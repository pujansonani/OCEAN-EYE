import React from 'react';
import { X, ShieldCheck, AlertTriangle, Cpu, Scale } from 'lucide-react';

interface UncertaintyModalProps {
  onClose: () => void;
}

export const UncertaintyModal: React.FC<UncertaintyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#081326] border border-[#173260] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 font-mono">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#173260] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-ocean-accent" />
            <h3 className="text-lg font-bold text-white">
              Responsible AI, Uncertainty &amp; Legal Boundary Disclaimers
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
            <h4 className="font-bold text-cyan-400 mb-1 flex items-center gap-2 text-sm">
              <Scale className="w-4 h-4" /> Core Investigation-Support Mandate
            </h4>
            <p className="leading-relaxed text-slate-200">
              OCEAN-EYE is engineered as an <strong>investigation-support triage tool</strong> for maritime authorities (Coast Guard, DG Shipping, Pollution Control Boards). It connects disparate geospatial observations into coherent candidate rankings. 
              <strong>It NEVER claims to prove legal responsibility or identify a &ldquo;guilty vessel&rdquo;.</strong>
            </p>
          </div>

          {/* Uncertainty Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#173260]">
              <span className="text-amber-400 font-bold block mb-1">1. SAR Satellite Dark-Patch Ambiguity</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Synthetic Aperture Radar detects surface capillary wave damping. Natural biogenic slicks, low-wind calm zones (&lt; 3 m/s), grease ice, and internal waves create dark look-alikes.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#173260]">
              <span className="text-amber-400 font-bold block mb-1">2. Hydrodynamic Drift Uncertainty</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Backward particle hindcasting relies on regional current &amp; wind models. Sub-mesoscale turbulence and tide phase shifts are represented via probabilistic origin ellipses, not exact points.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#173260]">
              <span className="text-amber-400 font-bold block mb-1">3. AIS Telemetry Incompleteness</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Terrestrial and satellite AIS feeds contain blind zones and packet collisions. AIS transmission anomalies provide supporting clues only and do not establish malicious intent or discharge.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#173260]">
              <span className="text-amber-400 font-bold block mb-1">4. Human-In-The-Loop Sign-off</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Algorithmic evidence strength scores serve to prioritize patrol deployment and port inspection. Judicial action requires independent physical sampling and forensic chemical fingerprinting.
              </p>
            </div>
          </div>

          {/* Mandatory Terminology Guide */}
          <div className="p-3 rounded-lg bg-[#060e1d] border border-cyan-500/20">
            <h5 className="font-bold text-ocean-accent mb-2">Approved vs Prohibited Terminology:</h5>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="space-y-1 text-emerald-400">
                <p>&check; Candidate Vessel / Potentially Relevant Vessel</p>
                <p>&check; Evidence Strength Score / Attribution Score</p>
                <p>&check; Probable Origin Region / Release Window</p>
                <p>&check; Insufficient Attribution Evidence</p>
              </div>
              <div className="space-y-1 text-red-400 line-through opacity-80">
                <p>&cross; Guilty Vessel / Confirmed Culprit</p>
                <p>&cross; 100% Responsible / Proved by AI</p>
                <p>&cross; Probability of Guilt</p>
                <p>&cross; Guaranteed Attribution</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#173260] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500 text-xs font-bold text-cyan-300 transition-colors"
          >
            I Acknowledge &amp; Understand Disclaimers
          </button>
        </div>
      </div>
    </div>
  );
};
