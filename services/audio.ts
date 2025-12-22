
export type AmbientType = 'dungeon' | 'forest' | 'town' | 'none';

class AudioService {
  private ctx: AudioContext | undefined;
  private currentSource: AudioBufferSourceNode | undefined;
  private currentNarrationSource: AudioBufferSourceNode | undefined;
  private gainNode: GainNode | undefined;
  private narrationGainNode: GainNode | undefined;
  private currentType: AmbientType = 'none';
  private isSoundEnabled: boolean = true;
  
  // Cache generated buffers to avoid expensive CPU operations during gameplay
  private bufferCache: Map<string, AudioBuffer> = new Map();

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass({ sampleRate: 24000 }); // Optimization for TTS
        
        // Ambient/SFX track track gain
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = this.isSoundEnabled ? 0.05 : 0;
        this.gainNode.connect(this.ctx.destination);

        // Narration track gain (louder, separate control)
        this.narrationGainNode = this.ctx.createGain();
        this.narrationGainNode.gain.value = 1.0;
        this.narrationGainNode.connect(this.ctx.destination);
      }
    }
  }

  // Explicitly resume audio context (must be called during user gesture)
  public async resume() {
      this.init();
      if (this.ctx?.state === 'suspended') {
          await this.ctx.resume();
      }
  }

  public suspend() {
      if (this.ctx?.state === 'running') {
          this.ctx.suspend();
      }
  }

  private getCachedBuffer(key: string, generator: () => AudioBuffer | undefined): AudioBuffer | undefined {
    if (this.bufferCache.has(key)) {
        return this.bufferCache.get(key)!;
    }
    const buffer = generator();
    if (buffer) {
        this.bufferCache.set(key, buffer);
    }
    return buffer;
  }

  private createNoiseBuffer(): AudioBuffer | undefined {
    if (!this.ctx) return undefined;
    const bufferSize = this.ctx.sampleRate * 5; // 5 seconds loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Optimized pink noise generation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createRumbleBuffer(): AudioBuffer | undefined {
    if (!this.ctx) return undefined;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
    
    // Only affect the Ambient/SFX gain node
    if (this.gainNode && this.ctx) {
      // Smooth ramp to avoid clicking
      const targetVol = enabled ? 0.05 : 0;
      if (this.gainNode.gain) {
        this.gainNode.gain.setTargetAtTime(targetVol, this.ctx.currentTime || 0, 0.2);
      }
    }

    if (enabled) {
        this.resume();
    }
  }

  public playAmbient(type: AmbientType) {
    if (!this.isSoundEnabled) return;
    if (type === this.currentType) return;

    this.init();
    if (!this.ctx || !this.gainNode) return;

    // Fade out old
    if (this.currentSource) {
      try {
        const stopTime = this.ctx.currentTime + 1;
        this.currentSource.stop(stopTime);
      } catch (e) { }
    }

    this.currentType = type;
    if (type === 'none') return;

    // Use Cache
    const bufferKey = type === 'dungeon' ? 'rumble' : 'noise';
    const buffer = this.getCachedBuffer(bufferKey, () => 
        type === 'dungeon' ? this.createRumbleBuffer() : this.createNoiseBuffer()
    );

    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to shape the noise
    const filter = this.ctx.createBiquadFilter();

    if (type === 'dungeon') {
      filter.type = 'lowpass';
      filter.frequency.value = 120; // Deep rumble
    } else if (type === 'forest') {
      filter.type = 'highpass';
      filter.frequency.value = 600; // Wind/Leaves
      filter.Q.value = 0.7;
    } else if (type === 'town') {
      filter.type = 'peaking';
      filter.frequency.value = 800;
      filter.Q.value = 1;
    }

    source.connect(filter);
    filter.connect(this.gainNode);

    source.start();
    this.currentSource = source;
    this.resume();
  }

  public playOneShot(type: 'dice_roll' | 'crit' | 'fail', variant?: number) {
    if (!this.isSoundEnabled) return;
    this.init();
    if (!this.ctx || !this.gainNode) return;

    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    try {
        if (type === 'dice_roll') {
          // Add frequency variety for distinct sounds during multi-rolls
          const baseFreq = variant ? 150 + (variant % 100) : 200 + (Math.random() * 100 - 50);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.05);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start();
          osc.stop(now + 0.05);
        } else if (type === 'crit') {
          const osc2 = this.ctx.createOscillator();
          osc2.connect(gain);
          osc.type = 'sine';
          osc2.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
          osc2.frequency.setValueAtTime(783.99, now); // G5
          osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.15); // G6
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          osc.start();
          osc2.start();
          osc.stop(now + 0.8);
          osc2.stop(now + 0.8);
        } else if (type === 'fail') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(60, now);
          osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start();
          osc.stop(now + 0.3);
        }
    } catch (e) {
        console.warn("Audio play error", e);
    }
  }

  public playUiSound(type: 'click' | 'hover') {
    if (!this.isSoundEnabled) return;
    this.init();
    if (!this.ctx || !this.gainNode) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    try {
        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
            osc.start();
            osc.stop(now + 0.03);
        } else if (type === 'hover') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(0.005, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.01);
            osc.start();
            osc.stop(now + 0.01);
        }
    } catch (e) {
        console.warn("UI Audio error", e);
    }
  }

  public async playPCM(base64Data: string) {
    this.init();
    await this.resume();
    if (!this.ctx || !this.narrationGainNode) return;
    if (this.currentNarrationSource) {
        try { this.currentNarrationSource.stop(); } catch(e) {}
    }
    try {
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Data = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
        }
        const audioBuffer = this.ctx.createBuffer(1, float32Data.length, 24000);
        audioBuffer.copyToChannel(float32Data, 0);
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.narrationGainNode);
        source.start();
        this.currentNarrationSource = source;
    } catch (e) {
        console.error("Audio playback error:", e);
    }
  }

  public updateAmbientBasedOnLocation(location: string) {
    if (!this.isSoundEnabled) return;
    const loc = location.toLowerCase();
    let ambient: AmbientType = 'none';
    if (loc.match(/(dungeon|cave|crypt|mine|underdark)/)) ambient = 'dungeon';
    else if (loc.match(/(forest|woods|wild|jungle|swamp)/)) ambient = 'forest';
    else if (loc.match(/(town|city|tavern|village|castle)/)) ambient = 'town';
    this.playAmbient(ambient);
  }
}

export const audioService = new AudioService();
