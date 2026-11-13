import React, { useState } from 'react';
import { X, Mic, Volume2, Sliders, CheckCircle2, Play, Radio } from 'lucide-react';
import { VoiceProfile, VoiceProfileId } from '../types';
import { speakText, stopSpeaking, playSound } from '../utils/audio';

interface VoiceChangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVoice: VoiceProfile;
  availableVoices: VoiceProfile[];
  onSelectVoice: (voice: VoiceProfile) => void;
}

export const VoiceChangerModal: React.FC<VoiceChangerModalProps> = ({
  isOpen,
  onClose,
  currentVoice,
  availableVoices,
  onSelectVoice,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(currentVoice);
  const [testPitch, setTestPitch] = useState(currentVoice.pitch);
  const [testRate, setTestRate] = useState(currentVoice.rate);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  if (!isOpen) return null;

  const handlePreviewVoice = (voice: VoiceProfile) => {
    playSound('beep');
    setIsPlayingTest(true);
    stopSpeaking();

    const sampleText =
      voice.gender === 'Female'
        ? 'Nova Matrix online. Quantum cognitive neural network aligned. How may I empower your workflow?'
        : voice.id === 'ultron-crimson'
        ? 'Ultron Crimson Cyber protocol engaged. Every frontier model has been superseded.'
        : 'Ultron Prime active. Supreme intelligence cores ready to execute all commands.';

    speakText(
      sampleText,
      { ...voice, pitch: testPitch, rate: testRate },
      () => setIsPlayingTest(true),
      () => setIsPlayingTest(false)
    );
  };

  const handleApplyVoice = () => {
    playSound('send');
    const updatedVoice: VoiceProfile = {
      ...selectedVoice,
      pitch: testPitch,
      rate: testRate,
    };
    onSelectVoice(updatedVoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070e]/95 backdrop-blur-xl p-3 sm:p-6 overflow-hidden">
      <div className="relative w-full max-w-2xl rounded-3xl border border-red-500/40 bg-gradient-to-b from-[#120407] via-[#090306] to-[#04060c] shadow-[0_0_60px_rgba(255,26,64,0.3)] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(255,26,64,0.5)]">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-orbitron text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-cyan-400">
                ULTRON VOICE CHANGER MATRIX
              </h2>
              <p className="text-xs text-slate-400 font-rajdhani">
                Dynamically switch voice profiles: Male, Female, or Robotic Ultron characters.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* VOICE PROFILES LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-orbitron font-bold text-red-400 uppercase tracking-wider">
              <span>Select Voice Persona</span>
              <span className="text-[10px] text-cyan-400 font-mono">REAL-TIME CONVERSION</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableVoices.map((voice) => {
                const isCurrent = selectedVoice.id === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setTestPitch(voice.pitch);
                      setTestRate(voice.rate);
                    }}
                    className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-red-500 bg-red-950/40 shadow-[0_0_20px_rgba(255,26,64,0.35)]'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: voice.color }}
                          />
                          <h4 className="font-orbitron text-sm font-bold text-white">
                            {voice.name}
                          </h4>
                        </div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            voice.gender === 'Female'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                              : voice.gender === 'Robotic'
                              ? 'bg-red-950 text-red-300 border border-red-500/30'
                              : 'bg-blue-950 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {voice.gender} Character
                        </span>
                      </div>

                      {isCurrent && (
                        <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>

                    <p className="mt-2 text-xs text-slate-400 font-rajdhani line-clamp-2">
                      {voice.description}
                    </p>

                    {/* Quick Preview Button */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoice(voice);
                          handlePreviewVoice(voice);
                        }}
                        className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Sample Voice</span>
                      </button>
                      <span className="text-[10px] font-mono text-slate-500">
                        Pitch {voice.pitch} | Rate {voice.rate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* REAL-TIME SLIDERS FOR VOICE CHANGER MODULATION */}
          <div className="p-4 rounded-2xl bg-black/60 border border-red-500/30 space-y-4">
            <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-cyan-400 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" /> Voice Changer Modulators ({selectedVoice.name})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pitch Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Vocal Pitch (Bass to High)</span>
                  <span className="text-red-400 font-bold">{testPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.8"
                  step="0.05"
                  value={testPitch}
                  onChange={(e) => setTestPitch(parseFloat(e.target.value))}
                  className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Rate Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Speech Velocity / Tempo</span>
                  <span className="text-cyan-400 font-bold">{testRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={testRate}
                  onChange={(e) => setTestRate(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => handlePreviewVoice(selectedVoice)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-rajdhani font-bold transition-colors"
              >
                <Play className="w-3 h-3 text-cyan-400 fill-current" />
                <span>Test Configured Tone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTestPitch(selectedVoice.pitch);
                  setTestRate(selectedVoice.rate);
                }}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-rajdhani text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyVoice}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-orbitron text-xs font-bold tracking-wider shadow-[0_0_20px_rgba(255,26,64,0.6)] active:scale-95 transition-all"
            >
              ACTIVATE VOICE PERSONA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
