#!/usr/bin/env python3
import json
import os
import sys
import urllib.parse
import urllib.request

CONFIG_PATH = os.path.expanduser("~/.gemini/config/mcp_config.json")
PKCE_PATH = "/tmp/mint_pkce.json"
TOKEN_ENDPOINT = "https://mcp.mint.gg/oauth/token"
REDIRECT_URI = "http://localhost:8080/callback"
MCP_ENDPOINT = "https://mcp.mint.gg/mcp"

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/mint_auth_exchange.py <CODE_OR_REDIRECT_URL>")
        sys.exit(1)

    raw_input = sys.argv[1].strip()
    code = raw_input
    if "code=" in raw_input:
        parsed = urllib.parse.urlparse(raw_input)
        qs = urllib.parse.parse_qs(parsed.query or raw_input)
        if "code" in qs:
            code = qs["code"][0]

    if not os.path.exists(PKCE_PATH):
        print(f"Error: PKCE state not found at {PKCE_PATH}. Run OAuth flow first.")
        sys.exit(1)

    with open(PKCE_PATH) as f:
        pkce = json.load(f)

    client_id = pkce["client_id"]
    verifier = pkce["verifier"]

    print(f"Exchanging code for client {client_id}...")
    data = urllib.parse.urlencode({
        "grant_type": "authorization_code",
        "client_id": client_id,
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "code_verifier": verifier,
        "resource": MCP_ENDPOINT
    }).encode("utf-8")

    req = urllib.request.Request(
        TOKEN_ENDPOINT,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            token_data = json.loads(resp.read().decode("utf-8"))
            access_token = token_data.get("access_token")
            if not access_token:
                print("Failed to get access_token:", token_data)
                sys.exit(1)

            # Update mcp_config.json
            try:
                with open(CONFIG_PATH) as f:
                    cfg = json.load(f)
            except Exception:
                cfg = {"mcpServers": {}}

            cfg.setdefault("mcpServers", {})["mint"] = {
                "disabled": False,
                "serverUrl": MCP_ENDPOINT,
                "headers": {
                    "Authorization": f"Bearer {access_token}"
                }
            }
            with open(CONFIG_PATH, "w") as f:
                json.dump(cfg, f, indent=2)

            print(f"✅ Successfully updated Mint MCP token in {CONFIG_PATH}!")
            print("Access Token:", access_token[:30] + "...")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
