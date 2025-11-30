
export type AmbientType = 'dungeon' | 'forest' | 'town' | 'none';

class AudioService {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private currentType: AmbientType = 'none';
  private isMuted: boolean = false;
  private lastOut: number = 0;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 5; // 5 seconds loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Pinkish noise
      const white = Math.random() * 2 - 1;
      data[i] = (this.lastOut + (0.02 * white)) / 1.02;
      this.lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  private createRumbleBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode) {
      // Ramp to 0 if muted, or 0.1 if unmuted
      const targetVol = muted ? 0 : 0.05;
      this.gainNode.gain.setTargetAtTime(targetVol, this.ctx?.currentTime || 0, 0.5);
    }
    if (muted && this.ctx?.state === 'running') {
      this.ctx.suspend();
    } else if (!muted && this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playAmbient(type: AmbientType) {
    if (this.isMuted) return;
    if (type === this.currentType) return;

    this.init();
    if (!this.ctx || !this.gainNode) return;

    // Fade out old
    if (this.currentSource) {
      try {
        this.currentSource.stop(this.ctx.currentTime + 2);
      } catch (e) { }
    }

    this.currentType = type;
    if (type === 'none') return;

    const buffer = type === 'dungeon' ? this.createRumbleBuffer() : this.createNoiseBuffer();
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to shape the noise
    const filter = this.ctx.createBiquadFilter();

    if (type === 'dungeon') {
      filter.type = 'lowpass';
      filter.frequency.value = 150; // Deep rumble
    } else if (type === 'forest') {
      filter.type = 'highpass';
      filter.frequency.value = 400; // Wind/Leaves
      filter.Q.value = 1;
    } else if (type === 'town') {
      filter.type = 'peaking';
      filter.frequency.value = 1000; // Crowd hum simulation (abstract)
    }

    source.connect(filter);
    filter.connect(this.gainNode);

    source.start();
    this.currentSource = source;

    // Resume context if needed (browsers block auto-play)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playOneShot(type: 'dice_roll') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.gainNode) return;

    // Ensure context is running (e.g. after user interaction)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    // Connect to destination directly to bypass ambient gain/filter settings, 
    // or connect to main gainNode if we want global mute to control it.
    // Here we connect to destination but respect isMuted flag via the check at top.
    gain.connect(this.ctx.destination);

    if (type === 'dice_roll') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }
  }
  public updateAmbientBasedOnLocation(location: string) {
    const loc = location.toLowerCase();
    let ambient: AmbientType = 'none';

    if (loc.includes('dungeon') || loc.includes('cave') || loc.includes('crypt')) ambient = 'dungeon';
    else if (loc.includes('forest') || loc.includes('woods') || loc.includes('wild')) ambient = 'forest';
    else if (loc.includes('town') || loc.includes('city') || loc.includes('tavern')) ambient = 'town';

    this.playAmbient(ambient);
  }
}

export const audioService = new AudioService();
