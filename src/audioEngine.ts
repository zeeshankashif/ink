/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private masterVolume: GainNode | null = null;

  isUnlocked = false;

  constructor() {}

  async init() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);

      // Start drone synthesis
      this.buildDrone();

      // Resume context if suspended
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.isUnlocked = true;

      // Fade in master volume
      this.masterVolume.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 1.2);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  private buildDrone() {
    if (!this.ctx || !this.masterVolume) return;

    // Create two oscillators to build a rich, fat, detuned sub-aquatic thrum
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();

    this.droneOsc1.type = 'sawtooth';
    this.droneOsc2.type = 'triangle';

    // A1 = 55Hz, chorused and detuned
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime);
    this.droneOsc2.frequency.setValueAtTime(55.4, this.ctx.currentTime);

    // Steeper lowpass filter to create a highly muffled hydro-acoustic effect
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.Q.setValueAtTime(3.5, this.ctx.currentTime); // resonant hum
    this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

    // LFO to slowly sweep the filter frequency and create fluid movement (underwater sweep)
    this.lfo = this.ctx.createOscillator();
    this.lfoGain = this.ctx.createGain();
    this.lfo.frequency.setValueAtTime(0.22, this.ctx.currentTime); // 0.22 Hz
    this.lfoGain.gain.setValueAtTime(35, this.ctx.currentTime); // sweep range

    this.droneGain = this.ctx.createGain();
    // Default low playback volume as requested
    this.droneGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    // Modulator connections
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.droneFilter.frequency);

    // Routing
    this.droneOsc1.connect(this.droneGain);
    this.droneOsc2.connect(this.droneGain);
    this.droneGain.connect(this.droneFilter);
    this.droneFilter.connect(this.masterVolume);

    // Start
    this.droneOsc1.start();
    this.droneOsc2.start();
    this.lfo.start();
  }

  updateScrollProgress(progress: number) {
    if (!this.ctx || !this.isUnlocked || !this.droneOsc1 || !this.droneOsc2 || !this.droneFilter || !this.droneGain) return;

    // The threshold is 55% (0.55)
    // Between 0.0 and 0.25: stable submerge drone at 55Hz, filter at 140Hz
    // Between 0.26 and 0.54: rises dramatically in pitch and brilliance as we accelerate
    if (progress >= 0.25 && progress < 0.54) {
      const p = (progress - 0.25) / 0.29; // normalize 0 to 1
      const targetFreq1 = 55 + p * 125;   // Rises to 180Hz
      const targetFreq2 = 55.4 + p * 125;
      const targetFilter = 140 + p * 480;  // Open filters for sharper, louder sound

      this.droneOsc1.frequency.setTargetAtTime(targetFreq1, this.ctx.currentTime, 0.05);
      this.droneOsc2.frequency.setTargetAtTime(targetFreq2, this.ctx.currentTime, 0.05);
      this.droneFilter.frequency.setTargetAtTime(targetFilter, this.ctx.currentTime, 0.05);
      this.droneGain.gain.setValueAtTime(0.25 + p * 0.25, this.ctx.currentTime); // volume sweeps to 0.5
    } else if (progress < 0.25) {
      this.droneOsc1.frequency.setTargetAtTime(55, this.ctx.currentTime, 0.1);
      this.droneOsc2.frequency.setTargetAtTime(55.4, this.ctx.currentTime, 0.1);
      this.droneFilter.frequency.setTargetAtTime(140, this.ctx.currentTime, 0.1);
      this.droneGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    }

    // Cut off entirely to dead silence just before breach (0.54 to 0.55)
    if (progress >= 0.54 && progress < 0.56) {
      this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (progress >= 0.56) {
      // Completely post-portal: Keep drone silent or extremely faint atmospheric shimmer
      this.droneGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    }
  }

  pop() {
    if (!this.ctx || !this.isUnlocked || !this.masterVolume) return;

    const now = this.ctx.currentTime;

    // Schedule instant cut-off of the drone
    if (this.droneGain) {
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.setValueAtTime(0, now);
    }

    // High frequency additive crystal glass chime synthesis
    const frequencies = [920, 1380, 1840, 2300, 2900, 3900, 5200];
    const gains = [0.45, 0.35, 0.28, 0.22, 0.16, 0.08, 0.04];
    const decays = [1.5, 1.1, 0.8, 0.5, 0.35, 0.2, 0.1]; // Shorter decays for high overtones

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscGain.gain.setValueAtTime(0, now);
      // Clean high-speed burst attack
      oscGain.gain.linearRampToValueAtTime(gains[idx] * 0.65, now + 0.003);
      // Exponential beautiful ring decay
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

      osc.connect(oscGain);
      oscGain.connect(this.masterVolume!);

      osc.start(now);
      osc.stop(now + decays[idx] + 0.1);
    });

    // Generate physical spray splash highpass white noise
    const bufferSize = this.ctx.sampleRate * 0.22; // 220ms duration buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Fill noise with random float numbers
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(2000, now);
    noiseFilter.Q.setValueAtTime(1.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.24, now + 0.004);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterVolume);

    noise.start(now);
    noise.stop(now + 0.25);
  }

  cleanup() {
    this.isUnlocked = false;

    if (this.masterVolume && this.ctx) {
      try {
        this.masterVolume.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterVolume.gain.setValueAtTime(this.masterVolume.gain.value, this.ctx.currentTime);
        this.masterVolume.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.25);
      } catch (e) {
        console.warn(e);
      }
    }

    setTimeout(() => {
      if (this.ctx) {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.lfo?.stop();
          this.ctx.close();
        } catch (e) {
          // Ignore state cleanup warnings
        }
      }
    }, 300);
  }
}
