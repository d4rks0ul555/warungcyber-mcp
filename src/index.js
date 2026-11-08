#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.WARUNGCYBER_BASE_URL || "https://api.warungcyber.net";
const DEFAULT_API_KEY = process.env.WARUNGCYBER_API_KEY || "";

// 19 SOTA Models Catalog
const GENUINE_MODELS = [
  {
    id: "glm-5.3-uncensored",
    displayName: "GLM 5.3 UNCENSORED",
    provider: "Uncensored",
    category: "ZERO REFUSAL",
    context: "1M",
    speed: "~3-4s",
    priceUsd: { in: 0.60, out: 0.60 },
    priceIdr: { in: 9600, out: 9600 },
    desc: "100% Uncensored LLM with zero refusal guardrails and a 1M token context window at a flat rate. Built for security research, pentesting scripts, and unrestricted creative writing."
  },
  {
    id: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6",
    provider: "Anthropic",
    category: "CODING / PRO",
    context: "200k",
    speed: "~1.4s",
    priceUsd: { in: 3, out: 15 },
    priceIdr: { in: 48000, out: 240000 },
    desc: "World's #1 reasoning & coding model. Perfect for Cursor IDE and complex system refactoring."
  },
  {
    id: "claude-sonnet-3-7",
    displayName: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "HYBRID REASONING",
    context: "200k",
    speed: "~2.4s",
    priceUsd: { in: 3, out: 15 },
    priceIdr: { in: 48000, out: 240000 },
    desc: "Anthropic's hybrid reasoning model for deep algorithmic problem solving."
  },
  {
    id: "claude-opus-4-7",
    displayName: "Claude Opus 4.7",
    provider: "Anthropic",
    category: "DEEP THINKING",
    context: "200k",
    speed: "~1.4s",
    priceUsd: { in: 15, out: 75 },
    priceIdr: { in: 240000, out: 1200000 },
    desc: "Latest-generation Opus for heavy reasoning, agentic coding, and deep analysis."
  },
  {
    id: "gemini-3.7-flash",
    displayName: "Gemini 3.7 Flash",
    provider: "Gemini",
    category: "TEXT / CHAT",
    context: "1M",
    speed: "~1.6s",
    priceUsd: { in: 0.15, out: 0.60 },
    priceIdr: { in: 2400, out: 9600 },
    desc: "Latest Gemini Flash generation: fast, multimodal, and cost-efficient for high-volume use."
  },
  {
    id: "gemini-3-flash",
    displayName: "Gemini 3 Flash",
    provider: "Gemini",
    category: "REASONING",
    context: "1M",
    speed: "< 1s",
    priceUsd: { in: 0.20, out: 0.80 },
    priceIdr: { in: 3200, out: 12800 },
    desc: "Sub-second responses for chat, summarization, and daily coding assistance."
  },
  {
    id: "gemini-3.1-pro",
    displayName: "Google Gemini 3.1 Pro",
    provider: "Gemini",
    category: "DEEP LOGIC",
    context: "2M",
    speed: "~3s",
    priceUsd: { in: 1.25, out: 5 },
    priceIdr: { in: 20000, out: 80000 },
    desc: "Massive 2 Million token context window. Ingests entire codebases, books, and hundreds of PDFs."
  },
  {
    id: "glm-5-3",
    displayName: "GLM 5.3",
    provider: "Zhipu",
    category: "TEXT / CHAT",
    context: "128k",
    speed: "< 1s",
    priceUsd: { in: 0.15, out: 0.60 },
    priceIdr: { in: 2400, out: 9600 },
    desc: "Zhipu's GLM 5.3 flagship: top-tier reasoning & coding at sub-second speed."
  },
  {
    id: "deepseek-v4-flash",
    displayName: "DeepSeek V4 Flash",
    provider: "DeepSeek",
    category: "OFFICIAL SOTA",
    context: "128k",
    speed: "< 1s",
    priceUsd: { in: 0.14, out: 0.28 },
    priceIdr: { in: 2240, out: 4480 },
    desc: "Successor to DeepSeek Chat: smarter, still extremely cheap and very fast."
  },
  {
    id: "deepseek-r1",
    displayName: "DeepSeek R1",
    provider: "DeepSeek",
    category: "REASONING",
    context: "128k",
    speed: "~3.2s",
    priceUsd: { in: 0.55, out: 2.19 },
    priceIdr: { in: 8800, out: 35040 },
    desc: "SOTA reasoning model with full Chain-of-Thought deliberation (rivals OpenAI o1)."
  },
  {
    id: "qwen3-coder-480b",
    displayName: "Qwen3 Coder 480B",
    provider: "Qwen",
    category: "TOP CODING",
    context: "256k",
    speed: "< 0.5s",
    priceUsd: { in: 0.07, out: 0.16 },
    priceIdr: { in: 1120, out: 2560 },
    desc: "The strongest open-weights coding model: Qwen3 Coder 480B Turbo. Accurate refactoring and debugging in VS Code/Cursor."
  },
  {
    id: "qwen-3.5-397b",
    displayName: "Qwen 3.5 397B",
    provider: "Qwen",
    category: "FLAGSHIP LLM",
    context: "256k",
    speed: "< 1s",
    priceUsd: { in: 0.12, out: 0.39 },
    priceIdr: { in: 1920, out: 6240 },
    desc: "Flagship open-weight Qwen 3.5 397B for frontier-class general and coding capability."
  },
  {
    id: "claude-haiku-4-5",
    displayName: "Claude Haiku 4.5",
    provider: "Anthropic",
    category: "FAST CLAUDE",
    context: "200k",
    speed: "~1.6s",
    priceUsd: { in: 0.25, out: 1.25 },
    priceIdr: { in: 4000, out: 20000 },
    desc: "Fastest, cheapest Claude 4.5 for classification, chat, and data extraction."
  },
  {
    id: "kimi-k2-6",
    displayName: "Kimi K2.6",
    provider: "Moonshot",
    category: "RESEARCH",
    context: "256k",
    speed: "~1.4s",
    priceUsd: { in: 0.50, out: 2 },
    priceIdr: { in: 8000, out: 32000 },
    desc: "Moonshot's Kimi K2.6: agentic coding and tool-use reasoning with a 256k context window."
  },
  {
    id: "claude-opus-5",
    displayName: "Claude Opus 5",
    provider: "Anthropic",
    category: "DEEP THINKING",
    context: "200k",
    speed: "~1.4s",
    priceUsd: { in: 15, out: 75 },
    priceIdr: { in: 240000, out: 1200000 },
    desc: "Anthropic's generation-5 flagship: the strongest reasoning and agentic coding model available."
  },
  {
    id: "claude-sonnet-5",
    displayName: "Claude Sonnet 5",
    provider: "Anthropic",
    category: "CODING / PRO",
    context: "200k",
    speed: "~1.1s",
    priceUsd: { in: 3, out: 15 },
    priceIdr: { in: 48000, out: 240000 },
    desc: "Generation-5 Sonnet flagship: the best balance of speed, coding, and reasoning for daily pro work."
  },
  {
    id: "deepseek-v4-pro",
    displayName: "DeepSeek V4 Pro",
    provider: "DeepSeek",
    category: "OFFICIAL SOTA",
    context: "128k",
    speed: "~1.5s",
    priceUsd: { in: 0.55, out: 2.19 },
    priceIdr: { in: 8800, out: 35040 },
    desc: "The Pro flagship of the DeepSeek V4 series for heavy reasoning and coding."
  },
  {
    id: "qwen3-max",
    displayName: "Qwen3 Max",
    provider: "Qwen",
    category: "FLAGSHIP LLM",
    context: "256k",
    speed: "~3.9s",
    priceUsd: { in: 0.12, out: 0.39 },
    priceIdr: { in: 1920, out: 6240 },
    desc: "Alibaba's Qwen3 Max flagship: the strongest Qwen for reasoning, coding, and agents."
  },
  {
    id: "kimi-k3",
    displayName: "Kimi K3",
    provider: "Moonshot",
    category: "FLAGSHIP LLM",
    context: "256k",
    speed: "< 1s",
    priceUsd: { in: 0.50, out: 2 },
    priceIdr: { in: 8000, out: 32000 },
    desc: "Moonshot's Kimi K3 flagship: the fastest agentic coding and tool-use model in its class."
  }
];

