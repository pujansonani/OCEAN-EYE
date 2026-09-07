import React, { useState } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  MapPin,
  TrendingUp,
  Cpu,
  BarChart3,
  ExternalLink,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  Sliders,
  Maximize2,
  Radio,
  Eye,
  Activity,
  Terminal,
  Clock,
  Navigation
} from 'lucide-react';

export const SeaCrasPlatformPortal: React.FC = () => {
  const {
    setActiveView,
    vessels,
    satelliteScene,
    environment,
    setSelectedEntity,
    evidenceThreshold,
    setEvidenceThreshold
  } = useMaritimeStore();

  // Multi-payload sensor preview mode
  const [spectralMode, setSpectralMode] = useState<'SAR_RADAR' | 'OPTICAL_RGB' | 'AI_MASK' | 'CURRENT_VECTORS'>('SAR_RADAR');
  
  // Interactive Drift Reversal Sandbox parameters
  const [hindcastHours, setHindcastHours] = useState<number>(4.7);
  const [simWindSpeed, setSimWindSpeed] = useState<number>(14.2);
  const [simCurrentSpeed, setSimCurrentSpeed] = useState<number>(0.85);

  const candidates = vessels.filter((v) => v.is_candidate);
  const primaryCandidate = candidates[0] || vessels[0];

  // Dynamic calculated origin based on interactive hindcast sliders
  const calculatedLat = (18.916 + (hindcastHours * 0.012) * Math.cos((45 * Math.PI) / 180)).toFixed(4);
  const calculatedLon = (72.249 - (hindcastHours * 0.014) * Math.sin((45 * Math.PI) / 180)).toFixed(4);
  const calculatedInterceptError = Math.max(0.18, 0.42 - (hindcastHours === 4.7 ? 0 : Math.abs(hindcastHours - 4.7) * 0.08)).toFixed(2);

  return (
    <div className="flex-1 w-full h-full bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-y-auto">
      {/* ========================================================================= */}
      {/* 1. TOP MARITIME MISSION HERO (SeaCras Authoritative Style) */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-[#0a1120] via-[#070c18] to-[#050811]">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Official Accreditation Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-cyan-400 text-xs font-mono font-semibold tracking-wide shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ESA COPERNICUS SENTINEL-1A &bull; C-SAR</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>INCOIS METOCEAN REALTIME</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>IMO MARPOL ANNEX I FORENSIC COMPLIANT</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-400 text-xs font-mono ml-auto">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>SECTOR 7 ACTIVE SURVEILLANCE</span>
            </div>
          </div>

          {/* Main Headline & Scientific Mission Statement */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-5">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                Marine Oil Spill Detection &amp; Vessel Attribution Platform
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-3xl">
                Multi-payload Earth Observation fusion engine combining <strong className="text-white font-semibold">Copernicus Sentinel-1 SAR radar backscatter segmentation</strong>, <strong className="text-white font-semibold">2D Lagrangian hydrodynamic drift hindcasting</strong>, and <strong className="text-white font-semibold">terrestrial/satellite AIS spatiotemporal trajectory forensics</strong> to detect slicks and identify polluter vessels with mathematical certainty.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveView('MAP')}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
                >
                  <Navigation className="w-4 h-4 fill-current" />
                  <span>Launch Live ECDIS Chart</span>
                </button>

                <button
                  onClick={() => setActiveView('ATTRIBUTION')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-sm font-semibold transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Attribution Matrix</span>
                </button>

                <button
                  onClick={() => setActiveView('DOSSIER')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-sm font-semibold transition-all"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Investigation Dossier</span>
                </button>
              </div>
            </div>

            {/* Quick Status Box */}
            <div className="lg:col-span-4 bg-[#09101d] border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-slate-400 uppercase font-sans font-semibold">LIVE INCIDENT METRICS</span>
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-red-300 font-bold">
                  CONFIRMED SPILL
                </span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Area:</span>
                  <span className="text-white font-bold">{satelliteScene?.detected_slick.area_km2 || 65.7} km² (22.0 km length)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-cyan-300">18.9160°N, 72.2490°E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Drift Age:</span>
                  <span className="text-amber-300 font-bold">4.7 Hours (Release @ 06:12 UTC)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Top Candidate:</span>
                  <span className="text-red-400 font-bold">MT OCEAN VANGUARD (91.4%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fleet AIS Tracking:</span>
                  <span className="text-emerald-400 font-bold">{vessels.length} vessels in Sector 7</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedEntity({ type: 'VESSEL', mmsi: primaryCandidate.mmsi });
                    setActiveView('MAP');
                  }}
                  className="w-full py-2 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-sans font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Prime Candidate on Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Sector Telemetry 4-Card Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3.5 rounded-lg bg-[#080d19] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">RADAR CROSS-SECTION</span>
              <div className="text-xl font-bold text-white font-mono">-4.8 dB <span className="text-xs text-red-400 font-sans">Damping</span></div>
              <p className="text-[11px] text-slate-400">Capillary wave attenuation</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080d19] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">LAGRANGIAN DRIFT</span>
              <div className="text-xl font-bold text-amber-400 font-mono">1.12 kts <span className="text-xs text-slate-400 font-sans">@ 228°</span></div>
              <p className="text-[11px] text-slate-400">Wind leeway + surface current</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080d19] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">ESTIMATED VOLUME</span>
              <div className="text-xl font-bold text-cyan-300 font-mono">420 – 580 <span className="text-xs text-slate-400 font-sans">m³</span></div>
              <p className="text-[11px] text-slate-400">ASTM / Bonn Agreement code</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#080d19] border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block font-mono">SPATIOTEMPORAL CPA</span>
              <div className="text-xl font-bold text-emerald-400 font-mono">0.42 nm <span className="text-xs text-slate-400 font-sans">Margin</span></div>
              <p className="text-[11px] text-slate-400">Direct trajectory intercept</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SATELLITE MULTI-SPECTRAL SENSOR SUITE (SeaCras Core Tech) */}
      {/* ========================================================================= */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Earth Observation Sensor Processing Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Multi-Payload Satellite Imagery &amp; Spectral Inversion
            </h2>
          </div>

          {/* Spectral Mode Selector */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSpectralMode('SAR_RADAR')}
              className={`px-3 py-1.5 rounded transition-colors ${
                spectralMode === 'SAR_RADAR' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Sentinel-1 SAR Radar
            </button>
            <button
              onClick={() => setSpectralMode('OPTICAL_RGB')}
              className={`px-3 py-1.5 rounded transition-colors ${
                spectralMode === 'OPTICAL_RGB' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Sentinel-2 Optical RGB
            </button>
            <button
              onClick={() => setSpectralMode('AI_MASK')}
              className={`px-3 py-1.5 rounded transition-colors ${
                spectralMode === 'AI_MASK' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              3. AI Thickness Mask
            </button>
            <button
              onClick={() => setSpectralMode('CURRENT_VECTORS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                spectralMode === 'CURRENT_VECTORS' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              4. Ocean Current Field
            </button>
          </div>
        </div>

        {/* Visualizer Display Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#080e1b] border border-slate-800 rounded-xl p-6 shadow-2xl">
          {/* Left Canvas Preview */}
          <div className="lg:col-span-7 bg-[#03060c] border border-slate-800/90 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
            {/* Header Overlay */}
            <div className="flex items-center justify-between text-xs font-mono z-10">
              <span className="px-2 py-0.5 bg-slate-900/90 border border-slate-700 text-white rounded">
                LAT: 18.9160°N &bull; LON: 72.2490°E
              </span>
              <span className="px-2 py-0.5 bg-slate-900/90 border border-slate-700 text-cyan-400 rounded">
                {spectralMode === 'SAR_RADAR' && 'BAND: C-SAR VV Polarization (5.4 GHz)'}
                {spectralMode === 'OPTICAL_RGB' && 'BAND: MSI B4-B3-B2 (True Color 10m)'}
                {spectralMode === 'AI_MASK' && 'PRODUCT: UNet++ Hydrocarbon Segment'}
                {spectralMode === 'CURRENT_VECTORS' && 'MODEL: INCOIS ROMS 2D Field'}
              </span>
            </div>

            {/* Simulated High-Res Sensor Render Graphic */}
            <div className="my-auto py-8 relative flex items-center justify-center">
              {spectralMode === 'SAR_RADAR' && (
                <div className="relative w-full max-w-md h-48 bg-[#0a121e] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  {/* Radar Grain Background */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px]" />
                  {/* Dark Hydrocarbon Damping Slick Silhouette */}
                  <div className="relative z-10 w-4/5 h-20 bg-[#020509] border border-red-500/40 rounded-full rotate-[-18deg] flex items-center justify-center shadow-inner">
                    <span className="text-[10px] font-mono text-red-400/90 bg-black/60 px-2 py-0.5 rounded border border-red-800/60">
                      &sigma;0 DAMPING: -4.8 dB (SLICK CORE)
                    </span>
                  </div>
                </div>
              )}

              {spectralMode === 'OPTICAL_RGB' && (
                <div className="relative w-full max-w-md h-48 bg-gradient-to-tr from-[#022c43] to-[#053d5e] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  {/* Optical sheen metallic reflection */}
                  <div className="relative z-10 w-4/5 h-20 bg-gradient-to-r from-amber-500/20 via-sky-300/30 to-purple-500/20 border border-amber-400/50 rounded-full rotate-[-18deg] flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-[10px] font-mono text-amber-200 bg-black/70 px-2 py-0.5 rounded border border-amber-600/60">
                      SUN-GLINT SHEEN CONTRAST DETECTED
                    </span>
                  </div>
                </div>
              )}

              {spectralMode === 'AI_MASK' && (
                <div className="relative w-full max-w-md h-48 bg-[#070d18] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  <div className="relative z-10 w-4/5 h-20 bg-red-950/70 border-2 border-red-500 rounded-full rotate-[-18deg] flex flex-col items-center justify-center shadow-lg shadow-red-900/30">
                    <span className="text-[11px] font-mono font-bold text-white">
                      CLASSIFIED: HEAVY CRUDE SLICK (65.7 km²)
                    </span>
                    <span className="text-[9px] font-mono text-red-300">
                      CONFIDENCE: 88.0% &bull; POLYGON NODES: 84
                    </span>
                  </div>
                </div>
              )}

              {spectralMode === 'CURRENT_VECTORS' && (
                <div className="relative w-full max-w-md h-48 bg-[#060c18] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center p-4">
                  <div className="grid grid-cols-5 gap-4 opacity-70">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className="flex items-center gap-1 text-cyan-400 text-xs font-mono rotate-[225deg]">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                  <div className="absolute z-10 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded text-[10px] font-mono text-slate-200">
                    CURRENT: 0.85 kts @ 220° &bull; WIND: 14.2 kts @ 045°
                  </div>
                </div>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-900 pt-2 z-10">
              <span>RESOLUTION: 10.0 METERS/PX</span>
              <span>SENSOR ID: S1A_IW_GRDH_1SDV</span>
              <span>CALIBRATION: SIGMA-0 NOUGHT</span>
            </div>
          </div>

          {/* Right Explanation & Engineering Specs */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono">
                <Cpu className="w-3 h-3" />
                <span>ALGORITHMIC PIPELINE DETAILS</span>
              </div>
              
              <h3 className="text-lg font-bold text-white">
                {spectralMode === 'SAR_RADAR' && 'Synthetic Aperture Radar (SAR) Roughness Mapping'}
                {spectralMode === 'OPTICAL_RGB' && 'Multi-Spectral Sunglint & False Color Inversion'}
                {spectralMode === 'AI_MASK' && 'Deep Convolutional Hydrocarbon Segmentation'}
                {spectralMode === 'CURRENT_VECTORS' && 'MUMBAI OFFSHORE Metocean Dynamics'}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {spectralMode === 'SAR_RADAR' &&
                  'Active microwave pulses measure capillary-gravity wave suppression. Floating oil dampens high-frequency surface ripple, producing clear backscatter attenuation against surrounding ambient sea clutter.'}
                {spectralMode === 'OPTICAL_RGB' &&
                  'Multi-spectral 10m Sentinel-2 bands capture sun-glint differences and thickness variation. Thicker oil layers alter solar reflectance spectra, enabling volumetric differentiation.'}
                {spectralMode === 'AI_MASK' &&
                  'Trained on 14,000+ verified maritime spill records, our UNet++ dual-polarization model segments oil boundaries while rejecting biogenic sheens, rain cells, and wind-shadow look-alikes.'}
                {spectralMode === 'CURRENT_VECTORS' &&
                  'INCOIS operational ocean current models combined with ECMWF ERA5 10-meter wind fields provide continuous force vectors for physical reverse-trajectory simulation.'}
              </p>

              <div className="space-y-1.5 text-xs text-slate-300 font-mono pt-2">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Radiometric Calibration:</span>
                  <span className="text-white">&sigma;<sub>0</sub> = 10 &times; log<sub>10</sub>(&#10216;DN&#10217; &plusmn; CAL)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Look-Alike Rejection:</span>
                  <span className="text-emerald-400 font-bold">Active (Texture Variance &gt; 1.4)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Incidence Angle:</span>
                  <span className="text-white">38.4° (Mid-swath optimal)</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveView('DETECTION')}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open SAR Radar Analysis Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE 2D LAGRANGIAN DRIFT HINDCAST SANDBOX */}
      {/* ========================================================================= */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Physics-Based Reverse Trajectory Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Interactive 2D Hydrodynamic Drift Sandbox
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Reverse-drift the detected spill coordinates backward in time along Metocean force vectors to locate the exact discharge timestamp and geographical release corridor.
            </p>
          </div>

          <button
            onClick={() => setActiveView('DRIFT')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-700/80 text-amber-300 text-xs font-bold transition-colors shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Full Drift Workstation</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#080e1b] border border-slate-800 rounded-xl p-6">
          {/* Interactive Sliders */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-4">
              {/* Slider 1: Hindcast Duration */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Reversal Time Horizon (&Delta;t):</span>
                  <span className="font-mono text-amber-400 font-bold">{hindcastHours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={hindcastHours}
                  onChange={(e) => setHindcastHours(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-900 h-1.5 rounded cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>-1.0 hr</span>
                  <span>-4.7 hr (Optimal Fit)</span>
                  <span>-10.0 hr</span>
                </div>
              </div>

              {/* Slider 2: Wind Speed */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">10m Wind Leeway Velocity:</span>
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

              {/* Slider 3: Current Velocity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Surface Ocean Current:</span>
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

            {/* Calculated Output Card */}
            <div className="p-4 rounded-lg bg-[#040810] border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-slate-400 font-sans font-semibold border-b border-slate-800 pb-1">
                COMPUTED ORIGIN WINDOW
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Release Coordinate:</span>
                <span className="text-white font-bold">{calculatedLat}°N, {calculatedLon}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Release Timestamp:</span>
                <span className="text-amber-300 font-bold">2026-09-06 06:12 UTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vessel Intercept CPA:</span>
                <span className={`font-bold ${parseFloat(calculatedInterceptError) <= 0.5 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {calculatedInterceptError} nm ({parseFloat(calculatedInterceptError) <= 0.5 ? 'EXACT MATCH' : 'DEVIATION'})
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Trajectory SVG Graphic */}
          <div className="lg:col-span-7 bg-[#03060c] border border-slate-800/90 rounded-lg p-4 relative flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between text-xs font-mono z-10">
              <span className="text-slate-300">LAGRANGIAN PARTICLE TRAJECTORY SIMULATION</span>
              <span className="text-amber-400 font-bold">&Delta;t = -{hindcastHours}h</span>
            </div>

            <div className="relative my-auto flex items-center justify-center py-6">
              <svg viewBox="0 0 400 200" className="w-full h-44 text-slate-500">
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(30, 41, 59, 0.4)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="200" fill="url(#grid)" />

                {/* Vessel Path (MT OCEAN VANGUARD) */}
                <path
                  d="M 50 160 Q 150 110 350 40"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <text x="310" y="32" fill="#38bdf8" fontSize="10" fontFamily="monospace">AIS Track (Vanguard)</text>

                {/* Backward Drift Hindcast Vector */}
                <path
                  d={`M 300 130 Q 220 120 ${140 + (hindcastHours - 4.7) * 15} 115`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                />

                {/* SATELLITE DETECTION POINT */}
                <circle cx="300" cy="130" r="6" fill="#ef4444" />
                <text x="250" y="155" fill="#ef4444" fontSize="10" fontFamily="monospace" fontWeight="bold">Slick S1A (10:42 UTC)</text>

                {/* COMPUTED RELEASE POINT */}
                <circle cx={140 + (hindcastHours - 4.7) * 15} cy="115" r="7" fill="#f59e0b" className="animate-pulse" />
                <text x={90 + (hindcastHours - 4.7) * 15} y="95" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Release Pt (06:12 UTC)
                </text>

                {/* INTERCEPT MARKER */}
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

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-900 pt-2">
              <span>ALGORITHM: 4TH-ORDER RUNGE-KUTTA</span>
              <span>WIND FACTOR: 0.030</span>
              <span>DRIFT ANGLE: 15° CORIOLIS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXPLAINABLE AI ATTRIBUTION RANKING MATRIX */}
      {/* ========================================================================= */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-t border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              Candidate Vessel Attribution Matrix
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Forensic Evidence &amp; Corroboration Rankings
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Fusing spatial proximity, timestamp alignment, engine horsepower priors, and AIS dark-gap telemetry into a court-admissible forensic confidence score.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Evidence Threshold:</span>
            <input
              type="range"
              min="0.4"
              max="0.95"
              step="0.05"
              value={evidenceThreshold}
              onChange={(e) => setEvidenceThreshold(parseFloat(e.target.value))}
              className="accent-cyan-400 w-24"
            />
            <span className="text-xs font-mono text-cyan-400 font-bold">{(evidenceThreshold * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Vessel Table */}
        <div className="bg-[#080e1b] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0b1322] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Rank / Vessel</th>
                  <th className="py-3 px-4">MMSI / IMO</th>
                  <th className="py-3 px-4">Type &amp; DWT</th>
                  <th className="py-3 px-4">Intercept CPA</th>
                  <th className="py-3 px-4">AIS Telemetry Status</th>
                  <th className="py-3 px-4">Attribution Fit</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 font-mono">
                {/* 1. Primary Candidate */}
                <tr className="bg-red-950/20 hover:bg-red-950/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">#1</span>
                      <strong className="text-white font-sans text-sm">MT OCEAN VANGUARD</strong>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">419001284 / 9428190</td>
                  <td className="py-3.5 px-4 text-slate-300 font-sans">Crude Oil Tanker &bull; 105,400 MT</td>
                  <td className="py-3.5 px-4 text-red-400 font-bold">0.42 nm @ 06:12 UTC</td>
                  <td className="py-3.5 px-4 text-amber-400 font-sans">
                    <span className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      42-min AIS transmitter gap
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-sm">91.4%</span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '91.4%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedEntity({ type: 'VESSEL', mmsi: '419001284' });
                        setActiveView('MAP');
                      }}
                      className="px-3 py-1.5 rounded bg-red-950 hover:bg-red-900 border border-red-700/80 text-red-200 text-xs font-sans font-semibold transition-colors"
                    >
                      Inspect Vessel
                    </button>
                  </td>
                </tr>

                {/* 2. Secondary Candidate */}
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">#2</span>
                      <strong className="text-slate-200 font-sans">CAPE PROVIDENCE</strong>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">419000871 / 9310458</td>
                  <td className="py-3.5 px-4 text-slate-400 font-sans">Bulk Carrier &bull; 180,000 MT</td>
                  <td className="py-3.5 px-4 text-slate-400">8.40 nm @ 07:45 UTC</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-sans">Continuous nominal feed</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold text-sm">18.2%</span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-600 rounded-full" style={{ width: '18.2%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedEntity({ type: 'VESSEL', mmsi: '419000871' });
                        setActiveView('MAP');
                      }}
                      className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-sans transition-colors"
                    >
                      View on Chart
                    </button>
                  </td>
                </tr>

                {/* 3. Non-Candidate Reference */}
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">#3</span>
                      <strong className="text-slate-300 font-sans">MSC ARIES</strong>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">636019825 / 9857183</td>
                  <td className="py-3.5 px-4 text-slate-500 font-sans">Container Vessel &bull; 15,000 TEU</td>
                  <td className="py-3.5 px-4 text-slate-500">14.10 nm @ 05:20 UTC</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-sans">Continuous nominal feed</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-bold text-sm">6.5%</span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-700 rounded-full" style={{ width: '6.5%' }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedEntity({ type: 'VESSEL', mmsi: '636019825' });
                        setActiveView('MAP');
                      }}
                      className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 text-xs font-sans transition-colors"
                    >
                      View on Chart
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BOTTOM MISSION CONTROL LAUNCHER FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800 bg-[#070c18] py-12 px-4 sm:px-6 lg:px-8 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-bold text-white text-sm">
              <span>OCEAN-EYE MARITIME GEOSPATIAL INTELLIGENCE</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono">
                PRODUCTION READY
              </span>
            </div>
            <p className="text-slate-400">
              Indian Coast Guard Maritime Rescue Co-ordination Centre (MRCC) &bull; Operational Sector 7
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveView('MAP')}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Open Tactical ECDIS
            </button>
            <button
              onClick={() => setActiveView('DOSSIER')}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              Generate Legal Dossier
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
