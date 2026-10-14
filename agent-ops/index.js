import "./llm/ollamaClient.js"; // Must be imported first to set default client
import { run } from "@openai/agents";
import { OpsAgent } from "./core/agent.js";

async function main() {
  console.log("🚀 Starting Ops Agent Investigation...\n");

  try {
    const stream = await run(OpsAgent, "investigate order-api", {
      stream: true,
      maxTurns: 6,
    });

    // Listen to streaming events just like your Next.js route did[cite: 1]
    for await (const event of stream) {
      if (event.type === "run_item_stream_event") {
        if (event.item.type === "tool_call_item") {
          console.log(`\n🔧 [Agent deciding] Tool Called: ${event.item.rawItem.name}`);
        }
        if (event.item.type === "tool_call_output_item") {
          console.log(`✅ [Tool Finished] Data retrieved.`);
        }
      }
    }

    await stream.completed;
    
    console.log("\n================ REPORT ================\n");
    console.log(stream.finalOutput); // The final Markdown report with the 4 sections
    console.log("\n========================================\n");

  } catch (error) {
    console.error("\n❌ Investigation failed:", error.message);
  }
}

main();