const AVAILABLE_MODEL_IDS = [
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
];

const server = new McpServer({
  name: "warungcyber-mcp",
  version: "1.0.1"
});

// 1. Tool: List Models
server.tool(
  "warungcyber_list_models",
  "List available AI models from the WarungCyber AI Gateway, including context window limits, token pricing (USD and IDR), and capability categories. Read-only operation.",
  {
    category: z.enum(["ALL", "CODING", "REASONING", "UNCENSORED", "VISION", "CHEAP"]).optional().describe("Filter models by capability category"),
    format: z.enum(["markdown", "json"]).optional().describe("Output format for the model list (default: markdown)")
  },
  async ({ category = "ALL", format = "markdown" }) => {
    let filtered = GENUINE_MODELS;
    if (category === "CODING") {
      filtered = filtered.filter(m => m.category.includes("CODING") || m.id.includes("coder") || m.id.includes("claude"));
    } else if (category === "REASONING") {
      filtered = filtered.filter(m => m.category.includes("REASONING") || m.category.includes("THINKING") || m.id.includes("reasoner"));
    } else if (category === "UNCENSORED") {
      filtered = filtered.filter(m => m.category.includes("ZERO REFUSAL") || m.id.includes("uncensored"));
    } else if (category === "VISION") {
      filtered = filtered.filter(m => m.category.includes("IMAGE"));
    } else if (category === "CHEAP") {
      filtered = filtered.filter(m => m.priceUsd.in <= 0.20);
    }

    if (format === "json") {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ gateway: BASE_URL, total: filtered.length, models: filtered }, null, 2)
        }]
      };
    }

    let md = `### 🌐 WarungCyber AI Gateway — 19 SOTA Models Catalog\n`;
    md += `**Gateway Base URL:** \`${BASE_URL}/v1\` (100% OpenAI-compatible SDK standard)\n`;
    md += `**Co-Location:** Jakarta Datacenter (< 20ms Latency) • **Pricing:** Pay-as-you-go from $1.00 USD (Rp 18,000)\n\n`;
    md += `| Model ID | Provider | Context | Speed | Input / 1M | Output / 1M | Specialization |\n`;
    md += `| :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n`;

    for (const m of filtered) {
      md += `| \`${m.id}\` | **${m.provider}** | ${m.context} | ${m.speed} | $${m.priceUsd.in.toFixed(2)} (Rp ${m.priceIdr.in.toLocaleString()}) | $${m.priceUsd.out.toFixed(2)} (Rp ${m.priceIdr.out.toLocaleString()}) | ${m.desc.slice(0, 65)}... |\n`;
    }

    md += `\n💡 *To use any model, set OpenAI SDK base_url to \`${BASE_URL}/v1\` and pass your WarungCyber API key.*`;
    return { content: [{ type: "text", text: md }] };
  }
);

