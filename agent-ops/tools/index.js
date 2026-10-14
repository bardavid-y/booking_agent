process.env.OPENAI_TRACING_ENABLED = "false";
import { tool } from "@openai/agents";
import { z } from "zod";
import "dotenv/config";

const BASE_URL = process.env.HOTEL_API_URL || "http://localhost:3000";

async function callEndpoint(path) {
  const started = Date.now();
  try {
    const response = await fetch(BASE_URL + path, {
      signal: AbortSignal.timeout(5000),
    });
    const body = await response.json();
    return { httpStatus: response.status, ms: Date.now() - started, body };
  } catch (error) {
    return { error: `${error.name} ${error.message}`, ms: Date.now() - started };
  }
}

export const check_hotel_health = tool({
  name: "check_hotel_health",
  description: "Check the hotel system health check at /api/agent/health",
  parameters: z.object({}),
  async execute() {
    console.log("[Tool] Checking /api/agent/health...");
    return await callEndpoint("/api/agent/health");
  },
});

export const check_hotel_rooms = tool({
  name: "check_hotel_rooms",
  description: "Check the rooms API at /api/rooms",
  parameters: z.object({}),
  async execute() {
    console.log("[Tool] Checking /api/rooms...");
    return await callEndpoint("/api/rooms");
  },
});