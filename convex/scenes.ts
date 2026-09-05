import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { assetCategory, dimensions3D, physicsProperties, vec3 } from "./schema";
import { Id } from "./_generated/dataModel";

const placedObjectShape = v.object({
  objectId: v.string(),
  assetId: v.string(),
  name: v.string(),
  category: assetCategory,
  position: vec3,
  rotation: vec3,
  scale: vec3,
  dimensions: dimensions3D,
  physics: physicsProperties,
  color: v.optional(v.string()),
  modelUrl: v.optional(v.string()),
});

/** Read a staged scene and everything in it. Live-updates in the client. */
export const get = query({
  args: { shareId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      shareId: v.string(),
      listingId: v.string(),
      listingTitle: v.string(),
      listingAddress: v.optional(v.string()),
      metricBounds: v.object({
        widthMeters: v.number(),
        depthMeters: v.number(),
        ceilingHeightMeters: v.number(),
      }),
      stylePack: v.optional(v.string()),
      updatedAt: v.number(),
      objects: v.array(placedObjectShape),
    }),
  ),
  handler: async (ctx, args) => {
    const scene = await ctx.db
      .query("scenes")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();
    if (scene === null) return null;

    const rows = await ctx.db
      .query("placedObjects")
      .withIndex("by_sceneId", (q) => q.eq("sceneId", scene._id))
      .collect();

    return {
      shareId: scene.shareId,
      listingId: scene.listingId,
      listingTitle: scene.listingTitle,
      listingAddress: scene.listingAddress,
      metricBounds: scene.metricBounds,
      stylePack: scene.stylePack,
      updatedAt: scene.updatedAt,
      objects: rows.map((r) => ({
        objectId: r.objectId,
        assetId: r.assetId,
        name: r.name,
        category: r.category,
        position: r.position,
        rotation: r.rotation,
        scale: r.scale,
        dimensions: r.dimensions,
        physics: r.physics,
        color: r.color,
        modelUrl: r.modelUrl,
      })),
    };
  },
});

/** Most recently touched scenes, for a "continue staging" list. */
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      shareId: v.string(),
      listingTitle: v.string(),
      stylePack: v.optional(v.string()),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const scenes = await ctx.db
      .query("scenes")
      .order("desc")
      .take(args.limit ?? 20);
    return scenes.map((s) => ({
      shareId: s.shareId,
      listingTitle: s.listingTitle,
      stylePack: s.stylePack,
      updatedAt: s.updatedAt,
    }));
  },
});

/**
 * Publish the current studio state under `shareId`, creating it if needed.
 * Replaces the object set wholesale - use objects.move for live dragging.
 */
export const save = mutation({
  args: {
    shareId: v.string(),
    listingId: v.string(),
    listingTitle: v.string(),
    listingAddress: v.optional(v.string()),
    metricBounds: v.object({
      widthMeters: v.number(),
      depthMeters: v.number(),
      ceilingHeightMeters: v.number(),
    }),
    stylePack: v.optional(v.string()),
    objects: v.array(placedObjectShape),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scenes")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();

    const fields = {
      shareId: args.shareId,
      listingId: args.listingId,
      listingTitle: args.listingTitle,
      listingAddress: args.listingAddress,
      metricBounds: args.metricBounds,
      stylePack: args.stylePack,
      updatedAt: Date.now(),
    };

    let sceneId: Id<"scenes">;
    if (existing === null) {
      sceneId = await ctx.db.insert("scenes", fields);
    } else {
      sceneId = existing._id;
      await ctx.db.patch(sceneId, fields);
      const old = await ctx.db
        .query("placedObjects")
        .withIndex("by_sceneId", (q) => q.eq("sceneId", sceneId))
        .collect();
      for (const row of old) await ctx.db.delete(row._id);
    }

    for (const o of args.objects) {
      await ctx.db.insert("placedObjects", { sceneId, ...o });
    }
    return args.shareId;
  },
});
