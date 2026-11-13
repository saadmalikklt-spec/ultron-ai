export type VoiceProfileId = 
  | 'ultron-prime' 
  | 'ultron-crimson' 
  | 'nova-matrix' 
  | 'omega-overlord' 
  | 'nexus-synthesizer';

export interface VoiceProfile {
  id: VoiceProfileId;
  name: string;
  gender: 'Male' | 'Female' | 'Robotic';
  description: string;
  pitch: number;
  rate: number;
  robotEffect: boolean;
  accent: string;
  color: string;
}

export interface WebSource {
  title: string;
  url: string;
}

export interface VoiceNoteData {
  audioBlobUrl?: string;
  audioBase64?: string;
  durationSeconds: number;
  waveform: number[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  executionTimeMs?: number;
  voiceNote?: VoiceNoteData;
  isVoiceMessage?: boolean;
  webSources?: WebSource[];
  language?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  style: string;
  aspectRatio: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isGoogleVerified: boolean;
  plan: 'ULTRON SUPREME (FREE)';
}
