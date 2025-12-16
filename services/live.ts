
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            // Initialize Audio Contexts
            this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
            this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
            this.outputNode = this.outputAudioContext.createGain();
            this.outputNode.connect(this.outputAudioContext.destination);

            // Get Mic Stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create Live Session
            // We modify the system instruction to prevent JSON output during voice chat
            const voiceSystemPrompt = SYSTEM_PROMPT + "\n\n[VOICE MODE ACTIVE]: Do NOT output the JSON state block in this mode. Keep responses concise, atmospheric, and purely narrative. Do not read out game mechanics or math unless critical.";

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
                        console.log("Gemini Live Connected");
                        this.onStatusChange?.(true);
                        
                        // Start Audio Input Stream
                        if (!this.inputAudioContext) return;
                        
                        this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
                        this.processor = this.inputAudioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
                        
                        this.processor.onaudioprocess = (e) => {
                            // Check mute state before sending audio
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
                        // Handle Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && this.outputAudioContext && this.outputNode) {
                            await this.playAudioChunk(audioData);
                        }

                        // Handle Transcription
                        const transcript = msg.serverContent?.outputTranscription?.text;
                        if (transcript && this.onMessage) {
                            this.onMessage(transcript);
                        }

                        // Handle Turn Completion (optional logic here)
                        if (msg.serverContent?.turnComplete) {
                            // Can trigger UI updates
                        }
                        
                        // Handle Interruption
                        if (msg.serverContent?.interrupted) {
                            this.stopAudioPlayback();
                        }
                    },
                    onclose: () => {
                        console.log("Gemini Live Closed");
                        this.disconnect();
                    },
                    onerror: (err) => {
                        console.error("Gemini Live Error", err);
                        this.disconnect();
                    }
                }
            });

            this.session = await sessionPromise;

        } catch (error) {
            console.error("Failed to connect to Gemini Live:", error);
            this.disconnect();
            throw error;
        }
    }

    disconnect() {
        if (this.session) {
            this.session.close(); // Assuming close method exists or we just drop ref
            this.session = null;
        }

        // Stop Input
        if (this.inputSource) {
            this.inputSource.disconnect();
            this.inputSource.mediaStream.getTracks().forEach(track => track.stop());
            this.inputSource = null;
        }
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.inputAudioContext) {
            this.inputAudioContext.close();
            this.inputAudioContext = null;
        }

        // Stop Output
        this.stopAudioPlayback();
        if (this.outputAudioContext) {
            this.outputAudioContext.close();
            this.outputAudioContext = null;
        }

        this.isMuted = false; // Reset mute state
        this.onStatusChange?.(false);
    }

    private createBlob(data: Float32Array): Blob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, data[i] * 32768));
        }
        const uint8 = new Uint8Array(int16.buffer);
        const base64 = this.arrayBufferToBase64(uint8);
        
        return {
            data: base64,
            mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
        };
    }

    private async playAudioChunk(base64: string) {
        if (!this.outputAudioContext || !this.outputNode) return;

        try {
            const arrayBuffer = this.base64ToArrayBuffer(base64);
            const audioBuffer = await this.decodeAudioData(arrayBuffer, this.outputAudioContext);
            
            // Schedule playback
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

    // --- Helpers ---

    private arrayBufferToBase64(buffer: Uint8Array): string {
        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(buffer[i]);
        }
        return window.btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): Uint8Array {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
        // Raw PCM decoding (1 channel, 16-bit, 24kHz)
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
