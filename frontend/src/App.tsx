import React, { useEffect, useState } from 'react';
import { useMaritimeStore } from './store/useMaritimeStore';
import { TopOperationsBar } from './components/TopOperationsBar';
import { OperationalMap } from './components/OperationalMap';
import { LayerControlDock } from './components/LayerControlDock';
import { ContextualInspectorDock } from './components/ContextualInspectorDock';
import { BottomTimelineBar } from './components/BottomTimelineBar';
import { SouffletOceanEyePortal } from './components/SouffletOceanEyePortal';
import { SouffletLoader } from './components/SouffletLoader';

import { DataSourcesModal } from './components/DataSourcesModal';
import { ResponsibleAIModal } from './components/ResponsibleAIModal';
import { WorkflowWizardModal } from './components/WorkflowWizardModal';
import { InvestigationDossierModal } from './components/InvestigationDossierModal';
import { ECDISWorkspace } from './components/ECDISWorkspace';
import {
  FALLBACK_VESSELS,
  FALLBACK_SATELLITE_SCENE,
  FALLBACK_OCEAN_ENVIRONMENT
} from './data/fallbackDataset';

export const App: React.FC = () => {
  const {
    setVessels,
    setSatelliteScene,
    setEnvironment,
    setSystemStatus,
    isPlayingTrack,
    playbackSpeed,
    timelineUtc,
    setTimelineUtc,
    activeView
  } = useMaritimeStore();

  // Soufflet-style cursor tracking state
  const [cursorPos, setCursorPosition] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isCursorHovered, setIsCursorHovered] = useState<boolean>(false);

  // Initial Data Fetching with robust fallback
  useEffect(() => {
    const apiHost = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
    const apiBase = apiHost ? `${apiHost}/api` : '/api';

    const fetchData = async () => {
      try {
        const [vesselsRes, satRes, envRes] = await Promise.all([
          fetch(`${apiBase}/vessels`).then((r) => (r.ok ? r.json() : null)),
          fetch(`${apiBase}/satellite/latest`).then((r) => (r.ok ? r.json() : null)),
          fetch(`${apiBase}/environment/field`).then((r) => (r.ok ? r.json() : null)),
        ]);
        if (vesselsRes && vesselsRes.length > 0) setVessels(vesselsRes);
        if (satRes) setSatelliteScene(satRes);
        if (envRes) setEnvironment(envRes);
        setSystemStatus({ ais: 'CONNECTED', sar: 'AVAILABLE', env: 'AVAILABLE' });
      } catch (err) {
        console.info('Using local verified sector 7 dataset.');
        setVessels(FALLBACK_VESSELS);
        setSatelliteScene(FALLBACK_SATELLITE_SCENE);
        setEnvironment(FALLBACK_OCEAN_ENVIRONMENT);
      }
    };
    fetchData();
  }, []);

  // WebSocket Live AIS Telemetry Stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const apiHost = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      let wsUrl: string;
      if (apiHost) {
        const wsProto = apiHost.startsWith('https') ? 'wss:' : 'ws:';
        wsUrl = `${apiHost.replace(/^https?:/, wsProto)}/ws/ais`;
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${protocol}//${window.location.host}/ws/ais`;
      }
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setSystemStatus({ ws: 'CONNECTED' });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'heartbeat' && msg.vessels && msg.vessels.length > 0) {
            setVessels(msg.vessels);
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      ws.onclose = () => {
        setSystemStatus({ ws: 'DISCONNECTED' });
      };
    } catch (e) {
      setSystemStatus({ ws: 'DISCONNECTED' });
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Track Playback Time Increment Loop
  useEffect(() => {
    if (!isPlayingTrack) return;

    const interval = setInterval(() => {
      setTimelineUtc(
        new Date(new Date(timelineUtc).getTime() + 60000 * playbackSpeed)
          .toISOString()
          .replace('T', ' ')
          .substring(0, 19) + ' UTC'
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlayingTrack, playbackSpeed, timelineUtc]);

  // Continuous Real-Time Maritime Simulation Loop (Updates vessel coordinates, AIS decodes, and Metocean telemetry live)
  const advanceSimulationStep = useMaritimeStore((state) => state.advanceSimulationStep);
  useEffect(() => {
    const simInterval = setInterval(() => {
      advanceSimulationStep();
    }, 1500);
    return () => clearInterval(simInterval);
  }, [advanceSimulationStep]);

  // Mouse move listener for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      if (target && (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('select') || target.getAttribute('role') === 'button')) {
        setIsCursorHovered(true);
      } else {
        setIsCursorHovered(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#05070d] text-slate-100 overflow-hidden font-sans relative">
      
      {/* 0. Soufflet Malt Cinematic Loading Screen */}
      <SouffletLoader />

      {/* Soufflet Interactive Custom Cursor */}
      <div
        className="soufflet-cursor-dot hidden md:block"
        style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }}
      />
      <div
        className={`soufflet-cursor-ring hidden md:block ${isCursorHovered ? 'hovered' : ''}`}
        style={{ transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)` }}
      />

      {/* 1. Top Command Bar */}
      <TopOperationsBar />

      {/* 2. Central Area: Soufflet Ocean Eye Platform Portal OR ECDIS Operational Chart OR Workstation Labs */}
      <main className="flex-1 relative w-full h-full overflow-hidden flex flex-col min-h-0">
        {activeView === 'PLATFORM_PORTAL' ? (
          <SouffletOceanEyePortal />
        ) : activeView === 'MAP' ? (
          <div className="flex-1 relative w-full h-full overflow-hidden">
            {/* Full-bleed Operational GIS Map */}
            <OperationalMap />

            {/* Left Dock: GIS Layer Manager */}
            <LayerControlDock />

            {/* Right Dock: Contextual Dynamic Inspector */}
            <ContextualInspectorDock />
          </div>
        ) : (
          <ECDISWorkspace />
        )}
      </main>

      {/* 3. Bottom Timeline Bar */}
      {activeView !== 'PLATFORM_PORTAL' && <BottomTimelineBar />}

      {/* Modals */}
      <DataSourcesModal />
      <ResponsibleAIModal />
      <WorkflowWizardModal />
      <InvestigationDossierModal />
    </div>
  );
};
