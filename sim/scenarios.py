"""
Realistic Multi-Scenario Topological Graphs and Narrative Definitions for The Living Map.
Each scenario has authentic 3D geometry, distinct waypoints, obstacle mechanics, and environments:
1. SF Mission Creek: Maritime Canal & Twin Parallel Drawbridges (4th St & 3rd St)
2. NYC Soho Urban Grid: Manhattan Street Grid (Mercer Alley Trench vs Broadway Avenue)
3. Port Logistics Terminal: Intermodal Container Depot (Gantry Bay Alpha vs Bay Beta Rail Bypass)
"""

SCENARIOS = {
    "sf_mission_creek": {
        "id": "sf_mission_creek",
        "title": "SF Mission Creek (China Basin)",
        "subtitle": "Two parallel drawbridges crossing Mission Creek canal: 4th St (Bascule) & 3rd St (Scherzer Lift)",
        "worldId": "272b9f6e-5c61-4729-9511-faf551e139de",
        "marbleUrl": "https://marble.worldlabs.ai/world/272b9f6e-5c61-4729-9511-faf551e139de",
        "environmentType": "waterway_bridges",
        "primaryName": "4th St Bridge (Alpha)",
        "detourName": "3rd St Bridge (Beta)",
        "incidentType": "MAINTENANCE_DRAWBRIDGE_LIFT",
        "incidentTitle": "Drawbridge Raised for Tugboat Transit",
        "primaryDistance": "88m",
        "detourDistance": "120m",
        "delayAvoided": "8m 30s",
        "delaySeconds": 510,
        "waterChannelLabel": "≈ MISSION CREEK CANAL WATERWAY ≈",
        "hubStartLabel": "South Depot (China Basin)",
        "hubGoalLabel": "North Goal (Oracle Park Hub)",
        "positions": {
            "start": {"x": 0.0, "y": -30.0, "z": 0.0},
            "fork": {"x": 0.0, "y": -12.0, "z": 0.0},
            "primaryEntry": {"x": -18.0, "y": -4.0, "z": 0.5},
            "primaryMid": {"x": -18.0, "y": 10.0, "z": 0.5},
            "primaryExit": {"x": -18.0, "y": 24.0, "z": 0.5},
            "detourApproach": {"x": 22.0, "y": -12.0, "z": 0.0},
            "detourEntry": {"x": 22.0, "y": -4.0, "z": 0.5},
            "detourMid": {"x": 22.0, "y": 10.0, "z": 0.5},
            "detourExit": {"x": 22.0, "y": 24.0, "z": 0.5},
            "northApproach": {"x": 0.0, "y": 28.0, "z": 0.0},
            "goal": {"x": 0.0, "y": 38.0, "z": 0.0}
        }
    },
    "nyc_soho": {
        "id": "nyc_soho",
        "title": "NYC Soho Urban Grid",
        "subtitle": "High-density Manhattan block: Mercer St narrow alleyway vs Broadway Avenue detour",
        "worldId": "7e7a2603-0c27-4939-9c9b-2be271fa85f2",
        "marbleUrl": "https://marble.worldlabs.ai/world/7e7a2603-0c27-4939-9c9b-2be271fa85f2",
        "environmentType": "urban_grid",
        "primaryName": "Mercer St Alleyway",
        "detourName": "Broadway Avenue Corridor",
        "incidentType": "UTILITY_TRENCH_COLLAPSE",
        "incidentTitle": "Water Main Trench Collapse & Emergency Roadwork",
        "primaryDistance": "65m",
        "detourDistance": "110m",
        "delayAvoided": "11m 45s",
        "delaySeconds": 705,
        "waterChannelLabel": "🏙️ PRINCE ST / MERCER ST URBAN CORRIDOR 🏙️",
        "hubStartLabel": "Soho Micro-Hub Staging",
        "hubGoalLabel": "Customer Delivery Hub (Spring St)",
        "positions": {
            "start": {"x": 0.0, "y": -32.0, "z": 0.0},
            "fork": {"x": 0.0, "y": -16.0, "z": 0.0},
            "primaryEntry": {"x": 0.0, "y": -4.0, "z": 0.0},
            "primaryMid": {"x": 0.0, "y": 10.0, "z": 0.0},
            "primaryExit": {"x": 0.0, "y": 24.0, "z": 0.0},
            "detourApproach": {"x": 26.0, "y": -16.0, "z": 0.0},
            "detourEntry": {"x": 26.0, "y": 0.0, "z": 0.0},
            "detourMid": {"x": 26.0, "y": 16.0, "z": 0.0},
            "detourExit": {"x": 26.0, "y": 28.0, "z": 0.0},
            "northApproach": {"x": 0.0, "y": 28.0, "z": 0.0},
            "goal": {"x": 0.0, "y": 38.0, "z": 0.0}
        }
    },
    "port_logistics": {
        "id": "port_logistics",
        "title": "Automated Port Container Terminal",
        "subtitle": "Intermodal shipping container depot: Gantry Bay Alpha vs Bay Beta Rail Bypass",
        "worldId": "c6359220-4637-4a19-841e-d55cea097dd6",
        "marbleUrl": "https://marble.worldlabs.ai/world/c6359220-4637-4a19-841e-d55cea097dd6",
        "environmentType": "port_depot",
        "primaryName": "Gantry Crane Bay Alpha",
        "detourName": "Stacking Yard Bay Beta",
        "incidentType": "GANTRY_CONTAINER_SPILL",
        "incidentTitle": "Overturned 40ft Freight Container Blockade",
        "primaryDistance": "90m",
        "detourDistance": "140m",
        "delayAvoided": "14m 20s",
        "delaySeconds": 860,
        "waterChannelLabel": "🚢 GANTRY CRANE AUTOMATED AGV LANES 🚢",
        "hubStartLabel": "Berth 12 AGV Staging",
        "hubGoalLabel": "Intermodal Railhead Freight Hub",
        "positions": {
            "start": {"x": -15.0, "y": -30.0, "z": 0.0},
            "fork": {"x": -15.0, "y": -12.0, "z": 0.0},
            "primaryEntry": {"x": -15.0, "y": -2.0, "z": 0.0},
            "primaryMid": {"x": -15.0, "y": 12.0, "z": 0.0},
            "primaryExit": {"x": -15.0, "y": 24.0, "z": 0.0},
            "detourApproach": {"x": 18.0, "y": -12.0, "z": 0.0},
            "detourEntry": {"x": 18.0, "y": 0.0, "z": 0.0},
            "detourMid": {"x": 18.0, "y": 14.0, "z": 0.0},
            "detourExit": {"x": 18.0, "y": 26.0, "z": 0.0},
            "northApproach": {"x": 0.0, "y": 28.0, "z": 0.0},
            "goal": {"x": 0.0, "y": 38.0, "z": 0.0}
        }
    }
}
