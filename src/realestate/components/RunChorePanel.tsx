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
 *
 * Two chores are offered. Tidy is the default because its success is
 * machine-checked - the toy is inside the basket volume and at rest, or it is
 * not - which is the claim worth putting in front of a judge. Book is the
 * original carry task and its check is a looser proximity test.
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
  chore?: Chore;
  trace?: {
    listing?: string;
    chore?: Chore;
    from?: { object?: string };
    to?: { object?: string };
    start?: number[];
    end?: number[];
    distance_m?: number;
    success?: boolean;
    /** Present when the run happened but could not finish, e.g. a refused grasp. */
    error?: string;
    /** Tidy only: the machine-checked verdict, broken down. */
    predicate?: {
      inside_xy?: boolean;
      inside_z?: boolean;
      at_rest?: boolean;
      success?: boolean;
    };
  };
}

type Chore = 'book' | 'tidy';

const CHOICES: { id: Chore; label: string; blurb: string }[] = [
  {
    id: 'tidy',
    label: 'Tidy',
    blurb: 'Toy into the basket — success is machine-checked',
  },
  {
    id: 'book',
    label: 'Book',
    blurb: 'Carry a book between two staged surfaces',
  },
];

/** The three geometric facts behind a tidy verdict, in the order they read. */
const PREDICATE_PARTS: { key: 'inside_xy' | 'inside_z' | 'at_rest'; label: string }[] = [
  { key: 'inside_xy', label: 'over basket' },
  { key: 'inside_z', label: 'below rim' },
  { key: 'at_rest', label: 'at rest' },
];

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
  const [chore, setChore] = useState<Chore>('tidy');

  // A result belongs to the chore that produced it. Leaving it on screen while
  // the other tab is selected shows a tidy video under a Book heading, so the
  // selection drops it rather than letting the two disagree.
  const selectChore = (next: Chore) => {
    if (next === chore) return;
    setChore(next);
    setResult(null);
  };

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
        body: JSON.stringify({ shareId: shared.shareId, chore }),
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
            ? `${err.message} — is scripts/sim_server.py running, and does the Vite proxy point at its port (SIM_SERVER_PORT)?`
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
  // Prefer what the simulator recorded over what the server echoed back, and
  // show the label the selector uses rather than the wire value.
  const ranChore = trace?.chore ?? result?.chore;
  const ranLabel = CHOICES.find((c) => c.id === ranChore)?.label;

  return (
    <div className="flex flex-col gap-2 px-4 py-3 rounded-xl bg-slate-900/85 border border-white/10 backdrop-blur-md shadow-2xl w-[320px]">
      <div className="flex flex-col gap-1">
        <div className="flex gap-1 p-0.5 rounded-lg bg-slate-800/70 border border-white/5">
          {CHOICES.map((c) => (
            <button
              key={c.id}
              onClick={() => selectChore(c.id)}
              disabled={busy}
              aria-pressed={chore === c.id}
              className={`flex-1 px-2 py-1 rounded-md text-[11px] font-semibold transition
                          disabled:cursor-wait ${
                            chore === c.id
                              ? 'bg-cyan-500/90 text-slate-900'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
              title={c.blurb}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 leading-snug">
          {CHOICES.find((c) => c.id === chore)?.blurb}
        </p>
      </div>

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
            {ranLabel ? `${ranLabel} · ` : ''}
            {result.success ? 'completed' : 'ran, but missed the target'}
            {result.durationSec !== undefined && (
              <span className="font-mono font-normal opacity-70"> · {result.durationSec}s</span>
            )}
          </div>

          {/* A task failure arrives as ok:true with the reason inside the
              trace, not as result.error - that field is for the server's own
              failures. Reading only result.error would show a failed run with
              no explanation at all. */}
          {!result.success && trace?.error && (
            <p className="px-2.5 py-2 rounded-lg bg-amber-950/40 border border-amber-500/30
                          text-[11px] text-amber-200/90 font-mono break-words">
              {trace.error}
            </p>
          )}

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
              {trace.predicate && (
                <div className="flex flex-col gap-1 px-2 py-1.5 rounded bg-slate-800/70 border border-white/5">
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">
                    Machine-checked verdict
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PREDICATE_PARTS.map(({ key, label }) => {
                      const held = trace.predicate?.[key] === true;
                      return (
                        <span
                          key={key}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                            held
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          {held ? '✓' : '✗'} {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

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
