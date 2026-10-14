// app/api/agent-run/route.js
import { OpenAI } from "openai";
import { Agent, run, setDefaultOpenAIClient, tool } from "@openai/agents"; // <-- Add `tool` here
import { z } from "zod";

process.env.OPENAI_TRACING_ENABLED = "false";
const ollamaClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "http://localhost:11434/v1",
  apiKey: "ollama",
});
setDefaultOpenAIClient(ollamaClient);

const BASE_URL = process.env.HOTEL_API_URL || "http://localhost:3000";

async function callEndpoint(path) {
  const started = Date.now();
  try {
    const response = await fetch(BASE_URL + path, { signal: AbortSignal.timeout(5000) });
    const body = await response.json();
    return { httpStatus: response.status, ms: Date.now() - started, body };
  } catch (error) {
    return { error: `${error.name} ${error.message}`, ms: Date.now() - started };
  }
}

// Wrap the tool definitions with the `tool()` function
const check_hotel_health = tool({
  name: "check_hotel_health",
  description: "Check the hotel system health at /api/agent/health",
  parameters: z.object({}),
  execute: async () => await callEndpoint("/api/agent/health"),
});

const check_hotel_rooms = tool({
  name: "check_hotel_rooms",
  description: "Check the rooms API at /api/rooms",
  parameters: z.object({}),
  execute: async () => await callEndpoint("/api/rooms"),
});

const OpsAgent = new Agent({
  name: "Hotel Ops Agent",
  model: "qwen2.5",
  instructions: `You are an on-call engineer investigating the Hotel System. 
Verify backend health and database connectivity.
Answer with exactly 4 sections: Investigated, Evidence, Hypothesis, Next Steps.`,
  tools: [check_hotel_health, check_hotel_rooms],
  parallel_tool_calls: false,
});

export async function POST(request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));

      try {
        const result = await run(OpsAgent, "Verify hotel backend and database connection.", {
          stream: true,
          maxTurns: 6,
        });

        for await (const event of result) {
          if (event.type === "run_item_stream_event") {
            if (event.item.type === "tool_call_item") {
              send({ type: "log", message: `🔧 Calling tool: ${event.item.rawItem.name}...` });
            }
            if (event.item.type === "tool_call_output_item") {
              send({ type: "log", message: `✅ Tool returned data successfully.` });
            }
          }
        }

        await result.completed;
        send({ type: "report", report: result.finalOutput });
      } catch (error) {
        send({ type: "error", message: error.message });
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
}