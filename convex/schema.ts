import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Dynamic road and bridge network status
  bridges: defineTable({
    bridgeId: v.string(), // "Bridge_Alpha" (4th St) | "Bridge_Beta" (3rd St)
    name: v.string(),
    isBlocked: v.boolean(),
    closureReason: v.optional(v.string()), // "MAINTENANCE_LIFT", "ACCIDENT", "FLOODED"
    costMultiplier: v.number(), // 1.0 (open) vs 999.0 (closed)
    reportedBy: v.optional(v.string()), // "Rover_1"
    updatedAt: v.number(),
  }).index("by_bridgeId", ["bridgeId"]),

  // Real-time fleet telemetry for Isaac Sim agents
  robots: defineTable({
    robotId: v.string(),
    position: v.object({ x: v.number(), y: v.number(), z: v.number() }),
    heading: v.number(),
    status: v.string(), // "EN_ROUTE", "TRAPPED", "REROUTING", "ARRIVED"
    activeRoute: v.string(), // "VIA_BRIDGE_ALPHA" | "VIA_BRIDGE_BETA"
    destination: v.string(),
    updatedAt: v.number(),
  }).index("by_robotId", ["robotId"]),

  // Mission timeline and live alerts for the dashboard
  eventLogs: defineTable({
    timestamp: v.number(),
    source: v.string(), // "Rover_1", "Convex_Dispatcher"
    message: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
  }),
});
