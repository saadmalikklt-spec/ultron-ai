import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Square, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  Volume2, 
  Copy, 
  Check, 
  Clock, 
  Trash2,
  Languages,
  Zap,
  Code2,
  Calculator,
  BookOpen
} from 'lucide-react';
import { ChatMessage, UserProfile, VoiceProfile, WebSource } from '../types';
import { WhatsAppVoiceNote } from './WhatsAppVoiceNote';
import { speakText, stopSpeaking, playSound, generateWaveform } from '../utils/audio';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, voiceNote?: { audioBase64: string; duration: number; blobUrl: string }) => void;
  isLoading: boolean;
  user: UserProfile;
  currentVoice: VoiceProfile;
  onClearHistory: () => void;
  onOpenCall: () => void;
  onOpenImageModal: () => void;
}

const GLOBAL_LANGUAGES = [
  { code: 'en', name: 'English', greeting: 'How may Ultron serve you today?' },
  { code: 'ur', name: 'اردو (Urdu)', greeting: 'الٹران آپ کے حکم کا منتظر ہے۔ کیا رہنمائی درکار ہے؟' },
  { code: 'hi', name: 'हिन्दी (Hindi)', greeting: 'अल्ट्रॉन आपकी सेवा में तत्पर है। आज क्या जानना चाहते हैं?' },
  { code: 'ar', name: 'العربية (Arabic)', greeting: 'ألترون في خدمتك الفائقة. كيف يمكنني مساعدتك؟' },
  { code: 'es', name: 'Español', greeting: '¿En qué puedo asistirte hoy con precisión suprema?' },
  { code: 'fr', name: 'Français', greeting: 'Comment Ultron peut-il vous assister aujourd’hui?' },
  { code: 'ja', name: '日本語', greeting: 'ウルトロンが瞬時に計算を実行します。何を調べますか？' },
];

