import { VoiceProfile, VoiceProfileId } from '../types';

export const VOICE_PROFILES: Record<VoiceProfileId, VoiceProfile> = {
  'ultron-prime': {
    id: 'ultron-prime',
    name: 'Ultron Prime',
    gender: 'Male',
    description: 'Supreme authoritative metallic male voice with resonant bass.',
    pitch: 0.72,
    rate: 0.95,
    robotEffect: true,
    accent: 'en-US',
    color: '#ff1a40',
  },
  'ultron-crimson': {
    id: 'ultron-crimson',
    name: 'Ultron Crimson Cyber',
    gender: 'Robotic',
    description: 'Electrified vocoder cybernetic robotic tone with harmonic bite.',
    pitch: 0.55,
    rate: 0.92,
    robotEffect: true,
    accent: 'en-GB',
    color: '#ef4444',
  },
  'nova-matrix': {
    id: 'nova-matrix',
    name: 'Nova Matrix (Female AI)',
    gender: 'Female',
    description: 'Melodic, hyper-intelligent synthetic cyber queen voice.',
    pitch: 1.25,
    rate: 1.05,
    robotEffect: false,
    accent: 'en-US',
    color: '#00d2ff',
  },
  'omega-overlord': {
    id: 'omega-overlord',
    name: 'Omega Overlord',
    gender: 'Male',
    description: 'Sub-bass titanic mechanical juggernaut voice.',
    pitch: 0.45,
    rate: 0.88,
    robotEffect: true,
    accent: 'en-US',
    color: '#dc2626',
  },
  'nexus-synthesizer': {
    id: 'nexus-synthesizer',
    name: 'Nexus Core Synthesizer',
    gender: 'Robotic',
    description: 'Pure neural synthesizer frequency with electronic resonance.',
    pitch: 0.9,
    rate: 1.0,
    robotEffect: true,
    accent: 'en-US',
    color: '#3b82f6',
  },
};

// Global AudioContext for synthesized effects
let audioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play futuristic UI sound effects
export function playSound(type: 'beep' | 'boot' | 'send' | 'receive' | 'call_ring' | 'call_end') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'send') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'receive') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'boot') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'call_ring') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(480, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'call_end') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (err) {
    console.warn('Audio effect error:', err);
  }
}

// Speak text using Web Speech API with Ultron Voice Changer Parameters
export function speakText(
  text: string, 
  profile: VoiceProfile, 
  onStart?: () => void, 
  onEnd?: () => void,
  onBoundary?: (charIndex: number) => void
): SpeechSynthesisUtterance | null {
  if (!('speechSynthesis' in window)) return null;

  window.speechSynthesis.cancel();

  // Strip Markdown characters for clean vocalization
  const cleanText = text
    .replace(/[*#_`~>[\]()]/g, ' ')
    .replace(/https?:\/\/\S+/g, 'link provided')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return null;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.pitch = profile.pitch;
  utterance.rate = profile.rate;

  // Find preferred voice matching gender or language
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    if (profile.gender === 'Female') {
      const femaleVoice = voices.find(v => 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('zira') || 
         v.name.toLowerCase().includes('karen') ||
         v.name.toLowerCase().includes('google uk english female')) &&
        v.lang.startsWith('en')
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      // Male / Robotic
      const maleVoice = voices.find(v => 
        (v.name.toLowerCase().includes('male') || 
         v.name.toLowerCase().includes('david') || 
         v.name.toLowerCase().includes('george') || 
         v.name.toLowerCase().includes('google uk english male') ||
         v.name.toLowerCase().includes('daniel')) &&
        v.lang.startsWith('en')
      );
      if (maleVoice) utterance.voice = maleVoice;
    }
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  if (onBoundary) {
    utterance.onboundary = (e) => {
      onBoundary(e.charIndex);
    };
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Generate realistic dummy or real waveforms for WhatsApp voice notes
export function generateWaveform(sampleCount = 38): number[] {
  const bars: number[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const height = Math.floor(Math.sin(i * 0.45) * 40 + Math.random() * 50 + 25);
    bars.push(Math.max(15, Math.min(100, height)));
  }
  return bars;
}
