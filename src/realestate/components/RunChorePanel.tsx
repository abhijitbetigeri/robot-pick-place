import React, { useState } from 'react';
import { Bot, Loader2, AlertTriangle, ArrowRight, RotateCw } from 'lucide-react';
import { SharedSceneState } from '../hooks/useSharedScene';

/**
 * Run the household chore in the room the user just staged, and show what the
 * robot actually did.
 *
 * The studio already publishes a scene to Convex; `scripts/sim_server.py` turns
 * that shareId into a MuJoCo rollout. This panel is the seam: ask for a run,
 * wait, then play the video and read the carried object's start and end pose
 * straight out of the trace the simulator wrote.
 *
 * Re-running is the reset: the script rebuilds the scene from scratch and
 * overwrites its own artifacts, so pressing the button twice is a clean
 * second run rather than an accumulation.
 */

/** Shape returned by POST /api/run. Failure is data, not an exception. */
interface RunResult {
  ok: boolean;
  success?: boolean;
  error?: string;
  exitCode?: number;
  videoUrl?: string | null;
  traceUrl?: string;
  durationSec?: number;
  stderr?: string;
  trace?: {
    listing?: string;
    from?: { object?: string };
    to?: { object?: string };
    start?: number[];
    end?: number[];
    distance_m?: number;
    success?: boolean;
  };
}

const fmt = (p?: number[]): string =>
  p && p.length >= 3
    ? `${p[0].toFixed(2)}, ${p[1].toFixed(2)}, ${p[2].toFixed(2)}`
    : '—';

interface RunChorePanelProps {
  shared: SharedSceneState;
}

export const RunChorePanel: React.FC<RunChorePanelProps> = ({ shared }) => {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const run = async () => {
    if (!shared.shareId) return;
    setBusy(true);
    // Drop the previous result immediately, so a second run never shows the
    // first run's video while the new one is still rendering.
    setResult(null);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId: shared.shareId }),
      });
      const data: RunResult = await res.json();
      setResult(data);
    } catch (err) {
      // A transport failure is the one case with no server payload to show,
      // so synthesise the same shape rather than swallowing it.
      setResult({
        ok: false,
        error:
          err instanceof Error
            ? `${err.message} — is scripts/sim_server.py running on :8765?`
            : 'request failed',
      });
    } finally {
      setBusy(false);
    }
  };

  // The task needs a published scene to read; until then, say so rather than
  // offering a button that cannot work.
  if (!shared.isShared || !shared.shareId) {
    return (
      <div className="px-3 py-2 rounded-xl bg-slate-900/70 border border-white/10 text-[11px] text-slate-400">
        Share the scene to run the robot chore in it
      </div>
    );
  }

  const trace = result?.trace;

  return (
    <div className="flex flex-col gap-2 px-4 py-3 rounded-xl bg-slate-900/85 border border-white/10 backdrop-blur-md shadow-2xl w-[320px]">
      <button
        onClick={() => void run()}
        disabled={busy}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/90
                   hover:bg-cyan-400 text-slate-900 text-sm font-semibold transition
                   disabled:opacity-60 disabled:cursor-wait"
        title="Run the mobile manipulator on this staged room"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : result ? <RotateCw size={16} /> : <Bot size={16} />}
        {busy ? 'Running robot task…' : result ? 'Run again' : 'Run robot task'}
      </button>

      {busy && (
        <p className="text-[11px] text-slate-400">
          Simulating in MuJoCo and rendering the rollout. Takes about a minute.
        </p>
      )}

      {result && !result.ok && (
        <div className="flex flex-col gap-1 px-2.5 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
            <AlertTriangle size={13} />
            Run failed{typeof result.exitCode === 'number' ? ` (exit ${result.exitCode})` : ''}
          </span>
          <p className="text-[11px] text-rose-200/90 font-mono break-words">{result.error}</p>
          {result.stderr && (
            <pre className="max-h-28 overflow-auto text-[10px] text-rose-200/70 font-mono whitespace-pre-wrap">
              {result.stderr.slice(-600)}
            </pre>
          )}
        </div>
      )}

      {result?.ok && (
        <>
          <div
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
              result.success
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}
          >
            {result.success ? 'Chore completed' : 'Robot ran, but missed the target'}
            {result.durationSec !== undefined && (
              <span className="font-mono font-normal opacity-70"> · {result.durationSec}s</span>
            )}
          </div>

          {result.videoUrl && (
            <video
              key={result.videoUrl}
              src={result.videoUrl}
              controls
              autoPlay
              muted
              loop
              className="w-full rounded-lg border border-white/10 bg-black"
            />
          )}

          {trace && (
            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="font-semibold">{trace.from?.object ?? 'source'}</span>
                <ArrowRight size={12} className="text-slate-500" />
                <span className="font-semibold">{trace.to?.object ?? 'destination'}</span>
                {trace.distance_m !== undefined && (
                  <span className="ml-auto font-mono text-slate-400">{trace.distance_m} m</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="px-2 py-1.5 rounded bg-slate-800/70 border border-white/5">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">Before</div>
                  <div className="font-mono text-slate-300">{fmt(trace.start)}</div>
                </div>
                <div className="px-2 py-1.5 rounded bg-slate-800/70 border border-white/5">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">After</div>
                  <div className="font-mono text-slate-300">{fmt(trace.end)}</div>
                </div>
              </div>
              {result.traceUrl && (
                <a
                  href={result.traceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-500 hover:text-slate-300 font-mono transition"
                >
                  {result.traceUrl}
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
