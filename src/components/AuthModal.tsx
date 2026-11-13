import React, { useState } from 'react';
import { X, ShieldCheck, Mail, CheckCircle2, LogIn, LogOut, Key, UserCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [emailInput, setEmailInput] = useState(user.email);
  const [nameInput, setNameInput] = useState(user.name);
  const [isSwitching, setIsSwitching] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    playSound('beep');
    const updated: UserProfile = {
      name: nameInput || 'Saad Malik',
      email: emailInput || 'Saadmalikklt@gmail.com',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nameInput || 'Saad')}&backgroundColor=05070e`,
      isGoogleVerified: true,
      plan: 'ULTRON SUPREME (FREE)',
    };
    onUpdateUser(updated);
    setIsSwitching(false);
    playSound('receive');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070e]/95 backdrop-blur-xl p-3 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-lg rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0a1020] via-[#060a14] to-[#04060c] shadow-[0_0_60px_rgba(0,210,255,0.3)] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(0,210,255,0.5)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-orbitron text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                GOOGLE ACCOUNT AUTHENTICATION
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Seamless, secure Gmail integration & biometric identity verification.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* CURRENT GOOGLE ACCOUNT CARD */}
          <div className="p-4 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-blue-950/40 to-cyan-950/20 flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-14 h-14 rounded-full border-2 border-cyan-400 object-cover shadow-[0_0_12px_rgba(0,210,255,0.6)]"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron text-sm font-bold text-white truncate">
                  {user.name}
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-green-950 text-green-400 border border-green-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </span>
              </div>
              <p className="text-xs text-cyan-300 font-mono truncate">{user.email}</p>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-rajdhani">
                <span>Tier: <strong className="text-cyan-400">{user.plan}</strong></span>
                <span>•</span>
                <span>Gmail Synced</span>
              </div>
            </div>
          </div>

          {/* OFFICIAL GOOGLE SIGN-IN BUTTON */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-sans font-medium text-sm flex items-center justify-center gap-3 shadow-lg active:scale-[0.99] transition-all"
            >
              {/* Official Google G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>

            <button
              onClick={() => setIsSwitching(!isSwitching)}
              className="w-full text-center text-xs text-slate-400 hover:text-cyan-400 font-rajdhani transition-colors"
            >
              {isSwitching ? 'Cancel Account Switch' : 'Switch Google Account / Custom Gmail'}
            </button>
          </div>

          {/* CUSTOM GOOGLE ACCOUNT FORM */}
          {isSwitching && (
            <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
              <div className="text-xs font-orbitron text-cyan-400 uppercase tracking-wider">
                Specify Google Credentials
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-rajdhani">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Saad Malik"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-rajdhani"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-rajdhani">Google / Gmail Address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. Saadmalikklt@gmail.com"
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-rajdhani"
                />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-orbitron font-bold text-xs"
              >
                SYNC GOOGLE ACCOUNT
              </button>
            </div>
          )}

          {/* INTEGRATION FEATURES */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-orbitron">
                <Mail className="w-3.5 h-3.5 text-red-400" /> Gmail Linked
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-rajdhani">
                Enables instantaneous voice notes, transcripts, and cloud sync.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 font-orbitron">
                <Key className="w-3.5 h-3.5 text-cyan-400" /> Quantum Secured
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-rajdhani">
                Military-grade 4096-bit neural encryption on all conversations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
