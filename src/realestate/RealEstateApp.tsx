import React, { useState } from 'react';
import { RealEstateListing, PlacedObject, AssetCatalogItem } from './types';
import { SAMPLE_LISTINGS } from './data/sampleListings';
import { ListingService } from './services/listingService';
import { Viewport3D } from './components/Viewport3D';
import { AssetLibraryDrawer } from './components/AssetLibraryDrawer';
import { ObjectPropertiesPanel } from './components/ObjectPropertiesPanel';
import { SimulationExportModal } from './components/SimulationExportModal';
import { ListingDetailsModal } from './components/ListingDetailsModal';
import { FloorplanOverview2D } from './components/FloorplanOverview2D';
import { SharePanel } from './components/SharePanel';
import { useSharedScene } from './hooks/useSharedScene';
import {
  Home,
  Plus,
  Sliders,
  Download,
  Map,
  RotateCcw,
  Sparkles,
  Layers,
  Box,
  Bot,
  Compass,
  ExternalLink,
} from 'lucide-react';

export const RealEstateApp: React.FC = () => {
  const [currentListing, setCurrentListing] = useState<RealEstateListing>(SAMPLE_LISTINGS[0]);
  const [objects, setObjects] = useState<PlacedObject[]>(SAMPLE_LISTINGS[0].initialObjects);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [transformMode, setTransformMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [viewMode, setViewMode] = useState<"perspective" | "topdown" | "robot_fpv" | "wireframe_physics">("perspective");

  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState<boolean>(false);
  const [isFloorplanOpen, setIsFloorplanOpen] = useState<boolean>(false);

  // Live co-staging: publishes the scene, syncs object transforms, tracks viewers.
  const shared = useSharedScene(currentListing, objects, setObjects);

  // --- OBJECT MANIPULATION HANDLERS ---
  const handleSelectObject = (id: string | null) => {
    setSelectedObjectId(id);
  };

  const handleUpdateObject = (updated: PlacedObject) => {
    setObjects((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  };

  const handleDeleteObject = (id: string) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
    if (selectedObjectId === id) setSelectedObjectId(null);
  };

  const handleDuplicateObject = (id: string) => {
    const target = objects.find((o) => o.id === id);
    if (!target) return;

    const duplicated: PlacedObject = {
      ...target,
      id: `${target.assetId}_${Date.now()}`,
      name: `${target.name} (Copy)`,
      position: {
        x: target.position.x + 0.6,
        y: target.position.y,
        z: target.position.z + 0.6,
      },
    };

    setObjects((prev) => [...prev, duplicated]);
    setSelectedObjectId(duplicated.id);
  };

  const handleAddObjectFromCatalog = (item: AssetCatalogItem) => {
    const halfH = item.defaultDimensions.height / 2;
    const newObj: PlacedObject = {
      id: `${item.id}_${Date.now()}`,
      assetId: item.id,
      name: item.name,
      category: item.category,
      position: { x: 0, y: halfH, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: item.defaultDimensions,
      physics: {
        isStatic: item.category !== 'robotics_fixtures',
        mass: item.defaultMass,
        friction: item.defaultFriction,
        restitution: 0.15,
        geomType: item.geomType,
      },
      color: item.defaultColor,
    };

    setObjects((prev) => [...prev, newObj]);
    setSelectedObjectId(newObj.id);
  };

  const handleSelectListing = (listing: RealEstateListing) => {
    setCurrentListing(listing);
    setObjects(listing.initialObjects);
    setSelectedObjectId(null);
  };

  const handleIngestUrl = async (url: string) => {
    const ingested = await ListingService.ingestListingUrl(url);
    handleSelectListing(ingested);
  };

  const handleResetScene = () => {
    setObjects(currentListing.initialObjects);
    setSelectedObjectId(null);
  };

  const selectedObject = objects.find((o) => o.id === selectedObjectId) || null;

  return (
    <div className="w-full h-screen bg-[#020617] text-slate-100 flex flex-col font-['Outfit',sans-serif] overflow-hidden selection:bg-cyan-500/30">
      {/* Top Main Navigation Bar */}
      <header className="px-6 py-2.5 border-b border-slate-800 bg-[#070b14]/90 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Home className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              REAL ESTATE TO MUJOCO & ISAAC SIM PIPELINE
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
                Redfin / Zillow Ingest
              </span>
            </h1>
          </div>
        </div>

        {/* Center Property Switcher Pill & World Labs 3D World Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsListingModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold truncate max-w-[200px]">{currentListing.title}</span>
            <span className="text-slate-500 border-l border-slate-800 pl-2">{currentListing.price}</span>
          </button>

          {currentListing.marbleWorldUrl && (
            <a
              href={currentListing.marbleWorldUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
              title="Open Generated 3D World on World Labs Marble"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">World Labs 3D</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          )}

          {currentListing.mintChatUrl && (
            <a
              href={currentListing.mintChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-lime-500/20 to-emerald-500/20 hover:from-lime-500/30 hover:to-emerald-500/30 text-lime-300 border border-lime-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md"
              title="Open Generated 3D World on Mint.gg"
            >
              <Layers className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden md:inline">Mint.gg 3D</span>
              <ExternalLink className="w-3 h-3 text-lime-400" />
            </a>
          )}

          <SharePanel shared={shared} />
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setIsFloorplanOpen(!isFloorplanOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isFloorplanOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-indigo-400" />
            <span>2D Blueprint</span>
          </button>

          <button
            onClick={() => setIsLibraryOpen(!isLibraryOpen)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isLibraryOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Asset Catalog</span>
          </button>

          <button
            onClick={handleResetScene}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-all"
            title="Reset Room Layout"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to MuJoCo / Isaac Sim</span>
          </button>
        </div>
      </header>

      {/* Main 3D Stage & Floating Panels */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        <Viewport3D
          listing={currentListing}
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={handleSelectObject}
          onUpdateObject={handleUpdateObject}
          onDeleteObject={handleDeleteObject}
          onDuplicateObject={handleDuplicateObject}
          transformMode={transformMode}
          onChangeTransformMode={setTransformMode}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
        />

        {/* Selected Object Properties Panel */}
        <ObjectPropertiesPanel
          object={selectedObject}
          onUpdate={handleUpdateObject}
          onDelete={handleDeleteObject}
          onDuplicate={handleDuplicateObject}
          onClose={() => setSelectedObjectId(null)}
        />

        {/* Asset Catalog Drawer */}
        <AssetLibraryDrawer
          onAddObject={handleAddObjectFromCatalog}
          isOpen={isLibraryOpen}
          onToggle={() => setIsLibraryOpen(!isLibraryOpen)}
        />

        {/* 2D Architectural Floorplan Blueprint Modal/Panel */}
        <FloorplanOverview2D
          listing={currentListing}
          objects={objects}
          selectedObjectId={selectedObjectId}
          onSelectObject={(id) => setSelectedObjectId(id)}
          isOpen={isFloorplanOpen}
          onClose={() => setIsFloorplanOpen(false)}
        />

        {/* Simulation Exporter Modal (MuJoCo & Isaac Sim) */}
        <SimulationExportModal
          listing={currentListing}
          objects={objects}
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />

        {/* Real Estate Property Ingest & Gallery Modal */}
        <ListingDetailsModal
          currentListing={currentListing}
          onSelectListing={handleSelectListing}
          onIngestUrl={handleIngestUrl}
          isOpen={isListingModalOpen}
          onClose={() => setIsListingModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default RealEstateApp;
