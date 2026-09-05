import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Mirrors src/realestate/types.ts so the studio can round-trip a staged scene.
export const vec3 = v.object({
  x: v.number(),
  y: v.number(),
  z: v.number(),
});

export const dimensions3D = v.object({
  width: v.number(),
  height: v.number(),
  depth: v.number(),
});

export const geomType = v.union(
  v.literal("box"),
  v.literal("cylinder"),
  v.literal("sphere"),
  v.literal("capsule"),
  v.literal("mesh"),
);

export const assetCategory = v.union(
  v.literal("living_room"),
  v.literal("kitchen_dining"),
  v.literal("bedroom_office"),
  v.literal("robotics_fixtures"),
  v.literal("lighting_decor"),
);

export const physicsProperties = v.object({
  isStatic: v.boolean(),
  mass: v.number(),
  friction: v.array(v.number()), // [sliding, torsional, rolling]
  restitution: v.number(),
  geomType,
  collisionGroup: v.optional(v.number()),
  contype: v.optional(v.number()),
  conaffinity: v.optional(v.number()),
});

export default defineSchema({
  // One staged room. `shareId` is the short public token in the URL.
  scenes: defineTable({
    shareId: v.string(),
    listingId: v.string(),
    listingTitle: v.string(),
    listingAddress: v.optional(v.string()),
    metricBounds: v.object({
      widthMeters: v.number(),
      depthMeters: v.number(),
      ceilingHeightMeters: v.number(),
    }),
    stylePack: v.optional(v.string()), // which generated asset pack is staged
    updatedAt: v.number(),
  }).index("by_shareId", ["shareId"]),

  // Furniture is its own table, not an array on `scenes`: two people can drag
  // different pieces at once without their writes contending on one document.
  placedObjects: defineTable({
    sceneId: v.id("scenes"),
    objectId: v.string(), // client-side id from types.ts PlacedObject
    assetId: v.string(),
    name: v.string(),
    category: assetCategory,
    position: vec3,
    rotation: vec3, // radians
    scale: vec3,
    dimensions: dimensions3D,
    physics: physicsProperties,
    color: v.optional(v.string()),
    modelUrl: v.optional(v.string()), // generated GLB, when not a primitive
    updatedBy: v.optional(v.string()),
  })
    .index("by_sceneId", ["sceneId"])
    .index("by_sceneId_and_objectId", ["sceneId", "objectId"]),

  // High-churn, kept off `scenes` per the schema guidelines.
  presence: defineTable({
    shareId: v.string(),
    sessionId: v.string(),
    displayName: v.string(),
    color: v.string(),
    cameraPosition: v.optional(vec3),
    cameraTarget: v.optional(vec3),
    lastSeen: v.number(),
  })
    .index("by_shareId", ["shareId"])
    .index("by_shareId_and_sessionId", ["shareId", "sessionId"]),
});
