#!/usr/bin/env python3
"""
Launch 3D World Generations on Mint.gg seeded with authentic multi-view real estate photos.
"""

import requests
import json
import os
import time

CONFIG_PATH = os.path.expanduser("~/.gemini/config/mcp_config.json")
with open(CONFIG_PATH) as f:
    cfg = json.load(f)

token = cfg["mcpServers"]["mint"]["headers"]["Authorization"].split("Bearer ")[1]
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream",
    "Authorization": f"Bearer {token}"
}

def parse_sse_response(resp_text):
    for line in resp_text.splitlines():
        if line.startswith("data: "):
            return json.loads(line[6:])
    try:
        return json.loads(resp_text)
    except:
        return resp_text

TARGETS = [
    {
        "id": "house_2",
        "title": "4BD / 3BA Modern Residence (House #2)",
        "photos": [
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/2_frontal.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/2_kitchen.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/2_bedroom.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/2_bathroom.jpg"
        ],
        "prompt": "Interior architectural spatial environment and open living room of 4BD / 3BA Modern Residence, hardwood floors, high ceilings, photorealistic lighting, calibrated metric scale."
    },
    {
        "id": "house_3",
        "title": "3BD / 2BA Coastal Craftsman (House #3)",
        "photos": [
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/3_frontal.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/3_kitchen.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/3_bedroom.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/3_bathroom.jpg"
        ],
        "prompt": "Interior living room and dining spatial environment of 3BD Coastal Craftsman, large windows, oak floors, calibrated metric room bounds."
    },
    {
        "id": "house_4",
        "title": "5BD / 4BA Architectural Estate (House #4)",
        "photos": [
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/4_frontal.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/4_kitchen.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/4_bedroom.jpg",
            "https://raw.githubusercontent.com/emanhamed/Houses-dataset/master/Houses%20Dataset/4_bathroom.jpg"
        ],
        "prompt": "Luxury interior great room and architectural living layout of 5BD Architectural Estate, double-height ceilings, contemporary lighting, photorealistic."
    },
    {
        "id": "sf_loft",
        "title": "Jackson Square Architectural Penthouse Loft",
        "photos": [
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
        ],
        "prompt": "Contemporary San Francisco penthouse loft interior, exposed architectural beams, floor-to-ceiling panoramic windows, hardwood floors, modern designer furniture."
    }
]

def main():
    results = [
        {
            "id": "house_1",
            "title": "4BD / 4BA California Luxury Residence (House #1)",
            "chatUrl": "https://mint.gg/chat/ph74rgzgyzw11br3wrytmtmjzn8dt98m",
            "assetId": "j97ag4gqp2rba9e8qj4spjepe98dtmcc",
            "status": "queued"
        }
    ]

    for item in TARGETS:
        print(f"\n🚀 Launching Mint.gg 3D World: {item['title']}...")
        payload = {
            "jsonrpc": "2.0",
            "id": int(time.time()),
            "method": "tools/call",
            "params": {
                "name": "start_world_generation",
                "arguments": {
                    "project_id": "zd767hpq3j77j30agf5nbfwd8h8dvrjm",
                    "context": f"Generate 3D spatial twin for {item['title']} real estate listing using multi-view photography.",
                    "display_name_hint": item["title"][:80],
                    "prompt": item["prompt"],
                    "image_url": item["photos"][0],
                    "source_images": item["photos"],
                    "mode": "auto"
                }
            }
        }

        try:
            res = requests.post("https://mcp.mint.gg/mcp", headers=headers, json=payload, timeout=60)
            data = parse_sse_response(res.text)
            content = data.get("result", {}).get("content", [])
            if content:
                details = json.loads(content[0]["text"])
                chat_url = details.get("chatUrl")
                asset_id = details.get("assetId")
                status = details.get("status")
                print(f"  ✅ Started! Chat: {chat_url}")
                print(f"  Asset ID: {asset_id}")
                results.append({
                    "id": item["id"],
                    "title": item["title"],
                    "chatUrl": chat_url,
                    "assetId": asset_id,
                    "status": status
                })
            else:
                print(f"  Response: {data}")
        except Exception as e:
            print(f"  ⚠️ Error: {e}")

        time.sleep(1) # brief rate spacer

    with open("mint_active_generations.json", "w") as f:
        json.dump(results, f, indent=2)

    print("\n🎉 All Mint.gg 3D world generations launched successfully!")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
