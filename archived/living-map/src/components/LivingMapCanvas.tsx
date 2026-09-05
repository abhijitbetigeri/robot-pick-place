import React, { useState } from 'react';
import { Robot, Bridge, Waypoint, ScenarioDef } from '../types';
import { AlertTriangle, CheckCircle2, Compass } from 'lucide-react';

interface LivingMapCanvasProps {
  robots: Robot[];
  bridges: Bridge[];
  onToggleBridge: (bridgeId: string) => void;
  scenario: ScenarioDef;
}

export const LivingMapCanvas: React.FC<LivingMapCanvasProps> = ({
  robots,
  bridges,
  onToggleBridge,
  scenario,
}) => {
  const [hoveredNode, setHoveredNode] = useState<Waypoint | null>(null);

  const bridgeAlpha = bridges.find(b => b.bridgeId === "Bridge_Alpha");
  const alphaBlocked = bridgeAlpha?.isBlocked ?? false;

  const rover1 = robots.find(r => r.robotId === "Rover_1");
  const rover2 = robots.find(r => r.robotId === "Rover_2");

  const pos = scenario.positions;

  // Coordinate transforms (SVG Canvas: 800 x 520)
  const toSvgX = (x: number) => 400 + (x * 9.5);
  const toSvgY = (y: number) => 260 - (y * 5.6);

  const waypointsData: Waypoint[] = [
    { id: "start", name: scenario.hubStartLabel, x: pos.start.x, y: pos.start.y, z: 0.0, type: "depot" },
    { id: "fork", name: "Decision Junction Point", x: pos.fork.x, y: pos.fork.y, z: 0.0, type: "fork" },
    { id: "primaryEntry", name: `${scenario.primaryName} (Entry)`, x: pos.primaryEntry.x, y: pos.primaryEntry.y, z: 0.5, type: "bridge_alpha" },
    { id: "primaryMid", name: `${scenario.primaryName} (Mid)`, x: pos.primaryMid.x, y: pos.primaryMid.y, z: 0.5, type: "bridge_alpha" },
    { id: "primaryExit", name: `${scenario.primaryName} (Exit)`, x: pos.primaryExit.x, y: pos.primaryExit.y, z: 0.5, type: "bridge_alpha" },
    { id: "detourApproach", name: `${scenario.detourName} Approach`, x: pos.detourApproach.x, y: pos.detourApproach.y, z: 0.0, type: "fork" },
    { id: "detourEntry", name: `${scenario.detourName} (Entry)`, x: pos.detourEntry.x, y: pos.detourEntry.y, z: 0.5, type: "bridge_beta" },
    { id: "detourMid", name: `${scenario.detourName} (Span)`, x: pos.detourMid.x, y: pos.detourMid.y, z: 0.5, type: "bridge_beta" },
    { id: "detourExit", name: `${scenario.detourName} (Exit)`, x: pos.detourExit.x, y: pos.detourExit.y, z: 0.5, type: "bridge_beta" },
    { id: "northApproach", name: "North Gateway Corridor", x: pos.northApproach.x, y: pos.northApproach.y, z: 0.0, type: "fork" },
    { id: "goal", name: scenario.hubGoalLabel, x: pos.goal.x, y: pos.goal.y, z: 0.0, type: "goal" },
  ];

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
              {scenario.title} — 2D Topological Schematic
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Metric Graph Nodes
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {scenario.subtitle}
            </p>
          </div>
        </div>

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
            {scenario.primaryName}: {alphaBlocked ? "BLOCKED" : "OPEN"}
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full aspect-[16/10] bg-[#070b14] rounded-xl border border-slate-800/80 overflow-hidden bg-grid-pattern shadow-inner">
        <svg viewBox="0 0 800 520" className="w-full h-full select-none">
          <defs>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0c4a6e" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.8" />
            </linearGradient>

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

          {/* Scenario Specific Background Graphics */}
          {scenario.environmentType === "waterway_bridges" ? (
            // SF Mission Creek Canal
            <g>
              <rect x="0" y="190" width="800" height="140" fill="url(#waterGradient)" />
              <line x1="0" y1="190" x2="800" y2="190" stroke="#1e293b" strokeWidth="3" strokeDasharray="6 4" />
              <line x1="0" y1="330" x2="800" y2="330" stroke="#1e293b" strokeWidth="3" strokeDasharray="6 4" />
              <text x="400" y="265" fill="#38bdf8" fillOpacity="0.25" fontSize="14" fontWeight="bold" letterSpacing="4" textAnchor="middle" fontFamily="monospace">
                {scenario.waterChannelLabel}
              </text>
            </g>
          ) : scenario.environmentType === "urban_grid" ? (
            // NYC Manhattan Building Blocks
            <g>
              <rect x="60" y="140" width="220" height="180" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              <text x="170" y="235" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                SOHO CAST-IRON BLOCK
              </text>

              <rect x="440" y="140" width="160" height="180" rx="8" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
              <text x="520" y="235" fill="#475569" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                BROADWAY RETAIL BLOCK
              </text>
            </g>
          ) : (
            // Port Container Stacks
            <g>
              <rect x="60" y="140" width="140" height="180" rx="4" fill="#0f172a" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="130" y="235" fill="#dc2626" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                CONTAINER STACK A
              </text>

              <rect x="360" y="140" width="140" height="180" rx="4" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="430" y="235" fill="#0284c7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                CONTAINER STACK B
              </text>
            </g>
          )}

          {/* Primary Route Segment */}
          <g>
            <rect
              x={toSvgX(pos.primaryMid.x) - 20}
              y={toSvgY(pos.primaryMid.y) - 60}
              width="40"
              height="120"
              rx="6"
              fill="#0f172a"
              stroke={alphaBlocked ? "#f43f5e" : "#334155"}
              strokeWidth="2.5"
            />
            <text x={toSvgX(pos.primaryMid.x)} y={toSvgY(pos.primaryMid.y) - 75} fill={alphaBlocked ? "#f43f5e" : "#94a3b8"} fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {scenario.primaryName}
            </text>
          </g>

          {/* Detour Route Segment */}
          <g>
            <rect
              x={toSvgX(pos.detourMid.x) - 20}
              y={toSvgY(pos.detourMid.y) - 60}
              width="40"
              height="120"
              rx="6"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2.5"
            />
            <text x={toSvgX(pos.detourMid.x)} y={toSvgY(pos.detourMid.y) - 75} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {scenario.detourName}
            </text>
          </g>

          {/* Road Network Connections */}
          <path d={`M ${toSvgX(pos.start.x)} ${toSvgY(pos.start.y)} L ${toSvgX(pos.fork.x)} ${toSvgY(pos.fork.y)}`} stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          
          {/* Primary Route path */}
          <path d={`M ${toSvgX(pos.fork.x)} ${toSvgY(pos.fork.y)} L ${toSvgX(pos.primaryEntry.x)} ${toSvgY(pos.primaryEntry.y)}`} stroke={alphaBlocked ? "#f43f5e" : "#334155"} strokeWidth="4" strokeDasharray={alphaBlocked ? "6 4" : "none"} fill="none" />
          <path d={`M ${toSvgX(pos.primaryEntry.x)} ${toSvgY(pos.primaryEntry.y)} L ${toSvgX(pos.primaryExit.x)} ${toSvgY(pos.primaryExit.y)}`} stroke={alphaBlocked ? "#f43f5e" : "#334155"} strokeWidth="4" strokeDasharray={alphaBlocked ? "6 4" : "none"} fill="none" />
          <path d={`M ${toSvgX(pos.primaryExit.x)} ${toSvgY(pos.primaryExit.y)} L ${toSvgX(pos.northApproach.x)} ${toSvgY(pos.northApproach.y)}`} stroke={alphaBlocked ? "#f43f5e" : "#334155"} strokeWidth="4" strokeDasharray={alphaBlocked ? "6 4" : "none"} fill="none" />

          {/* Detour Route path */}
          <path d={`M ${toSvgX(pos.fork.x)} ${toSvgY(pos.fork.y)} L ${toSvgX(pos.detourApproach.x)} ${toSvgY(pos.detourApproach.y)}`} stroke="#334155" strokeWidth="4" fill="none" />
          <path d={`M ${toSvgX(pos.detourApproach.x)} ${toSvgY(pos.detourApproach.y)} L ${toSvgX(pos.detourEntry.x)} ${toSvgY(pos.detourEntry.y)}`} stroke="#334155" strokeWidth="4" fill="none" />
          <path d={`M ${toSvgX(pos.detourEntry.x)} ${toSvgY(pos.detourEntry.y)} L ${toSvgX(pos.detourExit.x)} ${toSvgY(pos.detourExit.y)}`} stroke="#334155" strokeWidth="4" fill="none" />
          <path d={`M ${toSvgX(pos.detourExit.x)} ${toSvgY(pos.detourExit.y)} L ${toSvgX(pos.northApproach.x)} ${toSvgY(pos.northApproach.y)}`} stroke="#334155" strokeWidth="4" fill="none" />

          <path d={`M ${toSvgX(pos.northApproach.x)} ${toSvgY(pos.northApproach.y)} L ${toSvgX(pos.goal.x)} ${toSvgY(pos.goal.y)}`} stroke="#334155" strokeWidth="4" strokeLinecap="round" />

          {/* Active Path Ribbon */}
          {rover2 && (
            <g filter="url(#glow-cyan)">
              {rover2.activeRoute === "VIA_BRIDGE_BETA" ? (
                <path
                  d={`M ${toSvgX(rover2.position.x)} ${toSvgY(rover2.position.y)}
                      L ${toSvgX(pos.fork.x)} ${toSvgY(pos.fork.y)}
                      L ${toSvgX(pos.detourApproach.x)} ${toSvgY(pos.detourApproach.y)}
                      L ${toSvgX(pos.detourEntry.x)} ${toSvgY(pos.detourEntry.y)}
                      L ${toSvgX(pos.detourExit.x)} ${toSvgY(pos.detourExit.y)}
                      L ${toSvgX(pos.northApproach.x)} ${toSvgY(pos.northApproach.y)}
                      L ${toSvgX(pos.goal.x)} ${toSvgY(pos.goal.y)}`}
                  stroke="#00f0ff"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-pulse"
                />
              ) : (
                <path
                  d={`M ${toSvgX(rover2.position.x)} ${toSvgY(rover2.position.y)}
                      L ${toSvgX(pos.fork.x)} ${toSvgY(pos.fork.y)}
                      L ${toSvgX(pos.primaryEntry.x)} ${toSvgY(pos.primaryEntry.y)}
                      L ${toSvgX(pos.primaryExit.x)} ${toSvgY(pos.primaryExit.y)}
                      L ${toSvgX(pos.northApproach.x)} ${toSvgY(pos.northApproach.y)}
                      L ${toSvgX(pos.goal.x)} ${toSvgY(pos.goal.y)}`}
                  stroke="#00f0ff"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </g>
          )}

          {/* Obstacle Hazard Icon */}
          {alphaBlocked && (
            <g transform={`translate(${toSvgX(pos.primaryMid.x)}, ${toSvgY(pos.primaryMid.y)})`} filter="url(#glow-rose)">
              <circle r="16" fill="#f43f5e" fillOpacity="0.25" className="animate-ping" />
              <circle r="12" fill="#f43f5e" />
              <rect x="-18" y="-4" width="36" height="8" rx="2" fill="#fff" transform="rotate(-25)" />
              <text y="28" fill="#f43f5e" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                ⛔ {scenario.incidentTitle}
              </text>
            </g>
          )}

          {/* Waypoint Nodes */}
          {waypointsData.map((wp) => {
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
                className="cursor-pointer"
              >
                <circle cx={sx} cy={sy} r={isHovered ? 8 : 5} fill="#090e1a" stroke={color} strokeWidth={isHovered ? 3 : 2} />
                <circle cx={sx} cy={sy} r={isHovered ? 4 : 2} fill={color} />
              </g>
            );
          })}

          {/* Rover 1 (Scout) */}
          {rover1 && (
            <g transform={`translate(${toSvgX(rover1.position.x)}, ${toSvgY(rover1.position.y)})`} filter="url(#glow-amber)">
              <circle r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: '6s' }} />
              <circle r="9" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
              <circle r="3" fill="#090e1a" />
              <g transform="translate(14, -10)">
                <rect width="70" height="20" rx="4" fill="#090e1a" stroke="#f59e0b" strokeWidth="1" />
                <text x="35" y="14" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Rover 1 (Scout)
                </text>
              </g>
            </g>
          )}

          {/* Rover 2 (Delivery) */}
          {rover2 && (
            <g transform={`translate(${toSvgX(rover2.position.x)}, ${toSvgY(rover2.position.y)})`} filter="url(#glow-cyan)">
              <circle r="22" fill="#00f0ff" fillOpacity="0.12" className="animate-pulse" />
              <circle r="9" fill="#00f0ff" stroke="#fff" strokeWidth="2" />
              <circle r="3" fill="#090e1a" />
              <g transform="translate(14, -10)">
                <rect width="80" height="20" rx="4" fill="#090e1a" stroke="#00f0ff" strokeWidth="1" />
                <text x="40" y="14" fill="#00f0ff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  Rover 2 (Delivery)
                </text>
              </g>
            </g>
          )}

          {/* Hub Labels */}
          <g transform={`translate(${toSvgX(pos.start.x)}, ${toSvgY(pos.start.y)})`}>
            <text y="24" fill="#10b981" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              📍 {scenario.hubStartLabel}
            </text>
          </g>
          <g transform={`translate(${toSvgX(pos.goal.x)}, ${toSvgY(pos.goal.y)})`}>
            <text y="-14" fill="#a855f7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              🎯 {scenario.hubGoalLabel}
            </text>
          </g>
        </svg>

        {hoveredNode && (
          <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 rounded-lg p-3 text-xs font-mono shadow-2xl backdrop-blur-md pointer-events-none">
            <div className="text-cyan-400 font-bold mb-1">{hoveredNode.name}</div>
            <div className="text-slate-400">
              Metric Pos: ({hoveredNode.x.toFixed(1)}m, {hoveredNode.y.toFixed(1)}m, {hoveredNode.z.toFixed(1)}m)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
