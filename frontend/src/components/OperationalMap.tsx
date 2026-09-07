import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import { useMaritimeStore, VesselObject, BasemapType } from '../store/useMaritimeStore';
import {
  Maximize2,
  Crosshair,
  Layers,
  Map as MapIcon,
  Compass,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Info
} from 'lucide-react';

// Free High-Definition Maritime Tile Providers (No API Key Required, Zero Watermarks)
const BASEMAP_TILES: Record<BasemapType, { url: string; attribution: string; maxZoom: number }> = {
  dark: {
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &bull; Sentinel-1 SAR &bull; INCOIS Metocean',
    maxZoom: 19
  },
  satellite: {
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &bull; Earthstar Geographics &bull; Sentinel-1 SAR',
    maxZoom: 19
  },
  ocean: {
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri Ocean Basemap &bull; GEBCO &bull; NOAA &bull; IHO',
    maxZoom: 16
  },
  voyager: {
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri Light Gray &bull; OpenStreetMap contributors',
    maxZoom: 19
  }
};

// Tactical SVG vessel marker with course line & candidate styling
const createTacticalVesselIcon = (
  vessel: VesselObject,
  isSelected: boolean
) => {
  const { vessel_type, sog, hdg, cog, is_candidate } = vessel;
  const angle = (hdg !== undefined && hdg !== null && !isNaN(hdg)) ? hdg : (cog || 0);

  // Palette by ship classification
  let fill = '#94a3b8'; // default slate
  let border = '#0f172a';

  if (is_candidate) {
    fill = '#ef4444'; // Candidate polluter highlight in striking red/orange
    border = '#ffffff';
  } else if (vessel_type.includes('Tanker')) {
    fill = '#f59e0b'; // Amber
  } else if (vessel_type.includes('Cargo') || vessel_type.includes('Carrier')) {
    fill = '#38bdf8'; // Sky Blue
  } else if (vessel_type.includes('Container')) {
    fill = '#a855f7'; // Purple
  } else if (vessel_type.includes('Tug') || vessel_type.includes('Supply') || vessel_type.includes('Offshore')) {
    fill = '#06b6d4'; // Cyan
  } else if (vessel_type.includes('Naval') || vessel_type.includes('Patrol')) {
    fill = '#10b981'; // Emerald
  } else if (vessel_type.includes('Fishing')) {
    fill = '#eab308'; // Yellow
  }

  if (isSelected) {
    border = '#00e5ff';
  }

  const size = isSelected ? 26 : is_candidate ? 22 : 18;
  const speedVectorLength = Math.min(Math.max(sog * 1.5, 4), 22);

  const svg = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${is_candidate ? `
        <div style="position: absolute; width: ${size + 14}px; height: ${size + 14}px; border-radius: 50%; border: 1.5px dashed #ef4444; opacity: 0.8; animation: spin 8s linear infinite;" class="candidate-pulse-ring"></div>
      ` : ''}
      ${isSelected ? `
        <div style="position: absolute; width: ${size + 10}px; height: ${size + 10}px; border-radius: 50%; border: 1.5px solid #00e5ff; box-shadow: 0 0 8px #00e5ff;"></div>
      ` : ''}
      <svg width="${size}" height="${size}" viewBox="0 0 28 28" style="transform: rotate(${angle}deg); transform-origin: center; overflow: visible;">
        <!-- Velocity Vector Leader -->
        <line x1="14" y1="14" x2="14" y2="${14 - speedVectorLength}" stroke="${isSelected ? '#00e5ff' : '#94a3b8'}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2,2" />
        <!-- Vessel Hull Polygon -->
        <polygon points="14,2 23,23 14,19 5,23" fill="${fill}" stroke="${border}" stroke-width="${isSelected ? 2 : 1.2}" stroke-linejoin="round" />
        ${is_candidate ? `<circle cx="14" cy="13" r="3" fill="#ffffff" />` : ''}
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'tactical-vessel-div-icon',
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4]
  });
};

