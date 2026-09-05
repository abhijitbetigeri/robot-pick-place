import React, { useState } from 'react';
import { Robot, Bridge, Waypoint } from '../types';
import { AlertTriangle, CheckCircle2, Navigation, Radio, MapPin, Compass } from 'lucide-react';

interface LivingMapCanvasProps {
  robots: Robot[];
  bridges: Bridge[];
  onToggleBridge: (bridgeId: string) => void;
}

// Normalized coordinate mapper for Mission Creek SF
const WAYPOINTS_DATA: Waypoint[] = [
  { id: "South_Depot", name: "South Depot (Staging)", x: 0.0, y: -30.0, z: 0.0, type: "depot" },
  { id: "Fork_Decision_Point", name: "Fork Decision Point", x: 0.0, y: -10.0, z: 0.0, type: "fork" },
  
  { id: "Bridge_Alpha_Entry", name: "4th St Bridge (Entry/Barrier)", x: -18.0, y: 0.0, z: 0.5, type: "bridge_alpha" },
  { id: "Bridge_Alpha_Mid", name: "4th St Bridge (Span)", x: -18.0, y: 12.0, z: 0.5, type: "bridge_alpha" },
  { id: "Bridge_Alpha_Exit", name: "4th St Bridge (North Exit)", x: -18.0, y: 24.0, z: 0.5, type: "bridge_alpha" },
  
  { id: "Detour_Approach", name: "3rd St Detour Corridor", x: 22.0, y: -10.0, z: 0.0, type: "fork" },
  { id: "Bridge_Beta_Entry", name: "3rd St Bridge (Entry)", x: 22.0, y: 0.0, z: 0.5, type: "bridge_beta" },
  { id: "Bridge_Beta_Mid", name: "3rd St Bridge (Span)", x: 22.0, y: 12.0, z: 0.5, type: "bridge_beta" },
  { id: "Bridge_Beta_Exit", name: "3rd St Bridge (North Exit)", x: 22.0, y: 24.0, z: 0.5, type: "bridge_beta" },
  
  { id: "North_Approach", name: "North Waterfront Approach", x: 0.0, y: 28.0, z: 0.0, type: "fork" },
  { id: "North_Goal", name: "North Goal (Oracle Park Hub)", x: 0.0, y: 38.0, z: 0.0, type: "goal" },
];

