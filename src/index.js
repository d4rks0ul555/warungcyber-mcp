#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.WARUNGCYBER_BASE_URL || "https://api.warungcyber.net";
const DEFAULT_API_KEY = process.env.WARUNGCYBER_API_KEY || "";

// 19 SOTA Models Catalog
const GENUINE_MODELS = [
  {
    id: "claude-sonnet-4-6",
    displayName: "Claude Sonnet 4.6 (Thinking)",
    provider: "Anthropic",
    category: "CODING / PRO",
    context: "200k",
    speed: "< 1.4s",
    priceUsd: { in: 3.00, out: 15.00 },
    priceIdr: { in: 48000, out: 240000 },
    desc: "World's #1 reasoning & coding model. Perfect for Cursor IDE and complex system refactoring."
  },
  {
    id: "claude-sonnet-3-7",
    displayName: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "HYBRID REASONING",
    context: "200k",
    speed: "< 2.0s",
    priceUsd: { in: 3.00, out: 15.00 },
    priceIdr: { in: 48000, out: 240000 },
    desc: "Anthropic's hybrid reasoning model for deep algorithmic problem solving."
  },
  {
    id: "claude-opus-4-6-thinking",
    displayName: "Claude Opus 4.6 Thinking",
    provider: "Anthropic",
    category: "DEEP THINKING",
    context: "200k",
    speed: "~8.0s",
    priceUsd: { in: 15.00, out: 75.00 },
    priceIdr: { in: 240000, out: 1200000 },
    desc: "High-level architectural audit and formal reasoning engine."
  },
  {
    id: "claude-3-haiku",
    displayName: "Claude 3 Haiku (Fast)",
    provider: "Anthropic",
    category: "FAST CLAUDE",
    context: "200k",
    speed: "< 500ms",
    priceUsd: { in: 0.25, out: 1.25 },
    priceIdr: { in: 4000, out: 20000 },
    desc: "Ultra-fast, lightweight Claude model for real-time bots and streaming."
  },
  {
    id: "deepseek-reasoner",
    displayName: "DeepSeek R1 (Deep Reasoning)",
    provider: "DeepSeek",
    category: "REASONING",
    context: "128k",
    speed: "Deep Chain",
    priceUsd: { in: 0.55, out: 2.19 },
    priceIdr: { in: 8800, out: 35040 },
    desc: "SOTA open reasoning model with full Chain-of-Thought deliberation (rivals OpenAI o1)."
  },
  {
    id: "deepseek-chat",
    displayName: "DeepSeek V3 (Chat & Code)",
    provider: "DeepSeek",
    category: "OFFICIAL SOTA",
    context: "128k",
    speed: "< 800ms",
    priceUsd: { in: 0.14, out: 0.28 },
    priceIdr: { in: 2240, out: 4480 },
    desc: "Fastest general intelligence and code generation model with incredible cost efficiency."
  },
  {
    id: "qwen-2.5-coder-32b",
    displayName: "Qwen 2.5 Coder 32B",
    provider: "Alibaba / Qwen",
    category: "TOP CODING",
    context: "128k",
    speed: "< 700ms",
    priceUsd: { in: 0.07, out: 0.16 },
    priceIdr: { in: 1120, out: 2560 },
    desc: "World's top open-weights coding model. Fast refactoring and debugging in VS Code/Cursor."
  },
  {
    id: "qwen-2.5-72b",
    displayName: "Qwen 2.5 72B Instruct",
    provider: "Alibaba / Qwen",
    category: "FLAGSHIP LLM",
    context: "128k",
    speed: "< 1.2s",
    priceUsd: { in: 0.12, out: 0.39 },
    priceIdr: { in: 1920, out: 6240 },
    desc: "Flagship 72B parameter model for high-accuracy reasoning and multilingual writing."
  },
  {
    id: "venice-uncensored",
    displayName: "Venice Uncensored (Dolphin 24B)",
    provider: "Uncensored",
    category: "ZERO REFUSAL",
    context: "128k",
    speed: "< 750ms",
    priceUsd: { in: 0.60, out: 2.20 },
    priceIdr: { in: 9600, out: 35200 },
    desc: "100% Uncensored LLM with zero moralizing or refusal guardrails. Built for security research, pentesting scripts, exploit payload analysis, and unrestricted creative writing."
  },
  {
    id: "gemini-3.1-pro",
    displayName: "Google Gemini 3.1 Pro",
    provider: "Google",
    category: "DEEP LOGIC",
    context: "2M (Huge)",
    speed: "< 1.8s",
    priceUsd: { in: 1.25, out: 5.00 },
    priceIdr: { in: 20000, out: 80000 },
    desc: "Massive 2 Million token context window. Ingests entire codebases, books, and hundreds of PDFs."
  },
  {
    id: "gemini-3.8-flash",
    displayName: "Google Gemini 3.8 Flash",
    provider: "Google",
    category: "TEXT / CHAT",
    context: "1M",
    speed: "< 3.5s",
    priceUsd: { in: 0.15, out: 0.60 },
    priceIdr: { in: 24000, out: 9600 },
    desc: "Ultra-fast generation with 1M context window for high-throughput applications."
  },
  {
    id: "gemini-3.7-flash",
    displayName: "Google Gemini 3.7 Flash High",
    provider: "Google",
    category: "REASONING",
    context: "1M",
    speed: "< 3.0s",
    priceUsd: { in: 0.20, out: 0.80 },
    priceIdr: { in: 3200, out: 12800 },
    desc: "Flash reasoning model with structured chain of thought."
  },
  {
    id: "gemini-3.6-flash",
    displayName: "Google Gemini 3.6 Flash",
    provider: "Google",
    category: "TEXT / CHAT",
    context: "1M",
    speed: "< 4.0s",
    priceUsd: { in: 0.15, out: 0.60 },
    priceIdr: { in: 2400, out: 9600 },
    desc: "Standard reliable fast generation for web and conversational bots."
  },
  {
    id: "gemma-4-31b-it",
    displayName: "Gemma 4 31B IT",
    provider: "Google",
    category: "OPEN SOTA",
    context: "128k",
    speed: "< 1.0s",
    priceUsd: { in: 0.10, out: 0.30 },
    priceIdr: { in: 1600, out: 4800 },
    desc: "Google's open-weights model for high-efficiency processing."
  },
  {
    id: "gpt-4o-mini",
    displayName: "OpenAI GPT-4o Mini",
    provider: "OpenAI",
    category: "FAST & CHEAP",
    context: "128k",
    speed: "< 600ms",
    priceUsd: { in: 0.15, out: 0.60 },
    priceIdr: { in: 2400, out: 9600 },
    desc: "Official fast lightweight model from OpenAI."
  },
  {
    id: "llama-3.3-70b",
    displayName: "Meta Llama 3.3 70B",
    provider: "Meta",
    category: "SOTA OPEN",
    context: "128k",
    speed: "< 1.0s",
    priceUsd: { in: 0.12, out: 0.30 },
    priceIdr: { in: 1920, out: 4800 },
    desc: "Meta's most intelligent open model matching GPT-4o capabilities."
  },
  {
    id: "gpt-oss-120b",
    displayName: "GPT-OSS 120B Ultra-Fast",
    provider: "Open-Weights",
    category: "MICROSERVICE",
    context: "128k",
    speed: "< 850ms",
    priceUsd: { in: 0.10, out: 0.40 },
    priceIdr: { in: 1600, out: 6400 },
    desc: "Sub-second text processing for real-time classification and pipelines."
  },
  {
    id: "atria-dawn-preview",
    displayName: "Atria Dawn ASI Preview",
    provider: "Atria ASI",
    category: "RESEARCH",
    context: "128k",
    speed: "~15s",
    priceUsd: { in: 0.50, out: 2.00 },
    priceIdr: { in: 8000, out: 32000 },
    desc: "Next-gen ASI mathematical logic and autonomous deliberation."
  },
  {
    id: "gemini-2.5-flash-image",
    displayName: "Google Imagen / Flash Image",
    provider: "ImageGen",
    category: "TEXT TO IMAGE",
    context: "Image Mode",
    speed: "< 2.5s",
    priceUsd: { in: 0.05, out: 0.05 },
    priceIdr: { in: 800, out: 800 },
    desc: "Generates high-resolution photorealistic images directly from prompt ($0.05 / Rp 800 per image)."
  }
];

