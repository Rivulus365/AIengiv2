
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';

// Audio configuration
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const BUFFER_SIZE = 4096;

class LiveClient {
    private session: any = null;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private inputSource: MediaStreamAudioSourceNode | null = null;
    private processor: ScriptProcessorNode | null = null;
    private outputNode: GainNode | null = null;
    private nextStartTime: number = 0;
    private activeSources: Set<AudioBufferSourceNode> = new Set();
    
    // State
    public isMuted: boolean = false;

    // Callbacks
    public onMessage: ((text: string) => void) | null = null;
    public onStatusChange: ((isActive: boolean) => void) | null = null;

    setMuted(muted: boolean) {
        this.isMuted = muted;
    }

    async connect() {
        if (this.session) return;

        try {
            // Request microphone access immediately to capitalize on the user gesture
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
                const msg = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.toLowerCase().includes('dismissed')
                    ? "Microphone access was denied or dismissed. Please ensure permissions are granted in your browser settings."
                    : "An error occurred while accessing the microphone.";
                throw new Error(msg);
            });

            // Initialize Audio Contexts
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.inputAudioContext = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
            this.outputAudioContext = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });
            
            // Resume contexts immediately
            if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
            if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

            this.outputNode = this.outputAudioContext.createGain();
            this.outputNode.connect(this.outputAudioContext.destination);

            // Initialize the API client right before connection
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const voiceSystemPrompt = SYSTEM_PROMPT + "\n\n[VOICE MODE ACTIVE]: Do NOT output JSON state blocks. Keep responses atmospheric, purely narrative, and very concise. Use evocative language fit for a master storyteller.";

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    systemInstruction: voiceSystemPrompt,
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        console.log("Live connection established");
                        this.onStatusChange?.(true);
                        
                        if (!this.inputAudioContext) return;
                        
                        this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
                        this.processor = this.inputAudioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
                        
                        this.processor.onaudioprocess = (e) => {
                            if (this.isMuted) return;
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = this.createBlob(inputData);
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };

                        this.inputSource.connect(this.processor);
                        this.processor.connect(this.inputAudioContext.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && this.outputAudioContext && this.outputNode) {
                            await this.playAudioChunk(audioData);
                        }

                        const transcript = msg.serverContent?.outputTranscription?.text;
                        if (transcript && this.onMessage) {
                            this.onMessage(transcript);
                        }

                        if (msg.serverContent?.interrupted) {
                            this.stopAudioPlayback();
                        }
                    },
                    onclose: () => {
                        console.log("Live connection closed");
                        this.disconnect();
                    },
                    onerror: (err) => {
                        console.error("Live session error", err);
                        this.disconnect();
                    }
                }
            });

            this.session = await sessionPromise;

        } catch (error) {
            console.error("Gemini Live connection failure:", error);
            this.disconnect();
            throw error;
        }
    }

    disconnect() {
        if (this.session) {
            try { this.session.close(); } catch(e) {}
            this.session = null;
        }

        if (this.inputSource) {
            try {
                this.inputSource.disconnect();
                this.inputSource.mediaStream.getTracks().forEach(track => track.stop());
            } catch(e) {}
            this.inputSource = null;
        }
        if (this.processor) {
            try { this.processor.disconnect(); } catch(e) {}
            this.processor = null;
        }
        if (this.inputAudioContext) {
            try { this.inputAudioContext.close(); } catch(e) {}
            this.inputAudioContext = null;
        }

        this.stopAudioPlayback();
        if (this.outputAudioContext) {
            try { this.outputAudioContext.close(); } catch(e) {}
            this.outputAudioContext = null;
        }

        this.isMuted = false; 
        this.onStatusChange?.(false);
    }

    private createBlob(data: Float32Array): Blob {
        const int16 = new Int16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
        }
        return {
            data: this.arrayBufferToBase64(new Uint8Array(int16.buffer)),
            mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
        };
    }

    private async playAudioChunk(base64: string) {
        if (!this.outputAudioContext || !this.outputNode) return;

        try {
            const arrayBuffer = this.base64ToArrayBuffer(base64);
            const audioBuffer = await this.decodeAudioData(arrayBuffer, this.outputAudioContext);
            this.nextStartTime = Math.max(this.outputAudioContext.currentTime, this.nextStartTime);
            
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputNode);
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            
            this.activeSources.add(source);
            source.onended = () => this.activeSources.delete(source);
        } catch (e) {
            console.error("Audio playback error:", e);
        }
    }

    private stopAudioPlayback() {
        this.activeSources.forEach(source => {
            try { source.stop(); } catch(e) {}
        });
        this.activeSources.clear();
        this.nextStartTime = 0;
    }

    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        for (let i = 0; i < buffer.byteLength; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return window.btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
        const int16Data = new Int16Array(data.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
        }
        const buffer = ctx.createBuffer(1, float32Data.length, OUTPUT_SAMPLE_RATE);
        buffer.copyToChannel(float32Data, 0);
        return buffer;
    }
}

export const liveService = new LiveClient();