export const LivingMapCanvas: React.FC<LivingMapCanvasProps> = ({
  robots,
  bridges,
  onToggleBridge,
}) => {
  const [hoveredNode, setHoveredNode] = useState<Waypoint | null>(null);

  const bridgeAlpha = bridges.find(b => b.bridgeId === "Bridge_Alpha");
  const bridgeBeta = bridges.find(b => b.bridgeId === "Bridge_Beta");
  const alphaBlocked = bridgeAlpha?.isBlocked ?? false;

  const rover1 = robots.find(r => r.robotId === "Rover_1");
  const rover2 = robots.find(r => r.robotId === "Rover_2");

  // Coordinate transforms (SVG Canvas: 800 x 560)
  // X: -35m to +35m -> 60px to 740px
  // Y: -38m (South) to +44m (North) -> 500px to 60px
  const toSvgX = (x: number) => 400 + (x * 9.5);
  const toSvgY = (y: number) => 280 - (y * 5.8);

  const alphaEntryX = toSvgX(-18.0);
  const alphaEntryY = toSvgY(0.0);
  const betaEntryX = toSvgX(22.0);
  const betaEntryY = toSvgY(0.0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Mission Creek Live Topological Map
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Isaac Sim 1:1 Metric Frame
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time multi-agent spatial coordination & dynamic edge cost weighting
            </p>
          </div>
        </div>

        {/* Quick Bridge Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBridge("Bridge_Alpha")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              alphaBlocked
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
            }`}
          >
            {alphaBlocked ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            4th St (Alpha): {alphaBlocked ? "LIFTED / BLOCKED" : "OPEN"}
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/10] bg-[#070b14] rounded-xl border border-slate-800/80 overflow-hidden bg-grid-pattern shadow-inner">
        <svg viewBox="0 0 800 520" className="w-full h-full select-none">
          <defs>
            {/* Water Linear Gradient */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0c4a6e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.8" />
            </linearGradient>

            {/* Glowing Neon Filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ================= WATER CHANNEL (MISSION CREEK CANAL) ================= */}
          <rect x="0" y="200" width="800" height="150" fill="url(#waterGradient)" />
          
          {/* Waterway Shoreline Banks */}
          <line x1="0" y1="200" x2="800" y2="200" stroke="#1e293b" strokeWidth="3" strokeDasharray="6 4" />
          <line x1="0" y1="350" x2="800" y2="350" stroke="#1e293b" strokeWidth="3" strokeDasharray="6 4" />

          {/* Water Label */}
          <text x="400" y="275" fill="#38bdf8" fillOpacity="0.25" fontSize="16" fontWeight="bold" letterSpacing="6" textAnchor="middle" fontFamily="monospace">
            ≈ MISSION CREEK WATERWAY (CHINA BASIN) ≈
          </text>

          {/* ================= BRIDGE STRUCTURES ================= */}
          {/* 1. Bridge Alpha Structure (4th Street Bridge) */}
          <g>
            <rect
              x={alphaEntryX - 22}
              y="180"
              width="44"
              height="190"
              rx="6"
              fill="#0f172a"
              stroke={alphaBlocked ? "#f43f5e" : "#334155"}
              strokeWidth="2.5"
              className="transition-colors duration-300"
            />
            {/* Bridge asphalt lane */}
            <rect
              x={alphaEntryX - 12}
              y="185"
              width="24"
              height="180"
              fill="#1e293b"
            />
            {/* Center line markings */}
            <line
              x1={alphaEntryX}
              y1="190"
              x2={alphaEntryX}
              y2="360"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
            {/* Bridge Alpha Label */}
            <text x={alphaEntryX} y="170" fill={alphaBlocked ? "#f43f5e" : "#94a3b8"} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              4th St Bridge (Alpha)
            </text>
            <text x={alphaEntryX} y="385" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
              {alphaBlocked ? "⚠️ DRAWBRIDGE LIFTED" : "Primary Route (88m)"}
            </text>
          </g>

          {/* 2. Bridge Beta Structure (3rd Street Bridge) */}
          <g>
            <rect
              x={betaEntryX - 22}
              y="180"
              width="44"
              height="190"
              rx="6"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2.5"
            />
            {/* Bridge asphalt lane */}
            <rect
              x={betaEntryX - 12}
              y="185"
              width="24"
              height="180"
              fill="#1e293b"
            />
            {/* Center line markings */}
            <line
              x1={betaEntryX}
              y1="190"
              x2={betaEntryX}
              y2="360"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />
            {/* Bridge Beta Label */}
            <text x={betaEntryX} y="170" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              3rd St Bridge (Beta)
            </text>
            <text x={betaEntryX} y="385" fill="#64748b" fontSize="10" textAnchor="middle" fontFamily="monospace">
              Detour Route (120m)
            </text>
          </g>

          {/* ================= ROAD NETWORK EDGES (GRAPH CONNECTIONS) ================= */}
          {/* South Approach to Fork */}
          <path
            d={`M ${toSvgX(0)} ${toSvgY(-30)} L ${toSvgX(0)} ${toSvgY(-10)}`}
            stroke="#334155"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Fork to Alpha Entry */}
          <path
            d={`M ${toSvgX(0)} ${toSvgY(-10)} Q ${toSvgX(-8)} ${toSvgY(-6)}, ${toSvgX(-18)} ${toSvgY(0)}`}
            stroke={alphaBlocked ? "#f43f5e" : "#334155"}
            strokeWidth="4"
            strokeDasharray={alphaBlocked ? "6 4" : "none"}
            fill="none"
            className="transition-all duration-300"
          />

          {/* Alpha Span */}
          <path
            d={`M ${toSvgX(-18)} ${toSvgY(0)} L ${toSvgX(-18)} ${toSvgY(24)}`}
            stroke={alphaBlocked ? "#f43f5e" : "#334155"}
            strokeWidth="4"
            strokeDasharray={alphaBlocked ? "6 4" : "none"}
            fill="none"
          />

          {/* Alpha Exit to North Approach */}
          <path
            d={`M ${toSvgX(-18)} ${toSvgY(24)} Q ${toSvgX(-8)} ${toSvgY(27)}, ${toSvgX(0)} ${toSvgY(28)}`}
            stroke={alphaBlocked ? "#f43f5e" : "#334155"}
            strokeWidth="4"
            strokeDasharray={alphaBlocked ? "6 4" : "none"}
            fill="none"
          />

          {/* Fork to Detour Approach */}
          <path
            d={`M ${toSvgX(0)} ${toSvgY(-10)} L ${toSvgX(22)} ${toSvgY(-10)}`}
            stroke="#334155"
            strokeWidth="4"
            fill="none"
          />

          {/* Detour to Beta Entry */}
          <path
            d={`M ${toSvgX(22)} ${toSvgY(-10)} L ${toSvgX(22)} ${toSvgY(0)}`}
            stroke="#334155"
            strokeWidth="4"
            fill="none"
          />

          {/* Beta Span */}
          <path
            d={`M ${toSvgX(22)} ${toSvgY(0)} L ${toSvgX(22)} ${toSvgY(24)}`}
            stroke="#334155"
            strokeWidth="4"
            fill="none"
          />

          {/* Beta Exit to North Approach */}
          <path
            d={`M ${toSvgX(22)} ${toSvgY(24)} Q ${toSvgX(10)} ${toSvgY(27)}, ${toSvgX(0)} ${toSvgY(28)}`}
            stroke="#334155"
            strokeWidth="4"
            fill="none"
          />

          {/* North Approach to Goal */}
          <path
            d={`M ${toSvgX(0)} ${toSvgY(28)} L ${toSvgX(0)} ${toSvgY(38)}`}
            stroke="#334155"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* ================= ACTIVE PATH RIBBONS (DYNAMIC REROUTE VISUALIZATION) ================= */}
          {/* Rover 2 Dynamic Glowing Path Ribbon */}
          {rover2 && (
            <g filter="url(#glow-cyan)">
              {rover2.activeRoute === "VIA_BRIDGE_BETA" ? (
                // Detour Ribbon snapped to Bridge Beta
                <path
                  d={`M ${toSvgX(rover2.position.x)} ${toSvgY(rover2.position.y)}
                      L ${toSvgX(0)} ${toSvgY(-10)}
                      L ${toSvgX(22)} ${toSvgY(-10)}
                      L ${toSvgX(22)} ${toSvgY(0)}
                      L ${toSvgX(22)} ${toSvgY(24)}
                      Q ${toSvgX(10)} ${toSvgY(27)}, ${toSvgX(0)} ${toSvgY(28)}
                      L ${toSvgX(0)} ${toSvgY(38)}`}
                  stroke="#00f0ff"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-pulse"
                />
              ) : (
                // Primary Ribbon along Bridge Alpha
                <path
                  d={`M ${toSvgX(rover2.position.x)} ${toSvgY(rover2.position.y)}
                      L ${toSvgX(0)} ${toSvgY(-10)}
                      Q ${toSvgX(-8)} ${toSvgY(-6)}, ${toSvgX(-18)} ${toSvgY(0)}
                      L ${toSvgX(-18)} ${toSvgY(24)}
                      Q ${toSvgX(-8)} ${toSvgY(27)}, ${toSvgX(0)} ${toSvgY(28)}
                      L ${toSvgX(0)} ${toSvgY(38)}`}
                  stroke="#00f0ff"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </g>
          )}

          {/* ================= OBSTACLE / CLOSURE BARRIER (BRIDGE ALPHA) ================= */}
          {alphaBlocked && (
            <g transform={`translate(${alphaEntryX}, ${alphaEntryY + 30})`} filter="url(#glow-rose)">
              <circle r="16" fill="#f43f5e" fillOpacity="0.25" className="animate-ping" />
              <circle r="12" fill="#f43f5e" />
              <rect x="-18" y="-4" width="36" height="8" rx="2" fill="#fff" transform="rotate(-25)" />
              <text y="28" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                ⛔ BARRIER BLOCKED
              </text>
            </g>
          )}

          {/* ================= WAYPOINT NODES ================= */}
          {WAYPOINTS_DATA.map((wp) => {
            const sx = toSvgX(wp.x);
            const sy = toSvgY(wp.y);
            const isHovered = hoveredNode?.id === wp.id;

            let color = "#64748b";
            if (wp.type === "depot") color = "#10b981";
            if (wp.type === "goal") color = "#8b5cf6";
            if (wp.type === "bridge_alpha") color = alphaBlocked ? "#f43f5e" : "#0ea5e9";
            if (wp.type === "bridge_beta") color = "#00f0ff";

            return (
              <g
                key={wp.id}
                onMouseEnter={() => setHoveredNode(wp)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform"
              >
                <circle
                  cx={sx}
                  cy={sy}
                  r={isHovered ? 8 : 5}
                  fill="#090e1a"
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                />
                <circle
                  cx={sx}
                  cy={sy}
                  r={isHovered ? 4 : 2}
                  fill={color}
                />
              </g>
            );
          })}

          {/* ================= ROBOT AGENTS ================= */}
          {/* Rover 1 (Lead Scout) */}
          {rover1 && (
            <g transform={`translate(${toSvgX(rover1.position.x)}, ${toSvgY(rover1.position.y)})`} filter="url(#glow-amber)">
              {/* Lidar cone */}
              <path
                d="M 0 0 L -25 -40 L 25 -40 Z"
                fill="#f59e0b"
                fillOpacity="0.15"
              />
              {/* Pulse ring */}
              <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: '6s' }} />
              {/* Rover body */}
              <circle r="9" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
              <circle r="3" fill="#090e1a" />
              {/* Rover 1 Badge */}
              <g transform="translate(14, -10)">
                <rect width="70" height="20" rx="4" fill="#090e1a" stroke="#f59e0b" strokeWidth="1" />
                <text x="35" y="14" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Rover 1 (Scout)
                </text>
              </g>
            </g>
          )}

          {/* Rover 2 (Delivery Unit) */}
          {rover2 && (
            <g transform={`translate(${toSvgX(rover2.position.x)}, ${toSvgY(rover2.position.y)})`} filter="url(#glow-cyan)">
              {/* Forward Sensing Wake */}
              <circle r="22" fill="#00f0ff" fillOpacity="0.12" className="animate-pulse" />
              {/* Rover body */}
              <circle r="9" fill="#00f0ff" stroke="#fff" strokeWidth="2" />
              <circle r="3" fill="#090e1a" />
              {/* Rover 2 Badge */}
              <g transform="translate(14, -10)">
                <rect width="80" height="20" rx="4" fill="#090e1a" stroke="#00f0ff" strokeWidth="1" />
                <text x="40" y="14" fill="#00f0ff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Rover 2 (Delivery)
                </text>
              </g>
            </g>
          )}

          {/* ================= DEPOT & GOAL HUBS ================= */}
          {/* South Depot */}
          <g transform={`translate(${toSvgX(0)}, ${toSvgY(-30)})`}>
            <text y="24" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              📍 SOUTH DEPOT (Start)
            </text>
          </g>

          {/* North Goal */}
          <g transform={`translate(${toSvgX(0)}, ${toSvgY(38)})`}>
            <text y="-14" fill="#a855f7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              🎯 NORTH GOAL (Oracle Park Hub)
            </text>
          </g>
        </svg>

        {/* Floating Tooltip for Waypoints */}
        {hoveredNode && (
          <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 rounded-lg p-3 text-xs font-mono shadow-2xl backdrop-blur-md pointer-events-none">
            <div className="text-cyan-400 font-bold mb-1">{hoveredNode.name}</div>
            <div className="text-slate-400">
              Metric Pos: ({hoveredNode.x.toFixed(1)}m, {hoveredNode.y.toFixed(1)}m, {hoveredNode.z.toFixed(1)}m)
            </div>
            <div className="text-slate-500 mt-1 capitalize">Type: {hoveredNode.type.replace('_', ' ')}</div>
          </div>
        )}
      </div>

      {/* Map Legend & Scenario Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Rover 1 (Lead Scout)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span>Rover 2 (Delivery Reroute)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-cyan-400 border-t border-dashed" />
            <span>Active Path Ribbon</span>
          </div>
        </div>
        <div className="text-slate-500">
          Coordinate Frame: Z-Up Meters (NVIDIA Isaac Sim / World Labs Marble)
        </div>
      </div>
    </div>
  );
};
