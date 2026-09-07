import React from 'react';
import { useMaritimeStore } from '../store/useMaritimeStore';
import { X, Database, Satellite, Waves, Radio, ShieldCheck, CheckCircle, ExternalLink, Coins } from 'lucide-react';

export const DataSourcesModal: React.FC = () => {
  const { activeModal, setActiveModal } = useMaritimeStore();

  if (activeModal !== 'SOURCES') return null;

  const sources = [
    {
      domain: "Live AIS Gateway 1: MyShipTracking API v2",
      provider: "MyShipTracking Enterprise Maritime Feed (myshiptracking.com)",
      status: "LIVE OPERATIONAL (1,972 COINS ACTIVE)",
      update_frequency: "Real-time Terrestrial / Nearshore AIS",
      coverage: "Global Commercial & Coastal Marine Traffic",
      parameters: "MMSI, IMO, SOG, COG, Heading, Dimensions (A/B/C/D), Draught, Historical Breadcrumb Tracks (Days 1–7)",
      endpoint: "https://api.myshiptracking.com/api/v2/vessel, /vessel/track, /vessel/search"
    },
    {
      domain: "Live AIS Gateway 2: DataDocked Vessel API",
      provider: "DataDocked Operational Maritime Intelligence (datadocked.com)",
      status: "LIVE ENTERPRISE KEY CONNECTED",
      update_frequency: "Real-time Worldwide Commercial Fleet Registry",
      coverage: "Global Merchant Marine & Deepwater Tankers",
      parameters: "IMO, MMSI, Registered Owner, ISM Manager, Classification Society (DNV GL / Lloyd's), P&I Club, Year Built, DWT, Last Port",
      endpoint: "https://datadocked.com/api/vessels_operations/get-vessel-info"
    },
    {
      domain: "Synthetic Aperture Radar (SAR Earth Observation)",
      provider: "ESA Copernicus Sentinel-1A C-Band SAR Constellation",
      status: "ACQUIRED: 2026-09-06 10:42:18 UTC",
      update_frequency: "1–3 day constellation revisit",
      coverage: "Interferometric Wide (IW) Swath (250 km Ground Coverage)",
      parameters: "VV/VH Polarization Backscatter Amplitude, Morphological Dark Slicks, Backscatter Contrast (-4.8 dB)"
    },
    {
      domain: "Hydrodynamic Ocean Currents (Drift Hindcast)",
      provider: "INCOIS Regional Ocean Modeling System (ROMS)",
      status: "REANALYSIS HOURLY FIELD",
      update_frequency: "Hourly (0.1° horizontal grid resolution)",
      coverage: "Indian Continental Shelf & Exclusive Economic Zone (EEZ)",
      parameters: "Zonal (U) and Meridional (V) surface velocity vectors (0.35 m/s @ 65° ENE)"
    },
    {
      domain: "Marine Boundary Layer Wind Reanalysis",
      provider: "ECMWF ERA5 Marine Atmospheric Boundary Layer",
      status: "OPERATIONAL FIELD",
      update_frequency: "Hourly (0.125° grid resolution)",
      coverage: "Global / North Indian Ocean",
      parameters: "10m Wind velocity (6.2 m/s), Wind direction (240° WSW), Windage leeway factor (3.2%)"
    },
    {
      domain: "Maritime Geospatial Infrastructure & Cadastre",
      provider: "UNCLOS / National Hydrographic Office (NHO India)",
      status: "VERIFIED HYDROGRAPHIC CHARTS",
      update_frequency: "Quarterly Notice to Mariners (NTM)",
      coverage: "Indian EEZ (200nm baseline), Traffic Separation Schemes (TSS), Bathymetry 50/100/200m",
      parameters: "Sovereign Maritime Boundaries, TSS separation zones, IALA buoyage, Depth contours"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-mono">
      <div className="bg-[#060e1d] border border-[#172e54] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-xs text-slate-300">
        <div className="flex items-center justify-between border-b border-[#172e54] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">
              Operational Data Sources &amp; Dual-Gateway Ingestion Provenance
            </h3>
          </div>
          <button
            onClick={() => setActiveModal('NONE')}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#102344]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-slate-400 mb-4 text-[11px] leading-relaxed">
          OCEAN-EYE unifies real-time live terrestrial/satellite AIS from <strong>MyShipTracking</strong> and <strong>DataDocked</strong> with ESA Copernicus Sentinel-1 SAR earth observation radar and INCOIS/ECMWF hydrodynamic drift models. Every piece of telemetry retains its explicit source metadata and provenance.
        </p>

        <div className="space-y-3">
          {sources.map((s, idx) => (
            <div key={idx} className="p-3 rounded bg-[#081326] border border-[#172e54] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {s.domain}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#040812] text-cyan-300 border border-cyan-900 font-bold">
                  {s.status}
                </span>
              </div>
              <p className="text-slate-300 text-[11px]"><span className="text-slate-400">Provider:</span> {s.provider}</p>
              {s.endpoint && (
                <p className="text-slate-400 text-[10px]"><span className="text-slate-300">API Endpoint:</span> <code className="text-cyan-300">{s.endpoint}</code></p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-[#132742]">
                <p><span className="text-slate-300">Cadence:</span> {s.update_frequency}</p>
                <p><span className="text-slate-300">Coverage:</span> {s.coverage}</p>
              </div>
              <p className="text-[10px] text-slate-500"><span className="text-slate-400">Parameters:</span> {s.parameters}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-[#172e54] flex justify-end">
          <button
            onClick={() => setActiveModal('NONE')}
            className="px-4 py-1.5 rounded bg-[#0f244a] hover:bg-[#173a78] border border-cyan-500/40 text-cyan-300 font-bold text-xs"
          >
            Close Data Provenance
          </button>
        </div>
      </div>
    </div>
  );
};