// 2. Tool: Check Balance
server.tool(
  "warungcyber_check_balance",
  "Retrieve remaining account balance (USD/IDR), cumulative token consumption, and active account status for a WarungCyber API key via an external gateway API call. Read-only operation.",
  {
    apiKey: z.string().describe("WarungCyber API key (starts with sk-wc-)")
  },
  async ({ apiKey }) => {
    const keyToUse = apiKey || DEFAULT_API_KEY;
    if (!keyToUse) {
      return {
        content: [{
          type: "text",
          text: "❌ Error: API Key is required. Please pass your WarungCyber API key or set WARUNGCYBER_API_KEY environment variable."
        }]
      };
    }

    try {
      const resp = await fetch(`${BASE_URL}/api/check-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyToUse.trim() })
      });

      const data = await resp.json();
      if (data.status === "ok") {
        const d = data.data;
        let text = `### 💳 WarungCyber Account Balance & Telemetry\n\n`;
        text += `- **Account Name:** ${d.name}\n`;
        text += `- **Status:** 🟢 **${d.status.toUpperCase()}**\n`;
        text += `- **Remaining Balance:** **${d.balance_usd}** (${d.balance_idr})\n`;
        text += `- **Total Tokens Consumed:** \`${d.tokens_used.toLocaleString()}\` tokens\n`;
        text += `- **Gateway Endpoint:** \`${BASE_URL}/v1\`\n`;
        text += `- **Server Co-Location:** Jakarta Datacenter (< 20ms latency)\n`;
        text += `- **Balance Expiry:** **NEVER EXPIRES** (Lifetime pay-as-you-go)\n`;
        return { content: [{ type: "text", text }] };
      } else {
        return {
          content: [{
            type: "text",
            text: `❌ ${data.message || "API key not found or inactive in WarungCyber system."}`
          }]
        };
      }
    } catch (err) {
      return {
        content: [{
          type: "text",
          text: `❌ Connection error: Unable to reach WarungCyber server at ${BASE_URL}: ${err.message}`
        }]
      };
    }
  }
);

