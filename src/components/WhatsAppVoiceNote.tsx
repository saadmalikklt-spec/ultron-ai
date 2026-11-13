import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCheck, Mic } from 'lucide-react';
import { VoiceNoteData, VoiceProfile } from '../types';
import { speakText, stopSpeaking } from '../utils/audio';

interface WhatsAppVoiceNoteProps {
  voiceNote: VoiceNoteData;
  isUser: boolean;
  userAvatar?: string;
  assistantText?: string;
  currentVoice?: VoiceProfile;
  timestamp: string;
}

export const WhatsAppVoiceNote: React.FC<WhatsAppVoiceNoteProps> = ({
  voiceNote,
  isUser,
  userAvatar,
  assistantText = '',
  currentVoice,
  timestamp,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentProgress, setCurrentProgress] = useState(0); // 0 to 1
  const [elapsedTime, setElapsedTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const duration = Math.max(1, voiceNote.durationSeconds || 6);

  // Cycle speed: 1x -> 1.5x -> 2x -> 1x
  const handleToggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = () => {
    setIsPlaying(true);

    if (voiceNote.audioBlobUrl) {
      // Direct audio blob playback
      if (!audioRef.current) {
        audioRef.current = new Audio(voiceNote.audioBlobUrl);
      }
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(e => console.warn('Audio play error:', e));

      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          const prog = audioRef.current.currentTime / (audioRef.current.duration || duration);
          setCurrentProgress(Math.min(1, prog));
          setElapsedTime(audioRef.current.currentTime);
        }
      };

      audioRef.current.onended = () => {
        stopPlayback();
      };
    } else if (!isUser && assistantText && currentVoice) {
      // Ultron voice response speech synthesis playback
      const estimatedDuration = Math.max(3, assistantText.split(' ').length * 0.35 / playbackSpeed);
      const startMs = Date.now();

      intervalRef.current = window.setInterval(() => {
        const elapsedSec = (Date.now() - startMs) / 1000;
        const prog = Math.min(1, elapsedSec / estimatedDuration);
        setCurrentProgress(prog);
        setElapsedTime(elapsedSec);

        if (prog >= 1) {
          stopPlayback();
        }
      }, 100);

      speakText(
        assistantText,
        { ...currentVoice, rate: currentVoice.rate * playbackSpeed },
        () => setIsPlaying(true),
        () => stopPlayback()
      );
    } else {
      // Simulated audio waveform progress
      const startMs = Date.now();
      intervalRef.current = window.setInterval(() => {
        const elapsedSec = ((Date.now() - startMs) / 1000) * playbackSpeed;
        const prog = Math.min(1, elapsedSec / duration);
        setCurrentProgress(prog);
        setElapsedTime(elapsedSec);
        if (prog >= 1) {
          stopPlayback();
        }
      }, 80);
    }
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentProgress(0);
    setElapsedTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    stopSpeaking();
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const waveformBars = voiceNote.waveform && voiceNote.waveform.length > 0
    ? voiceNote.waveform
    : [20, 35, 60, 45, 80, 50, 70, 90, 40, 25, 55, 75, 95, 60, 40, 30, 65, 85, 45, 30, 50, 70, 40, 25];

  return (
    <div
      className={`rounded-2xl p-3 max-w-[340px] sm:max-w-[380px] select-none shadow-lg border transition-all ${
        isUser
          ? 'bg-gradient-to-r from-blue-950/80 to-[#0d1c3a] border-blue-500/40 text-blue-50'
          : 'bg-gradient-to-r from-red-950/80 to-[#1e070c] border-red-500/40 text-red-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with Mic Indicator */}
        <div className="relative flex-shrink-0">
          {isUser && userAvatar ? (
            <img
              src={userAvatar}
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-cyan-400 object-cover shadow-[0_0_8px_rgba(0,210,255,0.5)]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center shadow-[0_0_10px_rgba(255,26,64,0.6)]">
              <span className="font-orbitron text-xs font-black text-red-400">UL</span>
            </div>
          )}
          <span
            className={`absolute -bottom-1 -right-1 p-0.5 rounded-full ${
              isUser ? 'bg-cyan-500 text-slate-950' : 'bg-red-500 text-white'
            }`}
          >
            <Mic className="w-2.5 h-2.5" />
          </span>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-md ${
            isUser
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.5)]'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(255,26,64,0.6)]'
          }`}
          title={isPlaying ? 'Pause' : 'Play voice note'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Waveform Scrubber & Timer */}
        <div className="flex-1 min-w-0">
          {/* Waveform bars */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const newProg = Math.max(0, Math.min(1, clickX / rect.width));
              setCurrentProgress(newProg);
              if (audioRef.current) {
                audioRef.current.currentTime = newProg * (audioRef.current.duration || duration);
              }
              if (!isPlaying) startPlayback();
            }}
            className="flex items-center gap-[2.5px] h-8 cursor-pointer py-1"
          >
            {waveformBars.map((height, idx) => {
              const barProg = idx / waveformBars.length;
              const isPassed = barProg <= currentProgress;

              return (
                <div
                  key={idx}
                  className={`w-[3px] rounded-full transition-all duration-75 ${
                    isPassed
                      ? isUser
                        ? 'bg-cyan-400'
                        : 'bg-red-500 shadow-[0_0_6px_#ff1a40]'
                      : isUser
                      ? 'bg-cyan-900/60'
                      : 'bg-red-950/80'
                  }`}
                  style={{
                    height: `${Math.max(18, height)}%`,
                  }}
                />
              );
            })}
          </div>

          {/* Time & Speed Controls */}
          <div className="flex items-center justify-between text-[11px] font-mono opacity-80 pt-0.5">
            <span>{isPlaying ? formatTime(elapsedTime) : formatTime(duration)}</span>

            <div className="flex items-center gap-2">
              {/* Playback speed toggle */}
              <button
                onClick={handleToggleSpeed}
                className="px-1.5 py-0.2 rounded bg-black/40 hover:bg-black/60 text-[10px] font-bold text-cyan-300 font-mono border border-cyan-500/20"
                title="Change speed"
              >
                {playbackSpeed}x
              </button>

              <span className="text-[10px] text-slate-400">{timestamp}</span>

              {/* WhatsApp double tick */}
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