// Map View Sync & Lifecycle Component
const MapLifecycle: React.FC = () => {
  const map = useMap();
  const setCursorPos = useMaritimeStore((s) => s.setCursorPos);
  const setZoomLevel = useMaritimeStore((s) => s.setZoomLevel);
  const selectedEntity = useMaritimeStore((s) => s.selectedEntity);
  const vessels = useMaritimeStore((s) => s.vessels);
  const isLayerDockOpen = useMaritimeStore((s) => s.isLayerDockOpen);
  const isInspectorDockOpen = useMaritimeStore((s) => s.isInspectorDockOpen);

  // Resize handling so tiles load across entire canvas immediately
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, isLayerDockOpen, isInspectorDockOpen]);

  useMapEvents({
    mousemove(e) {
      setCursorPos({
        lat: Number(e.latlng.lat.toFixed(4)),
        lon: Number(e.latlng.lng.toFixed(4))
      });
    },
    zoomend(e) {
      setZoomLevel(e.target.getZoom());
    }
  });

  // Pan to selected entity
  useEffect(() => {
    if (selectedEntity.type === 'VESSEL') {
      const v = vessels.find((item) => item.mmsi === selectedEntity.mmsi);
      if (v) {
        map.flyTo([v.lat, v.lon], Math.max(map.getZoom(), 11), { duration: 0.6 });
      }
    } else if (selectedEntity.type === 'SPILL') {
      map.flyTo([19.425, 71.848], 11, { duration: 0.6 });
    } else if (selectedEntity.type === 'ORIGIN') {
      map.flyTo([19.280, 71.450], 11, { duration: 0.6 });
    }
  }, [selectedEntity, vessels, map]);

  return null;
};

