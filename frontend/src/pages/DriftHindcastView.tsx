import React, { useState } from 'react';
import {
  SpillDetection,
  DriftHindcastResult,
  AISVessel
} from '../types';
import { MaritimeMap } from '../components/MaritimeMap';
import {
  Compass,
  Wind,
  Waves,
  RefreshCw,
  Clock,
  AlertCircle,
  Play,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DriftHindcastViewProps {
  detection: SpillDetection;
  drift: DriftHindcastResult;
  vessels: AISVessel[];
  onRunDrift: (params: {
    current_mps?: number;
    current_deg?: number;
    wind_mps?: number;
    wind_deg?: number;
    uncertainty_scale?: number;
  }) => void;
  isLoading: boolean;
  onProceedToAIS: () => void;
}

export const DriftHindcastView: React.FC<DriftHindcastViewProps> = ({
  detection,
  drift,
  vessels,
  onRunDrift,
  isLoading,
  onProceedToAIS
}) => {
  const [currentSpeed, setCurrentSpeed] = useState(drift.current_velocity_mps);
  const [currentDir, setCurrentDir] = useState(drift.current_direction_deg);
  const [windSpeed, setWindSpeed] = useState(drift.wind_velocity_mps);
  const [windDir, setWindDir] = useState(drift.wind_direction_deg);
  const [uncertaintyScale, setUncertaintyScale] = useState(1.0);

  const handleSimulate = () => {
    onRunDrift({
      current_mps: currentSpeed,
      current_deg: currentDir,
      wind_mps: windSpeed,
      wind_deg: windDir,
      uncertainty_scale: uncertaintyScale
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#081326]/90 border border-[#173260] p-4 rounded-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-500/40">
            <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Stage 2: Physical Backward Drift Hindcasting &amp; Origin Estimation
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              2D Lagrangian particle transport backtracking under historical ocean currents &amp; surface windage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={handleSimulate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-md"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Computing Hindcast...' : 'Run Backward Drift'}
          </button>
          <button
            onClick={onProceedToAIS}
            className="px-4 py-2 bg-[#102244] hover:bg-[#173260] border border-ocean-accent/50 text-ocean-accent text-xs font-bold rounded-lg transition-all"
          >
            Proceed to AIS Attribution &rarr;
          </button>
        </div>
      </div>

      {/* Conceptual Workflow Flow-Chart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-[#081326]/80 p-3 rounded-xl border border-[#173260] text-xs font-mono text-center">
        <div className="p-2 rounded-lg bg-[#060e1d] border border-[#132742]">
          <span className="text-[10px] text-red-400 font-bold block">1. Observed Spill</span>
          <span className="text-slate-200">65.7 km² at 10:42 UTC</span>
        </div>
        <div className="p-2 rounded-lg bg-[#060e1d] border border-[#132742]">
          <span className="text-[10px] text-cyan-400 font-bold block">2. Environmental Hindcast</span>
          <span className="text-slate-200">Current 0.35 m/s + Wind 6.2 m/s</span>
        </div>
        <div className="p-2 rounded-lg bg-[#060e1d] border border-[#132742]">
          <span className="text-[10px] text-amber-400 font-bold block">3. Backward Lagrangian</span>
          <span className="text-slate-200">4.7-Hour Backtracking</span>
        </div>
        <div className="p-2 rounded-lg bg-[#060e1d] border border-[#132742]">
          <span className="text-[10px] text-emerald-400 font-bold block">4. Probable Origin Region</span>
          <span className="text-slate-200">06:00–10:00 UTC Window</span>
        </div>
      </div>

      {/* Main Grid: Map (Left) + Environmental Controls & Uncertainty (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Map View (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <MaritimeMap
            detection={detection}
            drift={drift}
            vessels={vessels}
            selectedVesselId=""
            onSelectVessel={() => {}}
            heightClass="h-[520px]"
          />

          <div className="p-3 rounded-lg bg-[#081326] border border-[#173260] text-xs font-mono text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <span className="text-amber-300 font-bold">Uncertainty Notice: </span>
              {drift.methodology_note}
            </p>
          </div>
        </div>

        {/* Right: Environmental & Transport Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#081326]/90 border border-[#173260] rounded-xl p-5 shadow-xl space-y-4 font-mono">
            <div className="border-b border-[#173260] pb-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Hydrodynamic Transport Inputs
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Drift Simulation Parameters
                </h3>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                SYNTHETIC DEMO DATA
              </span>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-3 text-xs">
              {/* Ocean Current Speed */}
              <div className="p-2.5 rounded-lg bg-[#060e1d] border border-[#132742] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                    <Waves className="w-3.5 h-3.5 text-cyan-400" /> Ocean Current Velocity:
                  </span>
                  <span className="text-cyan-300 font-bold">{currentSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.50"
                  step="0.05"
                  value={currentSpeed}
                  onChange={(e) => setCurrentSpeed(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded accent-ocean-accent"
                />
              </div>

              {/* Ocean Current Direction */}
              <div className="p-2.5 rounded-lg bg-[#060e1d] border border-[#132742] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" /> Current Direction (Towards):
                  </span>
                  <span className="text-cyan-300 font-bold">{currentDir}° (ENE)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={currentDir}
                  onChange={(e) => setCurrentDir(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded accent-ocean-accent"
                />
              </div>

              {/* Surface Wind Speed */}
              <div className="p-2.5 rounded-lg bg-[#060e1d] border border-[#132742] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                    <Wind className="w-3.5 h-3.5 text-amber-400" /> Surface Wind (10m):
                  </span>
                  <span className="text-amber-300 font-bold">{windSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="20.0"
                  step="0.5"
                  value={windSpeed}
                  onChange={(e) => setWindSpeed(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded accent-amber-400"
                />
              </div>

              {/* Wind Direction */}
              <div className="p-2.5 rounded-lg bg-[#060e1d] border border-[#132742] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1.5 font-semibold">
                    <Compass className="w-3.5 h-3.5 text-amber-400" /> Wind Direction (From):
                  </span>
                  <span className="text-amber-300 font-bold">{windDir}° (WSW)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={windDir}
                  onChange={(e) => setWindDir(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded accent-amber-400"
                />
              </div>

              {/* Uncertainty Dispersion Scaling */}
              <div className="p-2.5 rounded-lg bg-[#060e1d] border border-[#132742] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Eddy Diffusivity / Uncertainty:</span>
                  <span className="text-purple-300 font-bold">{uncertaintyScale}x Scale</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.25"
                  value={uncertaintyScale}
                  onChange={(e) => setUncertaintyScale(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded accent-purple-400"
                />
              </div>
            </div>

            {/* Estimated Release Window Highlight */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-orange-950/60 border border-amber-500/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Estimated Release Window:
                </span>
                <span className="text-base font-black text-white">
                  {drift.release_window_label}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-amber-900/60">
                <span>Origin Reconstruction Confidence:</span>
                <span className="font-bold text-amber-400">{drift.origin_confidence} / 1.00</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Bounding Ellipse Semi-Major Axis: {drift.probable_origin.semi_major_km} km
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
