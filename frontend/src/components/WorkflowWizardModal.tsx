import React, { useState } from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import {
  X,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Radar,
  Compass,
  Activity,
  Sparkles,
  FileText
} from 'lucide-react';

export const WorkflowWizardModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    workflowStep,
    setWorkflowStep,
    setSelectedEntity
  } = useMaritimeStore();

  const [activeTab, setActiveTab] = useState<number>(0);

  if (activeModal !== 'WORKFLOW_WIZARD') return null;

  const steps = [
    {
      step_num: "01",
      title: "Sentinel-1 SAR Detection & Segmentation",
      time: "10:42 UTC",
      icon: <Radar className="w-4 h-4 text-cyan-400" />,
      entityTrigger: { type: 'SPILL' as const },
      summary: "Copernicus Sentinel-1A C-Band SAR image acquired at 10:42 UTC. Dark backscatter thresholding identifies a suspected mineral oil slick in the Mumbai High offshore sector.",
      metrics: [
        { label: "Detected Area", value: "65.7 km²" },
        { label: "Major Axis Length", value: "22.0 km" },
        { label: "Centroid", value: "19.425°N, 71.848°E" },
        { label: "Detection Conf", value: "0.86 (SAR IW Mode)" }
      ]
    },
    {
      step_num: "02",
      title: "SAR Look-Alike & Backscatter Quality Check",
      time: "10:45 UTC",
      icon: <Radar className="w-4 h-4 text-sky-400" />,
      entityTrigger: { type: 'SPILL' as const },
      summary: "Evaluated polarimetric contrast ratio (-4.8 dB) and collocated ECMWF surface wind speed (6.2 m/s). Low-wind false positive threshold (> 3.0 m/s) satisfied.",
      metrics: [
        { label: "Surface Wind", value: "6.2 m/s @ 240°" },
        { label: "Contrast Ratio", value: "-4.8 dB (VV/VH)" },
        { label: "Look-Alike Risk", value: "LOW (Nominal)" },
        { label: "Status", value: "Confirmed Slick Signature" }
      ]
    },
    {
      step_num: "03",
      title: "Physical Backward Drift Hindcasting",
      time: "10:48 UTC",
      icon: <Compass className="w-4 h-4 text-amber-400" />,
      entityTrigger: { type: 'ORIGIN' as const },
      summary: "2D Lagrangian particle transport backtracked 4.7 hours under INCOIS current (0.35 m/s towards 65° ENE) and surface windage leeway (3%).",
      metrics: [
        { label: "Backtrack Time", value: "4.7 Hours" },
        { label: "Current Vector", value: "0.35 m/s @ 65°" },
        { label: "Origin Region", value: "19.280°N, 71.450°E" },
        { label: "Origin Conf", value: "0.72 (Dispersion Ellipse)" }
      ]
    },
    {
      step_num: "04",
      title: "Probable Origin Region & Release Window",
      time: "10:50 UTC",
      icon: <Clock className="w-4 h-4 text-amber-400" />,
      entityTrigger: { type: 'ORIGIN' as const },
      summary: "Reconstructed probable release-time window: 06:00–10:00 UTC with a 9.5 km semi-major axis dispersion boundary.",
      metrics: [
        { label: "Release Window", value: "06:00–10:00 UTC" },
        { label: "Semi-Major Axis", value: "9.5 km" },
        { label: "Semi-Minor Axis", value: "4.2 km" },
        { label: "Transport Axis", value: "62° Azimuth" }
      ]
    },
    {
      step_num: "05",
      title: "Spatiotemporal AIS Fleet Filtration",
      time: "10:52 UTC",
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      entityTrigger: { type: 'VESSEL' as const, mmsi: '419001284' },
      summary: "Filter funnel: 12 sector fleet detected $\\to$ 5 spatial corridor candidates $\\to$ 3 temporal candidates (Vessel A, Vessel B, Vessel C).",
      metrics: [
        { label: "Total Fleet", value: "12 Vessels" },
        { label: "Spatial Match", value: "5 Vessels" },
        { label: "Temporal Match", value: "3 Candidates" },
        { label: "Eliminated", value: "9 Non-Correlated" }
      ]
    },
    {
      step_num: "06",
      title: "Multi-Factor Explainable Evidence Scoring",
      time: "10:54 UTC",
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      entityTrigger: { type: 'VESSEL' as const, mmsi: '419001284' },
      summary: "Formula applied: 0.25*Prox + 0.20*Temp + 0.20*Drift + 0.15*Traj + 0.10*Behav + 0.10*AIS. Vessel A ranked #1 (91.4 HIGH Priority with 22-min AIS gap).",
      metrics: [
        { label: "Vessel A (Tanker)", value: "91.4 (HIGH PRIORITY)" },
        { label: "Vessel B (Bulk)", value: "67.8 (MEDIUM)" },
        { label: "Vessel C (Container)", value: "51.3 (LOW)" },
        { label: "AIS Anomaly Log", value: "22-min gap on Vessel A" }
      ]
    },
    {
      step_num: "07",
      title: "Counterfactual Plume Hypothesis Stress-Test",
      time: "10:55 UTC",
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      entityTrigger: { type: 'VESSEL' as const, mmsi: '419001284' },
      summary: "Simulated forward release plume for Candidate Vessel A from 08:25 UTC. High spatial consistency (88% IoU overlap, 0.9 km centroid delta) with observed slick.",
      metrics: [
        { label: "IoU Overlap", value: "88% (Vessel A)" },
        { label: "Centroid Delta", value: "0.9 km" },
        { label: "Hypothesis Consistency", value: "HIGH" },
        { label: "Status", value: "Ready for Analyst Verification" }
      ]
    }
  ];

  const curr = steps[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div className="bg-[#060e1d] border border-[#172e54] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs text-slate-300 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#172e54] pb-3">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400 fill-current" />
            <h3 className="font-bold text-white text-sm">
              Investigation Workflow (Steps 1 to 7)
            </h3>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#102344]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Step Navigation Pill Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(idx);
                setSelectedEntity(s.entityTrigger);
              }}
              className={`p-2 rounded border text-left transition-colors ${
                activeTab === idx
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow'
                  : 'bg-[#081326] text-slate-400 border-[#172e54] hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-500">{s.step_num}</span>
                <span className="text-[9px] text-slate-400">{s.time}</span>
              </div>
              <p className="text-[10px] leading-tight truncate">{s.title.split(' ')[0]} {s.title.split(' ')[1]}</p>
            </button>
          ))}
        </div>

        {/* Selected Step Details Box */}
        <div className="p-4 rounded-xl bg-[#081326] border border-[#172e54] space-y-3">
          <div className="flex items-center justify-between border-b border-[#172e54] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-sm">Step {curr.step_num}:</span>
              <h4 className="font-bold text-white text-sm">{curr.title}</h4>
            </div>
            <span className="text-slate-400 text-[10px]">{curr.time}</span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            {curr.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {curr.metrics.map((m, mIdx) => (
              <div key={mIdx} className="p-2 rounded bg-[#060e1d] border border-[#132742]">
                <span className="text-slate-400 text-[10px] block">{m.label}:</span>
                <span className="text-white font-bold text-xs">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-[#172e54] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              disabled={activeTab === 0}
              onClick={() => {
                const prev = Math.max(0, activeTab - 1);
                setActiveTab(prev);
                setSelectedEntity(steps[prev].entityTrigger);
              }}
              className="px-3 py-1.5 rounded bg-[#081326] hover:bg-[#102344] border border-[#172e54] text-slate-300 disabled:opacity-40"
            >
              &larr; Previous Step
            </button>
            <button
              disabled={activeTab === steps.length - 1}
              onClick={() => {
                const next = Math.min(steps.length - 1, activeTab + 1);
                setActiveTab(next);
                setSelectedEntity(steps[next].entityTrigger);
              }}
              className="px-3 py-1.5 rounded bg-[#081326] hover:bg-[#102344] border border-[#172e54] text-slate-300 disabled:opacity-40"
            >
              Next Step &rarr;
            </button>
          </div>

          <button
            onClick={() => {
              setActiveModal('NONE');
              setSelectedEntity(curr.entityTrigger);
            }}
            className="px-4 py-1.5 rounded bg-[#0f244a] hover:bg-[#173a78] border border-cyan-500/40 text-cyan-300 font-bold"
          >
            Inspect on Map &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
