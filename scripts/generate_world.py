#!/usr/bin/env python3
"""
Generate 3D worlds from images/panoramas using the World Labs Marble API.
Exports: Gaussian Splatting (.ply) and Collision Mesh (.glb).
"""

import argparse
import os
import sys
import time
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WORLD_LABS_API_KEY")
BASE_URL = "https://api.worldlabs.ai"

if not API_KEY:
    print("Error: WORLD_LABS_API_KEY environment variable is not set.")
    print("Set it in .env or via: export WORLD_LABS_API_KEY=your_key")
    sys.exit(1)

HEADERS = {
    "WLT-Api-Key": API_KEY,
    "Content-Type": "application/json",
}

def check_credits():
    res = requests.get(f"{BASE_URL}/marble/v1/credits", headers=HEADERS)
    if res.status_code == 200:
        data = res.json()
        print(f"World Labs API Account Verified. Remaining Credits: {data.get('remaining_credits')}")
        return True
    else:
        print(f"Credit check failed: {res.status_code} - {res.text}")
        return False

def generate_world(prompt_text: str, image_url: str = None, display_name: str = "SF_Bridge_Twin_Canal"):
    if not check_credits():
        return None

    payload = {
        "display_name": display_name,
        "model": "marble-1.1",
        "world_prompt": {
            "type": "text" if not image_url else "image",
            "text_prompt": prompt_text,
        }
    }
    if image_url:
        payload["world_prompt"]["image_url"] = image_url

    print(f"\nSubmitting World Generation Request to World Labs Marble...")
    print(f"Display Name: {display_name}")
    print(f"Prompt: {prompt_text}")

    res = requests.post(f"{BASE_URL}/marble/v1/worlds:generate", headers=HEADERS, json=payload)
    if res.status_code not in (200, 201, 202):
        print(f"Generation request failed ({res.status_code}): {res.text}")
        return None

    op = res.json()
    op_name = op.get("name") or op.get("operation_id")
    print(f"Operation queued successfully! Operation ID: {op_name}")

    # Polling loop
    print("Synthesizing 3D Gaussian Splats and Collider Mesh...")
    while True:
        poll_res = requests.get(f"{BASE_URL}/marble/v1/{op_name}", headers=HEADERS)
        if poll_res.status_code != 200:
            print(f"Polling warning ({poll_res.status_code}): {poll_res.text}")
            time.sleep(10)
            continue

        poll_data = poll_res.json()
        if poll_data.get("done"):
            print("\nWorld Generation Completed Successfully!")
            world = poll_data.get("response", {})
            return world
        
        progress = poll_data.get("metadata", {}).get("progress", "processing")
        print(f"Status: {progress}... (polling in 10s)")
        time.sleep(10)

def download_assets(world_data: dict, out_dir: str = "assets"):
    os.makedirs(out_dir, exist_ok=True)
    assets = world_data.get("assets", {})
    
    ply_url = assets.get("gaussian_splats_ply_url") or assets.get("splats_url")
    glb_url = assets.get("collider_mesh_glb_url") or assets.get("mesh_url")
    
    if ply_url:
        ply_file = os.path.join(out_dir, "scene_splats.ply")
        print(f"Downloading Gaussian Splats to {ply_file}...")
        r = requests.get(ply_url, stream=True)
        with open(ply_file, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Gaussian Splats saved.")

    if glb_url:
        glb_file = os.path.join(out_dir, "scene_collider.glb")
        print(f"Downloading Collider Mesh to {glb_file}...")
        r = requests.get(glb_url, stream=True)
        with open(glb_file, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
        print("Collider Mesh saved.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate 3D Worlds via World Labs Marble API")
    parser.add_argument("--prompt", type=str, default="San Francisco Mission Creek canal waterway with two parallel drawbridges crossing the water, asphalt roads on both riverbanks, clear daylight, photorealistic urban geometry.")
    parser.add_argument("--image-url", type=str, default=None, help="Public URL of 360 panorama or image")
    parser.add_argument("--name", type=str, default="SF_Mission_Creek_Bridges")
    parser.add_argument("--out-dir", type=str, default="assets")
    
    args = parser.parse_args()
    world = generate_world(args.prompt, args.image_url, args.name)
    if world:
        download_assets(world, args.out_dir)
