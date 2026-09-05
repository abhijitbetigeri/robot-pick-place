#!/usr/bin/env python3
"""
Generate 3D worlds from images/panoramas using the World Labs Marble API.
Exports: Gaussian Splatting (.ply / .spz) and Collision Mesh (.glb).
"""

import argparse
import json
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
        print(f"✅ World Labs API Account Verified. Remaining Credits: {data.get('remaining_credits')}")
        return True
    else:
        print(f"❌ Credit check failed: {res.status_code} - {res.text}")
        return False

def generate_world(prompt_text: str, image_url: str = None, display_name: str = "SF_Mission_Creek_Bridges"):
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

    print(f"\n🚀 Submitting World Generation Request to World Labs Marble API...")
    print(f"• Display Name: {display_name}")
    print(f"• Prompt: {prompt_text}")
    if image_url:
        print(f"• Image Source: {image_url}")

    res = requests.post(f"{BASE_URL}/marble/v1/worlds:generate", headers=HEADERS, json=payload)
    if res.status_code not in (200, 201, 202):
        print(f"❌ Generation request failed ({res.status_code}): {res.text}")
        return None

    op = res.json()
    op_id = op.get("operation_id") or op.get("name")
    print(f"✅ Generation Operation Queued! Operation ID: {op_id}")
    return poll_operation(op_id)

def poll_operation(op_id: str):
    print("\n⏳ Synthesizing 3D Gaussian Splats and Collider Mesh in World Labs Cloud...")
    start_time = time.time()
    
    while True:
        poll_res = requests.get(f"{BASE_URL}/marble/v1/operations/{op_id}", headers=HEADERS)
        if poll_res.status_code != 200:
            print(f"⚠️ Polling notice ({poll_res.status_code}): {poll_res.text}")
            time.sleep(10)
            continue

        poll_data = poll_res.json()
        meta = poll_data.get("metadata") or {}
        world_id = meta.get("world_id")
        
        if poll_data.get("done"):
            if poll_data.get("error"):
                print(f"❌ World generation failed with error: {poll_data.get('error')}")
                return None
                
            elapsed = time.time() - start_time
            print(f"\n🎉 3D World Generation Completed in {elapsed:.1f}s!")
            
            # Fetch world details
            if world_id:
                w_res = requests.get(f"{BASE_URL}/marble/v1/worlds/{world_id}", headers=HEADERS)
                if w_res.status_code == 200:
                    return w_res.json()
            return poll_data.get("response") or poll_data
        
        progress = meta.get("progress", {})
        status_desc = progress.get("description") or progress.get("status") or "Processing 3D scene"
        elapsed = time.time() - start_time
        print(f"[{int(elapsed)}s] {status_desc}... (World ID: {world_id or 'pending'})")
        time.sleep(10)

def download_assets(world_data: dict, out_dir: str = "assets"):
    os.makedirs(out_dir, exist_ok=True)
    
    world_id = world_data.get("world_id") or "world"
    marble_url = world_data.get("world_marble_url") or f"https://marble.worldlabs.ai/world/{world_id}"
    print(f"\n🌐 Marble 3D Web Viewer: {marble_url}")
    
    # Save metadata
    meta_path = os.path.join(out_dir, "world_meta.json")
    with open(meta_path, "w") as f:
        json.dump(world_data, f, indent=2)
    print(f"💾 World metadata saved to: {meta_path}")

    assets = world_data.get("assets") or {}
    
    # Helper downloader
    def fetch_file(url, target_filename, description):
        if not url:
            return
        target_path = os.path.join(out_dir, target_filename)
        print(f"📥 Downloading {description} from {url[:40]}... -> {target_path}")
        try:
            r = requests.get(url, stream=True, timeout=60)
            if r.status_code == 200:
                with open(target_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=65536):
                        f.write(chunk)
                size_mb = os.path.getsize(target_path) / (1024 * 1024)
                print(f"✅ Saved {description} ({size_mb:.2f} MB)")
            else:
                print(f"⚠️ Failed to download {description}: HTTP {r.status_code}")
        except Exception as e:
            print(f"⚠️ Error downloading {description}: {e}")

    # Gaussian splats
    ply_url = assets.get("gaussian_splats_ply_url") or assets.get("splats_url") or assets.get("ply_url")
    fetch_file(ply_url, "scene_splats.ply", "Gaussian Splats (PLY)")
    
    # SPZ compact format
    spz_url = assets.get("spz_url") or assets.get("splats_spz_url")
    fetch_file(spz_url, "scene_splats.spz", "Compact Splats (SPZ)")

    # Collider mesh GLB
    glb_url = assets.get("collider_mesh_glb_url") or assets.get("mesh_url") or assets.get("glb_url")
    fetch_file(glb_url, "scene_collider.glb", "Collider Mesh (GLB)")

    # Imagery / Thumbnail
    thumb_url = assets.get("thumbnail_url") or assets.get("preview_image_url")
    fetch_file(thumb_url, "scene_preview.jpg", "World Thumbnail Preview")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate 3D Worlds via World Labs Marble API")
    parser.add_argument("--prompt", type=str, default="San Francisco Mission Creek canal with two parallel drawbridges crossing the water, asphalt roads on both riverbanks, clear daylight, photorealistic urban geometry.")
    parser.add_argument("--image-url", type=str, default=None, help="Public URL of 360 panorama or image")
    parser.add_argument("--name", type=str, default="SF_Mission_Creek_Bridges")
    parser.add_argument("--out-dir", type=str, default="assets")
    parser.add_argument("--op-id", type=str, default=None, help="Poll existing operation ID")
    
    args = parser.parse_args()
    
    if args.op_id:
        world = poll_operation(args.op_id)
    else:
        world = generate_world(args.prompt, args.image_url, args.name)
        
    if world:
        download_assets(world, args.out_dir)
