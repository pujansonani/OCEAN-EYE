import React, { useState } from 'react';
import { SpillDetection } from '../types';
import {
  Radar,
  Sliders,
  Eye,
  EyeOff,
  Maximize2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Sparkles,
  Layers
} from 'lucide-react';
import { LookAlikeWarningBanner } from '../components/LookAlikeWarningBanner';

interface DetectionWorkspaceProps {
  detection: SpillDetection;
  onRunDetection: (simulateLookAlike?: boolean) => void;
  isLoading: boolean;
  onToggleLookAlikeSimulate: () => void;
  isLookAlikeSimulated: boolean;
  onProceedToDrift: () => void;
}

export const DetectionWorkspace: React.FC<DetectionWorkspaceProps> = ({
  detection,
  onRunDetection,
  isLoading,
  onToggleLookAlikeSimulate,
  isLookAlikeSimulated,
  onProceedToDrift
}) => {
  const [showMask, setShowMask] = useState(true);
  const [maskOpacity, setMaskOpacity] = useState(70);
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#081326]/90 border border-[#173260] p-4 rounded-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-ocean-accent/40">
            <Radar className="w-5 h-5 text-ocean-accent animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Stage 1: Sentinel-1 SAR Spill Detection &amp; Segmentation
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Synthetic Aperture Radar backscatter thresholding &amp; U-Net morphological segmentation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => onRunDetection(false)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Processing SAR...' : 'Run Detection'}
          </button>
          <button
            onClick={onProceedToDrift}
            className="px-4 py-2 bg-[#102244] hover:bg-[#173260] border border-ocean-accent/50 text-ocean-accent text-xs font-bold rounded-lg transition-all"
          >
            Proceed to Drift Trace &rarr;
          </button>
        </div>
      </div>

      <LookAlikeWarningBanner
        check={detection.look_alike_check}
        onToggleSimulate={onToggleLookAlikeSimulate}
        isSimulated={isLookAlikeSimulated}
      />

      {/* Main Workspace Layout: Viewer (Left) + Geometry & Characterization (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: SAR Image / Canvas Viewer (7 Cols) */}
        <div className="lg:col-span-7 bg-[#081326]/90 border border-[#173260] rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#173260] pb-3">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <Layers className="w-4 h-4 text-ocean-accent" />
              <span>SAR Backscatter Frame: <span className="text-white font-bold">VV Polarization (IW Mode)</span></span>
            </div>

            {/* Viewer Controls */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="flex items-center gap-1.5 bg-[#060e1d] px-2 py-1 rounded border border-[#173260]">
                <Sliders className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] text-slate-400">Mask Opacity:</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={maskOpacity}
                  onChange={(e) => setMaskOpacity(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-700 rounded accent-ocean-accent cursor-pointer"
                />
                <span className="text-[10px] text-cyan-300 w-6">{maskOpacity}%</span>
              </div>

              <button
                onClick={() => setShowMask(!showMask)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-all ${
                  showMask
                    ? 'bg-cyan-950 text-ocean-accent border-cyan-500/50'
                    : 'bg-[#060e1d] text-slate-400 border-[#173260]'
                }`}
              >
                {showMask ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showMask ? 'Segmentation ON' : 'Segmentation OFF'}
              </button>
            </div>
          </div>

          {/* Interactive SAR Synthetic Visualizer */}
          <div className="relative w-full h-[460px] bg-[#02050b] rounded-lg overflow-hidden border border-[#132742] flex items-center justify-center select-none group">
            {/* Grayscale SAR Noise & Ocean Texture */}
            <div
              className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
              style={{ filter: 'contrast(180%) brightness(80%)' }}
            />

            {/* Speckle SAR Backscatter Simulation Canvas */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#050b14] via-[#09152a] to-[#040812] opacity-90" />

            {/* Ocean Current Ripple Lines */}
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="sarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sarGrid)" />
            </svg>

            {/* Suspected Spill Dark Patch Polygon Overlay */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 460">
              {/* Dark Backscatter Dampening Core */}
              <path
                d="M 380 90 Q 360 140 330 200 T 290 310 Q 275 360 260 410 Q 275 415 295 400 Q 325 330 355 240 T 410 120 Z"
                fill="#000000"
                opacity="0.85"
                filter="blur(3px)"
              />

              {/* AI Segmentation Mask Overlay (Toggled) */}
              {showMask && (
                <g style={{ opacity: maskOpacity / 100 }}>
                  <path
                    d="M 380 90 Q 360 140 330 200 T 290 310 Q 275 360 260 410 Q 275 415 295 400 Q 325 330 355 240 T 410 120 Z"
                    fill="rgba(255, 77, 79, 0.4)"
                    stroke="#ff4d4f"
                    strokeWidth="2.5"
                    strokeDasharray="6, 3"
                  />
                  {/* Slick Centroid Node */}
                  <circle cx="335" cy="250" r="5" fill="#ff4d4f" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="345" y="254" fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    Centroid [19.425°N, 71.848°E]
                  </text>
                  {/* Axis Line */}
                  <line x1="390" y1="100" x2="270" y2="405" stroke="#ffb703" strokeWidth="1.5" strokeDasharray="4, 4" />
                  <text x="395" y="110" fill="#ffb703" fontSize="10" fontFamily="monospace">
                    Major Axis: 158° (22.0 km)
                  </text>
                </g>
              )}
            </svg>

            {/* Corner Geospatial Metadata Overlay */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md p-2 rounded border border-slate-700 text-[10px] font-mono text-slate-300 space-y-0.5">
              <p className="text-ocean-accent font-bold">SENTINEL-1A SAR C-BAND</p>
              <p>Acquisition: 2026-09-06 10:42:00 UTC</p>
              <p>Polarization: VV + VH | Orbit: Ascending (Track 12)</p>
              <p>Resolution: 10m x 10m Ground Pixel</p>
            </div>

            {/* Synthetic Data Watermark */}
            <div className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded border border-amber-500/40 text-[10px] font-mono text-amber-300">
              SYNTHETIC SAR DEMONSTRATION IMAGE
            </div>
          </div>
        </div>

        {/* Right: Characterization & Geometric Extraction Metrics (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-5 shadow-xl space-y-4 font-mono">
            <div className="border-b border-[#173260] pb-3">
              <span className="text-[10px] text-ocean-accent font-bold uppercase tracking-wider">
                Automated Geometric Extraction
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Detection Characterization Results
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400">Detection Status:</span>
                <span className="font-bold text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                  {detection.status}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400">Detection Confidence:</span>
                <span className="font-bold text-cyan-300 text-sm">
                  {detection.confidence} / 1.00
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400">Calculated Slick Area:</span>
                <span className="font-bold text-white text-sm">
                  {detection.area_km2} km²
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400">Major Axis Length:</span>
                <span className="font-bold text-white">
                  {detection.length_km} km
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400">Mean Minor Width:</span>
                <span className="font-bold text-white">
                  {detection.width_km} km
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400">Streak Orientation:</span>
                <span className="font-bold text-amber-300">
                  {detection.orientation_deg}° (NNW–SSE)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400">Centroid Coordinates:</span>
                <span className="font-bold text-slate-200 text-[11px]">
                  {detection.centroid.lat}° N, {detection.centroid.lng}° E
                </span>
              </div>
            </div>

            {/* Architecture Explanatory Notice */}
            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#173260] text-[11px] text-slate-400 leading-normal space-y-1">
              <span className="text-slate-300 font-bold block flex items-center gap-1">
                <FileSearch className="w-3.5 h-3.5 text-ocean-accent" />
                Detection Architecture Note:
              </span>
              <p>
                The detection service extracts boundary coordinates via morphological polygon dilation.
                In production, this module directly interfaces with PyTorch U-Net or Copernicus Open Access APIs without changing downstream drift feeds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
