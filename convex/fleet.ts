import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Initialize bridge network state
export const initNetwork = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if bridges exist
    const existing = await ctx.db.query("bridges").collect();
    if (existing.length === 0) {
      await ctx.db.insert("bridges", {
        bridgeId: "Bridge_Alpha",
        name: "4th Street Bridge (Primary)",
        isBlocked: false,
        costMultiplier: 1.0,
        updatedAt: Date.now(),
      });
      await ctx.db.insert("bridges", {
        bridgeId: "Bridge_Beta",
        name: "3rd Street Bridge (Detour)",
        isBlocked: false,
        costMultiplier: 1.0,
        updatedAt: Date.now(),
      });
      await ctx.db.insert("eventLogs", {
        timestamp: Date.now(),
        source: "System",
        message: "Living Map network initialized. Both bridges OPEN.",
        severity: "info",
      });
    }
  },
});

// Rover 1 reports Bridge Alpha is closed
export const reportBridgeClosure = mutation({
  args: {
    bridgeId: v.string(),
    reason: v.string(),
    robotId: v.string(),
  },
  handler: async (ctx, args) => {
    const bridge = await ctx.db
      .query("bridges")
      .withIndex("by_bridgeId", (q) => q.eq("bridgeId", args.bridgeId))
      .first();

    if (bridge) {
      await ctx.db.patch(bridge._id, {
        isBlocked: true,
        costMultiplier: 999.0,
        closureReason: args.reason,
        reportedBy: args.robotId,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.insert("eventLogs", {
      timestamp: Date.now(),
      source: args.robotId,
      message: `🚨 CLOSURE REPORTED: ${args.bridgeId} is CLOSED (${args.reason}). Global costmap updated.`,
      severity: "critical",
    });
  },
});

// Update robot telemetry from Isaac Sim
export const updateTelemetry = mutation({
  args: {
    robotId: v.string(),
    position: v.object({ x: v.number(), y: v.number(), z: v.number() }),
    heading: v.number(),
    status: v.string(),
    activeRoute: v.string(),
    destination: v.string(),
  },
  handler: async (ctx, args) => {
    const robot = await ctx.db
      .query("robots")
      .withIndex("by_robotId", (q) => q.eq("robotId", args.robotId))
      .first();

    if (robot) {
      await ctx.db.patch(robot._id, {
        position: args.position,
        heading: args.heading,
        status: args.status,
        activeRoute: args.activeRoute,
        destination: args.destination,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("robots", {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

// Reactive queries for Isaac Sim and the Web Dashboard
export const getBridges = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bridges").collect();
  },
});

export const getFleetState = query({
  args: {},
  handler: async (ctx) => {
    const robots = await ctx.db.query("robots").collect();
    const bridges = await ctx.db.query("bridges").collect();
    const logs = await ctx.db.query("eventLogs").order("desc").take(15);
    return { robots, bridges, logs };
  },
});
