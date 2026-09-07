import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Scale,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Layers,
  Cpu
} from 'lucide-react';

interface ResponsibleAIViewProps {
  evidenceThreshold: number;
  setEvidenceThreshold: (val: number) => void;
  onToggleLookAlikeSimulate: () => void;
  isLookAlikeSimulated: boolean;
}

export const ResponsibleAIView: React.FC<ResponsibleAIViewProps> = ({
  evidenceThreshold,
  setEvidenceThreshold,
  onToggleLookAlikeSimulate,
  isLookAlikeSimulated
}) => {
  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center gap-3.5 bg-[#081326]/90 border border-[#173260] p-5 rounded-2xl shadow-xl">
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-ocean-accent/40">
          <ShieldCheck className="w-7 h-7 text-ocean-accent animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Responsible AI, Scientific Uncertainty &amp; Ethics Architecture
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            System limitations, fail-safe protocols, and strict non-accusatory investigative principles
          </p>
        </div>
      </div>

      {/* Core Principle Callout */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#081326] to-blue-950/40 border border-ocean-accent/50 shadow-2xl space-y-2">
        <h3 className="text-sm font-bold text-ocean-accent flex items-center gap-2">
          <Scale className="w-4 h-4 text-ocean-accent" />
          The Investigation-Support Paradigm
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          OCEAN-EYE operates under the foundational premise that <strong>AI does not prove legal guilt</strong>.
          Maritime oil spills involve complex multi-physics transport, discrete satellite revisit gaps, and imperfect terrestrial AIS coverage. 
          The system exists to synthesize disparate data sources into explainable, reproducible candidate rankings to guide Coast Guard patrols and port state control inspections.
        </p>
      </div>

      {/* 4 Pillars of Uncertainty Propagation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#081326] border border-[#173260] space-y-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            1. SAR Satellite Look-Alike Ambiguity
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            SAR sensors measure radar backscatter reduction caused by damped capillary waves. Look-alikes (low wind speeds &lt; 3.0 m/s, natural algal biogenic slicks, internal ocean waves, grease ice) frequently mimic mineral oil slicks. OCEAN-EYE features automatic look-alike risk checks that decrease detection confidence when wind fields indicate calm zones.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#081326] border border-[#173260] space-y-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            2. Hydrodynamic Transport Uncertainty
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Operational ocean current reanalysis (INCOIS / ECMWF) provides regional mesoscale grids. Sub-mesoscale coastal eddies and tidal shear introduce dispersion. The drift engine represents this uncertainty through probabilistic origin ellipses and release-time windows rather than single deterministic points.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#081326] border border-[#173260] space-y-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            3. AIS Telemetry Gaps &amp; Anomalies
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            AIS transmission gaps can occur from VHF terrain blockage, satellite constellation gaps, or transponder power cycling. An AIS gap is treated as supporting investigative evidence only and must <strong>never</strong> be interpreted as proof of intentional discharge or guilt.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#081326] border border-[#173260] space-y-2">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            4. Human-In-The-Loop Sign-Off
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            The output of OCEAN-EYE is an <strong>investigation hypothesis</strong>. Regulatory enforcement, vessel boarding, and legal prosecution require physical chemical fingerprinting (GC-MS crude biomarkers) and formal Coast Guard analyst sign-off.
          </p>
        </div>
      </div>

      {/* Interactive Responsible AI Sandbox */}
      <div className="bg-[#081326] border border-[#173260] rounded-xl p-5 shadow-xl space-y-4">
        <div className="border-b border-[#173260] pb-3">
          <span className="text-xs font-bold text-ocean-accent uppercase tracking-wider">
            Interactive Responsible AI Sandbox
          </span>
          <h3 className="text-sm font-bold text-white mt-0.5">
            Test Conservative Fallback Behaviors &amp; Edge Cases
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Edge Case 1: SAR Look-Alike Simulation */}
          <div className="p-3.5 rounded-lg bg-[#060e1d] border border-[#132742] space-y-3">
            <span className="text-slate-200 font-bold block">
              1. SAR Look-Alike Edge Case
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Simulate low-wind false-positive risk. When activated, the system lowers detection confidence to 0.42 and warns analysts not to initiate vessel attribution without optical or airborne verification.
            </p>
            <button
              onClick={onToggleLookAlikeSimulate}
              className={`w-full py-2 rounded-lg font-bold transition-all text-xs ${
                isLookAlikeSimulated
                  ? 'bg-amber-950 text-amber-300 border border-amber-500'
                  : 'bg-[#102244] hover:bg-[#173260] text-slate-200 border border-[#173260]'
              }`}
            >
              {isLookAlikeSimulated ? '✓ Look-Alike Risk Active (Reset)' : 'Simulate Low-Wind Look-Alike'}
            </button>
          </div>

          {/* Edge Case 2: Insufficient Evidence Threshold */}
          <div className="p-3.5 rounded-lg bg-[#060e1d] border border-[#132742] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-bold">2. Insufficient Evidence Threshold</span>
              <span className="text-cyan-300 font-bold">{evidenceThreshold}%</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Slide above 92% to test how the system safely triggers the <strong>Insufficient Attribution Evidence</strong> state rather than forcing a low-confidence candidate.
            </p>
            <input
              type="range"
              min="30"
              max="98"
              value={evidenceThreshold}
              onChange={(e) => setEvidenceThreshold(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded accent-ocean-accent cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Terminology Audit Table */}
      <div className="bg-[#081326] border border-[#173260] rounded-xl p-5 shadow-xl font-mono text-xs space-y-3">
        <h3 className="font-bold text-white text-sm">
          Investigation-Support Terminology Governance Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-1.5 text-emerald-300">
            <span className="font-bold flex items-center gap-1.5 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4" /> Approved Probabilistic Terms:
            </span>
            <p>&bull; Suspected Oil Slick</p>
            <p>&bull; Candidate Vessel / Potentially Relevant Vessel</p>
            <p>&bull; Evidence Strength Score (0–100)</p>
            <p>&bull; Investigation Priority (HIGH / MEDIUM / LOW)</p>
            <p>&bull; Probable Origin Region &amp; Release Window</p>
            <p>&bull; Insufficient Attribution Evidence</p>
            <p>&bull; Counterfactual Hypothesis Test</p>
          </div>

          <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/40 space-y-1.5 text-red-300">
            <span className="font-bold flex items-center gap-1.5 text-red-400 text-xs">
              <XCircle className="w-4 h-4" /> Strictly Prohibited Accusatory Terms:
            </span>
            <p className="line-through">&bull; Guilty Vessel</p>
            <p className="line-through">&bull; Confirmed Culprit</p>
            <p className="line-through">&bull; Responsible Vessel</p>
            <p className="line-through">&bull; Probability of Guilt</p>
            <p className="line-through">&bull; 100% Proved by AI</p>
            <p className="line-through">&bull; Guaranteed Attribution</p>
            <p className="line-through">&bull; Automated Legal Liability</p>
          </div>
        </div>
      </div>
    </div>
  );
};
