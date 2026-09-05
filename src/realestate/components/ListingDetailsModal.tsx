import React, { useState } from 'react';
import { RealEstateListing } from '../types';
import { SAMPLE_LISTINGS } from '../data/sampleListings';
import { HOUSES_DATASET_LISTINGS } from '../data/housesDatasetListings';
import {
  Home,
  DollarSign,
  BedDouble,
  Bath,
  Maximize2,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  Calendar,
  Database,
  Building,
} from 'lucide-react';

interface ListingDetailsModalProps {
  currentListing: RealEstateListing;
  onSelectListing: (listing: RealEstateListing) => void;
  onIngestUrl: (url: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  currentListing,
  onSelectListing,
  onIngestUrl,
  isOpen,
  onClose,
}) => {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'luxury' | 'dataset'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    setIsIngesting(true);
    try {
      await onIngestUrl(inputUrl);
      onClose();
    } finally {
      setIsIngesting(false);
    }
  };

  const allAvailableListings = [...SAMPLE_LISTINGS, ...HOUSES_DATASET_LISTINGS];

  const filteredListings = allAvailableListings.filter((item) => {
    if (activeTab === 'luxury' && item.source === 'mls') return false;
    if (activeTab === 'dataset' && item.source !== 'mls') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 selection:bg-cyan-500/30">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Home className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                REAL ESTATE PROPERTY INGESTION
              </h2>
              <p className="text-[11px] text-slate-400">Redfin & Zillow Pipeline to Physics Digital Twin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar">
          {/* URL Ingestion Form */}
          <form onSubmit={handleIngest} className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ingest Live Property Listing (Redfin / Zillow URL)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://www.redfin.com/CA/San-Francisco/742-Montgomery-St-94111/home/1849201"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isIngesting || !inputUrl.trim()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
              >
                {isIngesting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{isIngesting ? 'Synthesizing...' : 'Ingest'}</span>
              </button>
            </div>
          </form>

          {/* Quick Select Tabs & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeTab === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({allAvailableListings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('luxury')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                    activeTab === 'luxury'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building className="w-3 h-3" />
                  <span>Curated Penthouses</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('dataset')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                    activeTab === 'dataset'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3 h-3" />
                  <span>Houses Dataset</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by city, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-56 bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {filteredListings.map((item) => {
                const isSelected = currentListing.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectListing(item);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-cyan-300 uppercase">
                          {item.source} • {item.propertyType}
                        </span>
                        <span className="text-emerald-400 font-bold">{item.price}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-400">{item.address}, {item.city}, {item.state}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
                      <span>{item.bedrooms} bd / {item.bathrooms} ba</span>
                      <span>{item.sqft} sqft</span>
                      <span className="text-cyan-400 flex items-center gap-1">
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                        {isSelected ? 'Active' : 'Load Twin'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Property Details Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{currentListing.title}</h3>
                <p className="text-[11px] text-slate-400">{currentListing.address}, {currentListing.city}, {currentListing.state} {currentListing.zipCode}</p>
              </div>
              <div className="flex items-center gap-2">
                {currentListing.marbleWorldUrl && (
                  <a
                    href={currentListing.marbleWorldUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span>World Labs 3D World</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <a
                  href={currentListing.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 text-[10px] flex items-center gap-1"
                >
                  <span>View on {currentListing.source.toUpperCase()}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentListing.description}</p>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                <span className="text-slate-500 text-[10px] block">Price</span>
                <span className="text-emerald-400 font-bold">{currentListing.price}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                <span className="text-slate-500 text-[10px] block">Living Area</span>
                <span className="text-white font-bold">{currentListing.sqft} sqft</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                <span className="text-slate-500 text-[10px] block">Bed / Bath</span>
                <span className="text-white font-bold">{currentListing.bedrooms} / {currentListing.bathrooms}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850">
                <span className="text-slate-500 text-[10px] block">Year Built</span>
                <span className="text-white font-bold">{currentListing.yearBuilt}</span>
              </div>
            </div>

            {/* Multi-View Photo Package (Frontal, Kitchen, Bedroom, Bathroom) */}
            {currentListing.photos.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block mb-1.5 font-bold uppercase tracking-wider">
                  Verified Multi-View RGB Property Photos ({currentListing.photos.length} Cameras):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {currentListing.photos.map((photo, idx) => {
                    const label =
                      idx === 0
                        ? "Frontal Exterior"
                        : idx === 1
                        ? "Kitchen & Dining"
                        : idx === 2
                        ? "Master Bedroom"
                        : idx === 3
                        ? "Bathroom"
                        : `View ${idx + 1}`;
                    return (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-800 group">
                        <img
                          src={photo}
                          alt={label}
                          className="w-full h-28 object-cover group-hover:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-cyan-300 uppercase">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
