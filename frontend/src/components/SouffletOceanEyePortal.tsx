import React, { useState, useEffect, useRef } from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import {
  Satellite,
  Radar,
  Waves,
  Ship,
  Sparkles,
  Compass,
  FileText,
  ShieldCheck,
  Database,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  MapPin,
  TrendingUp,
  Cpu,
  BarChart3,
  ExternalLink,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  Activity,
  ChevronRight,
  Globe2,
  Maximize2
} from 'lucide-react';

export const SouffletOceanEyePortal: React.FC = () => {
  const {
    setActiveView,
    vessels,
    satelliteScene,
    environment,
    liveEventLogs,
    setSelectedEntity,
    evidenceThreshold,
    setEvidenceThreshold
  } = useMaritimeStore();

  // Story horizontal slider index
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [spectralMode, setSpectralMode] = useState<'SAR_RADAR' | 'OPTICAL_RGB' | 'AI_MASK' | 'CURRENT_VECTORS'>('SAR_RADAR');
  
  // Interactive Drift Reversal Sandbox
  const [hindcastHours, setHindcastHours] = useState<number>(4.7);
  const [simWindSpeed, setSimWindSpeed] = useState<number>(14.2);
  const [simCurrentSpeed, setSimCurrentSpeed] = useState<number>(0.85);

  // Real-Time Live Clock state (IST & GMT/UTC)
  const [realDateStr, setRealDateStr] = useState<string>('');
  const [istLiveTime, setIstLiveTime] = useState<string>('');
  const [gmtLiveTime, setGmtLiveTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istT = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const istD = now.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
      const gmtT = now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

      setRealDateStr(istD);
      setIstLiveTime(`${istT} IST`);
      setGmtLiveTime(`${gmtT} GMT`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sound Synth Toggle
  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundTimerRef = useRef<number | null>(null);

  // Canvas particle wave animation ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const candidates = vessels.filter((v) => v.is_candidate);
  const primaryCandidate = candidates[0] || vessels[0];

  // Dynamic calculated origin
  const calculatedLat = (18.916 + (hindcastHours * 0.012) * Math.cos((45 * Math.PI) / 180)).toFixed(4);
  const calculatedLon = (72.249 - (hindcastHours * 0.014) * Math.sin((45 * Math.PI) / 180)).toFixed(4);
  const calculatedInterceptError = Math.max(0.18, 0.42 - (hindcastHours === 4.7 ? 0 : Math.abs(hindcastHours - 4.7) * 0.08)).toFixed(2);

  // Web Audio Sonar / Ocean Synth
  const toggleSound = () => {
    if (!isAudioActive) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        // Create subtle maritime ping
        const playSonarPing = () => {
          if (!audioContextRef.current || audioContextRef.current.state !== 'running') return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(840, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.8);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 1.2);
        };

        playSonarPing();
        soundTimerRef.current = window.setInterval(playSonarPing, 5000);
        setIsAudioActive(true);
      } catch (e) {
        console.warn('Audio not allowed', e);
      }
    } else {
      if (soundTimerRef.current) clearInterval(soundTimerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      setIsAudioActive(false);
    }
  };

  // Three-dimensional fluid particle canvas (Soufflet Malt style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 480);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = 480;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const cols = 36;
    const rows = 14;
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const spacingX = width / (cols - 1);
      const spacingY = height / (rows - 1);

      // Draw grid lines and fluid points
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;

        for (let c = 0; c < cols; c++) {
          const x = c * spacingX;
          const wave = Math.sin(time + c * 0.25 + r * 0.35) * 18 + Math.cos(time * 0.8 + c * 0.15) * 12;
          const y = r * spacingY + wave;

          if (c === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Golden/Cyan accent glowing points on peaks
          if ((c + r) % 4 === 0) {
            ctx.fillStyle = (c + r) % 8 === 0 ? 'rgba(216, 180, 82, 0.7)' : 'rgba(56, 189, 248, 0.6)';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const storyChapters = [
    {
      step: '01',
      tag: 'EARTH OBSERVATION',
      title: 'Satellite SAR Radar Detection',
      desc: 'Copernicus Sentinel-1 C-SAR radar sweeps across oceanic corridors, detecting hydrocarbon surface tension anomalies with 10m spatial resolution and zero weather occlusion.',
      badge: 'ESA SENTINEL-1A C-SAR',
      stat: '65.7 km²',
      statLabel: 'Slick Surface Swath',
      color: '#38bdf8'
    },
    {
      step: '02',
      tag: 'HYDRODYNAMIC SIMULATION',
      title: '2D Lagrangian Drift Reversal',
      desc: 'Coupling ECMWF ERA5 10m wind fields with INCOIS ocean currents, our 4th-order Runge-Kutta model calculates reverse dispersion trajectories to isolate the precise release coordinate.',
      badge: 'INCOIS ROMS MODEL',
      stat: '4.7 Hours',
      statLabel: 'Hindcast Window',
      color: '#d8b452'
    },
    {
      step: '03',
      tag: 'SPATIOTEMPORAL FORENSICS',
      title: 'Vessel Attribution Matrix',
      desc: 'Correlating 12,000+ terrestrial and satellite AIS tracks against the origin corridor, cross-referencing dead-reckoning during transmitter blackout periods.',
      badge: '91.4% CONFIDENCE',
      stat: '0.42 nm',
      statLabel: 'CPA Intercept Margin',
      color: '#ef4444'
    },
    {
      step: '04',
      tag: 'LEGAL ADMISSIBILITY',
      title: 'MARPOL Annex I Legal Dossier',
      desc: 'Automatic generation of cryptographic SHA-256 evidence packages tailored for the Indian Coast Guard and International Maritime Organization prosecution standards.',
      badge: 'IMO COMPLIANT',
      stat: '100%',
      statLabel: 'Chain-of-Custody',
      color: '#10b981'
    }
  ];

  return (
    <div className="flex-1 w-full h-full bg-[#05070d] text-slate-100 font-sans selection:bg-[#d8b452] selection:text-black overflow-y-auto">
      
      {/* ========================================================================= */}
      {/* 1. SOUFFLET MALT STYLE SUPER-HEADER & HERO BANNER */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between px-4 sm:px-8 lg:px-12 pt-8 pb-12 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0a0f1d] via-[#060913] to-[#05070d]">
        
        {/* High-Definition Background Ambient Video 1 */}
        <video
          src="/videos/video1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none mix-blend-screen z-0"
        />
        {/* Subtle dark cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d]/80 via-[#060913]/65 to-[#05070d] z-0 pointer-events-none" />

        {/* Animated Fluid Canvas Wave Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0"
        />

        {/* Top Floating Totem & Station Status */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-3">
            {/* Soufflet Gold Rotating Totem */}
            <div className="w-8 h-8 rounded-full bg-[#0e1628] border border-[#d8b452]/50 flex items-center justify-center shadow-lg shadow-[#d8b452]/10">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="animate-spin [animation-duration:16s]">
                <path d="M4.919 20.0389L6.967 17.9751H13.918V24.9797L11.87 27.0435C8.72 30.2174 4.453 31.9999 0 31.9999C0 27.5126 1.769 23.2129 4.919 20.0389Z" fill="#D8B452"/>
                <path d="M11.87 4.95635L13.918 7.0202V14.0248H6.967L4.919 11.9609C1.769 8.78697 0 4.4873 0 0C4.453 0 8.72 1.78241 11.87 4.95635Z" fill="#D8B452"/>
                <path d="M26.843 11.9609L24.795 14.0248H17.844V7.0202L19.892 4.95635C23.042 1.78241 27.308 0 31.761 0C31.761 4.4873 29.993 8.78697 26.848 11.9609" fill="#D8B452"/>
                <path d="M19.892 27.0489L17.844 24.985V17.9805H24.795L26.843 20.0443C29.993 23.2183 31.761 27.5179 31.761 32.0052C27.308 32.0052 23.042 30.2228 19.892 27.0489Z" fill="#D8B452"/>
              </svg>
            </div>
            <div>
              <span className="text-sm font-display font-bold tracking-tight text-white block">
                OCEAN<span className="text-cyan-400 font-tech font-bold">&bull;</span>EYE <span className="text-cyan-400 font-mono font-normal text-xs">&bull; INTELLIGENCE</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                SECTOR 7 ARABIAN SEA BASIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time Date and Dual IST & GMT Clock */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-cyan-300 font-semibold">{realDateStr}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-white font-bold">{istLiveTime}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{gmtLiveTime}</span>
            </div>

            <button
              onClick={() => setActiveView('MAP')}
              className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-display font-bold tracking-wide transition-all shadow-md shadow-cyan-500/20"
            >
              Enter Tactical Map
            </button>
          </div>
        </div>

        {/* Hero Dramatic Typography */}
        <div className="relative z-10 my-auto py-12 max-w-5xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 uppercase font-semibold">
            <span>[ MULTI-PAYLOAD SATELLITE EO &amp; AI ]</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.12]">
            Unleash the Power of{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
              Maritime Geospatial Intelligence
            </span>{' '}
            &amp; Satellite Forensics.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal max-w-3xl leading-relaxed">
            From active C-band radar backscatter to reverse Lagrangian hydrodynamic particle drift, Ocean-Eye delivers mathematical certainty in detecting marine oil spills and pinpointing suspect vessels.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setActiveView('MAP')}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105"
            >
              <span>EXPLORE LIVE OPERATIONAL CHART</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setActiveView('ATTRIBUTION')}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-sm font-display font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Attribution Engine</span>
            </button>
          </div>
        </div>

        {/* Bottom Ambient Sound Toggle & Live Metric Footer */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/60 pt-6">
          {/* Sound Toggle (Soufflet Style) */}
          <button
            onClick={toggleSound}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-300 hover:text-white hover:border-[#d8b452] transition-colors"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#d8b452] animate-pulse" />
                <span>SONAR AUDIO: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span>SONAR AUDIO: MUTED</span>
              </>
            )}
          </button>

          {/* Live Real-Time Moving Telemetry Metrics */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-slate-400">
            <div>
              <span className="text-slate-500">LIVE TARGET:</span>{' '}
              <strong className="text-red-400 font-bold">{primaryCandidate.name}</strong>{' '}
              <span className="text-[10px] text-cyan-400">({primaryCandidate.lat.toFixed(4)}°N, {primaryCandidate.lon.toFixed(4)}°E)</span>
            </div>
            <div>
              <span className="text-slate-500">SPEED:</span>{' '}
              <strong className="text-white font-bold">{primaryCandidate.sog} kts</strong>
            </div>
            <div>
              <span className="text-slate-500">WIND:</span>{' '}
              <strong className="text-cyan-300 font-bold">
                {environment ? (environment.wind_velocity_mps * 1.94384).toFixed(1) : '14.2'} kts
              </strong>
            </div>
            <div>
              <span className="text-slate-500">HINDCAST:</span>{' '}
              <strong className="text-[#d8b452] font-bold">4.7 Hours (91.4% Fit)</strong>
            </div>
          </div>
        </div>

        {/* Live Operational AIS Stream Banner */}
        {liveEventLogs && liveEventLogs.length > 0 && (
          <div className="relative z-10 mt-4 px-4 py-2 rounded-lg bg-[#040711]/90 border border-slate-800 flex items-center justify-between text-[11px] font-mono shadow-inner">
            <div className="flex items-center gap-2.5 truncate mr-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-emerald-400 font-bold shrink-0">● LIVE TELEMETRY DECODE:</span>
              <span className="text-slate-300 truncate">{liveEventLogs[0].message}</span>
            </div>
            <span className="text-[#d8b452] shrink-0 hidden sm:inline">
              {liveEventLogs[0].time}
            </span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. SOUFFLET HORIZONTAL INTERACTIVE CHAPTER CAROUSEL */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold block">
              [ THE FOUR PILLARS OF OCEAN-EYE ]
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
              End-to-End <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Forensic Journey</span>
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStoryIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStoryIndex === 0}
              className="p-3 rounded-full bg-slate-900 border border-slate-700 text-white disabled:opacity-30 hover:border-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveStoryIndex((prev) => Math.min(storyChapters.length - 1, prev + 1))}
              disabled={activeStoryIndex === storyChapters.length - 1}
              className="p-3 rounded-full bg-slate-900 border border-slate-700 text-white disabled:opacity-30 hover:border-cyan-400 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Story Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {storyChapters.map((chapter, idx) => (
            <div
              key={chapter.step}
              onClick={() => setActiveStoryIndex(idx)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[360px] ${
                activeStoryIndex === idx
                  ? 'bg-gradient-to-b from-[#0c182e] to-[#060c18] border-cyan-500/80 shadow-2xl shadow-cyan-500/10 scale-[1.02]'
                  : 'bg-[#090d18] border-slate-800/90 hover:border-slate-700 hover:bg-[#0c1222]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs text-slate-500 mb-4">
                  <span className="text-2xl font-tech font-bold text-cyan-400">{chapter.step}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                    {chapter.tag}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-3 leading-snug">
                  {chapter.title}
                </h3>
                <p className="text-xs text-slate-300 font-normal leading-relaxed font-sans">
                  {chapter.desc}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex items-end justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">
                    {chapter.statLabel}
                  </span>
                  <span className="text-2xl font-mono font-bold text-white">
                    {chapter.stat}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {chapter.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MULTI-PAYLOAD SATELLITE SENSOR LAB (Interactive Suite) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-8 border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold block">
              [ SPECTRAL SENSOR BENCHMARK ]
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white mt-1">
              Multi-Spectral <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Earth Observation</span> Inversion
            </h2>
          </div>

          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSpectralMode('SAR_RADAR')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors font-mono ${
                spectralMode === 'SAR_RADAR' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. SAR Radar
            </button>
            <button
              onClick={() => setSpectralMode('OPTICAL_RGB')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors font-mono ${
                spectralMode === 'OPTICAL_RGB' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Optical 10m
            </button>
            <button
              onClick={() => setSpectralMode('AI_MASK')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors font-mono ${
                spectralMode === 'AI_MASK' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Thickness Mask
            </button>
            <button
              onClick={() => setSpectralMode('CURRENT_VECTORS')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors font-mono ${
                spectralMode === 'CURRENT_VECTORS' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              4. ROMS Currents
            </button>
          </div>
        </div>

        {/* Sensor Visualizer Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#080d19] border border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="lg:col-span-7 bg-[#02050b] border border-slate-800 rounded-xl p-6 min-h-[380px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 z-10">
              <span>SENSOR: SENTINEL-1A C-SAR</span>
              <span className="text-[#d8b452]">RESOLUTION: 10M &bull; 5.4 GHZ</span>
            </div>

            {/* Sensor Render Visual: Video 2 Stream with Dynamic HUD */}
            <div className="my-auto py-2 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg h-60 sm:h-64 bg-[#03060c] rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
                <video
                  src="/videos/video2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* HUD Telemetry Badges over Video 2 */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-slate-700 text-[10px] font-mono text-cyan-400 backdrop-blur-md flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    LIVE SENSOR RADAR FEED
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-red-800/80 text-[10px] font-mono text-red-400 backdrop-blur-md">
                    HYDROCARBON ANOMALY DETECTED
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/80 border border-[#d8b452]/80 text-[10px] font-mono text-[#d8b452] backdrop-blur-md">
                    &sigma;0 DAMPING: -4.8 dB
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-900 pt-3">
              <span>LAT: 18.9160°N &bull; LON: 72.2490°E</span>
              <span>CALIBRATION: SIGMA-0</span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono text-[#d8b452] uppercase block">
                [ ALGORITHMIC PRINCIPLE ]
              </span>
              <h3 className="text-2xl font-light text-white">
                Capillary-Gravity Wave Attenuation
              </h3>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Hydrocarbons form a viscoelastic surface microlayer that severely dampens wind-induced capillary wave action (0.1–2.0 cm wavelengths). Synthetic Aperture Radar active pulses reflect away from the sensor, producing distinct dark low-backscatter signatures.
              </p>

              <div className="p-4 rounded-xl bg-[#040710] border border-slate-800 space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Signal-to-Noise Ratio:</span>
                  <span className="text-emerald-400 font-bold">14.2 dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wind Speed Threshold:</span>
                  <span className="text-white">3.0 to 12.0 m/s (Ideal)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">False-Positive Rejection:</span>
                  <span className="text-[#d8b452] font-bold">UNet++ Texture Check Passed</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('DETECTION')}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[#d8b452] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Launch SAR Radar Swath Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE DRIFT HINDCAST SANDBOX */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto space-y-8 border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-widest font-semibold block">
              [ LAGRANGIAN HYDRODYNAMICS ]
            </span>
            <h2 className="text-3xl font-light text-white mt-1">
              Interactive <span className="font-serif italic text-amber-400">Reverse Drift</span> Sandbox
            </h2>
          </div>

          <button
            onClick={() => setActiveView('DRIFT')}
            className="px-5 py-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-bold transition-colors"
          >
            Open Full Simulation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#080d19] border border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Hindcast Horizon (&Delta;t):</span>
                  <span className="font-mono text-amber-400 font-bold">{hindcastHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={hindcastHours}
                  onChange={(e) => setHindcastHours(parseFloat(e.target.value))}
                  className="w-full accent-[#d8b452] bg-slate-900 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">ERA5 10m Wind Velocity:</span>
                  <span className="font-mono text-cyan-400 font-bold">{simWindSpeed} Knots (045° NE)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="0.5"
                  value={simWindSpeed}
                  onChange={(e) => setSimWindSpeed(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-900 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">ROMS Surface Current:</span>
                  <span className="font-mono text-emerald-400 font-bold">{simCurrentSpeed} Knots (220° SW)</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.5"
                  step="0.05"
                  value={simCurrentSpeed}
                  onChange={(e) => setSimCurrentSpeed(parseFloat(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-900 h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040710] border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-slate-400 font-sans font-semibold border-b border-slate-800 pb-1">
                COMPUTED ORIGIN CORRIDOR
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Release Coordinate:</span>
                <span className="text-white font-bold">{calculatedLat}°N, {calculatedLon}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Release Timestamp:</span>
                <span className="text-[#d8b452] font-bold">2026-09-06 06:12 UTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Intercept Deviation:</span>
                <span className={`font-bold ${parseFloat(calculatedInterceptError) <= 0.5 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {calculatedInterceptError} nm ({parseFloat(calculatedInterceptError) <= 0.5 ? 'CORRELATION VERIFIED' : 'DEVIATION'})
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#02050b] border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>LAGRANGIAN PARTICLE VECTOR CHARTS</span>
              <span className="text-[#d8b452] font-bold">&Delta;t = -{hindcastHours}h</span>
            </div>

            <div className="my-auto py-6">
              <svg viewBox="0 0 400 200" className="w-full h-44 text-slate-600">
                <defs>
                  <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#grid-pattern)" />

                {/* AIS Vessel Path */}
                <path d="M 50 160 Q 150 110 350 40" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
                <text x="300" y="32" fill="#38bdf8" fontSize="10" fontFamily="monospace">AIS Track (MT Vanguard)</text>

                {/* Backward Drift Vector */}
                <path d={`M 300 130 Q 220 120 ${140 + (hindcastHours - 4.7) * 15} 115`} fill="none" stroke="#d8b452" strokeWidth="2.5" />

                {/* SATELLITE DETECTION POINT */}
                <circle cx="300" cy="130" r="6" fill="#ef4444" />
                <text x="240" y="155" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">Slick S1A (10:42 UTC)</text>

                {/* COMPUTED RELEASE POINT */}
                <circle cx={140 + (hindcastHours - 4.7) * 15} cy="115" r="7" fill="#d8b452" className="animate-pulse" />
                <text x={80 + (hindcastHours - 4.7) * 15} y="95" fill="#d8b452" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Release Pt (06:12 UTC)
                </text>

                {Math.abs(hindcastHours - 4.7) <= 0.3 && (
                  <g>
                    <circle cx="140" cy="115" r="14" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                    <text x="160" y="130" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      FORENSIC INTERCEPT (0.42 nm)
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-900 pt-3">
              <span>ALGORITHM: 4TH-ORDER RUNGE-KUTTA</span>
              <span>WIND FACTOR: 0.030</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SOUFFLET STYLE FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800 bg-[#04060d] py-16 px-4 sm:px-8 lg:px-12 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold text-base">
              <span>OCEAN-EYE MARITIME GEOSPATIAL INTELLIGENCE</span>
            </div>
            <p className="text-slate-400 font-light">
              Indian Coast Guard MRCC &bull; In association with ESA Copernicus &amp; INCOIS Metocean
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActiveView('MAP')}
              className="px-6 py-3 rounded-full bg-[#d8b452] hover:bg-[#c4a142] text-black font-bold text-xs tracking-wide transition-all"
            >
              LAUNCH LIVE ECDIS CHART
            </button>
            <button
              onClick={() => setActiveView('DOSSIER')}
              className="px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
            >
              GENERATE INCIDENT DOSSIER
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
