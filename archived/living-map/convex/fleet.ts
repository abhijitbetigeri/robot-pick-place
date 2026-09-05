import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Initialize bridge network and default staging state
export const initNetwork = mutation({
  args: {
    forceReset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingBridges = await ctx.db.query("bridges").collect();
    
    if (existingBridges.length === 0 || args.forceReset) {
      // Clear existing if force reset
      for (const b of existingBridges) {
        await ctx.db.delete(b._id);
      }
      
      const existingRobots = await ctx.db.query("robots").collect();
      for (const r of existingRobots) {
        await ctx.db.delete(r._id);
      }

      await ctx.db.insert("bridges", {
        bridgeId: "Bridge_Alpha",
        name: "4th Street Bridge (Primary 88m)",
        isBlocked: false,
        costMultiplier: 1.0,
        updatedAt: Date.now(),
      });
      
      await ctx.db.insert("bridges", {
        bridgeId: "Bridge_Beta",
        name: "3rd Street Bridge (Detour 120m)",
        isBlocked: false,
        costMultiplier: 1.0,
        updatedAt: Date.now(),
      });

      // Default Rover 1 (Scout)
      await ctx.db.insert("robots", {
        robotId: "Rover_1",
        position: { x: 0.0, y: -30.0, z: 0.0 },
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: "North_Goal",
        updatedAt: Date.now(),
      });

      // Default Rover 2 (Delivery)
      await ctx.db.insert("robots", {
        robotId: "Rover_2",
        position: { x: 0.0, y: -35.0, z: 0.0 },
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: "North_Goal",
        updatedAt: Date.now(),
      });

      await ctx.db.insert("eventLogs", {
        timestamp: Date.now(),
        source: "LivingMap_Dispatcher",
        message: "System initialized. Mission Creek topological network active. Both bridges OPEN.",
        severity: "info",
      });
    }
  },
});

// Rover 1 reports Bridge Alpha is closed (drawbridge raised, accident, roadwork)
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
      message: `🚨 OBSTACLE DETECTED: ${args.bridgeId} is BLOCKED (${args.reason}). Convex broadcasted cost delta to fleet.`,
      severity: "critical",
    });
  },
});

// Manual or API bridge state toggle
export const setBridgeStatus = mutation({
  args: {
    bridgeId: v.string(),
    isBlocked: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bridge = await ctx.db
      .query("bridges")
      .withIndex("by_bridgeId", (q) => q.eq("bridgeId", args.bridgeId))
      .first();

    if (bridge) {
      await ctx.db.patch(bridge._id, {
        isBlocked: args.isBlocked,
        costMultiplier: args.isBlocked ? 999.0 : 1.0,
        closureReason: args.isBlocked ? (args.reason || "MANUAL_OVERRIDE") : undefined,
        reportedBy: args.isBlocked ? "Mission_Control" : undefined,
        updatedAt: Date.now(),
      });

      await ctx.db.insert("eventLogs", {
        timestamp: Date.now(),
        source: "Mission_Control",
        message: args.isBlocked
          ? `⚠️ Bridge ${args.bridgeId} manually set to BLOCKED (${args.reason || "Manual"})`
          : `✅ Bridge ${args.bridgeId} reopened. Normal cost profile restored.`,
        severity: args.isBlocked ? "warning" : "info",
      });
    }
  },
});

// Update robot telemetry from Isaac Sim or Python simulator
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

// Log custom mission event
export const addEventLog = mutation({
  args: {
    source: v.string(),
    message: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("eventLogs", {
      timestamp: Date.now(),
      source: args.source,
      message: args.message,
      severity: args.severity,
    });
  },
});

// Reset entire simulation state
export const resetSimulation = mutation({
  args: {},
  handler: async (ctx) => {
    const bridges = await ctx.db.query("bridges").collect();
    for (const b of bridges) {
      await ctx.db.patch(b._id, {
        isBlocked: false,
        costMultiplier: 1.0,
        closureReason: undefined,
        reportedBy: undefined,
        updatedAt: Date.now(),
      });
    }

    const r1 = await ctx.db.query("robots").withIndex("by_robotId", q => q.eq("robotId", "Rover_1")).first();
    if (r1) {
      await ctx.db.patch(r1._id, {
        position: { x: 0.0, y: -30.0, z: 0.0 },
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: "North_Goal",
        updatedAt: Date.now(),
      });
    }

    const r2 = await ctx.db.query("robots").withIndex("by_robotId", q => q.eq("robotId", "Rover_2")).first();
    if (r2) {
      await ctx.db.patch(r2._id, {
        position: { x: 0.0, y: -35.0, z: 0.0 },
        heading: 90,
        status: "IDLE",
        activeRoute: "VIA_BRIDGE_ALPHA",
        destination: "North_Goal",
        updatedAt: Date.now(),
      });
    }

    await ctx.db.insert("eventLogs", {
      timestamp: Date.now(),
      source: "Mission_Control",
      message: "🔄 Simulation reset to initial state. Fleet stationed at South Depot.",
      severity: "info",
    });
  },
});

// Reactive queries for Isaac Sim and the Web Dashboard
export const getBridges = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bridges").collect();
  },
});

export const getRobots = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("robots").collect();
  },
});

export const getFleetState = query({
  args: {},
  handler: async (ctx) => {
    const robots = await ctx.db.query("robots").collect();
    const bridges = await ctx.db.query("bridges").collect();
    const logs = await ctx.db.query("eventLogs").order("desc").take(25);
    return { robots, bridges, logs };
  },
});
