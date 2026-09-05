import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { PlacedObject, RealEstateListing } from '../types';

/**
 * Live multiplayer staging on top of Convex.
 *
 * Design note: this hook DIFFS the existing `objects` array rather than asking
 * the app to call sync functions from its handlers. That keeps the footprint in
 * RealEstateApp to a single hook call - add/move/delete/duplicate all keep
 * working untouched, and each one replicates automatically.
 */

const SHARE_PARAM = 's';
const PUSH_DEBOUNCE_MS = 250;
const HEARTBEAT_MS = 3000;
// Ignore inbound snapshots briefly after our own write, so a drag isn't
// fought by the echo of the mutation that drag just issued.
const ECHO_GUARD_MS = 700;

const PALETTE = ['#f59e0b', '#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fb7185'];

function randomId(len = 8): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  let out = '';
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

function readShareIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(SHARE_PARAM);
}

/** Only the fields that define an object's placement, for cheap change detection. */
function transformKey(o: PlacedObject): string {
  return JSON.stringify([o.position, o.rotation, o.scale]);
}

function toConvexObject(o: PlacedObject) {
  return {
    objectId: o.id,
    assetId: o.assetId,
    name: o.name,
    category: o.category,
    position: o.position,
    rotation: o.rotation,
    scale: o.scale,
    dimensions: o.dimensions,
    physics: {
      isStatic: o.physics.isStatic,
      mass: o.physics.mass,
      friction: o.physics.friction as unknown as number[],
      restitution: o.physics.restitution,
      geomType: o.physics.geomType,
      collisionGroup: o.physics.collisionGroup,
      contype: o.physics.contype,
      conaffinity: o.physics.conaffinity,
    },
    color: o.color,
  };
}

function fromConvexObject(o: any): PlacedObject {
  return {
    id: o.objectId,
    assetId: o.assetId,
    name: o.name,
    category: o.category,
    position: o.position,
    rotation: o.rotation,
    scale: o.scale,
    dimensions: o.dimensions,
    physics: {
      ...o.physics,
      friction: o.physics.friction as [number, number, number],
    },
    color: o.color,
  };
}

export interface SharedSceneState {
  shareId: string | null;
  isShared: boolean;
  isPublishing: boolean;
  shareUrl: string | null;
  viewers: Array<{ sessionId: string; displayName: string; color: string }>;
  /** Other people currently in this scene (excludes you). */
  otherViewerCount: number;
  publish: () => Promise<void>;
  stopSharing: () => void;
}