// Custom Map Controls HUD
const MapTacticalHUD: React.FC = () => {
  const map = useMap();
  const { basemap, setBasemap, setSelectedEntity } = useMaritimeStore();
  const [showBasemapPicker, setShowBasemapPicker] = useState(false);

  return (
    <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-2 pointer-events-auto">
      {/* Basemap Selection Bar */}
      <div className="relative">
        <button
          onClick={() => setShowBasemapPicker(!showBasemapPicker)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0a1220]/90 backdrop-blur-md border border-slate-700/80 text-xs font-medium text-slate-200 hover:text-white hover:border-cyan-500/60 shadow-xl transition-all"
          title="Change Basemap Chart"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="capitalize">{basemap} Chart</span>
        </button>

        {showBasemapPicker && (
          <div className="absolute right-0 mt-1.5 w-44 bg-[#0a1220]/95 backdrop-blur-md border border-slate-700/90 rounded-md shadow-2xl p-1.5 space-y-1 z-50 text-xs">
            <div className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 uppercase tracking-wider">
              Nautical Basemap
            </div>
            {[
              { id: 'dark', label: 'Dark ECDIS Chart', desc: 'Tactical Navy Night' },
              { id: 'satellite', label: 'Satellite Hybrid', desc: 'High-Res SAR Overlay' },
              { id: 'ocean', label: 'ESRI Ocean Bathymetry', desc: 'Depth & Sea Floor' },
              { id: 'voyager', label: 'Standard Navigation', desc: 'Open Nautical View' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setBasemap(item.id as BasemapType);
                  setShowBasemapPicker(false);
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-xs flex flex-col transition-colors ${
                  basemap === item.id
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-[10px] text-slate-400">{item.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Navigation Controls */}
      <div className="flex flex-col bg-[#0a1220]/90 backdrop-blur-md border border-slate-700/80 rounded-md shadow-xl overflow-hidden text-slate-300">
        <button
          onClick={() => map.zoomIn()}
          className="p-2 hover:bg-slate-800/80 hover:text-white border-b border-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="p-2 hover:bg-slate-800/80 hover:text-white border-b border-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            map.flyTo([19.425, 71.848], 11, { duration: 0.8 });
            setSelectedEntity({ type: 'SPILL' });
          }}
          className="p-2 hover:bg-red-950/60 hover:text-red-300 border-b border-slate-800 transition-colors"
          title="Focus Oil Slick (SAR Detection)"
        >
          <AlertTriangle className="w-4 h-4 text-red-400" />
        </button>
        <button
          onClick={() => {
            map.flyTo([19.280, 71.450], 11, { duration: 0.8 });
            setSelectedEntity({ type: 'ORIGIN' });
          }}
          className="p-2 hover:bg-amber-950/60 hover:text-amber-300 border-b border-slate-800 transition-colors"
          title="Focus Probable Origin (Lagrangian)"
        >
          <Compass className="w-4 h-4 text-amber-400" />
        </button>
        <button
          onClick={() => {
            map.flyTo([19.380, 71.650], 10, { duration: 0.8 });
            setSelectedEntity({ type: 'NONE' });
          }}
          className="p-2 hover:bg-slate-800/80 hover:text-white transition-colors"
          title="Reset Sector 7 Full Overview"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </div>
  );
};

export const OperationalMap: React.FC = () => {
  const {
    vessels,
    satelliteScene,
    environment,
    layers,
    selectedEntity,
    setSelectedEntity,
    vesselTypeFilter,
    basemap
  } = useMaritimeStore();

  // Filter vessels according to user filter
  const filteredVessels = vessels.filter((v) => {
    if (vesselTypeFilter === 'ALL') return true;
    if (vesselTypeFilter === 'CANDIDATES') return v.is_candidate;
    return v.vessel_type.toUpperCase().includes(vesselTypeFilter);
  });

  // Marine Corridors & TSS Lines
  const shippingLanes = [
    {
      name: "Mumbai High Main Deepwater TSS Corridor",
      coords: [[19.050, 70.950], [19.220, 71.300], [19.420, 71.750], [19.680, 72.150]] as [number, number][]
    },
    {
      name: "Offshore Production Restricted Zone",
      coords: [[19.180, 71.280], [19.380, 71.420], [19.480, 71.650]] as [number, number][]
    }
  ];

  // Sovereign EEZ Baseline
  const eezLine: [number, number][] = [
    [18.400, 69.900],
    [18.900, 70.250],
    [19.450, 70.650],
    [20.000, 71.050],
    [20.500, 71.450]
  ];

  // GEBCO Bathymetry Contours
  const bathymetry50m: [number, number][] = [[19.050, 72.250], [19.380, 72.120], [19.720, 72.060]];
  const bathymetry100m: [number, number][] = [[19.050, 71.820], [19.380, 71.710], [19.720, 71.640]];
  const bathymetry200m: [number, number][] = [[18.950, 71.220], [19.280, 71.160], [19.620, 71.090]];

  // Lagrangian Drift Particle Streamlines
  const backwardParticles = [
    [[19.425, 71.848], [19.380, 71.720], [19.320, 71.580], [19.280, 71.450]],
    [[19.450, 71.840], [19.400, 71.710], [19.340, 71.570], [19.295, 71.440]],
    [[19.400, 71.855], [19.360, 71.730], [19.300, 71.590], [19.265, 71.460]],
    [[19.480, 71.830], [19.430, 71.700], [19.360, 71.560], [19.310, 71.430]],
    [[19.340, 71.875], [19.310, 71.750], [19.270, 71.600], [19.245, 71.470]],
  ];

  const currentTileConfig = BASEMAP_TILES[basemap] || BASEMAP_TILES.dark;

  return (
    <div className="relative w-full h-full bg-[#030712] overflow-hidden">
      <MapContainer
        center={[19.380, 71.650]}
        zoom={10}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapLifecycle />
        <MapTacticalHUD />

        {/* Dynamic Basemap Tile Layer */}
        <TileLayer
          key={basemap}
          attribution={currentTileConfig.attribution}
          url={currentTileConfig.url}
          maxZoom={currentTileConfig.maxZoom}
        />

        {/* 1. Bathymetry Depth Contours */}
        {layers.bathymetry && (
          <>
            <Polyline positions={bathymetry50m} pathOptions={{ color: '#2563eb', weight: 1.2, dashArray: '4, 6', opacity: 0.5 }} />
            <Polyline positions={bathymetry100m} pathOptions={{ color: '#1d4ed8', weight: 1.4, dashArray: '4, 6', opacity: 0.5 }} />
            <Polyline positions={bathymetry200m} pathOptions={{ color: '#1e40af', weight: 1.6, dashArray: '5, 8', opacity: 0.6 }} />
          </>
        )}

        {/* 2. EEZ Maritime Boundary Line */}
        {layers.eezBoundary && (
          <Polyline
            positions={eezLine}
            pathOptions={{ color: '#06b6d4', weight: 2, dashArray: '10, 8', opacity: 0.7 }}
          />
        )}

        {/* 3. Traffic Separation Schemes (TSS) */}
        {layers.shippingLanes &&
          shippingLanes.map((lane, idx) => (
            <Polyline
              key={`lane-${idx}`}
              positions={lane.coords}
              pathOptions={{ color: '#ec4899', weight: 2.2, dashArray: '8, 6', opacity: 0.65 }}
            />
          ))}

        {/* 4. Sentinel-1 SAR Satellite Acquisition Footprint */}
        {layers.satelliteFootprint && satelliteScene && (
          <Polygon
            positions={satelliteScene.footprint_coordinates as [number, number][]}
            pathOptions={{
              color: '#38bdf8',
              weight: 1.5,
              dashArray: '6, 6',
              fillColor: '#38bdf8',
              fillOpacity: 0.05
            }}
            eventHandlers={{
              click: () => setSelectedEntity({ type: 'SATELLITE' })
            }}
          />
        )}

        {/* 5. Suspected Oil Slick GIS Polygon (High Contrast Radar Layer) */}
        {layers.slickPolygon && satelliteScene && (
          <Polygon
            positions={satelliteScene.detected_slick.polygon as [number, number][]}
            pathOptions={{
              color: '#ef4444',
              weight: 2.5,
              fillColor: '#ef4444',
              fillOpacity: 0.55
            }}
            eventHandlers={{
              click: () => setSelectedEntity({ type: 'SPILL' })
            }}
          >
            <Popup>
              <div className="space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  CONFIRMED OIL SLICK (SAR)
                </div>
                <div className="text-[11px] text-slate-300">
                  Area: <strong className="text-white">{satelliteScene.detected_slick.area_km2} km²</strong> (22.0 km length)
                </div>
                <div className="text-[11px] text-slate-300">
                  Confidence: <strong className="text-emerald-400">{(satelliteScene.detected_slick.detection_confidence * 100).toFixed(0)}%</strong> (Contrast -4.8 dB)
                </div>
                <button
                  onClick={() => setSelectedEntity({ type: 'SPILL' })}
                  className="w-full mt-1.5 py-1 px-2 rounded bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-[10px] font-semibold text-center transition-colors"
                >
                  View Full Radar Slick Dossier
                </button>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Slick Centroid Tag */}
        {layers.slickPolygon && (
          <CircleMarker
            center={[19.425, 71.848]}
            radius={5}
            pathOptions={{ color: '#ffffff', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
            eventHandlers={{
              click: () => setSelectedEntity({ type: 'SPILL' })
            }}
          />
        )}

        {/* 6. Reconstructed Probable Origin Region Ellipse */}
        {layers.probableOrigin && environment && (
          <Polygon
            positions={environment.hindcast.probable_origin_ellipse.polygon as [number, number][]}
            pathOptions={{
              color: '#f59e0b',
              weight: 2,
              dashArray: '6, 6',
              fillColor: '#f59e0b',
              fillOpacity: 0.25
            }}
            eventHandlers={{
              click: () => setSelectedEntity({ type: 'ORIGIN' })
            }}
          >
            <Popup>
              <div className="space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase">
                  <Compass className="w-3.5 h-3.5" />
                  Probable Release Origin
                </div>
                <div className="text-[11px] text-slate-300">
                  Release Window: <strong className="text-white">06:00 – 10:00 UTC</strong>
                </div>
                <div className="text-[11px] text-slate-300">
                  Lagrangian Backward Drift: <strong className="text-cyan-300">4.7 Hours</strong>
                </div>
                <button
                  onClick={() => setSelectedEntity({ type: 'ORIGIN' })}
                  className="w-full mt-1.5 py-1 px-2 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 text-[10px] font-semibold text-center transition-colors"
                >
                  Inspect Drift Physics Parameters
                </button>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* 7. Backward Drift Particle Streamlines */}
        {layers.backwardParticles &&
          backwardParticles.map((pts, idx) => (
            <Polyline
              key={`drift-${idx}`}
              positions={pts as [number, number][]}
              pathOptions={{
                color: '#06b6d4',
                weight: 1.8,
                dashArray: '5, 6',
                opacity: 0.8
              }}
            />
          ))}

        {/* 8. Ocean Current Field (Directional Arrows) */}
        {layers.oceanCurrents && environment &&
          environment.current_vectors.map((vec, idx) => (
            <CircleMarker
              key={`cur-${idx}`}
              center={[vec.lat, vec.lon]}
              radius={2.5}
              pathOptions={{ color: '#00e5ff', fillColor: '#00e5ff', fillOpacity: 0.8, weight: 1 }}
            />
          ))}

        {/* 9. Historical Vessel Trajectories */}
        {layers.vesselTracks &&
          filteredVessels.map((v) => {
            if (!v.track || v.track.length < 2) return null;
            const isSelected = selectedEntity.type === 'VESSEL' && selectedEntity.mmsi === v.mmsi;
            const pts = v.track.map((p) => [p.lat, p.lon] as [number, number]);

            return (
              <React.Fragment key={`vtrack-${v.mmsi}`}>
                <Polyline
                  positions={pts}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : v.is_candidate ? '#ef4444' : '#64748b',
                    weight: isSelected ? 3.5 : v.is_candidate ? 2.5 : 1.2,
                    opacity: isSelected ? 1 : v.is_candidate ? 0.9 : 0.45,
                    dashArray: v.is_candidate ? undefined : '4, 6'
                  }}
                  eventHandlers={{
                    click: () => setSelectedEntity({ type: 'VESSEL', mmsi: v.mmsi })
                  }}
                />

                {/* Mark Anomaly Gap on Track if present */}
                {v.ais_continuity?.has_anomaly && (
                  <CircleMarker
                    center={[19.274, 71.432]}
                    radius={6}
                    pathOptions={{ color: '#f59e0b', fillColor: '#030712', fillOpacity: 1, weight: 2.5 }}
                    eventHandlers={{
                      click: () => setSelectedEntity({ type: 'VESSEL', mmsi: v.mmsi })
                    }}
                  >
                    <Popup>
                      <div className="font-sans text-xs space-y-1">
                        <div className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          AIS Silent Gap Anomaly
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          Duration: <strong className="text-white">42 Minutes</strong>
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          Location: <strong>19.274°N, 71.432°E</strong> (Inside Origin Ellipse)
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )}
              </React.Fragment>
            );
          })}

        {/* 10. Tactical Directional Vessel Markers */}
        {layers.vessels &&
          filteredVessels.map((v) => {
            const isSelected = selectedEntity.type === 'VESSEL' && selectedEntity.mmsi === v.mmsi;
            const icon = createTacticalVesselIcon(v, isSelected);

            return (
              <Marker
                key={`vessel-${v.mmsi}`}
                position={[v.lat, v.lon]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedEntity({ type: 'VESSEL', mmsi: v.mmsi })
                }}
              >
                <Popup>
                  <div className="space-y-1.5 font-sans min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-700/60 pb-1">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5 truncate">
                        <span className={`w-2 h-2 rounded-full ${v.is_candidate ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        {v.name}
                      </span>
                      {v.is_candidate && (
                        <span className="text-[9px] font-bold bg-red-950 text-red-300 border border-red-800 px-1 py-0.2 rounded">
                          CANDIDATE #{v.candidate_rank}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-300 pt-0.5">
                      <div>Type: <strong className="text-white">{v.vessel_type}</strong></div>
                      <div>Flag: <strong className="text-white">{v.flag_state}</strong></div>
                      <div>SOG: <strong className="text-cyan-300">{v.sog.toFixed(1)} kn</strong></div>
                      <div>COG: <strong className="text-cyan-300">{v.cog.toFixed(0)}°T</strong></div>
                      <div>MMSI: <span className="font-mono text-slate-400">{v.mmsi}</span></div>
                      <div>IMO: <span className="font-mono text-slate-400">{v.imo}</span></div>
                    </div>

                    {v.is_candidate && (
                      <div className="p-1.5 rounded bg-red-950/50 border border-red-800/60 text-[10px] text-red-200">
                        Evidence Strength: <strong className="text-white">{v.evidence_strength}%</strong> &bull; {v.investigation_priority} Priority
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedEntity({ type: 'VESSEL', mmsi: v.mmsi })}
                      className="w-full mt-1 py-1 px-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-[10px] font-semibold text-center transition-colors"
                    >
                      Open Target Telemetry &amp; Dossier
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
