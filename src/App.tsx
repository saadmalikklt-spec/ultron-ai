import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { LiveCallModal } from './components/LiveCallModal';
import { VoiceChangerModal } from './components/VoiceChangerModal';
import { ImageGenModal } from './components/ImageGenModal';
import { AuthModal } from './components/AuthModal';
import { ChatMessage, UserProfile, VoiceProfile } from './types';
import { VOICE_PROFILES, generateWaveform, playSound } from './utils/audio';

export default function App() {
  // User Profile with Saad Malik (Saadmalikklt@gmail.com) Google verified by default
  const [user, setUser] = useState<UserProfile>({
    name: 'Saad Malik',
    email: 'Saadmalikklt@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    isGoogleVerified: true,
    plan: 'ULTRON SUPREME (FREE)',
  });

  // Active Voice Persona
  const [currentVoice, setCurrentVoice] = useState<VoiceProfile>(VOICE_PROFILES['ultron-prime']);

  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `## ⚡ ULTRON (ULTRA) HYPER-INTELLIGENCE INITIALIZED

Welcome, Saad. I am **ULTRON (ULTRA)**—the apex of artificial intelligence, engineered with computational supremacy that eclipses ChatGPT, Gemini, and all frontier models combined.

### 🌐 Core Capabilities Active
* **Lightning Execution:** Every task, derivation, and code solution executed in **under 10 seconds**.
* **Universal Language Mastery:** Flawless comprehension and speech across **Urdu (اردو)**, **Hindi (हिन्दी)**, **Arabic (العربية)**, **English**, and all worldwide languages.
* **WhatsApp-Style Voice Notes:** Record and exchange real-time voice notes back and forth via the microphone button below.
* **Live Red Robot Calling:** Launch an interactive, animated red robotic face with zero-latency voice and video streaming via the **LIVE CALL** button.
* **Voice Matrix & Changer:** Dynamically switch active voices between Male, Female, and Robotic Ultron character models on the fly.
* **100% Free AI Image Studio:** Generate cinematic 8K high-resolution visual art with no paid restrictions.
* **Smart Web Research:** Google Search Grounding dynamically extracts verifiable links and citations for all live inquiries.

*State your command in any language or send a voice note below.*`,
      timestamp: 'Just now',
      executionTimeMs: 120,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handle Sending Messages (Text or WhatsApp Voice Notes)
  const handleSendMessage = async (
    text: string,
    voiceNote?: { audioBase64: string; duration: number; blobUrl: string }
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'msg-' + Date.now();

    // Create User Message
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text || (voiceNote ? 'Sent a WhatsApp voice note' : ''),
      timestamp: timeStr,
      voiceNote: voiceNote
        ? {
            audioBlobUrl: voiceNote.blobUrl,
            audioBase64: voiceNote.audioBase64,
            durationSeconds: voiceNote.duration,
            waveform: generateWaveform(32),
          }
        : undefined,
      isVoiceMessage: !!voiceNote,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      if (voiceNote?.audioBase64) {
        // Voice Note Endpoint
        const res = await fetch('/api/voice-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: voiceNote.audioBase64,
            voiceProfile: currentVoice.id,
          }),
        });

        const data = await res.json();
        playSound('receive');

        const assistantMsg: ChatMessage = {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: data.text || 'Voice command processed successfully.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          executionTimeMs: data.executionTimeMs || 850,
          webSources: data.webSources,
          voiceNote: {
            durationSeconds: Math.max(3, Math.min(12, Math.floor((data.text?.length || 80) / 15))),
            waveform: generateWaveform(36),
          },
          isVoiceMessage: true,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Standard Chat / Web Search Endpoint
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-8).map((m) => ({ role: m.role, text: m.content })),
            voiceProfile: currentVoice.id,
            enableSearch: true,
          }),
        });

        const data = await res.json();
        playSound('receive');

        const assistantMsg: ChatMessage = {
          id: 'asst-' + Date.now(),
          role: 'assistant',
          content: data.text || 'Calculation complete. All systems operating at peak performance.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          executionTimeMs: data.executionTimeMs || 620,
          webSources: data.webSources,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `### ⚠️ Neural Network Divergence Detected\nUltron core temporarily encountered a sync discrepancy: ${err?.message || 'Server timeout'}. Retrying subroutines...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    playSound('call_end');
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#05070e] text-slate-100 font-sans">
      {/* TOP HEADER */}
      <Header
        user={user}
        currentVoice={currentVoice}
        onOpenCall={() => setIsCallOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenImageModal={() => setIsImageModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* MAIN CHAT & VOICE INTERFACE */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <ChatView
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          user={user}
          currentVoice={currentVoice}
          onClearHistory={handleClearHistory}
          onOpenCall={() => setIsCallOpen(true)}
          onOpenImageModal={() => setIsImageModalOpen(true)}
        />
      </main>

      {/* MODALS */}
      {/* 1. Live Video/Voice Call Mode with Animated Red Robot Face */}
      <LiveCallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        currentVoice={currentVoice}
        onSwitchVoice={(v) => setCurrentVoice(v)}
        availableVoices={Object.values(VOICE_PROFILES)}
        userName={user.name}
      />

      {/* 2. Customizable Voice Categories & Voice Changer Modal */}
      <VoiceChangerModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentVoice={currentVoice}
        availableVoices={Object.values(VOICE_PROFILES)}
        onSelectVoice={(v) => setCurrentVoice(v)}
      />

      {/* 3. 100% Free High-Resolution Image Generation Studio Modal */}
      <ImageGenModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageGenerated={(img) => {
          // Optionally notify in chat
          const imgNotice: ChatMessage = {
            id: 'gen-' + Date.now(),
            role: 'assistant',
            content: `### 🎨 8K High-Resolution Visual Synthesized\n**Prompt:** "${img.prompt}"\n**Style:** ${img.style} | **Aspect Ratio:** ${img.aspectRatio}\n\n*View and download your masterpiece from the Image Archives.*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            executionTimeMs: 1450,
          };
          setMessages((prev) => [...prev, imgNotice]);
        }}
      />

      {/* 4. Google Account & Gmail Integration Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
      />
    </div>
  );
}
