#!/usr/bin/env python3
"""
=============================================================================
MINT.GG 3D WORLD & ASSET GENERATION PIPELINE (Real Estate Multi-View -> 3D)
=============================================================================
Uses Mint MCP API to upload real estate photos and launch 3D world generations.
"""

import argparse
import base64
import json
import os
import sys
import time
import requests

MCP_ENDPOINT = "https://mcp.mint.gg/mcp"
CONFIG_PATH = os.path.expanduser("~/.gemini/config/mcp_config.json")
DEFAULT_PROJECT_ID = "zd767hpq3j77j30agf5nbfwd8h8dvrjm"

def get_token():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH) as f:
                cfg = json.load(f)
            auth_header = cfg.get("mcpServers", {}).get("mint", {}).get("headers", {}).get("Authorization", "")
            if auth_header.startswith("Bearer "):
                return auth_header.split("Bearer ", 1)[1].strip()
        except Exception:
            pass
    return None

def parse_sse_response(resp_text: str):
    for line in resp_text.splitlines():
        if line.startswith("data: "):
            return json.loads(line[6:])
    try:
        return json.loads(resp_text)
    except:
        return {"raw": resp_text}

def call_mcp_tool(tool_name: str, arguments: dict):
    token = get_token()
    if not token:
        print("❌ Error: No Mint MCP Authorization token found.")
        return None

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "jsonrpc": "2.0",
        "id": int(time.time() * 1000) % 1000000,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }

    try:
        res = requests.post(MCP_ENDPOINT, headers=headers, json=payload, timeout=60)
        if res.status_code == 200:
            parsed = parse_sse_response(res.text)
            content = parsed.get("result", {}).get("content", [])
            if content and content[0].get("type") == "text":
                try:
                    return json.loads(content[0]["text"])
                except Exception:
                    return content[0]["text"]
            return parsed
        else:
            print(f"⚠️ Mint MCP request failed ({res.status_code}): {res.text}")
            return None
    except Exception as e:
        print(f"⚠️ Error calling Mint MCP: {e}")
        return None

def upload_local_photo(file_path: str, name: str, project_id: str = DEFAULT_PROJECT_ID):
    if not os.path.exists(file_path):
        print(f"⚠️ Local image not found: {file_path}")
        return None

    print(f"📤 Uploading '{file_path}' to Mint CDN...")
    with open(file_path, "rb") as f:
        b64_data = base64.b64encode(f.read()).decode("utf-8")

    ext = file_path.lower().split(".")[-1]
    content_type = "image/png" if ext == "png" else "image/jpeg"

    args = {
        "project_id": project_id,
        "context": f"Upload reference photo {name} for photorealistic real estate 3D digital twin reconstruction.",
        "name": name[:80],
        "file_name": os.path.basename(file_path),
        "content_type": content_type,
        "base64_data": b64_data
    }

    res = call_mcp_tool("upload_reference_image", args)
    if isinstance(res, dict) and "imageUrl" in res:
        print(f"  ✅ Stashed to Mint CDN: {res['imageUrl']}")
        return res["imageUrl"]
    elif isinstance(res, dict) and "url" in res:
        return res["url"]
    else:
        print(f"  ⚠️ Upload response: {res}")
        return None

def generate_mint_world(title: str, photos: list, prompt: str = None, project_id: str = DEFAULT_PROJECT_ID):
    print(f"\n=======================================================")
    print(f"🌱 Launching Mint.gg 3D World Generation: {title}")
    print(f"=======================================================")

    cdn_image_urls = []
    for idx, p in enumerate(photos):
        if p.startswith("http://") or p.startswith("https://"):
            cdn_image_urls.append(p)
        elif os.path.exists(p):
            uploaded_url = upload_local_photo(p, f"{title}_view_{idx+1}", project_id)
            if uploaded_url:
                cdn_image_urls.append(uploaded_url)

    if not prompt:
        prompt = f"Photorealistic 3D interior spatial room and architectural floorplan of {title}, high ceilings, hardwood flooring, modern architectural lighting, calibrated metric scale."

    args = {
        "project_id": project_id,
        "context": f"Synthesize realistic 3D spatial environment for {title} real estate listing.",
        "display_name_hint": title[:80],
        "prompt": prompt,
        "mode": "auto"
    }

    if cdn_image_urls:
        args["image_url"] = cdn_image_urls[0]
        if len(cdn_image_urls) > 1:
            args["source_images"] = cdn_image_urls[:6]
        print(f"📸 Seeding with {len(cdn_image_urls)} reference photos: {cdn_image_urls}")

    res = call_mcp_tool("start_world_generation", args)
    if isinstance(res, dict):
        chat_url = res.get("chatUrl") or res.get("url")
        asset_id = res.get("assetId") or res.get("id")
        print(f"\n🎉 Mint Generation Successfully Started!")
        if chat_url:
            print(f"👉 Mint Chat Link: {chat_url}")
        if asset_id:
            print(f"👉 Mint Asset ID: {asset_id}")
        return res
    else:
        print(f"Result: {res}")
        return res

def main():
    parser = argparse.ArgumentParser(description="Mint.gg 3D World Generator for Real Estate Listings")
    parser.add_argument("--house-id", type=int, default=1, help="House number from dataset (e.g. 1, 2, 3)")
    parser.add_argument("--title", type=str, help="Custom listing title")
    parser.add_argument("--all-samples", action="store_true", help="Generate 3D worlds in parallel for all sample listings")
    args = parser.parse_args()

    if args.all_samples:
        samples = [
            (1, "4BD / 4BA California Luxury Residence (House #1)"),
            (2, "4BD / 3BA Modern Residence (House #2)"),
            (3, "3BD / 2BA Coastal Craftsman (House #3)"),
            (4, "5BD / 4BA Architectural Estate (House #4)"),
        ]
        results = []
        for h_id, h_title in samples:
            photos = [
                f"public/houses/house_{h_id}/frontal.jpg",
                f"public/houses/house_{h_id}/kitchen.jpg",
                f"public/houses/house_{h_id}/bedroom.jpg",
                f"public/houses/house_{h_id}/bathroom.jpg",
            ]
            res = generate_mint_world(h_title, photos)
            results.append({"house_id": h_id, "title": h_title, "res": res})
            time.sleep(2) # rate spacing
        
        with open("mint_generations.json", "w") as f:
            json.dump(results, f, indent=2)
        print("\n💾 Saved Mint generation records to mint_generations.json")
    else:
        h_id = args.house_id
        title = args.title or f"House #{h_id} Real Estate Digital Twin"
        photos = [
            f"public/houses/house_{h_id}/frontal.jpg",
            f"public/houses/house_{h_id}/kitchen.jpg",
            f"public/houses/house_{h_id}/bedroom.jpg",
            f"public/houses/house_{h_id}/bathroom.jpg",
        ]
        generate_mint_world(title, photos)

if __name__ == "__main__":
    main()
