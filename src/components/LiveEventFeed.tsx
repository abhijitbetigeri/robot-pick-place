import React from 'react';
import { EventLog } from '../types';
import { Terminal, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface LiveEventFeedProps {
  logs: EventLog[];
}

export const LiveEventFeed: React.FC<LiveEventFeedProps> = ({ logs }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Critical
          </span>
        );
      case "warning":
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Warning
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
            <Info className="w-3 h-3" /> Event
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col h-full">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Convex Reactive Blackboard Feed
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live WebSocket Stream</span>
        </div>
      </div>

      {/* Log Feed List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[340px]">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            Awaiting fleet events and sensor mutations...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log._id || `${log.timestamp}-${index}`}
              className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                log.severity === "critical"
                  ? "bg-rose-950/20 border-rose-900/50 text-rose-200"
                  : log.severity === "warning"
                  ? "bg-amber-950/20 border-amber-900/50 text-amber-200"
                  : "bg-[#070b14]/80 border-slate-800/80 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(log.severity)}
                  <span className="text-slate-400 font-bold text-[11px]">
                    [{log.source}]
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-200">
                {log.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
