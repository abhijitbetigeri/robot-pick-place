import React from 'react';
import { RealEstateListing, PlacedObject } from '../types';
import { Map, Layers, Ruler } from 'lucide-react';

interface FloorplanOverview2DProps {
  listing: RealEstateListing;
  objects: PlacedObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FloorplanOverview2D: React.FC<FloorplanOverview2DProps> = ({
  listing,
  objects,
  selectedObjectId,
  onSelectObject,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const w = listing.metricBounds.widthMeters;
  const d = listing.metricBounds.depthMeters;

  const svgWidth = 460;
  const svgHeight = 360;
  const padding = 40;

  const scaleX = (svgWidth - padding * 2) / w;
  const scaleY = (svgHeight - padding * 2) / d;
  const scale = Math.min(scaleX, scaleY);

  const toSvgX = (x: number) => svgWidth / 2 + x * scale;
  const toSvgY = (z: number) => svgHeight / 2 + z * scale;

  return (
    <div className="absolute top-20 right-4 w-[480px] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 z-40 font-mono text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            2D ARCHITECTURAL FLOORPLAN BLUEPRINT
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 p-1 text-xs"
        >
          ✕
        </button>
      </div>

      {/* SVG Blueprint Canvas */}
      <div className="mt-3 relative bg-[#040814] rounded-xl border border-slate-900 p-2 overflow-hidden">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Blueprint Grid Lines (1m grid) */}
          <defs>
            <pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse">
              <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

          {/* Outer Room Perimeter */}
          <rect
            x={toSvgX(-w / 2)}
            y={toSvgY(-d / 2)}
            width={w * scale}
            height={d * scale}
            fill="#090e1a"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="none"
          />

          {/* Dimension Measurement Indicators */}
          <text
            x={svgWidth / 2}
            y={toSvgY(-d / 2) - 10}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
            fontFamily="monospace"
          >
            ← {w.toFixed(1)}m Width →
          </text>

          <text
            x={toSvgX(-w / 2) - 12}
            y={svgHeight / 2}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="middle"
            transform={`rotate(-90 ${toSvgX(-w / 2) - 12} ${svgHeight / 2})`}
            fontFamily="monospace"
          >
            ← {d.toFixed(1)}m Depth →
          </text>

          {/* Staged Objects 2D Boxes / Circles */}
          {objects.map((obj) => {
            const isSelected = selectedObjectId === obj.id;
            const ox = toSvgX(obj.position.x);
            const oy = toSvgY(obj.position.z);
            const ow = obj.dimensions.width * obj.scale.x * scale;
            const od = obj.dimensions.depth * obj.scale.z * scale;
            const rotDeg = (obj.rotation.y * 180) / Math.PI;

            return (
              <g
                key={obj.id}
                onClick={() => onSelectObject(obj.id)}
                className="cursor-pointer transition-all hover:opacity-80"
              >
                <g transform={`translate(${ox}, ${oy}) rotate(${rotDeg})`}>
                  {obj.physics.geomType === "cylinder" ? (
                    <circle
                      cx="0"
                      cy="0"
                      r={ow / 2}
                      fill={obj.color || "#0284c7"}
                      fillOpacity={isSelected ? "0.9" : "0.6"}
                      stroke={isSelected ? "#00f0ff" : "#1e293b"}
                      strokeWidth={isSelected ? "2" : "1"}
                    />
                  ) : (
                    <rect
                      x={-ow / 2}
                      y={-od / 2}
                      width={ow}
                      height={od}
                      rx="3"
                      fill={obj.color || "#3b82f6"}
                      fillOpacity={isSelected ? "0.9" : "0.6"}
                      stroke={isSelected ? "#00f0ff" : "#1e293b"}
                      strokeWidth={isSelected ? "2" : "1"}
                    />
                  )}

                  {/* Orientation facing notch */}
                  <line x1="0" y1="0" x2="0" y2={-od / 2 - 4} stroke={isSelected ? "#00f0ff" : "#64748b"} strokeWidth="1.5" />

                  {/* Label */}
                  <text
                    x="0"
                    y="3"
                    fill="#ffffff"
                    fontSize="8"
                    textAnchor="middle"
                    fontFamily="monospace"
                    className="pointer-events-none font-bold"
                  >
                    {obj.name.split(" ")[0]}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-1">
        <span className="flex items-center gap-1">
          <Ruler className="w-3 h-3 text-cyan-400" />
          Grid scale: 1.0m / cell
        </span>
        <span>Click any element to inspect & manipulate in 3D</span>
      </div>
    </div>
  );
};
