#!/usr/bin/env python3
"""
=============================================================================
MINT.GG MCP GENERATION SCRIPT
Integrates with Mint.gg MCP server for 3D world & asset generation from listings.
=============================================================================
"""

import argparse
import json
import os
import sys
import requests

MCP_ENDPOINT = "https://mcp.mint.gg/mcp"
CONFIG_PATH = os.path.expanduser("~/.gemini/config/mcp_config.json")

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

def call_mcp_tool(tool_name: str, arguments: dict, token: str = None):
    token = token or get_token()
    if not token:
        print("❌ Error: No Mint MCP Authorization token found.")
        print("Please authenticate using the Mint OAuth URL or update ~/.gemini/config/mcp_config.json")
        return None

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {token}"
    }

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        }
    }

    try:
        res = requests.post(MCP_ENDPOINT, headers=headers, json=payload, timeout=60)
        if res.status_code == 200:
            result = res.json()
            return result
        else:
            print(f"⚠️ Mint MCP request failed ({res.status_code}): {res.text}")
            return res.json() if res.headers.get("content-type", "").startswith("application/json") else {"error": res.text}
    except Exception as e:
        print(f"⚠️ Connection error calling Mint MCP: {e}")
        return None

def generate_mint_world(prompt: str, image_url: str = None, display_name: str = "Real Estate Digital Twin"):
    print(f"\n🌱 Triggering Mint.gg World Generation for '{display_name}'...")
    args = {
        "context": f"Synthesize realistic 3D spatial environment for {display_name} real estate digital twin.",
        "display_name_hint": display_name[:80],
        "prompt": prompt,
        "mode": "auto"
    }
    if image_url:
        args["image_url"] = image_url
        print(f"   Seeding with reference image: {image_url}")

    res = call_mcp_tool("start_world_generation", args)
    print("Response:", json.dumps(res, indent=2))
    return res

def list_mint_tools():
    token = get_token()
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {token}"
    }
    res = requests.post(MCP_ENDPOINT, headers=headers, json={
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list",
        "params": {}
    })
    print(f"Status: {res.status_code}")
    print(res.text)

def main():
    parser = argparse.ArgumentParser(description="Mint.gg 3D Generation Tool")
    parser.add_argument("--prompt", type=str, default="Photorealistic California modern home living room with hardwood floors and panoramic windows")
    parser.add_argument("--image", type=str, help="Reference image URL")
    parser.add_argument("--title", type=str, default="California Residence")
    parser.add_argument("--list-tools", action="store_true", help="List available Mint MCP tools")
    args = parser.parse_args()

    if args.list_tools:
        list_mint_tools()
    else:
        generate_mint_world(args.prompt, image_url=args.image, display_name=args.title)

if __name__ == "__main__":
    main()
