import React from 'react';
import { PhoneCall, Sparkles, User, Globe, Mic2, ShieldCheck, ChevronDown, ExternalLink } from 'lucide-react';
import { UserProfile, VoiceProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  currentVoice: VoiceProfile;
  onOpenCall: () => void;
  onOpenVoiceModal: () => void;
  onOpenImageModal: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentVoice,
  onOpenCall,
  onOpenVoiceModal,
  onOpenImageModal,
  onOpenAuthModal,
}) => {
  return (
    <header className="relative z-30 w-full border-b border-red-900/30 bg-[#05070e]/90 backdrop-blur-md px-3 sm:px-6 py-2.5">
      {/* Top Bar Grid Layout: Left link, Center Logo, Right Actions */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* TOP-LEFT: Clean Sleek Web Link */}
        <div className="flex items-center gap-2 min-w-0">
          <a
            href="https://www.ultron-ai.nexus"
            target="_blank"
            rel="noopener noreferrer"
            title="Official Nexus Portal"
            className="group flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 transition-all text-xs font-rajdhani font-semibold tracking-wider"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="hidden sm:inline">https://www.ultron-ai.nexus</span>
            <span className="sm:hidden text-[11px]">ultron-ai.nexus</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </a>
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/40 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            V4.8 QUANTUM
          </span>
        </div>

        {/* TOP-CENTER: Glowing, Highly Attractive Nexus / Altron Logo */}
        <div className="flex flex-col items-center justify-center cursor-pointer select-none">
          <div className="flex items-center gap-2">
            {/* Glowing Nexus Arc Reactor Icon */}
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-red-600 to-cyan-500 blur-sm opacity-80 animate-pulse-glow" />
              <div className="relative w-full h-full rounded-lg bg-[#0c0408] border border-red-500/70 flex items-center justify-center shadow-[0_0_15px_rgba(255,26,64,0.6)]">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-red-500 fill-current drop-shadow-[0_0_8px_#ff1a40]">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>

            {/* ULTRON Branding with ULTRA Super Badge */}
            <div className="flex items-baseline gap-1.5">
              <span className="font-orbitron text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-cyan-400 drop-shadow-[0_0_12px_rgba(255,26,64,0.5)]">
                ULTRON
              </span>
              <span className="font-rajdhani text-xs sm:text-sm font-bold px-1.5 py-0.2 rounded bg-gradient-to-r from-red-600 to-blue-600 text-white tracking-widest uppercase shadow-[0_0_10px_rgba(0,210,255,0.4)]">
                ULTRA
              </span>
            </div>
          </div>
          <span className="text-[9px] sm:text-[10px] font-rajdhani font-semibold tracking-[0.25em] text-cyan-400/80 uppercase -mt-0.5 hidden xs:block">
            SUPREME AI ECOSYSTEM
          </span>
        </div>

        {/* TOP-RIGHT: Live Call, Voice Switcher, Free Images, Google Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Free Image Gen Studio Button */}
          <button
            onClick={onOpenImageModal}
            title="100% Free High-Resolution Image Studio"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-blue-950/40 to-cyan-950/40 text-cyan-300 hover:border-cyan-400 hover:text-white transition-all text-xs font-rajdhani font-bold shadow-[0_0_12px_rgba(0,210,255,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden lg:inline">FREE AI IMAGES</span>
            <span className="lg:hidden">IMAGES</span>
          </button>

          {/* Voice Category Switcher Button */}
          <button
            onClick={onOpenVoiceModal}
            title="Switch Voice Profile & Voice Changer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-300 hover:border-red-500 hover:text-white transition-all text-xs font-rajdhani font-bold"
          >
            <Mic2 className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden md:inline">{currentVoice.name}</span>
            <span className="md:hidden">VOICE</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Live Robot Face Video/Voice Call Button */}
          <button
            onClick={onOpenCall}
            title="Launch Live Video/Voice Call with Animated Red Robot"
            className="relative group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white font-orbitron text-xs font-bold tracking-wider shadow-[0_0_18px_rgba(255,26,64,0.6)] hover:shadow-[0_0_26px_rgba(255,26,64,0.9)] hover:scale-105 active:scale-95 transition-all"
          >
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            <PhoneCall className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">LIVE CALL</span>
            <span className="sm:hidden">CALL</span>
          </button>

          {/* Google Account Authentication */}
          <button
            onClick={onOpenAuthModal}
            title="Google Account & Gmail Integration"
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg border border-slate-700/60 bg-slate-900/60 hover:border-slate-500 transition-all text-xs font-rajdhani"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-5 h-5 rounded-full border border-cyan-400/60 object-cover"
            />
            <div className="hidden xl:flex flex-col text-left leading-tight">
              <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[90px]">{user.name}</span>
              <span className="text-[9px] text-cyan-400 font-mono">Google Verified</span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
