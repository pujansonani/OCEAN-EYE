import React, { useState, useEffect } from 'react';

interface SouffletLoaderProps {
  onComplete?: () => void;
}

export const SouffletLoader: React.FC<SouffletLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('SYNCHRONIZING SENTINEL-1A SAR ORBIT...');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // 2.2s cinematic load duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      if (pct < 30) {
        setStatusMessage('SYNCHRONIZING COPERNICUS C-SAR RADAR...');
      } else if (pct < 65) {
        setStatusMessage('CALIBRATING INCOIS LAGRANGIAN DRIFT FIELD...');
      } else if (pct < 90) {
        setStatusMessage('CORRELATING ARABIAN SEA FLEET AIS...');
      } else {
        setStatusMessage('MARITIME INTELLIGENCE READY');
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDone(true);
            if (onComplete) onComplete();
          }, 600); // fade out transition duration
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between p-8 sm:p-12 bg-[#05070d] text-white select-none transition-all duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 -translate-y-6 pointer-events-none scale-105' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Top Header info */}
      <div className="w-full flex items-center justify-between text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#d8b452] animate-pulse" />
          <span className="text-slate-400">MISSION SYSTEM BOOTSTRAP</span>
        </div>
        <div className="tracking-widest text-[#d8b452]">
          [ SECTOR 7 // MRCC ]
        </div>
      </div>

      {/* Central Soufflet Totem & Text Mask */}
      <div className="flex flex-col items-center space-y-8 my-auto">
        {/* Animated 4-Petal Golden Totem */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Subtle glowing halo */}
          <div className="absolute inset-0 bg-[#d8b452]/10 rounded-full blur-xl animate-pulse" />

          <svg
            width="56"
            height="56"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin [animation-duration:12s]"
          >
            <path
              className="loader-petal loader-petal-1"
              d="M4.919 20.0389L6.967 17.9751H13.918V24.9797L11.87 27.0435C8.72 30.2174 4.453 31.9999 0 31.9999C0 27.5126 1.769 23.2129 4.919 20.0389Z"
              fill="#D8B452"
            />
            <path
              className="loader-petal loader-petal-2"
              d="M11.87 4.95635L13.918 7.0202V14.0248H6.967L4.919 11.9609C1.769 8.78697 0 4.4873 0 0C4.453 0 8.72 1.78241 11.87 4.95635Z"
              fill="#D8B452"
            />
            <path
              className="loader-petal loader-petal-3"
              d="M26.843 11.9609L24.795 14.0248H17.844V7.0202L19.892 4.95635C23.042 1.78241 27.308 0 31.761 0C31.761 4.4873 29.993 8.78697 26.848 11.9609"
              fill="#D8B452"
            />
            <path
              className="loader-petal loader-petal-4"
              d="M19.892 27.0489L17.844 24.985V17.9805H24.795L26.843 20.0443C29.993 23.2183 31.761 27.5179 31.761 32.0052C27.308 32.0052 23.042 30.2228 19.892 27.0489Z"
              fill="#D8B452"
            />
          </svg>
        </div>

        {/* Text Mask Upward Reveal */}
        <div className="overflow-hidden text-center space-y-2.5">
          <div className="overflow-hidden">
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white animate-slideUp">
              OCEAN<span className="text-cyan-400 font-tech font-bold">&bull;</span>EYE
            </h1>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs sm:text-sm font-mono tracking-[0.25em] text-cyan-400 uppercase animate-slideUpDelay font-medium">
              SATELLITE OIL SPILL FORENSICS &amp; VESSEL ATTRIBUTION
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Progress Bar & Telemetry Status */}
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 text-[11px] truncate mr-2">
            {statusMessage}
          </span>
          <span className="text-[#d8b452] font-bold">
            {progress}%
          </span>
        </div>

        {/* Ultra-slim elegant golden progress line */}
        <div className="w-full h-0.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#d8b452] via-[#f5deb3] to-[#d8b452] transition-all duration-100 ease-out shadow-sm shadow-[#d8b452]/50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
