import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { vec3 } from "./schema";

// A viewer is considered present if seen within this window.
const STALE_MS = 15_000;

/** Everyone currently in this scene, for avatars and a "2 people viewing" chip. */
export const list = query({
  args: { shareId: v.string() },
  returns: v.array(
    v.object({
      sessionId: v.string(),
      displayName: v.string(),
      color: v.string(),
      cameraPosition: v.optional(vec3),
      cameraTarget: v.optional(vec3),
      lastSeen: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const cutoff = Date.now() - STALE_MS;
    const rows = await ctx.db
      .query("presence")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .collect();

    return rows
      .filter((r) => r.lastSeen >= cutoff)
      .map((r) => ({
        sessionId: r.sessionId,
        displayName: r.displayName,
        color: r.color,
        cameraPosition: r.cameraPosition,
        cameraTarget: r.cameraTarget,
        lastSeen: r.lastSeen,
      }));
  },
});

/**
 * Call on an interval (~3s) and on camera move. Upserts this viewer's row and
 * opportunistically reaps rows that have gone stale.
 */
export const heartbeat = mutation({
  args: {
    shareId: v.string(),
    sessionId: v.string(),
    displayName: v.string(),
    color: v.string(),
    cameraPosition: v.optional(vec3),
    cameraTarget: v.optional(vec3),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_shareId_and_sessionId", (q) =>
        q.eq("shareId", args.shareId).eq("sessionId", args.sessionId),
      )
      .unique();

    const fields = { ...args, lastSeen: now };
    if (existing === null) {
      await ctx.db.insert("presence", fields);
    } else {
      await ctx.db.patch(existing._id, fields);
    }

    // Reap anyone who closed their tab, so avatars don't pile up during a demo.
    const stale = await ctx.db
      .query("presence")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .collect();
    for (const row of stale) {
      if (row.lastSeen < now - STALE_MS * 4) await ctx.db.delete(row._id);
    }
    return null;
  },
});

/** Explicit exit, e.g. on beforeunload. */
export const leave = mutation({
  args: { shareId: v.string(), sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("presence")
      .withIndex("by_shareId_and_sessionId", (q) =>
        q.eq("shareId", args.shareId).eq("sessionId", args.sessionId),
      )
      .unique();
    if (row !== null) await ctx.db.delete(row._id);
    return null;
  },
});
