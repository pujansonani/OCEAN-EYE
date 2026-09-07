import React, { useState } from 'react';
import { InvestigationReport as ReportType } from '../types';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  RefreshCw,
  Scale
} from 'lucide-react';

interface InvestigationReportViewProps {
  report: ReportType;
  onRefreshReport: () => void;
  isLoading: boolean;
}

export const InvestigationReportView: React.FC<InvestigationReportViewProps> = ({
  report,
  onRefreshReport,
  isLoading
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Print Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#081326]/90 border border-[#173260] p-4 rounded-xl shadow-xl no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-ocean-accent/40">
            <FileText className="w-5 h-5 text-ocean-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              Official Maritime Intelligence Dossier
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Standardized investigation summary with audit provenance &amp; evidence chain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={onRefreshReport}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#102244] hover:bg-[#173260] border border-[#173260] text-slate-200 text-xs font-bold rounded-lg transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Re-Generate
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Export Dossier
          </button>
        </div>
      </div>

      {/* Main Formatted Intelligence Report Container */}
      <div className="bg-[#081326]/95 border border-[#173260] rounded-2xl p-8 shadow-2xl space-y-8 font-mono max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b-2 border-ocean-accent/60 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-widest text-white">OCEAN-EYE</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-ocean-accent/40 text-ocean-accent font-bold">
                  SIH26143 DOSSIER
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-100 mt-2">
                MARITIME INCIDENT INVESTIGATION INTELLIGENCE REPORT
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-Powered Oil Spill Detection, Physical Drift Tracing &amp; Explainable Vessel Attribution
              </p>
            </div>

            <div className="text-right text-xs text-slate-400 space-y-0.5">
              <p><span className="text-slate-300 font-bold">Dossier ID:</span> {report.report_id}</p>
              <p><span className="text-slate-300 font-bold">Generated:</span> {report.generated_at}</p>
              <p><span className="text-slate-300 font-bold">Investigator Ref:</span> {report.analyst_reference}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-bold">
                SYNTHETIC DEMONSTRATION RECORD
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-ocean-accent border-b border-[#173260] pb-1">
            1. Executive Incident Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#132742]">
              <span className="text-slate-400 block text-[10px]">Incident ID / Sector</span>
              <span className="font-bold text-white text-sm">{report.incident_summary.id}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Arabian Sea / Mumbai High</p>
            </div>

            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#132742]">
              <span className="text-slate-400 block text-[10px]">Suspected Slick Area</span>
              <span className="font-bold text-red-400 text-sm">{report.detection_section.area_km2} km²</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Confidence: {report.detection_section.confidence}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#132742]">
              <span className="text-slate-400 block text-[10px]">Estimated Release Window</span>
              <span className="font-bold text-amber-300 text-sm">{report.drift_section.release_window_label}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Confidence: {report.drift_section.origin_confidence}</p>
            </div>

            <div className="p-3 rounded-lg bg-[#060e1d] border border-[#132742]">
              <span className="text-slate-400 block text-[10px]">Top Candidate Vessel</span>
              <span className="font-bold text-cyan-300 text-xs truncate block">{report.candidate_rankings[0].vessel_name}</span>
              <p className="text-[10px] text-ocean-accent mt-0.5">Score: {report.candidate_rankings[0].evidence_strength_score.toFixed(1)} / 100</p>
            </div>
          </div>
        </section>

        {/* Section 2: Satellite Detection & Geometry */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-ocean-accent border-b border-[#173260] pb-1">
            2. Satellite SAR Detection &amp; Spill Characterization
          </h2>
          <div className="p-4 rounded-xl bg-[#060e1d] border border-[#173260] text-xs space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Sensor:</span>
                <span className="text-white font-semibold">{report.detection_section.sensor_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Observation Timestamp:</span>
                <span className="text-white font-semibold">{report.detection_section.observation_timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Major Axis Length:</span>
                <span className="text-white font-semibold">{report.detection_section.length_km} km</span>
              </div>
              <div>
                <span className="text-slate-400 block">Orientation:</span>
                <span className="text-white font-semibold">{report.detection_section.orientation_deg}° (NNW–SSE)</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-[#132742]">
              <strong>Look-Alike Risk Check: </strong>
              {report.detection_section.look_alike_check.description}
            </p>
          </div>
        </section>

        {/* Section 3: Physical Drift Hindcasting */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-ocean-accent border-b border-[#173260] pb-1">
            3. Physical Backward Drift Hindcasting &amp; Probable Origin
          </h2>
          <div className="p-4 rounded-xl bg-[#060e1d] border border-[#173260] text-xs space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Ocean Current Velocity:</span>
                <span className="text-cyan-300 font-semibold">{report.drift_section.current_velocity_mps} m/s @ {report.drift_section.current_direction_deg}°</span>
              </div>
              <div>
                <span className="text-slate-400 block">Surface Wind (10m):</span>
                <span className="text-amber-300 font-semibold">{report.drift_section.wind_velocity_mps} m/s @ {report.drift_section.wind_direction_deg}°</span>
              </div>
              <div>
                <span className="text-slate-400 block">Probable Origin Centroid:</span>
                <span className="text-white font-semibold">19.280°N, 71.450°E</span>
              </div>
              <div>
                <span className="text-slate-400 block">Origin Dispersion Ellipse:</span>
                <span className="text-white font-semibold">{report.drift_section.probable_origin.semi_major_km} km Semi-Major</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-[#132742]">
              <strong>Methodology Note: </strong>
              {report.drift_section.methodology_note}
            </p>
          </div>
        </section>

        {/* Section 4: Candidate Vessel Ranking Matrix */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-ocean-accent border-b border-[#173260] pb-1">
            4. Candidate Vessel Attribution &amp; Evidence Ranking
          </h2>

          <div className="overflow-x-auto rounded-xl border border-[#173260]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#060e1d] text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="p-2.5">Rank</th>
                  <th className="p-2.5">Candidate Vessel</th>
                  <th className="p-2.5">MMSI</th>
                  <th className="p-2.5">Evidence Score</th>
                  <th className="p-2.5">Investigation Priority</th>
                  <th className="p-2.5">AIS Transmission Continuity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132742] text-slate-200">
                {report.candidate_rankings.map((c) => (
                  <tr key={c.vessel_id} className="hover:bg-[#0b1830]">
                    <td className="p-2.5 font-bold text-ocean-accent">#{c.rank}</td>
                    <td className="p-2.5 font-bold text-white">{c.vessel_name} ({c.vessel_type})</td>
                    <td className="p-2.5 font-mono text-slate-400">{c.mmsi}</td>
                    <td className="p-2.5 font-black text-cyan-300">{c.evidence_strength_score.toFixed(1)} / 100</td>
                    <td className="p-2.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
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
                    <td className="p-2.5 text-[11px]">
                      {c.vessel_id === 'VESSEL-001' ? (
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

        {/* Section 5: Evidence Provenance Audit Trail */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-ocean-accent border-b border-[#173260] pb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-ocean-accent" />
            5. Evidence Provenance &amp; Multi-Source Processing Chain
          </h2>

          <div className="space-y-2 text-xs">
            {report.evidence_provenance_trail.map((p) => (
              <div key={p.step_index} className="p-3 rounded-lg bg-[#060e1d] border border-[#132742] flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-ocean-accent font-bold">Step 0{p.step_index}:</span>
                    <span className="text-white font-bold">{p.processing_step}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Source: <span className="text-slate-300">{p.data_source}</span> &bull; Algorithm: <span className="text-cyan-300">{p.model_algorithm}</span>
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Output: {p.generated_output}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{p.timestamp_utc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: Recommended Actions & Regulatory Notice */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-ocean-accent border-b border-[#173260] pb-1">
            6. Recommended Next Steps &amp; Action Plan
          </h2>

          <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
            {report.analyst_action_recommendations.map((rec, idx) => (
              <li key={idx} className="leading-relaxed">{rec}</li>
            ))}
          </ul>
        </section>

        {/* Mandatory Compliance Disclaimer Footer */}
        <div className="p-4 rounded-xl bg-[#060e1d] border border-amber-500/40 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
          <Scale className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-400 mb-0.5">RESPONSIBLE AI INVESTIGATION NOTICE:</p>
            <p>{report.compliance_disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
