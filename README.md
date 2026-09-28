# WarungCyber AI Gateway — Official MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-1.6.1-purple.svg)](https://modelcontextprotocol.io)
[![Registry: Glama](https://img.shields.io/badge/Glama-Listed-orange.svg)](https://glama.ai/mcp/servers)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org)

The official **Model Context Protocol (MCP)** server for **WarungCyber AI Gateway** (`api.warungcyber.net`). 

Connect **Claude Desktop**, **Cursor IDE**, **VS Code (Continue)**, **Cline**, **Roo Code**, **Windsurf**, and autonomous agents directly to **19 SOTA AI Models** (Claude 4.6 Thinking, DeepSeek R1 Reasoning, Qwen 2.5 Coder, and 100% Uncensored Venice Dolphin 24B) with pay-as-you-go retail pricing starting from **$1.00 USD (Rp 16,000)** via instant QRIS / E-Wallet payments.

---

## 🌟 Key Features

* **19 SOTA AI Models Available:**
  * 👑 **Anthropic:** `claude-sonnet-4-6` (Thinking), `claude-sonnet-3-7`, `claude-opus-4-6-thinking`, `claude-3-haiku`
  * 🧠 **DeepSeek:** `deepseek-reasoner` (R1 Chain-of-Thought), `deepseek-chat` (V3 Code & Chat)
  * 💻 **Alibaba / Qwen:** `qwen-2.5-coder-32b`, `qwen-2.5-72b`
  * 🔓 **Uncensored (Zero Refusal):** `venice-uncensored` (Dolphin Mistral 24B — No moralizing guardrails, designed for pentest, security research & unrestricted writing)
  * 🌐 **Google:** `gemini-3.1-pro` (2M Context Window), `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-2.5-flash-image` (Image Generation)
  * 🟢 **OpenAI & Meta:** `gpt-4o-mini`, `llama-3.3-70b`, `gpt-oss-120b`, `atria-dawn-preview`
* **Sub-20ms Co-Location:** Hosted on Tencent Cloud Jakarta Datacenter for ultra-low latency.
* **Non-Expiring Balance:** Pay only for consumed tokens; balance never expires.
* **Standard OpenAI Format:** Base URL `https://api.warungcyber.net/v1`.

---

## 🚀 Quick Start (Claude Desktop)

Add the following configuration to your `claude_desktop_config.json`:

* **MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "warungcyber": {
      "command": "npx",
      "args": ["-y", "warungcyber-mcp"],
      "env": {
        "WARUNGCYBER_API_KEY": "sk-wc-YOUR_API_KEY_HERE"
      }
    }
  }
}
```

> *Don't have an API key? Get one instantly from [https://api.warungcyber.net](https://api.warungcyber.net) starting at $1.00 USD (Rp 16,000).*

---

## 🛠️ MCP Tools Provided

### 1. `warungcyber_list_models`
Lists all 19 available models with live pricing (USD & IDR), context window sizes, inference latencies, and category badges.
* **Arguments:**
  * `category` *(optional)*: `"ALL"` | `"CODING"` | `"REASONING"` | `"UNCENSORED"` | `"VISION"` | `"CHEAP"`
  * `format` *(optional)*: `"markdown"` | `"json"`

### 2. `warungcyber_check_balance`
Inspect live remaining balance (USD & IDR), total tokens consumed, active account status, and server latency.
* **Arguments:**
  * `apiKey` *(string)*: Your WarungCyber API Key (`sk-wc-...`).

### 3. `warungcyber_chat_completion`
Execute an AI reasoning, coding, or text generation task through any model in the WarungCyber fleet.
* **Arguments:**
  * `model` *(string)*: e.g. `"claude-sonnet-4-6"`, `"deepseek-reasoner"`, `"venice-uncensored"`, `"qwen-2.5-coder-32b"`
  * `prompt` *(string)*: Task or query instruction
  * `systemPrompt` *(optional string)*: Custom system behavior
  * `temperature` *(optional number)*: Sampling temperature (0.0 to 2.0)
  * `maxTokens` *(optional number)*: Maximum tokens to generate

### 4. `warungcyber_get_setup_guide`
Generates instant copy-paste configuration files for Cursor IDE, VS Code Continue, Cline, Roo Code, Python, and Node.js SDKs.
* **Arguments:**
  * `client`: `"cursor"` | `"continue"` | `"cline"` | `"chatbox"` | `"python"` | `"node"` | `"claude_desktop"`
  * `apiKey` *(optional string)*: Your API key to auto-fill into configs

---

## 💻 Manual Installation & CLI

```bash
# Run standalone stdio server
npx -y warungcyber-mcp

# Or install globally
npm install -g warungcyber-mcp
warungcyber-mcp
```

---

## 🔒 Security & Privacy

* **Direct Gateway Traffic:** All API calls are securely routed over HTTPS with TLS 1.3 to `https://api.warungcyber.net/v1`.
* **Zero Logging of Sensitive Prompts:** Complies with zero-retention policies for enterprise and pentesting research.

---

## 🌐 Links & Resources

* 🏪 **Official Storefront & Top-Up:** [https://api.warungcyber.net](https://api.warungcyber.net)
* 📖 **API Documentation:** [https://api.warungcyber.net/#docs](https://api.warungcyber.net/#docs)
* 💬 **Live Customer Support:** Available 24/7 on website.
* 📦 **MCP Registry Listing:** [https://glama.ai/mcp/servers](https://glama.ai/mcp/servers)

---

### License
MIT © 2026 WarungCyber (api.warungcyber.net)
