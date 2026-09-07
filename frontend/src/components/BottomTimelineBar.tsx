import React, { useState } from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Compass,
  MapPin,
  Sliders,
  Calendar,
  FastForward
} from 'lucide-react';

export const BottomTimelineBar: React.FC = () => {
  const {
    cursorPos,
    zoomLevel,
    timelineUtc,
    setTimelineUtc,
    isPlayingTrack,
    setIsPlayingTrack,
    playbackSpeed,
    setPlaybackSpeed
  } = useMaritimeStore();

  const [sliderVal, setSliderVal] = useState(70);

  const checkpoints = [
    { label: '06:00 Rel Start', pct: 14, time: '2026-09-06 06:00:00 UTC' },
    { label: '08:25 Vessel A Anomaly', pct: 49, time: '2026-09-06 08:25:00 UTC', isAlert: true },
    { label: '10:00 Rel End', pct: 71, time: '2026-09-06 10:00:00 UTC' },
    { label: '10:42 Sentinel-1 Pass', pct: 81, time: '2026-09-06 10:42:00 UTC', isKey: true },
  ];

  const handleSliderChange = (val: number) => {
    setSliderVal(val);
    const mins = Math.floor((val / 100) * 420);
    const totalMinutes = 5 * 60 + mins;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const timeStr = `2026-09-06 ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00 UTC`;
    setTimelineUtc(timeStr);
  };

  const handleJump = (time: string, pct: number) => {
    setSliderVal(pct);
    setTimelineUtc(time);
  };

  return (
    <footer className="h-11 bg-[#0a101d] border-t border-slate-800/80 px-4 flex items-center justify-between text-xs font-sans text-slate-300 z-50 select-none shrink-0">
      {/* Left: GIS Coordinates & Spatial Reference */}
      <div className="flex items-center gap-3 text-xs shrink-0 font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">
            <strong className="text-white">{cursorPos.lat.toFixed(4)}°N</strong>,{' '}
            <strong className="text-white">{cursorPos.lon.toFixed(4)}°E</strong>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-slate-500 border-l border-slate-800 pl-3 text-[11px]">
          <span>ZOOM: <strong className="text-slate-300">{zoomLevel}</strong></span>
          <span>&bull;</span>
          <span>WGS 84 (EPSG:4326)</span>
        </div>
      </div>

      {/* Center: Global Investigation Timeline Slider */}
      <div className="flex-1 max-w-xl mx-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300 text-[11px] shrink-0 font-mono bg-slate-900/90 px-2.5 py-0.5 rounded border border-slate-700/80">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-cyan-300 font-bold">{timelineUtc.substring(11, 19)} UTC</span>
          <span className="text-slate-600">/</span>
          <span className="text-[#d8b452] font-semibold">
            {(() => {
              try {
                const d = new Date(timelineUtc);
                if (!isNaN(d.getTime())) {
                  return d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' IST';
                }
              } catch (e) {}
              return 'IST';
            })()}
          </span>
        </div>

        {/* Timeline Slider with checkpoints */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg accent-amber-400 cursor-pointer"
          />

          {/* Key Checkpoint Clickable Badges */}
          <div className="absolute -top-4 w-full flex justify-between px-0.5 pointer-events-auto text-[9px] text-slate-500">
            {checkpoints.map((cp) => (
              <button
                key={cp.time}
                onClick={() => handleJump(cp.time, cp.pct)}
                className={`hover:underline cursor-pointer transition-colors ${
                  cp.isAlert
                    ? 'text-red-400 font-bold'
                    : cp.isKey
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400'
                }`}
                title={`Jump to ${cp.label}`}
              >
                {cp.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Playback Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsPlayingTrack(!isPlayingTrack)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            isPlayingTrack
              ? 'bg-amber-950 text-amber-300 border border-amber-700 shadow-sm'
              : 'bg-cyan-950/80 text-cyan-200 border border-cyan-600/60 hover:bg-cyan-900'
          }`}
        >
          {isPlayingTrack ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlayingTrack ? 'PAUSE' : 'REPLAY'}</span>
        </button>

        <button
          onClick={() => {
            const speeds = [1, 2, 5, 10];
            const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
            setPlaybackSpeed(speeds[nextIdx]);
          }}
          className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white font-mono text-[10px] font-bold"
          title="Change Playback Speed"
        >
          {playbackSpeed}x
        </button>

        <button
          onClick={() => handleJump('2026-09-06 06:00:00 UTC', 14)}
          className="p-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white"
          title="Reset Timeline to Start"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
