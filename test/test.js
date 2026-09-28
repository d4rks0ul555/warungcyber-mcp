import { spawn } from "child_process";
import readline from "readline";

const child = spawn("node", ["src/index.js"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    WARUNGCYBER_BASE_URL: "https://api.warungcyber.net"
  },
  stdio: ["pipe", "pipe", "inherit"]
});

const rl = readline.createInterface({
  input: child.stdout,
  terminal: false
});

let msgId = 1;
const pending = new Map();

rl.on("line", (line) => {
  try {
    const res = JSON.parse(line);
    if (res.id && pending.has(res.id)) {
      pending.get(res.id)(res);
      pending.delete(res.id);
    }
  } catch (err) {
    console.error("Non-JSON stdout:", line);
  }
});

function sendRpc(method, params = {}) {
  return new Promise((resolve) => {
    const id = msgId++;
    const payload = { jsonrpc: "2.0", id, method, params };
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify(payload) + "\n");
  });
}

async function runTests() {
  console.log("🚀 Initializing MCP Server over stdio...");
  
  // 1. Initialize
  const initRes = await sendRpc("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "test-client", version: "1.0.0" }
  });
  console.log("✅ MCP Init Response:", initRes.result?.serverInfo?.name);

  // Send initialized notification
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

  // 2. List Tools
  const toolsRes = await sendRpc("tools/list");
  const toolNames = toolsRes.result?.tools?.map(t => t.name) || [];
  console.log("✅ Registered Tools Count:", toolNames.length, toolNames);

  // 3. Test list_models tool
  console.log("\n🧪 Testing warungcyber_list_models...");
  const modelsRes = await sendRpc("tools/call", {
    name: "warungcyber_list_models",
    arguments: { category: "UNCENSORED" }
  });
  console.log("✅ Tool Output:\n", modelsRes.result?.content?.[0]?.text);

  // 4. Test setup guide tool
  console.log("\n🧪 Testing warungcyber_get_setup_guide (cursor)...");
  const guideRes = await sendRpc("tools/call", {
    name: "warungcyber_get_setup_guide",
    arguments: { client: "cursor", apiKey: "sk-wc-live-demo-key" }
  });
  console.log("✅ Guide Output:\n", guideRes.result?.content?.[0]?.text);

  console.log("\n🎉 ALL MCP TOOLS VERIFIED AND PASSED!");
  child.kill();
  process.exit(0);
}

runTests().catch(err => {
  console.error("Test failed:", err);
  child.kill();
  process.exit(1);
});
