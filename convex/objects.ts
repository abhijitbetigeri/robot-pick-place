import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { assetCategory, dimensions3D, physicsProperties, vec3 } from "./schema";
import { Doc, Id } from "./_generated/dataModel";

async function sceneByShareId(
  ctx: { db: any },
  shareId: string,
): Promise<Doc<"scenes"> | null> {
  return await ctx.db
    .query("scenes")
    .withIndex("by_shareId", (q: any) => q.eq("shareId", shareId))
    .unique();
}

/**
 * Live transform update for a single piece of furniture.
 * One document per object, so concurrent drags by different people
 * never contend on the same row.
 */
export const transform = mutation({
  args: {
    shareId: v.string(),
    objectId: v.string(),
    position: v.optional(vec3),
    rotation: v.optional(vec3),
    scale: v.optional(vec3),
    updatedBy: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scene = await sceneByShareId(ctx, args.shareId);
    if (scene === null) return null;

    const row = await ctx.db
      .query("placedObjects")
      .withIndex("by_sceneId_and_objectId", (q) =>
        q.eq("sceneId", scene._id).eq("objectId", args.objectId),
      )
      .unique();
    if (row === null) return null;

    const patch: Record<string, unknown> = { updatedBy: args.updatedBy };
    if (args.position !== undefined) patch.position = args.position;
    if (args.rotation !== undefined) patch.rotation = args.rotation;
    if (args.scale !== undefined) patch.scale = args.scale;

    await ctx.db.patch(row._id, patch);
    await ctx.db.patch(scene._id, { updatedAt: Date.now() });
    return null;
  },
});

/** Add one object to a staged scene. */
export const add = mutation({
  args: {
    shareId: v.string(),
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
    updatedBy: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { shareId, ...rest } = args;
    const scene = await sceneByShareId(ctx, shareId);
    if (scene === null) return null;

    const existing = await ctx.db
      .query("placedObjects")
      .withIndex("by_sceneId_and_objectId", (q) =>
        q.eq("sceneId", scene._id).eq("objectId", args.objectId),
      )
      .unique();

    if (existing === null) {
      await ctx.db.insert("placedObjects", { sceneId: scene._id, ...rest });
    } else {
      await ctx.db.patch(existing._id, rest);
    }
    await ctx.db.patch(scene._id, { updatedAt: Date.now() });
    return null;
  },
});

/** Remove one object from a staged scene. */
export const remove = mutation({
  args: { shareId: v.string(), objectId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const scene = await sceneByShareId(ctx, args.shareId);
    if (scene === null) return null;

    const row = await ctx.db
      .query("placedObjects")
      .withIndex("by_sceneId_and_objectId", (q) =>
        q.eq("sceneId", scene._id).eq("objectId", args.objectId),
      )
      .unique();
    if (row !== null) {
      await ctx.db.delete(row._id);
      await ctx.db.patch(scene._id, { updatedAt: Date.now() });
    }
    return null;
  },
});
