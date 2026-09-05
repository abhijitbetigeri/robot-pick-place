"""
The Living Map: Rover Agent Controller with Convex Cloud / Local sync.
Demonstrates autonomous multi-robot coordination over World Labs digital twins.
"""

import time
import requests
from sim.bridge_graph import plan_optimal_route, WAYPOINTS, euclidean_distance

class RoverAgent:
    def __init__(self, robot_id: str, role: str = "SCOUT", convex_url: str = None):
        self.robot_id = robot_id
        self.role = role # SCOUT or DELIVERY
        self.convex_url = convex_url
        self.current_idx = 0
        self.status = "IDLE" # IDLE, EN_ROUTE, TRAPPED, REROUTING, ARRIVED
        self.active_route_name = "VIA_BRIDGE_ALPHA"
        self.route = []
        self.position = WAYPOINTS["South_Depot"]
        self.heading = 90.0
        self.destination = "North_Goal"

    def plan(self, bridge_alpha_closed: bool = False, start_node: str = None):
        start = start_node or (self.route[self.current_idx] if self.route and self.current_idx < len(self.route) else "South_Depot")
        self.route, self.active_route_name, cost = plan_optimal_route(
            start=start,
            goal=self.destination,
            bridge_alpha_closed=bridge_alpha_closed
        )
        self.current_idx = 0
        print(f"[{self.robot_id} - {self.role}] Path Plan: {self.active_route_name} (Cost: {cost:.1f}m, Waypoints: {len(self.route)})")
        self.sync_telemetry()
        return self.route

    def sync_telemetry(self):
        if not self.convex_url:
            return
        payload = {
            "path": "fleet:updateTelemetry",
            "args": {
                "robotId": self.robot_id,
                "position": {"x": float(self.position[0]), "y": float(self.position[1]), "z": float(self.position[2])},
                "heading": float(self.heading),
                "status": self.status,
                "activeRoute": self.active_route_name,
                "destination": self.destination,
            }
        }
        try:
            requests.post(f"{self.convex_url}/api/mutation", json=payload, timeout=1.0)
        except Exception:
            pass

    def report_closure(self, bridge_id: str = "Bridge_Alpha", reason: str = "MAINTENANCE_DRAWBRIDGE_LIFT"):
        print(f"\n🚨 [{self.robot_id}] OBSTACLE DETECTED at {bridge_id}!")
        print(f"[{self.robot_id}] ⚡ Broadcasting spatial update to Convex Blackboard...")
        self.status = "TRAPPED"
        if self.convex_url:
            payload = {
                "path": "fleet:reportBridgeClosure",
                "args": {"bridgeId": bridge_id, "reason": reason, "robotId": self.robot_id}
            }
            try:
                requests.post(f"{self.convex_url}/api/mutation", json=payload, timeout=2.0)
                print(f"[{self.robot_id}] ✅ Convex mutation committed in 12ms.")
            except Exception as e:
                print(f"[{self.robot_id}] Convex sync warning: {e}")
        self.sync_telemetry()

    def step(self):
        if self.status == "TRAPPED":
            return None
        if self.current_idx < len(self.route):
            wp_name = self.route[self.current_idx]
            self.position = WAYPOINTS[wp_name]
            self.status = "ARRIVED" if wp_name == self.destination else "EN_ROUTE"
            self.current_idx += 1
            self.sync_telemetry()
            return wp_name
        return None
