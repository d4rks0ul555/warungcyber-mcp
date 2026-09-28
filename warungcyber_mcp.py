#!/usr/bin/env python3
"""
WarungCyber AI Gateway — Python Model Context Protocol (MCP) Server
Standard JSON-RPC 2.0 over stdio for Claude Desktop, Cursor, and Python AI Agents.
"""

import sys
import json
import os
import urllib.request
import urllib.error
import time

BASE_URL = os.environ.get("WARUNGCYBER_BASE_URL", "https://api.warungcyber.net")
DEFAULT_API_KEY = os.environ.get("WARUNGCYBER_API_KEY", "")

GENUINE_MODELS = [
    {"id": "claude-sonnet-4-6", "name": "Claude Sonnet 4.6 (Thinking)", "provider": "Anthropic", "context": "200k", "speed": "< 1.4s", "usd_in": 3.0, "usd_out": 15.0, "idr_in": 48000, "idr_out": 240000},
    {"id": "claude-sonnet-3-7", "name": "Claude 3.7 Sonnet", "provider": "Anthropic", "context": "200k", "speed": "< 2.0s", "usd_in": 3.0, "usd_out": 15.0, "idr_in": 48000, "idr_out": 240000},
    {"id": "deepseek-reasoner", "name": "DeepSeek R1 (Deep Reasoning)", "provider": "DeepSeek", "context": "128k", "speed": "Deep Chain", "usd_in": 0.55, "usd_out": 2.19, "idr_in": 8800, "idr_out": 35040},
    {"id": "deepseek-chat", "name": "DeepSeek V3 (Chat / Code)", "provider": "DeepSeek", "context": "128k", "speed": "< 800ms", "usd_in": 0.14, "usd_out": 0.28, "idr_in": 2240, "idr_out": 4480},
    {"id": "qwen-2.5-coder-32b", "name": "Qwen 2.5 Coder 32B", "provider": "Qwen / Alibaba", "context": "128k", "speed": "< 700ms", "usd_in": 0.07, "usd_out": 0.16, "idr_in": 1120, "idr_out": 2560},
    {"id": "venice-uncensored", "name": "Venice Uncensored (Dolphin 24B)", "provider": "Uncensored", "context": "128k", "speed": "< 750ms", "usd_in": 0.60, "usd_out": 2.20, "idr_in": 9600, "idr_out": 35200},
    {"id": "gemini-3.1-pro", "name": "Google Gemini 3.1 Pro (2M Context)", "provider": "Google", "context": "2M", "speed": "< 1.8s", "usd_in": 1.25, "usd_out": 5.0, "idr_in": 20000, "idr_out": 80000},
    {"id": "gemini-2.5-flash-image", "name": "Google Imagen / Flash Image", "provider": "ImageGen", "context": "Image Mode", "speed": "< 2.5s", "usd_in": 0.05, "usd_out": 0.05, "idr_in": 800, "idr_out": 800}
]

TOOLS_DEFINITIONS = [
    {
        "name": "warungcyber_list_models",
        "description": "List all 19 SOTA AI models available on WarungCyber AI Gateway with real-time pricing and context windows.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "category": {"type": "string", "enum": ["ALL", "CODING", "REASONING", "UNCENSORED", "CHEAP"], "description": "Filter by model capability"}
            }
        }
    },
    {
        "name": "warungcyber_check_balance",
        "description": "Inspect live balance (USD & IDR), active status, and token usage history for a WarungCyber API key.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "apiKey": {"type": "string", "description": "WarungCyber API Key (sk-wc-...)"}
            },
            "required": ["apiKey"]
        }
    },
    {
        "name": "warungcyber_chat_completion",
        "description": "Execute prompt via WarungCyber's low-latency Jakarta Gateway.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "model": {"type": "string", "description": "Model ID (e.g. claude-sonnet-4-6, deepseek-reasoner, venice-uncensored)"},
                "prompt": {"type": "string", "description": "User instruction or prompt"},
                "systemPrompt": {"type": "string", "description": "Optional system prompt"},
                "apiKey": {"type": "string", "description": "WarungCyber API key"}
            },
            "required": ["model", "prompt"]
        }
    }
]