const server = new McpServer({
  name: "warungcyber-mcp",
  version: "1.0.0"
});

// 1. Tool: List Models
server.tool(
  "warungcyber_list_models",
  "List all 19 SOTA AI models available on WarungCyber AI Gateway with real-time pricing (USD & IDR), context windows, latencies, and category tags.",
  {
    category: z.enum(["ALL", "CODING", "REASONING", "UNCENSORED", "VISION", "CHEAP"]).optional().describe("Filter models by capability"),
    format: z.enum(["json", "markdown"]).optional().describe("Output formatting (default: markdown)")
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
    md += `**Co-Location:** Jakarta Datacenter (< 20ms Latency) • **Pricing:** Pay-as-you-go from $1.00 USD (Rp 16,000)\n\n`;
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
  "Inspect live remaining balance (USD & IDR), active account status, and token usage history for a WarungCyber API key.",
  {
    apiKey: z.string().describe("Your WarungCyber API key (e.g. sk-wc-...)")
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
  "Execute an AI completion or reasoning task using any of WarungCyber's 19 SOTA models (Claude Sonnet 4.6, DeepSeek R1, Qwen Coder, Venice Uncensored, etc.).",
  {
    model: z.string().describe("Model ID (e.g. claude-sonnet-4-6, deepseek-reasoner, qwen-2.5-coder-32b, venice-uncensored, gemini-3.1-pro)"),
    prompt: z.string().describe("User prompt or instruction"),
    systemPrompt: z.string().optional().describe("Optional system instruction"),
    apiKey: z.string().optional().describe("WarungCyber API key (optional if WARUNGCYBER_API_KEY env set)"),
    temperature: z.number().min(0).max(2).optional().describe("Sampling temperature (default: 0.7)"),
    maxTokens: z.number().optional().describe("Maximum completion tokens")
  },
  async ({ model, prompt, systemPrompt, apiKey, temperature = 0.7, maxTokens = 2048 }) => {
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
  "Generate instant copy-paste configuration snippets for Cursor IDE, VS Code Continue, Cline, Chatbox, or Python/Node.js SDKs.",
  {
    client: z.enum(["cursor", "continue", "cline", "chatbox", "python", "node", "claude_desktop"]).describe("Target client or tool"),
    apiKey: z.string().optional().describe("Your WarungCyber API key to embed in snippet")
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
   - \`deepseek-reasoner\`
   - \`qwen-2.5-coder-32b\`
   - \`venice-uncensored\`
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
      "model": "deepseek-reasoner",
      "apiBase": "${BASE_URL}/v1",
      "apiKey": "${apiKey}"
    },
    {
      "title": "Qwen 2.5 Coder 32B (WarungCyber)",
      "provider": "openai",
      "model": "qwen-2.5-coder-32b",
      "apiBase": "${BASE_URL}/v1",
      "apiKey": "${apiKey}"
    },
    {
      "title": "Venice Dolphin 24B Uncensored (WarungCyber)",
      "provider": "openai",
      "model": "venice-uncensored",
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
    model="deepseek-reasoner",  # or claude-sonnet-4-6, venice-uncensored, qwen-2.5-coder-32b
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
5. Custom Models: \`claude-sonnet-4-6\`, \`deepseek-reasoner\`, \`venice-uncensored\`, \`gemini-3.1-pro\`.`;
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
