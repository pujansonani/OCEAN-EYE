import React from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import {
  X,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Cpu
} from 'lucide-react';

export const InvestigationDossierModal: React.FC = () => {
  const { activeModal, setActiveModal, vessels, satelliteScene, environment } = useMaritimeStore();

  if (activeModal !== 'REPORT') return null;

  const candidateVessels = vessels.filter((v) => v.is_candidate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div className="bg-[#060e1d] border border-[#172e54] rounded-lg w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl p-6 text-xs text-slate-300 space-y-6 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-[#172e54] pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">
              Official Maritime Investigation Dossier
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1 rounded bg-[#0f244a] hover:bg-[#173a78] border border-cyan-500/40 text-cyan-300 font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Export Dossier
            </button>
            <button
              onClick={() => setActiveModal('NONE')}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#102344]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dossier Header */}
        <div className="border-b-2 border-[#172e54] pb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-lg font-black tracking-widest text-white">OCEAN-EYE MARITIME INTELLIGENCE</span>
              <h1 className="text-sm font-bold text-slate-200 mt-1">
                INCIDENT DOSSIER: OCEAN-001 (ARABIAN SEA / MUMBAI HIGH BASIN)
              </h1>
              <p className="text-[10px] text-slate-400">
                AI-Powered Oil Spill Detection, 2D Lagrangian Hindcast &amp; Explainable Vessel Attribution
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-400 space-y-0.5">
              <p>Dossier Ref: <span className="text-white font-bold">MGIU-REP-OCEAN-001-2026</span></p>
              <p>Generated: <span className="text-white font-bold">2026-09-06 17:55 UTC</span></p>
              <span className="inline-block px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                HISTORICAL BENCHMARK RECORD
              </span>
            </div>
          </div>
        </div>

        {/* 1. Incident Overview */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-[#172e54] pb-1">
            1. Executive Summary &amp; Sector Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded bg-[#081326] border border-[#172e54]">
              <span className="text-slate-400 text-[10px] block">Suspected Slick:</span>
              <span className="font-bold text-red-400 text-sm">65.7 km²</span>
              <span className="text-[9px] text-slate-500 block">Sentinel-1A SAR</span>
            </div>
            <div className="p-2.5 rounded bg-[#081326] border border-[#172e54]">
              <span className="text-slate-400 text-[10px] block">Release Window:</span>
              <span className="font-bold text-amber-300 text-sm">06:00–10:00 UTC</span>
              <span className="text-[9px] text-slate-500 block">4.7h Drift Backtrack</span>
            </div>
            <div className="p-2.5 rounded bg-[#081326] border border-[#172e54]">
              <span className="text-slate-400 text-[10px] block">Top Candidate:</span>
              <span className="font-bold text-cyan-300 text-xs truncate block">MT Ocean Vanguard</span>
              <span className="text-[9px] text-slate-500 block">Score: 91.4 (HIGH)</span>
            </div>
            <div className="p-2.5 rounded bg-[#081326] border border-[#172e54]">
              <span className="text-slate-400 text-[10px] block">Investigation Status:</span>
              <span className="font-bold text-amber-400 text-xs block">Under Investigation</span>
              <span className="text-[9px] text-slate-500 block">Human Sign-off Req.</span>
            </div>
          </div>
        </section>

        {/* 2. Candidate Vessel Attribution Matrix */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-[#172e54] pb-1">
            2. Candidate Vessel Ranking &amp; Explainable Evidence
          </h2>
          <div className="overflow-x-auto rounded border border-[#172e54]">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#081326] text-slate-400 text-[10px] uppercase border-b border-[#172e54]">
                <tr>
                  <th className="p-2">Rank</th>
                  <th className="p-2">Candidate Vessel</th>
                  <th className="p-2">Type / MMSI</th>
                  <th className="p-2">Evidence Score</th>
                  <th className="p-2">Investigation Priority</th>
                  <th className="p-2">AIS Continuity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132742]">
                {candidateVessels.map((c) => (
                  <tr key={c.mmsi} className="hover:bg-[#081326]">
                    <td className="p-2 font-bold text-cyan-400">#{c.candidate_rank}</td>
                    <td className="p-2 font-bold text-white">{c.name}</td>
                    <td className="p-2 text-slate-400">{c.vessel_type} &bull; {c.mmsi}</td>
                    <td className="p-2 font-black text-cyan-300">{c.evidence_strength?.toFixed(1)} / 100</td>
                    <td className="p-2">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          c.investigation_priority === 'HIGH'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : c.investigation_priority === 'MEDIUM'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.investigation_priority}
                      </span>
                    </td>
                    <td className="p-2 text-[10px]">
                      {c.ais_continuity?.has_anomaly ? (
                        <span className="text-amber-400 font-semibold">22-min Gap (08:15–08:37 UTC)</span>
                      ) : (
                        <span className="text-emerald-400">Continuous AIS</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Evidence Provenance Audit Trail */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-[#172e54] pb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            3. Multi-Sensor Evidence Provenance Trail
          </h2>
          <div className="space-y-1.5 text-[10px]">
            <div className="p-2 rounded bg-[#081326] border border-[#172e54] flex justify-between">
              <div>
                <span className="text-cyan-400 font-bold">Step 01: SAR Segmentation:</span> Copernicus Sentinel-1A C-Band IW mode (10:42 UTC). Area 65.7 km².
              </div>
              <span className="text-slate-500">10:45 UTC</span>
            </div>
            <div className="p-2 rounded bg-[#081326] border border-[#172e54] flex justify-between">
              <div>
                <span className="text-cyan-400 font-bold">Step 02: Drift Backtrack:</span> INCOIS ROMS reanalysis (0.35 m/s @ 65°) + ECMWF wind (6.2 m/s). Probable Origin [19.280°N, 71.450°E].
              </div>
              <span className="text-slate-500">10:48 UTC</span>
            </div>
            <div className="p-2 rounded bg-[#081326] border border-[#172e54] flex justify-between">
              <div>
                <span className="text-cyan-400 font-bold">Step 03: AIS Spatiotemporal Filter:</span> 12 fleet detected $\to$ 5 spatial corridor $\to$ 3 release window candidates.
              </div>
              <span className="text-slate-500">10:50 UTC</span>
            </div>
            <div className="p-2 rounded bg-[#081326] border border-[#172e54] flex justify-between">
              <div>
                <span className="text-cyan-400 font-bold">Step 04: Evidence Scoring:</span> Weighted formula yields Vessel A score 91.4 (HIGH Priority).
              </div>
              <span className="text-slate-500">10:52 UTC</span>
            </div>
            <div className="p-2 rounded bg-[#081326] border border-[#172e54] flex justify-between">
              <div>
                <span className="text-cyan-400 font-bold">Step 05: Counterfactual Test:</span> Forward plume simulation from Vessel A at 08:25 UTC yields 88% IoU spatial overlap.
              </div>
              <span className="text-slate-500">10:55 UTC</span>
            </div>
          </div>
        </section>

        {/* 4. Action Recommendations */}
        <section className="space-y-1.5">
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-[#172e54] pb-1">
            4. Recommended Next Actions
          </h2>
          <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
            <li>Deploy Coast Guard patrol vessel or Dornier maritime reconnaissance aircraft for thermal FLIR / visual inspection.</li>
            <li>Issue port state control inspection notice for Candidate Vessel A upon next port call.</li>
            <li>Conduct physical hydrocarbon fingerprinting (GC-MS analysis) to establish definitive chemical matching.</li>
          </ul>
        </section>

        {/* 5. Compliance Disclaimer */}
        <div className="p-3 rounded bg-amber-950/20 border border-amber-500/40 text-[10px] text-amber-300/90 leading-relaxed flex items-start gap-2">
          <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-400 mb-0.5">RESPONSIBLE AI INVESTIGATION NOTICE:</p>
            <p>
              This document was generated by OCEAN-EYE as an investigation decision-support dossier for maritime authorities. All evidence rankings represent probabilistic hypotheses based on available remote sensing, hydrodynamic models, and AIS data. This system does not establish legal liability or guilt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
