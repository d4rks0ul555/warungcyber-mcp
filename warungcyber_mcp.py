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

AVAILABLE_MODEL_IDS = [
    "glm-5.3-uncensored",
    "claude-sonnet-4-6",
    "claude-sonnet-3-7",
    "claude-opus-4-7",
    "gemini-3.7-flash",
    "gemini-3-flash",
    "gemini-3.1-pro",
    "glm-5-3",
    "deepseek-v4-flash",
    "deepseek-r1",
    "qwen3-coder-480b",
    "qwen-3.5-397b",
    "claude-haiku-4-5",
    "kimi-k2-6",
    "claude-opus-5",
    "claude-sonnet-5",
    "deepseek-v4-pro",
    "qwen3-max",
    "kimi-k3"
]

GENUINE_MODELS = [
    {"id": "glm-5.3-uncensored", "name": "GLM 5.3 UNCENSORED", "provider": "Uncensored", "context": "1M", "speed": "~3-4s", "usd_in": 0.6, "usd_out": 0.6, "idr_in": 9600, "idr_out": 9600},
    {"id": "claude-sonnet-4-6", "name": "Claude Sonnet 4.6", "provider": "Anthropic", "context": "200k", "speed": "~1.4s", "usd_in": 3, "usd_out": 15, "idr_in": 48000, "idr_out": 240000},
    {"id": "claude-sonnet-3-7", "name": "Claude 3.7 Sonnet", "provider": "Anthropic", "context": "200k", "speed": "~2.4s", "usd_in": 3, "usd_out": 15, "idr_in": 48000, "idr_out": 240000},
    {"id": "claude-opus-4-7", "name": "Claude Opus 4.7", "provider": "Anthropic", "context": "200k", "speed": "~1.4s", "usd_in": 15, "usd_out": 75, "idr_in": 240000, "idr_out": 1200000},
    {"id": "gemini-3.7-flash", "name": "Gemini 3.7 Flash", "provider": "Gemini", "context": "1M", "speed": "~1.6s", "usd_in": 0.15, "usd_out": 0.6, "idr_in": 2400, "idr_out": 9600},
    {"id": "gemini-3-flash", "name": "Gemini 3 Flash", "provider": "Gemini", "context": "1M", "speed": "< 1s", "usd_in": 0.2, "usd_out": 0.8, "idr_in": 3200, "idr_out": 12800},
    {"id": "gemini-3.1-pro", "name": "Google Gemini 3.1 Pro", "provider": "Gemini", "context": "2M", "speed": "~3s", "usd_in": 1.25, "usd_out": 5, "idr_in": 20000, "idr_out": 80000},
    {"id": "glm-5-3", "name": "GLM 5.3", "provider": "Zhipu", "context": "128k", "speed": "< 1s", "usd_in": 0.15, "usd_out": 0.6, "idr_in": 2400, "idr_out": 9600},
    {"id": "deepseek-v4-flash", "name": "DeepSeek V4 Flash", "provider": "DeepSeek", "context": "128k", "speed": "< 1s", "usd_in": 0.14, "usd_out": 0.28, "idr_in": 2240, "idr_out": 4480},
    {"id": "deepseek-r1", "name": "DeepSeek R1", "provider": "DeepSeek", "context": "128k", "speed": "~3.2s", "usd_in": 0.55, "usd_out": 2.19, "idr_in": 8800, "idr_out": 35040},
    {"id": "qwen3-coder-480b", "name": "Qwen3 Coder 480B", "provider": "Qwen", "context": "256k", "speed": "< 0.5s", "usd_in": 0.07, "usd_out": 0.16, "idr_in": 1120, "idr_out": 2560},
    {"id": "qwen-3.5-397b", "name": "Qwen 3.5 397B", "provider": "Qwen", "context": "256k", "speed": "< 1s", "usd_in": 0.12, "usd_out": 0.39, "idr_in": 1920, "idr_out": 6240},
    {"id": "claude-haiku-4-5", "name": "Claude Haiku 4.5", "provider": "Anthropic", "context": "200k", "speed": "~1.6s", "usd_in": 0.25, "usd_out": 1.25, "idr_in": 4000, "idr_out": 20000},
    {"id": "kimi-k2-6", "name": "Kimi K2.6", "provider": "Moonshot", "context": "256k", "speed": "~1.4s", "usd_in": 0.5, "usd_out": 2, "idr_in": 8000, "idr_out": 32000},
    {"id": "claude-opus-5", "name": "Claude Opus 5", "provider": "Anthropic", "context": "200k", "speed": "~1.4s", "usd_in": 15, "usd_out": 75, "idr_in": 240000, "idr_out": 1200000},
    {"id": "claude-sonnet-5", "name": "Claude Sonnet 5", "provider": "Anthropic", "context": "200k", "speed": "~1.1s", "usd_in": 3, "usd_out": 15, "idr_in": 48000, "idr_out": 240000},
    {"id": "deepseek-v4-pro", "name": "DeepSeek V4 Pro", "provider": "DeepSeek", "context": "128k", "speed": "~1.5s", "usd_in": 0.55, "usd_out": 2.19, "idr_in": 8800, "idr_out": 35040},
    {"id": "qwen3-max", "name": "Qwen3 Max", "provider": "Qwen", "context": "256k", "speed": "~3.9s", "usd_in": 0.12, "usd_out": 0.39, "idr_in": 1920, "idr_out": 6240},
    {"id": "kimi-k3", "name": "Kimi K3", "provider": "Moonshot", "context": "256k", "speed": "< 1s", "usd_in": 0.5, "usd_out": 2, "idr_in": 8000, "idr_out": 32000}
]

