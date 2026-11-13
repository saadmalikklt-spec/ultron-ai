import React, { useEffect, useState, useRef } from 'react';

interface RobotFaceProps {
  isSpeaking: boolean;
  isListening?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  voiceProfileName?: string;
  activeStatusText?: string;
}

export const RobotFace: React.FC<RobotFaceProps> = ({
  isSpeaking,
  isListening = false,
  size = 'md',
  voiceProfileName = 'Ultron Prime',
  activeStatusText = 'SYSTEM OPTIMAL',
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mouthBars, setMouthBars] = useState<number[]>([15, 25, 45, 60, 45, 25, 15]);
  const animationRef = useRef<number | null>(null);

  // Mouse tracking for subtle eye movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const x = (e.clientX - centerX) / centerX; // -1 to 1
      const y = (e.clientY - centerY) / centerY;
      setMousePos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate mouth equalizer bars when speaking or listening
  useEffect(() => {
    let phase = 0;
    const animate = () => {
      phase += 0.2;
      if (isSpeaking) {
        setMouthBars([
          Math.sin(phase * 1.5) * 35 + 45,
          Math.cos(phase * 1.8) * 45 + 50,
          Math.sin(phase * 2.1) * 60 + 65,
          Math.cos(phase * 2.4) * 75 + 80,
          Math.sin(phase * 2.1) * 60 + 65,
          Math.cos(phase * 1.8) * 45 + 50,
          Math.sin(phase * 1.5) * 35 + 45,
        ]);
      } else if (isListening) {
        setMouthBars([
          Math.sin(phase * 0.8) * 15 + 20,
          Math.cos(phase * 0.9) * 20 + 25,
          Math.sin(phase * 1.1) * 30 + 35,
          Math.cos(phase * 1.2) * 35 + 40,
          Math.sin(phase * 1.1) * 30 + 35,
          Math.cos(phase * 0.9) * 20 + 25,
          Math.sin(phase * 0.8) * 15 + 20,
        ]);
      } else {
        setMouthBars([10, 15, 22, 28, 22, 15, 10]);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSpeaking, isListening]);

  const eyeOffsetX = mousePos.x * 6;
  const eyeOffsetY = mousePos.y * 4;

  const scaleClasses = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72 sm:w-80 sm:h-80',
    lg: 'w-96 h-96',
    fullscreen: 'w-80 h-80 sm:w-[420px] sm:h-[420px]',
  }[size];

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Outer Holographic Rings */}
      <div className={`relative ${scaleClasses} flex items-center justify-center`}>
        {/* Rotating Cyber Ring */}
        <div
          className={`absolute inset-0 rounded-full border border-red-500/20 border-dashed animate-spin`}
          style={{ animationDuration: isSpeaking ? '8s' : '22s' }}
        />
        {/* Cyan Sub-Ring */}
        <div
          className="absolute inset-4 rounded-full border border-cyan-400/20 border-dotted animate-spin"
          style={{ animationDuration: '16s', animationDirection: 'reverse' }}
        />

        {/* Ambient Crimson Halo Glow */}
        <div
          className={`absolute inset-8 rounded-full bg-gradient-to-tr from-red-600/30 via-red-900/10 to-transparent blur-2xl transition-all duration-500 ${
            isSpeaking ? 'scale-110 opacity-100 bg-red-600/40' : 'scale-95 opacity-60'
          }`}
        />

        {/* SVG Robot Face Graphic */}
        <svg
          viewBox="0 0 320 320"
          className="w-full h-full relative z-10 drop-shadow-[0_0_35px_rgba(255,26,64,0.7)]"
        >
          <defs>
            <linearGradient id="metalPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1a0508" />
              <stop offset="50%" stopColor="#2c090e" />
              <stop offset="100%" stopColor="#0c0204" />
            </linearGradient>

            <linearGradient id="crimsonLaserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0033" />
              <stop offset="50%" stopColor="#ff4d6d" />
              <stop offset="100%" stopColor="#ff0033" />
            </linearGradient>

            <linearGradient id="eyeGlowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#ff1a40" />
              <stop offset="100%" stopColor="#b3001e" />
            </linearGradient>

            <radialGradient id="reactorGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00d2ff" />
              <stop offset="60%" stopColor="#0055ff" />
              <stop offset="100%" stopColor="#ff1a40" />
            </radialGradient>

            <filter id="crimsonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Head Outer Armor Silhouette (Ultron Menacing Cranium) */}
          <path
            d="M 160 25 
               L 245 48 
               L 280 120 
               L 265 200 
               L 220 270 
               L 160 295 
               L 100 270 
               L 55 200 
               L 40 120 
               L 75 48 Z"
            fill="url(#metalPlateGrad)"
            stroke="#ff1a40"
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />

          {/* Temple Ear Plates & Cyber Grids */}
          <path
            d="M 40 120 L 20 160 L 55 200 Z"
            fill="#120407"
            stroke="#ff1a40"
            strokeWidth="1.5"
          />
          <path
            d="M 280 120 L 300 160 L 265 200 Z"
            fill="#120407"
            stroke="#ff1a40"
            strokeWidth="1.5"
          />

          {/* Forehead Nexus Power Core (Arc Reactor) */}
          <circle
            cx="160"
            cy="68"
            r="16"
            fill="url(#reactorGrad)"
            stroke="#00d2ff"
            strokeWidth="2"
            filter="url(#crimsonGlow)"
            className={isSpeaking ? 'animate-pulse' : ''}
          />
          <circle cx="160" cy="68" r="7" fill="#ffffff" opacity="0.9" />

          {/* Neural Lines from Forehead Core */}
          <line x1="160" y1="84" x2="160" y2="120" stroke="#00d2ff" strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1="145" y1="72" x2="105" y2="92" stroke="#ff1a40" strokeWidth="1.2" strokeOpacity="0.8" />
          <line x1="175" y1="72" x2="215" y2="92" stroke="#ff1a40" strokeWidth="1.2" strokeOpacity="0.8" />

          {/* Brow Plates / Aggressive Angular Visor */}
          <path
            d="M 80 126 L 150 144 L 160 146 L 170 144 L 240 126 L 225 116 L 160 132 L 95 116 Z"
            fill="#330b13"
            stroke="#ff1a40"
            strokeWidth="1.8"
          />

          {/* Left Ocular Visor Socket */}
          <polygon
            points="85,138 142,152 140,172 92,165"
            fill="#050102"
            stroke="#ff1a40"
            strokeWidth="1.5"
          />

          {/* Right Ocular Visor Socket */}
          <polygon
            points="235,138 178,152 180,172 228,165"
            fill="#050102"
            stroke="#ff1a40"
            strokeWidth="1.5"
          />

          {/* LEFT EYE - Glowing Crimson Optical Sensor with Pupil & Scan Ring */}
          <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
            {/* Outer Eye Slit */}
            <path
              d="M 96 150 Q 115 146 135 156 Q 115 168 96 150 Z"
              fill="url(#eyeGlowGrad)"
              filter="url(#crimsonGlow)"
              className="animate-robot-blink"
            />
            {/* Intense Core Pupil */}
            <circle
              cx="115"
              cy="154"
              r={isSpeaking ? 5.5 : 4.5}
              fill="#ffffff"
              className={isSpeaking ? 'animate-ping' : ''}
              style={{ animationDuration: '1.2s' }}
            />
            <circle cx="115" cy="154" r="2" fill="#00d2ff" />
          </g>

          {/* RIGHT EYE - Glowing Crimson Optical Sensor with Pupil & Scan Ring */}
          <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
            {/* Outer Eye Slit */}
            <path
              d="M 224 150 Q 205 146 185 156 Q 205 168 224 150 Z"
              fill="url(#eyeGlowGrad)"
              filter="url(#crimsonGlow)"
              className="animate-robot-blink"
            />
            {/* Intense Core Pupil */}
            <circle
              cx="205"
              cy="154"
              r={isSpeaking ? 5.5 : 4.5}
              fill="#ffffff"
              className={isSpeaking ? 'animate-ping' : ''}
              style={{ animationDuration: '1.2s' }}
            />
            <circle cx="205" cy="154" r="2" fill="#00d2ff" />
          </g>

          {/* Cheek Armor Facets & Ventilation Ports */}
          <line x1="85" y1="185" x2="115" y2="200" stroke="#ff1a40" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="88" y1="193" x2="118" y2="208" stroke="#ff1a40" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="235" y1="185" x2="205" y2="200" stroke="#ff1a40" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="232" y1="193" x2="202" y2="208" stroke="#ff1a40" strokeWidth="1" strokeOpacity="0.5" />

          {/* Central Nose Bridge Ridge */}
          <polygon
            points="156,146 164,146 168,198 152,198"
            fill="#22060b"
            stroke="#ff1a40"
            strokeWidth="1.2"
          />

          {/* Lower Jaw Shell Structure */}
          <path
            d="M 115 220 L 205 220 L 195 265 L 160 282 L 125 265 Z"
            fill="#100305"
            stroke="#ff1a40"
            strokeWidth="1.8"
          />

          {/* Mouth Cavity & Real-Time Dynamic Soundwave Equalizer */}
          <rect
            x="122"
            y="228"
            width="76"
            height="26"
            rx="4"
            fill="#050102"
            stroke={isSpeaking ? '#00d2ff' : '#ff1a40'}
            strokeWidth="1.2"
          />

          {/* Reactive Mouth Equalizer Bars (Animates when Ultron Speaks!) */}
          {mouthBars.map((heightPct, idx) => {
            const barWidth = 6;
            const barGap = 4;
            const startX = 129 + idx * (barWidth + barGap);
            const maxH = 20;
            const actualH = (heightPct / 100) * maxH;
            const posY = 228 + (26 - actualH) / 2;

            return (
              <rect
                key={idx}
                x={startX}
                y={posY}
                width={barWidth}
                height={actualH}
                rx="2"
                fill={isSpeaking ? '#ff1a40' : isListening ? '#00d2ff' : '#6b1120'}
                filter={isSpeaking ? 'url(#crimsonGlow)' : undefined}
                className="transition-all duration-75"
              />
            );
          })}

          {/* Chin Accent Lines */}
          <line x1="145" y1="262" x2="175" y2="262" stroke="#00d2ff" strokeWidth="1.5" strokeOpacity="0.8" />
          <circle cx="160" cy="272" r="2.5" fill="#ff1a40" />
        </svg>

        {/* Dynamic Voice Waveform Rings underneath */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping pointer-events-none" style={{ animationDuration: '1.4s' }} />
        )}
      </div>

      {/* Futuristic Telemetry Label */}
      <div className="mt-3 flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isSpeaking ? 'bg-red-500 animate-ping' : isListening ? 'bg-cyan-400 animate-pulse' : 'bg-red-600'
            }`}
          />
          <span className="font-orbitron text-xs tracking-wider text-red-400 font-bold uppercase">
            {isSpeaking ? 'ULTRON TRANSMITTING' : isListening ? 'NEURAL SENSORS LISTENING' : activeStatusText}
          </span>
        </div>
        <span className="text-[10px] tracking-widest text-cyan-400/80 uppercase font-rajdhani mt-0.5">
          VOICE MATRIX: {voiceProfileName} // SYNC 100%
        </span>
      </div>
    </div>
  );
};
