import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  Settings2,
  RefreshCw
} from 'lucide-react';
import { RobotFace } from './RobotFace';
import { VoiceProfile } from '../types';
import { speakText, stopSpeaking, playSound } from '../utils/audio';

interface LiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: VoiceProfile;
  onSwitchVoice: (voice: VoiceProfile) => void;
  availableVoices: VoiceProfile[];
  userName: string;
}

export const LiveCallModal: React.FC<LiveCallModalProps> = ({
  isOpen,
  onClose,
  currentVoice,
  onSwitchVoice,
  availableVoices,
  userName,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isUltronSpeaking, setIsUltronSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ sender: 'user' | 'ultron'; text: string }>>([
    {
      sender: 'ultron',
      text: `Ultron Neural Link initialized. Greetings, ${userName}. My global intelligence cores are at your complete command. Ask me anything in any language.`,
    },
  ]);
  const [quickInput, setQuickInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Call & Media
  useEffect(() => {
    if (!isOpen) return;

    playSound('call_ring');
    setCallDuration(0);

    // Call duration timer
    timerRef.current = window.setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Start Webcam video stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera/mic access error (fallback to avatar):', err);
        });
    }

    // Speak initial welcome message
    setTimeout(() => {
      speakUltron(
        `Ultron Neural Link initialized. Greetings, ${userName}. My global intelligence cores are at your complete command. Ask me anything in any language.`
      );
    }, 600);

    // Initialize Web Speech Recognition if available for real-time live speaking
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          if (transcript.trim()) {
            handleUserLiveQuery(transcript.trim());
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      } catch (e) {
        console.warn('Speech rec init failed:', e);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      stopSpeaking();
    };
  }, [isOpen]);

  const speakUltron = (text: string) => {
    if (isSpeakerMuted) return;
    setIsUltronSpeaking(true);
    speakText(
      text,
      currentVoice,
      () => setIsUltronSpeaking(true),
      () => setIsUltronSpeaking(false)
    );
  };

  const handleUserLiveQuery = async (userText: string) => {
    if (!userText.trim() || isProcessing) return;

    setDialogueHistory((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsProcessing(true);
    setIsListening(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          voiceProfile: currentVoice.id,
          enableSearch: true,
        }),
      });

      const data = await res.json();
      const reply = data.text || 'Calculation complete. All systems executing at optimal capacity.';

      setDialogueHistory((prev) => [...prev, { sender: 'ultron', text: reply }]);
      speakUltron(reply);
    } catch (err) {
      console.error('Call query error:', err);
      const fallback = 'Neural uplink re-calibrated. Please restate your command.';
      setDialogueHistory((prev) => [...prev, { sender: 'ultron', text: fallback }]);
      speakUltron(fallback);
    } finally {
      setIsProcessing(false);
      setIsListening(true);
    }
  };

  const handleEndCall = () => {
    playSound('call_end');
    stopSpeaking();
    onClose();
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070e]/95 backdrop-blur-xl p-2 sm:p-6 overflow-hidden">
      {/* Background Cyber Grid & Laser Scanlines */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Main Call View Container */}
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] rounded-3xl border border-red-500/40 bg-gradient-to-b from-[#120407] via-[#090306] to-[#04060c] shadow-[0_0_60px_rgba(255,26,64,0.35)] flex flex-col justify-between overflow-hidden">
        {/* TOP CALL HUD BAR */}
        <div className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-red-500/20 bg-black/40 backdrop-blur-md">
          {/* Status and Encryption */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-orbitron text-xs font-bold text-red-400 tracking-wider">
                LIVE NEURAL CALL
              </span>
            </div>
            <span className="font-mono text-xs text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {formatTimer(callDuration)}
            </span>
          </div>

          {/* Center Title */}
          <div className="hidden md:flex flex-col items-center">
            <span className="font-orbitron text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-cyan-400 tracking-widest">
              ULTRON RED ROBOT CORE
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              ZERO-LATENCY QUANTUM SYNC
            </span>
          </div>

          {/* Voice Switcher Dropdown in Call */}
          <div className="relative">
            <button
              onClick={() => setShowVoicePicker(!showVoicePicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/40 text-red-200 hover:text-white hover:border-red-400 transition-all text-xs font-rajdhani font-bold"
            >
              <Settings2 className="w-3.5 h-3.5 text-red-400" />
              <span>{currentVoice.name}</span>
            </button>

            {showVoicePicker && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-red-500/40 bg-[#0d0306] shadow-2xl p-2 z-30">
                <div className="text-[10px] uppercase font-mono text-cyan-400 px-2 py-1">
                  Active Voice Persona
                </div>
                {availableVoices.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSwitchVoice(v);
                      setShowVoicePicker(false);
                      playSound('beep');
                      speakUltron(`Voice profile updated to ${v.name}.`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-rajdhani flex items-center justify-between transition-colors ${
                      currentVoice.id === v.id
                        ? 'bg-red-900/40 text-red-300 font-bold border border-red-500/40'
                        : 'text-slate-300 hover:bg-red-950/20'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">{v.gender}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CENTER VIEWPORT: ANIMATED RED ROBOT FACE & REAL-TIME INTERACTION */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-4 min-h-0 overflow-hidden">
          {/* Ambient Circular Grid Backlight */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-red-500/10 pointer-events-none animate-pulse" />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-cyan-500/5 pointer-events-none" />

          {/* Interactive Animated Red Robot Character Face */}
          <div className="relative z-10 transition-transform duration-300 scale-95 sm:scale-100">
            <RobotFace
              isSpeaking={isUltronSpeaking}
              isListening={isListening && !isUltronSpeaking}
              size="fullscreen"
              voiceProfileName={currentVoice.name}
              activeStatusText={isProcessing ? 'NEURAL CORES SYNCHRONIZING...' : 'VOICE STREAM READY'}
            />
          </div>

          {/* Subtitle / Live Spoken Dialogue Box */}
          <div className="relative z-20 w-full max-w-xl mt-4 px-4 py-2.5 rounded-xl bg-black/60 border border-red-500/30 backdrop-blur-md shadow-xl text-center">
            {dialogueHistory.length > 0 ? (
              <p className="text-xs sm:text-sm font-rajdhani text-slate-200 line-clamp-3">
                <span className="font-bold text-red-400 uppercase tracking-wider mr-2 font-orbitron">
                  {dialogueHistory[dialogueHistory.length - 1].sender === 'ultron' ? 'ULTRON:' : 'YOU:'}
                </span>
                {dialogueHistory[dialogueHistory.length - 1].text}
              </p>
            ) : null}
          </div>

          {/* USER VIDEO CAMERA PICTURE-IN-PICTURE (FaceTime/WhatsApp Call style) */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 w-28 h-36 sm:w-36 sm:h-48 rounded-2xl border-2 border-cyan-400/80 bg-slate-950 overflow-hidden shadow-[0_0_20px_rgba(0,210,255,0.4)]">
            {isVideoOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                <VideoOff className="w-6 h-6 text-red-400 mb-1" />
                <span className="text-[10px] font-mono">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300">
              YOU
            </div>
          </div>
        </div>

        {/* BOTTOM CALL CONTROLS */}
        <div className="relative z-20 px-4 sm:px-8 py-4 border-t border-red-500/20 bg-black/60 backdrop-blur-md flex flex-col gap-3">
          {/* Quick Voice / Text prompt bar inside call */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickInput.trim()) {
                handleUserLiveQuery(quickInput.trim());
                setQuickInput('');
              }
            }}
            className="flex items-center gap-2 max-w-xl mx-auto w-full"
          >
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Type to speak or ask Ultron live in any language..."
              className="flex-1 bg-slate-950/80 border border-red-500/40 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all font-rajdhani"
            />
            <button
              type="submit"
              disabled={isProcessing || !quickInput.trim()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-rajdhani font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,26,64,0.5)] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SEND</span>
            </button>
          </form>

          {/* Action Button Row */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Mic Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full transition-all active:scale-90 ${
                isMuted
                  ? 'bg-red-950 border border-red-500 text-red-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* Video Camera Toggle */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3.5 rounded-full transition-all active:scale-90 ${
                !isVideoOn
                  ? 'bg-red-950 border border-red-500 text-red-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
              }`}
              title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
            >
              {isVideoOn ? <Video className="w-5 h-5 text-cyan-400" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Speaker Mute Toggle */}
            <button
              onClick={() => {
                if (!isSpeakerMuted) stopSpeaking();
                setIsSpeakerMuted(!isSpeakerMuted);
              }}
              className={`p-3.5 rounded-full transition-all active:scale-90 ${
                isSpeakerMuted
                  ? 'bg-red-950 border border-red-500 text-red-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
              }`}
              title={isSpeakerMuted ? 'Unmute Ultron Audio' : 'Mute Ultron Audio'}
            >
              {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-3.5 sm:px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-orbitron font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(255,26,64,0.7)] active:scale-95 transition-all"
              title="Terminate Live Call"
            >
              <PhoneOff className="w-5 h-5 fill-current" />
              <span className="hidden sm:inline text-xs">END CALL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
