#!/usr/bin/env python3
import requests
import json
import os
import sys

def main():
    api_key = os.getenv("WORLD_LABS_API_KEY")
    if not api_key and os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if line.startswith("WORLD_LABS_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
    
    if not api_key:
        print("Error: WORLD_LABS_API_KEY not found in environment or .env")
        sys.exit(1)

    headers = {"WLT-Api-Key": api_key, "Content-Type": "application/json"}

    ops = [
        ("House #1 (San Diego)", "e01e4dba-6955-4fc3-bd67-c45bc63589d3", "84de7e60-3434-4a8e-9846-600fe776aa4b"),
        ("House #2 (Lancaster)", "d8314291-8dc8-44c6-9285-fba74e5b1588", "418cea0d-6cbb-4a23-b5d8-83e79a1c21c8"),
        ("SF Penthouse Loft", "8dccfcc1-5689-4028-b42c-8a8d903dd45a", "ae3e7663-c699-4cc1-b273-df823e165140"),
        ("Seattle Modern", "a152a2b3-5482-4d05-bd0f-4c4930915f31", "b9343ffa-0b73-433b-98db-b4c448d93224"),
    ]

    print(f"🔍 Polling {len(ops)} World Labs Marble operations...")
    for name, op_id, world_id in ops:
        res = requests.get(f"https://api.worldlabs.ai/marble/v1/operations/{op_id}", headers=headers)
        if res.status_code == 200:
            data = res.json()
            done = data.get("done", False)
            print(f"• {name} [{world_id[:8]}...]: Done={done}")
            if done:
                world_res = requests.get(f"https://api.worldlabs.ai/marble/v1/worlds/{world_id}", headers=headers)
                if world_res.status_code == 200:
                    wdata = world_res.json()
                    assets = wdata.get("assets", {})
                    mesh_url = assets.get("mesh", {}).get("collider_mesh_url")
                    print(f"  -> Collider GLB: {mesh_url}")
        else:
            print(f"• {name} [{world_id[:8]}...]: HTTP {res.status_code} - {res.text[:100]}")

if __name__ == "__main__":
    main()
