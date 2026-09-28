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
    "claude-sonnet-4-6",
    "claude-sonnet-3-7",
    "claude-opus-4-6-thinking",
    "claude-3-haiku",
    "deepseek-reasoner",
    "deepseek-chat",
    "qwen-2.5-coder-32b",
    "qwen-2.5-72b",
    "venice-uncensored",
    "gemini-3.1-pro",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemma-4-31b-it",
    "gpt-4o-mini",
    "llama-3.3-70b",
    "gpt-oss-120b",
    "atria-dawn-preview",
    "gemini-2.5-flash-image"
]

GENUINE_MODELS = [
    {"id": "claude-sonnet-4-6", "name": "Claude Sonnet 4.6 (Thinking)", "provider": "Anthropic", "context": "200k", "speed": "< 1.4s", "usd_in": 3.0, "usd_out": 15.0, "idr_in": 48000, "idr_out": 240000},
    {"id": "claude-sonnet-3-7", "name": "Claude 3.7 Sonnet", "provider": "Anthropic", "context": "200k", "speed": "< 2.0s", "usd_in": 3.0, "usd_out": 15.0, "idr_in": 48000, "idr_out": 240000},
    {"id": "claude-opus-4-6-thinking", "name": "Claude Opus 4.6 Thinking", "provider": "Anthropic", "context": "200k", "speed": "~8.0s", "usd_in": 15.0, "usd_out": 75.0, "idr_in": 240000, "idr_out": 1200000},
    {"id": "claude-3-haiku", "name": "Claude 3 Haiku (Fast)", "provider": "Anthropic", "context": "200k", "speed": "< 500ms", "usd_in": 0.25, "usd_out": 1.25, "idr_in": 4000, "idr_out": 20000},
    {"id": "deepseek-reasoner", "name": "DeepSeek R1 (Deep Reasoning)", "provider": "DeepSeek", "context": "128k", "speed": "Deep Chain", "usd_in": 0.55, "usd_out": 2.19, "idr_in": 8800, "idr_out": 35040},
    {"id": "deepseek-chat", "name": "DeepSeek V3 (Chat / Code)", "provider": "DeepSeek", "context": "128k", "speed": "< 800ms", "usd_in": 0.14, "usd_out": 0.28, "idr_in": 2240, "idr_out": 4480},
    {"id": "qwen-2.5-coder-32b", "name": "Qwen 2.5 Coder 32B", "provider": "Qwen / Alibaba", "context": "128k", "speed": "< 700ms", "usd_in": 0.07, "usd_out": 0.16, "idr_in": 1120, "idr_out": 2560},
    {"id": "qwen-2.5-72b", "name": "Qwen 2.5 72B Instruct", "provider": "Qwen / Alibaba", "context": "128k", "speed": "< 1.2s", "usd_in": 0.12, "usd_out": 0.39, "idr_in": 1920, "idr_out": 6240},
    {"id": "venice-uncensored", "name": "Venice Uncensored (Dolphin 24B)", "provider": "Uncensored", "context": "128k", "speed": "< 750ms", "usd_in": 0.60, "usd_out": 2.20, "idr_in": 9600, "idr_out": 35200},
    {"id": "gemini-3.1-pro", "name": "Google Gemini 3.1 Pro (2M Context)", "provider": "Google", "context": "2M", "speed": "< 1.8s", "usd_in": 1.25, "usd_out": 5.0, "idr_in": 20000, "idr_out": 80000},
    {"id": "gemini-3.8-flash", "name": "Google Gemini 3.8 Flash (1M Context)", "provider": "Google", "context": "1M", "speed": "< 3.5s", "usd_in": 0.15, "usd_out": 0.60, "idr_in": 2400, "idr_out": 9600},
    {"id": "gemini-3.7-flash", "name": "Google Gemini 3.7 Flash High", "provider": "Google", "context": "1M", "speed": "< 3.0s", "usd_in": 0.20, "usd_out": 0.80, "idr_in": 3200, "idr_out": 12800},
    {"id": "gemini-3.6-flash", "name": "Google Gemini 3.6 Flash", "provider": "Google", "context": "1M", "speed": "< 4.0s", "usd_in": 0.15, "usd_out": 0.60, "idr_in": 2400, "idr_out": 9600},
    {"id": "gemma-4-31b-it", "name": "Gemma 4 31B IT", "provider": "Google", "context": "128k", "speed": "< 1.0s", "usd_in": 0.10, "usd_out": 0.30, "idr_in": 1600, "idr_out": 4800},
    {"id": "gpt-4o-mini", "name": "OpenAI GPT-4o Mini", "provider": "OpenAI", "context": "128k", "speed": "< 600ms", "usd_in": 0.15, "usd_out": 0.60, "idr_in": 2400, "idr_out": 9600},
    {"id": "llama-3.3-70b", "name": "Meta Llama 3.3 70B", "provider": "Meta", "context": "128k", "speed": "< 1.0s", "usd_in": 0.12, "usd_out": 0.30, "idr_in": 1920, "idr_out": 4800},
    {"id": "gpt-oss-120b", "name": "GPT-OSS 120B Ultra-Fast", "provider": "Open-Weights", "context": "128k", "speed": "< 850ms", "usd_in": 0.10, "usd_out": 0.40, "idr_in": 1600, "idr_out": 6400},
    {"id": "atria-dawn-preview", "name": "Atria Dawn ASI Preview", "provider": "Atria ASI", "context": "128k", "speed": "~15s", "usd_in": 0.50, "usd_out": 2.00, "idr_in": 8000, "idr_out": 32000},
    {"id": "gemini-2.5-flash-image", "name": "Google Imagen / Flash Image", "provider": "ImageGen", "context": "Image Mode", "speed": "< 2.5s", "usd_in": 0.05, "usd_out": 0.05, "idr_in": 800, "idr_out": 800}
]

TOOLS_DEFINITIONS = [
    {
        "name": "warungcyber_list_models",
        "description": "List available AI models with context window limits, pricing, and category tags.",
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
                    "description": "Output format (default: markdown)"
                }
            }
        }
    },
    {
        "name": "warungcyber_check_balance",
        "description": "Check the remaining account balance, token usage, and active status for a WarungCyber API key.",
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
        "description": "Generate a chat completion using a specified WarungCyber AI model.",
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
                    "description": "The user prompt or query text to complete"
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
        "description": "Get client configuration instructions for Cursor, VS Code, Chatbox, or SDKs.",
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
    model = args.get("model", "deepseek-chat")
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
    guide = f"### Configuration Guide for {client.upper()}\nBase URL: `{BASE_URL}/v1`\nAPI Key: `{api_key}`\nModels: `claude-sonnet-4-6`, `deepseek-reasoner`, `qwen-2.5-coder-32b`, `venice-uncensored`."
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