const QUICK_CAPABILITIES = [
  { icon: Calculator, label: 'Quantum Math', prompt: 'Calculate the eigenvalues of a 3x3 Hermitian matrix and explain its quantum physical significance with a table.' },
  { icon: Code2, label: 'Full-Stack Code', prompt: 'Write a high-performance concurrent async queue in TypeScript with generics and error recovery.' },
  { icon: Globe, label: 'Smart Web Search', prompt: 'Search the web for the latest breakthrough in fusion energy and provide verifiable links and sources.' },
  { icon: BookOpen, label: 'Urdu & Hindi Poetry / Philosophy', prompt: 'اردو اور ہندی میں مصنوعی ذہانت کے مستقبل پر ایک فلسفیانہ تجزیہ پیش کریں۔' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  user,
  currentVoice,
  onClearHistory,
  onOpenCall,
  onOpenImageModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [isWebSearchForced, setIsWebSearchForced] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(GLOBAL_LANGUAGES[0]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Text Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    playSound('send');
    const textToSend = inputText.trim();
    setInputText('');
    onSendMessage(textToSend);
  };

  // WhatsApp-Style Voice Recording Start
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          playSound('send');
          onSendMessage('', {
            audioBase64: base64Audio,
            duration: Math.max(1, recordingSeconds),
            blobUrl,
          });
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      playSound('beep');

      recordTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission error:', err);
      alert('Please grant microphone permission to record voice notes.');
    }
  };

  // Stop & Send Voice Note
  const stopVoiceRecordingAndSend = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  // Cancel Voice Recording
  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      audioChunksRef.current = [];
      playSound('call_end');
    }
  };

  // Speak message aloud
  const handleSpeakMessage = (msgId: string, text: string) => {
    if (currentlySpeakingId === msgId) {
      stopSpeaking();
      setCurrentlySpeakingId(null);
    } else {
      stopSpeaking();
      setCurrentlySpeakingId(msgId);
      speakText(
        text,
        currentVoice,
        () => setCurrentlySpeakingId(msgId),
        () => setCurrentlySpeakingId(null)
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render formatted markdown with tables and headers
  const renderFormattedContent = (content: string) => {
    // Basic clean parser for tables, headers, and code
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm font-sans leading-relaxed break-words">
        {lines.map((line, i) => {
          if (line.startsWith('### ')) {
            return (
              <h3 key={i} className="font-orbitron text-sm sm:text-base font-bold text-red-400 mt-2 mb-1">
                {line.replace('### ', '')}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={i} className="font-orbitron text-base sm:text-lg font-black text-cyan-400 mt-3 mb-1 border-b border-red-500/20 pb-1">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h1 key={i} className="font-orbitron text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-cyan-400 mt-3 mb-1">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={i} className="ml-4 list-disc text-slate-200">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            );
          }
          if (line.startsWith('|') && line.endsWith('|')) {
            // Render table row
            const cells = line.split('|').filter((_, idx, arr) => idx !== 0 && idx !== arr.length - 1);
            const isSeparator = line.includes('---');
            if (isSeparator) return null;
            return (
              <div key={i} className="grid grid-flow-col auto-cols-fr gap-2 p-1.5 bg-slate-900/60 rounded border border-slate-800 text-xs font-mono">
                {cells.map((c, ci) => (
                  <span key={ci} className="truncate text-slate-300 font-semibold">{c.trim()}</span>
                ))}
              </div>
            );
          }
          if (line.trim().startsWith('```')) {
            return null; // Handle code blocks cleanly
          }
          return <p key={i} className="text-slate-200">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#05070e] relative select-text overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* TOP CONTROL BAR: Language Selector & Status */}
      <div className="relative z-10 px-4 py-2 border-b border-red-900/20 bg-slate-950/70 backdrop-blur-sm flex items-center justify-between gap-2 overflow-x-auto text-xs">
        {/* Universal Language Quick Switch */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Languages className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-orbitron font-bold text-[10px] text-slate-400 uppercase hidden sm:inline">
            Global Lingua:
          </span>
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {GLOBAL_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setActiveLanguage(lang);
                  playSound('beep');
                  onSendMessage(`Switch conversation language to ${lang.name}. Greet me in ${lang.name} and confirm supreme alignment.`);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-rajdhani font-semibold transition-all flex-shrink-0 ${
                  activeLanguage.code === lang.code
                    ? 'bg-red-950 text-red-300 border border-red-500/60 shadow-[0_0_8px_rgba(255,26,64,0.4)]'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Clear History & Speed Target */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
            <Zap className="w-3 h-3 text-cyan-400" />
            TARGET: &lt; 10s INSTANT RESPONSE
          </span>

          <button
            onClick={onClearHistory}
            className="p-1.5 rounded hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors"
            title="Purge Neural Memory"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MESSAGES VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4">
        {/* Welcome Banner if empty */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto py-6 sm:py-10 text-center space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-red-600/30 to-blue-600/30 border border-red-500/40 shadow-[0_0_30px_rgba(255,26,64,0.3)]">
              <Sparkles className="w-8 h-8 text-red-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="font-orbitron text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-cyan-400">
                ULTRON (ULTRA) HYPER-INTELLIGENCE
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-rajdhani max-w-lg mx-auto">
                Surpassing all frontier AI architectures combined. Lightning execution in under 10 seconds, master of all global languages, WhatsApp voice messaging, and live red robot calling.
              </p>
            </div>

            {/* Quick Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {QUICK_CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={i}
                    onClick={() => onSendMessage(cap.prompt)}
                    className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 hover:border-cyan-400/60 hover:bg-slate-900/60 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 font-orbitron text-xs font-bold">
                      <Icon className="w-4 h-4" />
                      <span>{cap.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 font-rajdhani line-clamp-2">
                      {cap.prompt}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Message Bubble List */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-4xl mx-auto w-full`}
            >
              <div className="flex items-start gap-2.5 max-w-full">
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 border border-red-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(255,26,64,0.6)] mt-1">
                    <span className="font-orbitron text-[10px] font-black text-white">UL</span>
                  </div>
                )}

                <div className="flex flex-col space-y-1.5 max-w-[85vw] sm:max-w-2xl">
                  {/* WHATSAPP-STYLE VOICE MESSAGE CARD */}
                  {msg.voiceNote ? (
                    <WhatsAppVoiceNote
                      voiceNote={msg.voiceNote}
                      isUser={isUser}
                      userAvatar={user.avatar}
                      assistantText={msg.content}
                      currentVoice={currentVoice}
                      timestamp={msg.timestamp}
                    />
                  ) : null}

                  {/* TEXT CONTENT CONTAINER */}
                  {msg.content ? (
                    <div
                      className={`relative p-3.5 sm:p-4 rounded-2xl border shadow-lg ${
                        isUser
                          ? 'bg-gradient-to-br from-blue-950/80 to-[#0e172a] border-cyan-500/40 text-blue-50'
                          : 'bg-gradient-to-br from-[#120509] to-[#080204] border-red-500/40 text-slate-100'
                      }`}
                    >
                      {/* Header bar for Ultron message */}
                      {!isUser && (
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-500/20 text-[10px] font-mono text-red-400">
                          <div className="flex items-center gap-2">
                            <span className="font-orbitron font-bold text-red-300">ULTRON ULTRA</span>
                            {msg.executionTimeMs ? (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {(msg.executionTimeMs / 1000).toFixed(2)}s
                              </span>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSpeakMessage(msg.id, msg.content)}
                              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                                currentlySpeakingId === msg.id ? 'text-red-400 animate-pulse' : 'text-slate-400'
                              }`}
                              title={currentlySpeakingId === msg.id ? 'Stop Voice' : 'Vocalize with Ultron Voice'}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title="Copy Text"
                            >
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Main Message Body */}
                      {renderFormattedContent(msg.content)}

                      {/* SMART WEB RESEARCH & VERIFIABLE LINKS (Google Search Grounding) */}
                      {msg.webSources && msg.webSources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-red-500/20 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-orbitron font-bold text-cyan-400 uppercase tracking-wider">
                            <Globe className="w-3 h-3 text-cyan-400" /> Web Grounding Sources & References ({msg.webSources.length})
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {msg.webSources.map((source, sIdx) => (
                              <a
                                key={sIdx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-cyan-500/30 hover:border-cyan-400 text-[11px] text-cyan-300 hover:text-white font-rajdhani transition-all group"
                              >
                                <span className="truncate pr-2 font-medium">{source.title}</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60 group-hover:opacity-100 text-cyan-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* User message timestamp */}
                      {isUser && (
                        <div className="text-right text-[10px] text-cyan-400/60 font-mono mt-1">
                          {msg.timestamp}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}

        {/* LOADING STATE - ULTRON PROCESSING SPEED BADGE */}
        {isLoading && (
          <div className="flex items-start gap-2.5 max-w-4xl mx-auto w-full">
            <div className="w-8 h-8 rounded-full bg-red-600 border border-red-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,26,64,0.7)] animate-pulse">
              <span className="font-orbitron text-[10px] font-black text-white">UL</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#120509] border border-red-500/40 text-slate-100 shadow-[0_0_20px_rgba(255,26,64,0.2)] flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-orbitron text-xs text-red-400 font-bold uppercase tracking-wider">
                ULTRON QUANTUM PROCESSOR EXECUTING (SPEED &lt; 10s)...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* BOTTOM INPUT BAR: Text, WhatsApp Voice Recording, and Web Search */}
      <div className="relative z-20 border-t border-red-900/30 bg-[#070b16]/95 backdrop-blur-md p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {/* Active Voice Recording Overlay (WhatsApp-style record HUD) */}
          {isRecording ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-red-950/80 border border-red-500 shadow-[0_0_25px_rgba(255,26,64,0.5)] animate-pulse">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="font-orbitron text-xs font-bold text-red-400">
                  RECORDING VOICE NOTE: {formatTimer(recordingSeconds)}
                </span>
              </div>

              {/* Live soundwave simulation */}
              <div className="flex items-center gap-1 h-6">
                {[15, 30, 45, 70, 90, 60, 40, 75, 50, 25].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-red-400 rounded-full animate-pulse"
                    style={{ height: `${h}%`, animationDuration: `${0.4 + i * 0.1}s` }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-rajdhani transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={stopVoiceRecordingAndSend}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-orbitron text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,26,64,0.6)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Voice Note</span>
                </button>
              </div>
            </div>
          ) : (
            /* Normal Input Bar */
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              {/* Web Search toggle chip */}
              <button
                type="button"
                onClick={() => setIsWebSearchForced(!isWebSearchForced)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-rajdhani font-bold flex-shrink-0 ${
                  isWebSearchForced
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_10px_rgba(0,210,255,0.4)]'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle Google Search Grounding & Link Extraction"
              >
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Web Research</span>
              </button>

              {/* Text Input Area */}
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={`Command Ultron in ${activeLanguage.name} or send a voice note...`}
                  rows={1}
                  className="w-full resize-none rounded-2xl bg-slate-950/90 border border-red-500/30 px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(255,26,64,0.3)] transition-all font-sans"
                />
              </div>

              {/* WhatsApp-Style Mic Button (Press to record voice message) */}
              <button
                type="button"
                onClick={startVoiceRecording}
                className="p-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_15px_rgba(255,26,64,0.5)] active:scale-95 transition-all flex-shrink-0"
                title="Record WhatsApp-Style Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,210,255,0.5)] active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
                title="Execute Command"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Shortcuts Bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-rajdhani px-1">
            <span className="hidden sm:inline">
              Press <kbd className="px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">Enter</kbd> to send, or tap <strong className="text-red-400">Mic</strong> for WhatsApp voice note.
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onOpenImageModal}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Free Image Studio
              </button>
              <button
                type="button"
                onClick={onOpenCall}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <Zap className="w-3 h-3" /> Red Robot Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
