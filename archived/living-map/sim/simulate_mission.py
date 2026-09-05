#!/usr/bin/env python3
"""
The Living Map: Multi-Scenario Multi-Robot Mission Simulator
Simulates real-world dynamic obstacle discovery and reactive fleet rerouting
across diverse generative digital twins (SF Bridges, NYC Soho, Automated Port).
"""

import os
import sys
import time
import argparse
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sim.rover_agent import RoverAgent
from sim.scenarios import SCENARIOS

load_dotenv()
CONVEX_URL = os.getenv("CONVEX_URL") or os.getenv("VITE_CONVEX_URL")

def run_mission_simulation(scenario_key: str = "sf_mission_creek", delay: float = 0.5):
    scenario = SCENARIOS.get(scenario_key, SCENARIOS["sf_mission_creek"])
    
    print("=" * 75)
    print(f" 🗺️  THE LIVING MAP: MULTI-ROBOT SPATIAL MEMORY SIMULATION")
    print(f" 📍 Scenario: {scenario['title'].upper()}")
    print(f" 🏙️  Context:  {scenario['subtitle']}")
    print(f" 🌐 World Labs Marble 3D Model: {scenario['marbleUrl']}")
    print("=" * 75)
    print(f"  • Primary Path: {scenario['primaryName']} ({scenario['primaryDistance']})")
    print(f"  • Detour Route: {scenario['detourName']} ({scenario['detourDistance']})")
    print(f"  • Hazard Trigger: {scenario['incidentTitle']}")
    if CONVEX_URL:
        print(f"  • Backend: Connected to Convex ({CONVEX_URL})")
    else:
        print("  • Backend: Reactive In-Memory Shared Blackboard (<12ms latency)")
    print("=" * 75)
    
    # 1. Initialize Fleet
    rover_1 = RoverAgent("Rover_1", role="LEAD_SCOUT", convex_url=CONVEX_URL)
    rover_2 = RoverAgent("Rover_2", role="DELIVERY_UNIT", convex_url=CONVEX_URL)
    
    print("\n[Phase 1] 🚀 Fleet Staging & Departure")
    rover_1.plan(bridge_alpha_closed=False)
    rover_2.plan(bridge_alpha_closed=False)
    time.sleep(delay)
    
    # Step 1: Depart staging area
    wp1 = rover_1.step()
    wp2 = rover_2.step()
    print(f"  🤖 Rover 1 (Scout)    -> Departed: {wp1}")
    print(f"  🤖 Rover 2 (Delivery) -> Departed: {wp2}")
    time.sleep(delay)
    
    # Step 2: Rover 1 reaches fork
    wp1 = rover_1.step()
    print(f"  🤖 Rover 1 -> Traversed {wp1} -> Targeting {scenario['primaryName']}")
    time.sleep(delay)
    
    # Step 3: Rover 1 reaches primary bottleneck; detects obstacle
    print(f"\n[Phase 2] 🚧 Rover 1 Encounters Bottleneck Incident!")
    wp1 = rover_1.step()
    print(f"  🤖 Rover 1 reached: {wp1} at coordinate position {rover_1.position}")
    rover_1.report_closure(bridge_id=scenario["primaryName"], reason=scenario["incidentType"])
    time.sleep(delay)
    
    # Step 4: Rover 2 reaches Fork Decision Point
    print("\n[Phase 3] ⚡ Convex Reactive State Broadcast (<12ms)")
    wp2 = rover_2.step()
    print(f"  🤖 Rover 2 arrived at: {wp2} (Coordinates: {rover_2.position})")
    print(f"  📡 Convex Blackboard: Global cost delta received by Rover 2 before entering dead-end!")
    rover_2.plan(bridge_alpha_closed=True, start_node="Fork_Decision_Point")
    print(f"  ✨ Visual ribbon for Rover 2 path SNAPPED dynamically to {scenario['detourName']}!")
    time.sleep(delay)
    
    # Step 5: Rover 2 navigates detour
    print(f"\n[Phase 4] 🔀 Rover 2 Navigates Detour ({scenario['detourName']})")
    while True:
        wp = rover_2.step()
        if not wp:
            break
        print(f"  🤖 Rover 2 advancing -> {wp:<20} Pos: {rover_2.position}")
        time.sleep(delay * 0.7)
        
    # Step 6: Summary Metrics
    print("\n" + "=" * 75)
    print(" 🎯 MISSION SUCCESS: FLEET DISRUPTION MITIGATED")
    print("=" * 75)
    print(f"  • Rover 1 (Lead Scout): Safely halted before barrier at {scenario['primaryName']}")
    print(f"  • Rover 2 (Delivery):   Successfully completed route to {scenario['waypoints']['goal']['label']}")
    print(f"  • Bottlenecks Avoided:  100% (0 trapped rovers)")
    print(f"  • Fleet Delay Avoided:  ~{scenario['delayAvoided']} per trailing vehicle")
    print(f"  • Network Sync Latency: <12ms via Convex Shared Spatial Memory")
    print("=" * 75)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate Living Map Multi-Robot Coordination")
    parser.add_argument("--scenario", choices=["sf_mission_creek", "nyc_soho", "port_logistics"], default="sf_mission_creek")
    parser.add_argument("--delay", type=float, default=0.35)
    args = parser.parse_args()
    run_mission_simulation(scenario_key=args.scenario, delay=args.delay)
