"""
The Living Map: Rover Agent Controller for Isaac Sim.
Demonstrates autonomous multi-robot coordination with Convex backend.
"""

import time
import requests
from bridge_graph import plan_optimal_route, WAYPOINTS

class RoverAgent:
    def __init__(self, robot_id: str, convex_url: str = None):
        self.robot_id = robot_id
        self.convex_url = convex_url
        self.current_idx = 0
        self.status = "IDLE"
        self.active_route_name = "VIA_BRIDGE_ALPHA"
        self.route = []
        self.position = WAYPOINTS["South_Depot"]

    def plan(self, bridge_alpha_closed: bool = False):
        self.route, self.active_route_name, _ = plan_optimal_route(
            bridge_alpha_closed=bridge_alpha_closed
        )
        print(f"[{self.robot_id}] Planned path: {self.active_route_name} ({len(self.route)} waypoints)")

    def report_closure(self, bridge_id: str = "Bridge_Alpha", reason: str = "MAINTENANCE_LIFT"):
        print(f"\n🚨 [{self.robot_id}] OBSTACLE DETECTED at {bridge_id}!")
        print(f"[{self.robot_id}] Sending real-time mutation to Convex...")
        if self.convex_url:
            try:
                requests.post(
                    f"{self.convex_url}/api/mutation",
                    json={
                        "path": "fleet:reportBridgeClosure",
                        "args": {"bridgeId": bridge_id, "reason": reason, "robotId": self.robot_id}
                    },
                    timeout=2.0
                )
            except Exception as e:
                print(f"[{self.robot_id}] Convex sync warning: {e}")
        self.status = "TRAPPED_AT_BRIDGE"

    def step(self):
        if self.current_idx < len(self.route):
            wp_name = self.route[self.current_idx]
            self.position = WAYPOINTS[wp_name]
            self.current_idx += 1
            return wp_name
        return None

if __name__ == "__main__":
    print("=== THE LIVING MAP: MULTI-ROBOT SIMULATION SIMULATOR ===")
    
    # 1. Initialize Fleet
    rover_1 = RoverAgent("Rover_1")  # Lead scout
    rover_2 = RoverAgent("Rover_2")  # Trailing delivery unit
    
    rover_1.plan(bridge_alpha_closed=False)
    rover_2.plan(bridge_alpha_closed=False)
    
    bridge_alpha_closed = False
    
    # 2. Step 1: Fleet departs
    print("\n--- Phase 1: Fleet Departs South Depot ---")
    print(f"Rover 1 reaches: {rover_1.step()}")
    print(f"Rover 2 reaches: {rover_2.step()}")
    
    # 3. Step 2: Rover 1 reaches Bridge Alpha; detects closure
    print("\n--- Phase 2: Rover 1 Discovers Bridge Alpha Closed ---")
    rover_1.step()  # Fork
    rover_1_pos = rover_1.step()  # Bridge_Alpha_Entry
    print(f"Rover 1 arrived at: {rover_1_pos}")
    
    # Rover 1 triggers Convex update
    rover_1.report_closure("Bridge_Alpha", "MAINTENANCE_LIFT")
    bridge_alpha_closed = True
    
    # 4. Step 3: Rover 2 reacts to Convex BEFORE reaching Bridge Alpha
    print("\n--- Phase 3: Rover 2 Receives Convex Reactive Update ---")
    rover_2_pos = rover_2.step() # Reaches Fork_Decision_Point
    print(f"Rover 2 is currently at: {rover_2_pos}")
    print("⚡ Convex triggers reactive route recalculation for Rover 2!")
    rover_2.plan(bridge_alpha_closed=True)
    
    # 5. Step 4: Rover 2 smoothly detours across Bridge Beta
    print("\n--- Phase 4: Rover 2 Navigates Detour to Goal ---")
    while True:
        wp = rover_2.step()
        if not wp:
            break
        print(f"  Rover 2 advancing -> {wp}")
        
    print("\n✅ Mission Complete: Rover 2 successfully delivered to North_Goal via Bridge Beta without getting stuck!")