export function useSharedScene(
  listing: RealEstateListing,
  objects: PlacedObject[],
  setObjects: React.Dispatch<React.SetStateAction<PlacedObject[]>>,
  displayName = 'Guest',
): SharedSceneState {
  const [shareId, setShareId] = useState<string | null>(() => readShareIdFromUrl());
  const [isPublishing, setIsPublishing] = useState(false);

  const sessionId = useRef<string>(randomId(10));
  const color = useRef<string>(PALETTE[Math.floor(Math.random() * PALETTE.length)]);

  // objectId -> transformKey of what the server last confirmed / we last sent.
  const syncedRef = useRef<Map<string, string>>(new Map());
  const lastLocalWriteRef = useRef<number>(0);
  const applyingRemoteRef = useRef<boolean>(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Until the first server snapshot lands, this client's local objects are just
  // the listing defaults - pushing them would add our furniture to someone
  // else's room instead of adopting theirs.
  const hydratedRef = useRef<boolean>(false);

  const scene = useQuery(api.scenes.get, shareId ? { shareId } : 'skip');
  const presence = useQuery(api.presence.list, shareId ? { shareId } : 'skip');

  const saveScene = useMutation(api.scenes.save);
  const addObject = useMutation(api.objects.add);
  const transformObject = useMutation(api.objects.transform);
  const removeObject = useMutation(api.objects.remove);
  const heartbeat = useMutation(api.presence.heartbeat);

  /** Publish the current studio state and put ?s=<id> in the address bar. */
  const publish = useCallback(async () => {
    setIsPublishing(true);
    try {
      const id = shareId ?? randomId(8);
      await saveScene({
        shareId: id,
        listingId: listing.id,
        listingTitle: listing.title,
        listingAddress: listing.address,
        metricBounds: listing.metricBounds,
        objects: objects.map(toConvexObject),
      });
      syncedRef.current = new Map(objects.map((o) => [o.id, transformKey(o)]));
      lastLocalWriteRef.current = Date.now();
      hydratedRef.current = true; // we authored this scene, safe to push edits

      const url = new URL(window.location.href);
      url.searchParams.set(SHARE_PARAM, id);
      window.history.replaceState({}, '', url.toString());
      setShareId(id);
    } finally {
      setIsPublishing(false);
    }
  }, [shareId, listing, objects, saveScene]);

  const stopSharing = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete(SHARE_PARAM);
    window.history.replaceState({}, '', url.toString());
    syncedRef.current = new Map();
    hydratedRef.current = false;
    setShareId(null);
  }, []);

  // ---- inbound: remote scene -> local objects -------------------------------
  useEffect(() => {
    if (!shareId || scene === undefined) return;

    // Scene id in the URL that doesn't exist yet: nothing to adopt, so this
    // client owns it and may start publishing its own state.
    if (scene === null) {
      hydratedRef.current = true;
      return;
    }
    if (Date.now() - lastLocalWriteRef.current < ECHO_GUARD_MS) return;

    const incoming = scene.objects.map(fromConvexObject);
    const incomingKeys = new Map(incoming.map((o) => [o.id, transformKey(o)]));

    // Cheap equality check so we don't setState on every server tick.
    let identical = incomingKeys.size === syncedRef.current.size;
    if (identical) {
      for (const [id, key] of incomingKeys) {
        if (syncedRef.current.get(id) !== key) {
          identical = false;
          break;
        }
      }
    }
    if (identical) {
      hydratedRef.current = true;
      return;
    }

    applyingRemoteRef.current = true;
    syncedRef.current = incomingKeys;
    hydratedRef.current = true;
    setObjects(incoming);
  }, [scene, shareId, setObjects]);

  // ---- outbound: local objects -> per-object mutations ----------------------
  useEffect(() => {
    if (!shareId) return;

    // Wait for the first snapshot before sending anything, or we'd push this
    // client's listing defaults into a room someone else already staged.
    if (!hydratedRef.current) return;

    // Don't bounce a remote snapshot straight back to the server.
    if (applyingRemoteRef.current) {
      applyingRemoteRef.current = false;
      return;
    }

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      const prev = syncedRef.current;
      const next = new Map<string, string>();
      const writes: Array<Promise<unknown>> = [];

      for (const o of objects) {
        const key = transformKey(o);
        next.set(o.id, key);
        const before = prev.get(o.id);
        if (before === undefined) {
          writes.push(addObject({ shareId, ...toConvexObject(o), updatedBy: sessionId.current }));
        } else if (before !== key) {
          writes.push(
            transformObject({
              shareId,
              objectId: o.id,
              position: o.position,
              rotation: o.rotation,
              scale: o.scale,
              updatedBy: sessionId.current,
            }),
          );
        }
      }
      for (const id of prev.keys()) {
        if (!next.has(id)) writes.push(removeObject({ shareId, objectId: id }));
      }

      if (writes.length > 0) {
        lastLocalWriteRef.current = Date.now();
        syncedRef.current = next;
        void Promise.all(writes).catch(() => {
          // A failed write just means the next diff retries it.
        });
      }
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [objects, shareId, addObject, transformObject, removeObject]);

  // ---- presence -------------------------------------------------------------
  useEffect(() => {
    if (!shareId) return;
    const beat = () =>
      void heartbeat({
        shareId,
        sessionId: sessionId.current,
        displayName,
        color: color.current,
      }).catch(() => {});
    beat();
    const t = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(t);
  }, [shareId, displayName, heartbeat]);

  const viewers = useMemo(
    () =>
      (presence ?? []).map((p) => ({
        sessionId: p.sessionId,
        displayName: p.displayName,
        color: p.color,
      })),
    [presence],
  );

  return {
    shareId,
    isShared: shareId !== null,
    isPublishing,
    shareUrl: shareId
      ? `${window.location.origin}${window.location.pathname}?${SHARE_PARAM}=${shareId}`
      : null,
    viewers,
    otherViewerCount: viewers.filter((v) => v.sessionId !== sessionId.current).length,
    publish,
    stopSharing,
  };
}
