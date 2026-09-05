import React, { useState } from 'react';
import { Share2, Users, Check, Link2, Radio } from 'lucide-react';
import { SharedSceneState } from '../hooks/useSharedScene';

interface SharePanelProps {
  shared: SharedSceneState;
}

/**
 * Floating control for live co-staging. Collapsed to a single button until the
 * scene is published, then shows the link and who else is in the room.
 */
export const SharePanel: React.FC<SharePanelProps> = ({ shared }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!shared.shareUrl) return;
    try {
      await navigator.clipboard.writeText(shared.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the input below is selectable as a fallback.
    }
  };

  if (!shared.isShared) {
    return (
      <button
        onClick={() => void shared.publish()}
        disabled={shared.isPublishing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/90 hover:bg-amber-400
                   text-slate-900 text-sm font-semibold shadow-lg backdrop-blur transition
                   disabled:opacity-60 disabled:cursor-wait"
        title="Publish this staged scene and get a shareable link"
      >
        <Share2 size={16} />
        {shared.isPublishing ? 'Publishing…' : 'Share Live Scene'}
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 px-4 py-3 rounded-xl bg-slate-900/80 border border-white/10
                 backdrop-blur-md shadow-2xl min-w-[290px]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Radio size={13} className="animate-pulse" />
          LIVE · synced via Convex
        </span>
        <button
          onClick={shared.stopSharing}
          className="text-[11px] text-slate-400 hover:text-slate-200 transition"
        >
          Stop
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Link2 size={14} className="text-slate-500 shrink-0" />
        <input
          readOnly
          value={shared.shareUrl ?? ''}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 bg-slate-800/70 rounded px-2 py-1 text-[11px] text-slate-300
                     font-mono outline-none border border-white/5"
        />
        <button
          onClick={() => void copy()}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Copy link"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Users size={13} />
        <span>
          {shared.otherViewerCount === 0
            ? 'Waiting for others to join…'
            : `${shared.otherViewerCount} other ${
                shared.otherViewerCount === 1 ? 'person' : 'people'
              } staging`}
        </span>
        <div className="flex -space-x-1.5 ml-auto">
          {shared.viewers.slice(0, 5).map((v) => (
            <div
              key={v.sessionId}
              title={v.displayName}
              className="w-5 h-5 rounded-full border-2 border-slate-900"
              style={{ backgroundColor: v.color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