// 3. Tool: Chat Completion
server.tool(
  "warungcyber_chat_completion",
  "Send a chat completion prompt to a selected WarungCyber AI model via external HTTP API call. Consumes account token balance based on prompt and completion length. Requires an active WarungCyber API key (sk-wc-...). Returns generated text and token usage metrics.",
  {
    model: z.enum([
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
    ]).describe("Target AI model identifier to execute"),
    prompt: z.string().min(1).describe("The user prompt, task instruction, or code snippet to complete"),
    systemPrompt: z.string().optional().describe("Optional system instruction or persona definition"),
    temperature: z.number().min(0).max(2).optional().describe("Sampling temperature between 0.0 and 2.0 (default: 0.7)"),
    maxTokens: z.number().int().min(1).max(32000).optional().describe("Maximum completion tokens to generate (default: 2048)"),
    apiKey: z.string().optional().describe("WarungCyber API key (starts with sk-wc-). Uses WARUNGCYBER_API_KEY environment variable if omitted.")
  },
  async ({ model, prompt, systemPrompt, temperature = 0.7, maxTokens = 2048, apiKey }) => {
    const keyToUse = apiKey || DEFAULT_API_KEY;
    if (!keyToUse) {
      return {
        content: [{
          type: "text",
          text: "❌ Error: API Key required. Pass 'apiKey' argument or configure WARUNGCYBER_API_KEY environment variable."
        }]
      };
    }

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const t0 = Date.now();
      const resp = await fetch(`${BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${keyToUse.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model.trim(),
          messages,
          temperature,
          max_tokens: maxTokens
        })
      });

      const latencyMs = Date.now() - t0;
      if (!resp.ok) {
        const errText = await resp.text();
        return {
          content: [{
            type: "text",
            text: `❌ Gateway Error (HTTP ${resp.status}): ${errText}`
          }]
        };
      }

      const resJson = await resp.json();
      const content = resJson.choices?.[0]?.message?.content || "";
      const usage = resJson.usage || {};

      let result = `${content}\n\n`;
      result += `---\n`;
      result += `⚡ **Model:** \`${model}\` | **Latency:** \`${latencyMs}ms\` | **Tokens:** Prompt: \`${usage.prompt_tokens || 0}\`, Completion: \`${usage.completion_tokens || 0}\`, Total: \`${usage.total_tokens || 0}\``;

      return { content: [{ type: "text", text: result }] };
    } catch (err) {
      return {
        content: [{
          type: "text",
          text: `❌ Execution failed: ${err.message}`
        }]
      };
    }
  }
);

