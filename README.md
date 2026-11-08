# WarungCyber AI Gateway — Official MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-1.6.1-purple.svg)](https://modelcontextprotocol.io)
[![Registry: Glama](https://img.shields.io/badge/Glama-Listed-orange.svg)](https://glama.ai/mcp/servers)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org)

The official **Model Context Protocol (MCP)** server for **WarungCyber AI Gateway** (`api.warungcyber.net`). 

Connect **Claude Desktop**, **Cursor IDE**, **VS Code (Continue)**, **Cline**, **Roo Code**, **Windsurf**, and autonomous agents directly to **19 SOTA AI Models** (Claude Sonnet 4.6, DeepSeek V4 Pro, Qwen3 Coder 480B, and 100% Uncensored GLM 5.3) with pay-as-you-go retail pricing starting from **$1.00 USD (Rp 18,000)** via instant QRIS / E-Wallet payments.

---

## 🌟 Key Features

* **19 SOTA AI Models Available:**
  * 👑 **Anthropic:** `claude-sonnet-4-6`, `claude-sonnet-3-7`, `claude-opus-4-7`, `claude-opus-5`, `claude-sonnet-5`, `claude-haiku-4-5`
  * 🧠 **DeepSeek:** `deepseek-v4-flash`, `deepseek-v4-pro`, `deepseek-r1` (Reasoning)
  * 💻 **Alibaba / Qwen:** `qwen3-coder-480b`, `qwen-3.5-397b`, `qwen3-max`
  * 🔓 **Uncensored (Zero Refusal):** `glm-5.3-uncensored` (GLM 5.3 Uncensored — No moralizing guardrails, designed for pentest, security research & unrestricted writing)
  * 🌐 **Google:** `gemini-3.1-pro` (2M Context Window), `gemini-3.7-flash`, `gemini-3-flash`
  * 🌙 **Moonshot & Zhipu:** `kimi-k2-6`, `kimi-k3`, `glm-5-3`
* **Sub-20ms Co-Location:** Hosted on Tencent Cloud Jakarta Datacenter for ultra-low latency.
* **Non-Expiring Balance:** Pay only for consumed tokens; balance never expires.
* **Standard OpenAI Format:** Base URL `https://api.warungcyber.net/v1`.

---

## 🚀 Quick Start (Claude Desktop)

Clone and install the server first:

```bash
git clone https://github.com/d4rks0ul555/warungcyber-mcp.git
cd warungcyber-mcp
npm install
```

Then add the following configuration to your `claude_desktop_config.json`:

* **MacOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
* **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "warungcyber": {
      "command": "node",
      "args": ["/absolute/path/to/warungcyber-mcp/src/index.js"],
      "env": {
        "WARUNGCYBER_API_KEY": "sk-wc-YOUR_API_KEY_HERE"
      }
    }
  }
}
```

> *Don't have an API key? Get one instantly from [https://api.warungcyber.net](https://api.warungcyber.net) starting at $1.00 USD (Rp 18,000).*

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
  * `model` *(string)*: e.g. `"claude-sonnet-4-6"`, `"deepseek-r1"`, `"glm-5.3-uncensored"`, `"qwen3-coder-480b"`
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
# Clone the repository and install dependencies
git clone https://github.com/d4rks0ul555/warungcyber-mcp.git
cd warungcyber-mcp
npm install

# Run the standalone stdio server (Node.js)
node src/index.js

# Or run the Python implementation
python3 warungcyber_mcp.py
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
