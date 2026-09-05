#!/usr/bin/env python3
"""
Poll active Mint.gg 3D world generations and report stage/status.
"""

import requests
import json
import os

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

def main():
    if not os.path.exists("mint_active_generations.json"):
        print("No active Mint generations found in mint_active_generations.json")
        return

    with open("mint_active_generations.json") as f:
        gens = json.load(f)

    print(f"🔍 Polling {len(gens)} Active Mint.gg 3D World Generations...\n")
    for g in gens:
        asset_id = g.get("assetId")
        title = g.get("title")
        chat_url = g.get("chatUrl")
        
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": "get_asset",
                "arguments": {
                    "asset_id": asset_id,
                    "asset_type": "world"
                }
            }
        }
        try:
            res = requests.post("https://mcp.mint.gg/mcp", headers=headers, json=payload, timeout=30)
            data = parse_sse_response(res.text)
            content = data.get("result", {}).get("content", [])
            if content:
                details = json.loads(content[0]["text"])
                status = details.get("status") or details.get("lifecycleStatus")
                stage = details.get("stage")
                print(f"• {title}")
                print(f"  Asset ID: {asset_id}")
                print(f"  Status: {status} (Stage: {stage})")
                print(f"  Chat: {chat_url}\n")
            else:
                print(f"• {title} -> Raw: {data}\n")
        except Exception as e:
            print(f"• {title} -> Error: {e}\n")

if __name__ == "__main__":
    main()
