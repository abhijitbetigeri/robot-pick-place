import React, { useState } from 'react';
import { ASSET_CATALOG } from '../data/furnitureLibrary';
import { AssetCatalogItem, PlacedObject } from '../types';
import {
  Search,
  Plus,
  Sofa,
  Utensils,
  Bed,
  Lamp,
  Bot,
  Box,
  Layers,
  Sparkles,
  Weight,
  Ruler,
} from 'lucide-react';

interface AssetLibraryDrawerProps {
  onAddObject: (item: AssetCatalogItem) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AssetLibraryDrawer: React.FC<AssetLibraryDrawerProps> = ({
  onAddObject,
  isOpen,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Assets', icon: Layers },
    { id: 'living_room', label: 'Living Room', icon: Sofa },
    { id: 'kitchen_dining', label: 'Kitchen & Dining', icon: Utensils },
    { id: 'bedroom_office', label: 'Bedroom & Office', icon: Bed },
    { id: 'lighting_decor', label: 'Lighting & Decor', icon: Lamp },
    { id: 'robotics_fixtures', label: 'Robots & Sensors', icon: Bot },
  ];

  const filteredAssets = ASSET_CATALOG.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className={`absolute top-0 right-0 bottom-0 w-80 bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl z-40 flex flex-col transition-transform duration-300 shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Box className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono tracking-wide">ASSET CATALOG</h2>
            <p className="text-[10px] text-slate-400 font-mono">Physics-Calibrated Geoms</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-mono"
        >
          ✕
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search furniture, appliances, robots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-3 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap flex items-center gap-1 transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Asset Cards List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 custom-scrollbar">
        {filteredAssets.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => onAddObject(item)}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/30 text-[11px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Spec Badges */}
            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Ruler className="w-3 h-3 text-cyan-400" />
                {item.defaultDimensions.width}m × {item.defaultDimensions.depth}m × {item.defaultDimensions.height}m
              </span>
              <span className="flex items-center gap-1">
                <Weight className="w-3 h-3 text-amber-400" />
                {item.defaultMass} kg
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 uppercase text-[9px]">
                {item.geomType}
              </span>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs font-mono">
            No assets match your search.
          </div>
        )}
      </div>
    </div>
  );
};