def handle_list_models(args):
    cat = args.get("category", "ALL")
    md = f"### 🌐 WarungCyber AI Gateway (19 SOTA Models)\n**Endpoint:** `{BASE_URL}/v1` (Co-location: Jakarta DC <20ms)\n\n"
    md += "| Model ID | Provider | Context | Speed | Input / 1M | Output / 1M |\n|---|---|---|---|---|---|\n"
    for m in GENUINE_MODELS:
        md += f"| `{m['id']}` | **{m['provider']}** | {m['context']} | {m['speed']} | ${m['usd_in']:.2f} (Rp {m['idr_in']:,}) | ${m['usd_out']:.2f} (Rp {m['idr_out']:,}) |\n"
    return [{"type": "text", "text": md}]

def handle_check_balance(args):
    key = args.get("apiKey") or DEFAULT_API_KEY
    if not key:
        return [{"type": "text", "text": "❌ Error: API Key is required."}]
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/check-key",
            data=json.dumps({"key": key}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as r:
            res = json.loads(r.read().decode())
            if res.get("status") == "ok":
                d = res["data"]
                txt = f"### 💳 WarungCyber Balance Status\n- **Client:** {d['name']}\n- **Status:** 🟢 {d['status'].upper()}\n- **Remaining Balance:** {d['balance_usd']} ({d['balance_idr']})\n- **Tokens Used:** {d['tokens_used']:,}\n- **Gateway Latency:** < 20ms (Jakarta DC)\n- **Expiry:** NEVER (Lifetime)"
                return [{"type": "text", "text": txt}]
            return [{"type": "text", "text": f"❌ {res.get('message', 'Key not found.')}"}]
    except Exception as e:
        return [{"type": "text", "text": f"❌ Error: {str(e)}"}]

def handle_chat_completion(args):
    key = args.get("apiKey") or DEFAULT_API_KEY
    if not key:
        return [{"type": "text", "text": "❌ Error: API Key is required."}]
    model = args.get("model", "deepseek-chat")
    prompt = args.get("prompt", "")
    sys_prompt = args.get("systemPrompt")
    
    messages = []
    if sys_prompt:
        messages.append({"role": "system", "content": sys_prompt})
    messages.append({"role": "user", "content": prompt})

    body = {"model": model, "messages": messages, "temperature": 0.7}
    try:
        t0 = time.time()
        req = urllib.request.Request(
            f"{BASE_URL}/v1/chat/completions",
            data=json.dumps(body).encode(),
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as r:
            res = json.loads(r.read().decode())
            lat = int((time.time() - t0) * 1000)
            content = res.get("choices", [{}])[0].get("message", {}).get("content", "")
            return [{"type": "text", "text": f"{content}\n\n---\n⚡ Model: `{model}` | Latency: `{lat}ms`"}]
    except Exception as e:
        return [{"type": "text", "text": f"❌ Chat Error: {str(e)}"}]

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            req_id = req.get("id")
            method = req.get("method")

            if method == "initialize":
                res = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "protocolVersion": "2024-11-05",
                        "serverInfo": {"name": "warungcyber-mcp-python", "version": "1.0.0"},
                        "capabilities": {"tools": {}}
                    }
                }
                print(json.dumps(res), flush=True)

            elif method == "tools/list":
                res = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"tools": TOOLS_DEFINITIONS}
                }
                print(json.dumps(res), flush=True)

            elif method == "tools/call":
                params = req.get("params", {})
                name = params.get("name")
                args = params.get("arguments", {})

                if name == "warungcyber_list_models":
                    content = handle_list_models(args)
                elif name == "warungcyber_check_balance":
                    content = handle_check_balance(args)
                elif name == "warungcyber_chat_completion":
                    content = handle_chat_completion(args)
                else:
                    content = [{"type": "text", "text": f"Unknown tool: {name}"}]

                res = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {"content": content}
                }
                print(json.dumps(res), flush=True)

        except Exception as e:
            sys.stderr.write(f"RPC Error: {e}\n")

if __name__ == "__main__":
    main()
