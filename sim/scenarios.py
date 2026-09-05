"""
Multi-Scenario Topological Graphs and Narrative Definitions for The Living Map.
Includes:
1. SF Mission Creek (China Basin Twin Drawbridges)
2. NYC Soho Urban Canyon (Alleyway Trench Collapse)
3. Port Logistics Automated Depot (Gantry Container Spill)
"""

SCENARIOS = {
    "sf_mission_creek": {
        "id": "sf_mission_creek",
        "title": "SF Mission Creek (China Basin)",
        "subtitle": "Twin Drawbridges crossing canal waterway",
        "worldId": "272b9f6e-5c61-4729-9511-faf551e139de",
        "marbleUrl": "https://marble.worldlabs.ai/world/272b9f6e-5c61-4729-9511-faf551e139de",
        "primaryName": "4th St Bridge (Alpha)",
        "detourName": "3rd St Bridge (Beta)",
        "incidentType": "MAINTENANCE_DRAWBRIDGE_LIFT",
        "incidentTitle": "Drawbridge Raised for Maritime Tugboat",
        "primaryDistance": "88m",
        "detourDistance": "120m",
        "delayAvoided": "8m 30s",
        "delaySeconds": 510,
        "waypoints": {
            "start": {"x": 0.0, "y": -30.0, "z": 0.0, "label": "South Depot"},
            "fork": {"x": 0.0, "y": -10.0, "z": 0.0, "label": "Fork Point"},
            "primaryEntry": {"x": -18.0, "y": 0.0, "z": 0.5, "label": "4th St Entry (Barrier)"},
            "primaryMid": {"x": -18.0, "y": 12.0, "z": 0.5, "label": "4th St Span"},
            "primaryExit": {"x": -18.0, "y": 24.0, "z": 0.5, "label": "4th St Exit"},
            "detourApproach": {"x": 22.0, "y": -10.0, "z": 0.0, "label": "3rd St Approach"},
            "detourEntry": {"x": 22.0, "y": 0.0, "z": 0.5, "label": "3rd St Entry"},
            "detourMid": {"x": 22.0, "y": 12.0, "z": 0.5, "label": "3rd St Span"},
            "detourExit": {"x": 22.0, "y": 24.0, "z": 0.5, "label": "3rd St Exit"},
            "northApproach": {"x": 0.0, "y": 28.0, "z": 0.0, "label": "North Waterfront"},
            "goal": {"x": 0.0, "y": 38.0, "z": 0.0, "label": "North Goal (Oracle Park Hub)"}
        }
    },
    "nyc_soho": {
        "id": "nyc_soho",
        "title": "NYC Soho Urban Canyon",
        "subtitle": "Cast-iron historic alleyways & narrow delivery corridors",
        "worldId": "7e7a2603-0c27-4939-9c9b-2be271fa85f2",
        "marbleUrl": "https://marble.worldlabs.ai/world/7e7a2603-0c27-4939-9c9b-2be271fa85f2",
        "primaryName": "Mercer St Alleyway (Primary)",
        "detourName": "Broadway Avenue (Detour)",
        "incidentType": "UTILITY_TRENCH_COLLAPSE",
        "incidentTitle": "Water Main Utility Trench Hazard",
        "primaryDistance": "65m",
        "detourDistance": "105m",
        "delayAvoided": "11m 45s",
        "delaySeconds": 705,
        "waypoints": {
            "start": {"x": 0.0, "y": -30.0, "z": 0.0, "label": "Soho Micro-Hub"},
            "fork": {"x": 0.0, "y": -10.0, "z": 0.0, "label": "Prince St Intersection"},
            "primaryEntry": {"x": -18.0, "y": 0.0, "z": 0.0, "label": "Mercer Alley (Trench Barrier)"},
            "primaryMid": {"x": -18.0, "y": 12.0, "z": 0.0, "label": "Mercer Cobblestones"},
            "primaryExit": {"x": -18.0, "y": 24.0, "z": 0.0, "label": "Spring St Exit"},
            "detourApproach": {"x": 22.0, "y": -10.0, "z": 0.0, "label": "Broadway Approach"},
            "detourEntry": {"x": 22.0, "y": 0.0, "z": 0.0, "label": "Broadway Transit Lane"},
            "detourMid": {"x": 22.0, "y": 12.0, "z": 0.0, "label": "Broadway Mid"},
            "detourExit": {"x": 22.0, "y": 24.0, "z": 0.0, "label": "Broome St Crossing"},
            "northApproach": {"x": 0.0, "y": 28.0, "z": 0.0, "label": "Grand St Approach"},
            "goal": {"x": 0.0, "y": 38.0, "z": 0.0, "label": "Customer Dropoff Hub"}
        }
    },
    "port_logistics": {
        "id": "port_logistics",
        "title": "Automated Port Container Terminal",
        "subtitle": "AGV freight shuttling between crane container bays",
        "worldId": "c6359220-4637-4a19-841e-d55cea097dd6",
        "marbleUrl": "https://marble.worldlabs.ai/world/c6359220-4637-4a19-841e-d55cea097dd6",
        "primaryName": "Container Bay Alpha (Fast)",
        "detourName": "Container Corridor Beta (Detour)",
        "incidentType": "GANTRY_SPILL_CONTAINER_OBSTACLE",
        "incidentTitle": "Fallen Freight Container Blockade",
        "primaryDistance": "95m",
        "detourDistance": "145m",
        "delayAvoided": "14m 20s",
        "delaySeconds": 860,
        "waypoints": {
            "start": {"x": 0.0, "y": -30.0, "z": 0.0, "label": "Berth 12 AGV Staging"},
            "fork": {"x": 0.0, "y": -10.0, "z": 0.0, "label": "Gantry Switch Point"},
            "primaryEntry": {"x": -18.0, "y": 0.0, "z": 0.0, "label": "Bay Alpha Entry (Spill)"},
            "primaryMid": {"x": -18.0, "y": 12.0, "z": 0.0, "label": "Bay Alpha Gantry Rail"},
            "primaryExit": {"x": -18.0, "y": 24.0, "z": 0.0, "label": "Bay Alpha Exit"},
            "detourApproach": {"x": 22.0, "y": -10.0, "z": 0.0, "label": "Corridor Beta Route"},
            "detourEntry": {"x": 22.0, "y": 0.0, "z": 0.0, "label": "Stacking Yard Beta"},
            "detourMid": {"x": 22.0, "y": 12.0, "z": 0.0, "label": "Railhead Bypass"},
            "detourExit": {"x": 22.0, "y": 24.0, "z": 0.0, "label": "Customs Gate Beta"},
            "northApproach": {"x": 0.0, "y": 28.0, "z": 0.0, "label": "Intermodal Rail Loading"},
            "goal": {"x": 0.0, "y": 38.0, "z": 0.0, "label": "Intermodal Freight Terminal"}
        }
    }
}