TOOLS_DEFINITIONS = [
    {
        "name": "warungcyber_list_models",
        "description": "List available AI models from the WarungCyber AI Gateway, including context window limits, token pricing (USD and IDR), and capability categories. Read-only operation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "enum": ["ALL", "CODING", "REASONING", "UNCENSORED", "VISION", "CHEAP"],
                    "description": "Filter models by capability category"
                },
                "format": {
                    "type": "string",
                    "enum": ["markdown", "json"],
                    "description": "Output format for the model list (default: markdown)"
                }
            }
        }
    },
    {
        "name": "warungcyber_check_balance",
        "description": "Retrieve remaining account balance (USD/IDR), cumulative token consumption, and active account status for a WarungCyber API key via an external gateway API call. Read-only operation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "apiKey": {
                    "type": "string",
                    "description": "WarungCyber API key (starts with sk-wc-)"
                }
            },
            "required": ["apiKey"]
        }
    },
    {
        "name": "warungcyber_chat_completion",
        "description": "Send a chat completion prompt to a selected WarungCyber AI model via external HTTP API call. Consumes account token balance based on prompt and completion length. Requires an active WarungCyber API key (sk-wc-...). Returns generated text and token usage metrics.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "model": {
                    "type": "string",
                    "enum": AVAILABLE_MODEL_IDS,
                    "description": "Target AI model identifier to execute"
                },
                "prompt": {
                    "type": "string",
                    "description": "The user prompt, task instruction, or code snippet to complete"
                },
                "systemPrompt": {
                    "type": "string",
                    "description": "Optional system instruction or persona definition"
                },
                "temperature": {
                    "type": "number",
                    "description": "Sampling temperature between 0.0 and 2.0 (default: 0.7)"
                },
                "maxTokens": {
                    "type": "integer",
                    "description": "Maximum completion tokens to generate (default: 2048)"
                },
                "apiKey": {
                    "type": "string",
                    "description": "WarungCyber API key (starts with sk-wc-). Uses WARUNGCYBER_API_KEY environment variable if omitted."
                }
            },
            "required": ["model", "prompt"]
        }
    },
    {
        "name": "warungcyber_get_setup_guide",
        "description": "Generate formatted Markdown setup guides and copy-paste configuration snippets for integrating WarungCyber into Cursor IDE, VS Code Continue, Cline, Chatbox, or Python and Node.js SDKs. Embeds the provided API key (or placeholder if omitted) directly into the code sample. Read-only operation.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "client": {
                    "type": "string",
                    "enum": ["cursor", "continue", "cline", "chatbox", "python", "node", "claude_desktop"],
                    "description": "Target client application or development environment"
                },
                "apiKey": {
                    "type": "string",
                    "description": "WarungCyber API key to embed in the configuration snippet"
                }
            },
            "required": ["client"]
        }
    }
]

def handle_list_models(args):
    cat = args.get("category", "ALL")
    fmt = args.get("format", "markdown")
    filtered = GENUINE_MODELS
    if cat == "CODING":
        filtered = [m for m in filtered if "coder" in m["id"] or "claude" in m["id"]]
    elif cat == "REASONING":
        filtered = [m for m in filtered if "reasoner" in m["id"] or "thinking" in m["id"]]
    elif cat == "UNCENSORED":
        filtered = [m for m in filtered if "uncensored" in m["id"]]
    elif cat == "VISION":
        filtered = [m for m in filtered if "image" in m["id"]]
    elif cat == "CHEAP":
        filtered = [m for m in filtered if m["usd_in"] <= 0.20]

    if fmt == "json":
        return [{"type": "text", "text": json.dumps({"gateway": BASE_URL, "total": len(filtered), "models": filtered}, indent=2)}]

    md = f"### 🌐 WarungCyber AI Gateway (19 SOTA Models)\n**Endpoint:** `{BASE_URL}/v1` (Co-location: Jakarta DC <20ms)\n\n"
    md += "| Model ID | Provider | Context | Speed | Input / 1M | Output / 1M |\n|---|---|---|---|---|---|\n"
    for m in filtered:
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
    model = args.get("model", "deepseek-v4-flash")
    prompt = args.get("prompt", "")
    sys_prompt = args.get("systemPrompt")
    temp = args.get("temperature", 0.7)
    max_tok = args.get("maxTokens", 2048)
    
    messages = []
    if sys_prompt:
        messages.append({"role": "system", "content": sys_prompt})
    messages.append({"role": "user", "content": prompt})

    body = {"model": model, "messages": messages, "temperature": temp, "max_tokens": max_tok}
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

def handle_get_setup_guide(args):
    client = args.get("client", "cursor")
    api_key = args.get("apiKey", "sk-wc-YOUR_KEY_HERE")
    guide = f"### Configuration Guide for {client.upper()}\nBase URL: `{BASE_URL}/v1`\nAPI Key: `{api_key}`\nModels: `claude-sonnet-4-6`, `deepseek-r1`, `qwen3-coder-480b`, `glm-5.3-uncensored`."
    return [{"type": "text", "text": guide}]

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
                        "serverInfo": {"name": "warungcyber-mcp-python", "version": "1.0.1"},
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
                elif name == "warungcyber_get_setup_guide":
                    content = handle_get_setup_guide(args)
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