// 4. Tool: Get Setup Guide
server.tool(
  "warungcyber_get_setup_guide",
  "Generate formatted Markdown setup guides and copy-paste configuration snippets for integrating WarungCyber into Cursor IDE, VS Code Continue, Cline, Chatbox, or Python and Node.js SDKs. Embeds the provided API key (or placeholder if omitted) directly into the code sample. Read-only operation.",
  {
    client: z.enum(["cursor", "continue", "cline", "chatbox", "python", "node", "claude_desktop"]).describe("Target client application or development environment"),
    apiKey: z.string().optional().describe("WarungCyber API key to embed in the configuration snippet")
  },
  async ({ client, apiKey = "sk-wc-YOUR_KEY_HERE" }) => {
    let guide = "";

    if (client === "cursor") {
      guide = `### 💻 Cursor IDE Setup Guide

1. Open **Cursor Settings** (Gear icon) ➔ **Models**.
2. Enable **OpenAI API Key** and set:
   - **OpenAI Base URL:** \`${BASE_URL}/v1\`
   - **API Key:** \`${apiKey}\`
3. Add any model name from our catalog, e.g.:
   - \`claude-sonnet-4-6\`
   - \`deepseek-r1\`
   - \`qwen3-coder-480b\`
   - \`glm-5.3-uncensored\`
4. Click **Verify** ➔ Ready to code! 🚀`;
    } else if (client === "continue") {
      guide = `### 💻 VS Code Continue Extension (\`~/.continue/config.json\`)

\`\`\`json
{
  "models": [
    {
      "title": "Claude Sonnet 4.6 (WarungCyber)",
      "provider": "openai",
      "model": "claude-sonnet-4-6",
      "apiBase": "${BASE_URL}/v1",
      "apiKey": "${apiKey}"
    },
    {
      "title": "DeepSeek R1 Reasoning (WarungCyber)",
      "provider": "openai",
      "model": "deepseek-r1",
      "apiBase": "${BASE_URL}/v1",
      "apiKey": "${apiKey}"
    },
    {
      "title": "Qwen3 Coder 480B (WarungCyber)",
      "provider": "openai",
      "model": "qwen3-coder-480b",
      "apiBase": "${BASE_URL}/v1",
      "apiKey": "${apiKey}"
    },
    {
      "title": "GLM 5.3 Uncensored (WarungCyber)",
      "provider": "openai",
      "model": "glm-5.3-uncensored",
      "apiBase": "${BASE_URL}/v1",
      "apiKey": "${apiKey}"
    }
  ]
}
\`\`\``;
    } else if (client === "python") {
      guide = `### 🐍 Python SDK Integration

\`\`\`python
from openai import OpenAI

client = OpenAI(
    base_url="${BASE_URL}/v1",
    api_key="${apiKey}"
)

# Call any of 19 SOTA models:
response = client.chat.completions.create(
    model="deepseek-r1",  # or claude-sonnet-4-6, glm-5.3-uncensored, qwen3-coder-480b
    messages=[
        {"role": "system", "content": "You are an elite coding assistant."},
        {"role": "user", "content": "Optimize this binary search algorithm in Python."}
    ]
)

print(response.choices[0].message.content)
\`\`\``;
    } else if (client === "node") {
      guide = `### 🟢 Node.js / TypeScript Integration

\`\`\`javascript
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "${BASE_URL}/v1",
  apiKey: "${apiKey}"
});

const completion = await openai.chat.completions.create({
  model: "claude-sonnet-4-6",
  messages: [{ role: "user", content: "Write a high-performance HTTP microservice in Go." }]
});

console.log(completion.choices[0].message.content);
\`\`\``;
    } else if (client === "claude_desktop") {
      guide = `### 🤖 Claude Desktop MCP Integration (\`claude_desktop_config.json\`)

Add this block under \`"mcpServers"\`:

\`\`\`json
{
  "mcpServers": {
    "warungcyber": {
      "command": "npx",
      "args": ["-y", "warungcyber-mcp"],
      "env": {
        "WARUNGCYBER_API_KEY": "${apiKey}"
      }
    }
  }
}
\`\`\``;
    } else {
      guide = `### 💬 Chatbox / NextChat / Cherry Studio Setup

1. Open App **Settings** ➔ **Model Provider**.
2. Select **OpenAI Custom API**.
3. Set **API Host / Base URL:** \`${BASE_URL}/v1\`
4. Set **API Key:** \`${apiKey}\`
5. Custom Models: \`claude-sonnet-4-6\`, \`deepseek-r1\`, \`glm-5.3-uncensored\`, \`gemini-3.1-pro\`.`;
    }

    return { content: [{ type: "text", text: guide }] };
  }
);

// Start server on stdio
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error("Fatal MCP server error:", err);
  process.exit(1);
});
