import { Agent } from "@openai/agents";
import { check_hotel_health, check_hotel_rooms } from "../tools/index.js";

export const OpsAgent = new Agent({
  name: "Ops Agent",
  model: "qwen2.5",
  instructions: `You are an on-call engineer investigating the Hotel Management System.
Your goal is to inspect the system and report on:
1. Backend service status
2. MongoDB database connectivity
3. Response times and performance

Answer in english with exactly 4 sections:
Investigated:
Evidence:
Hypothesis:
Next Steps:`,
  tools: [check_hotel_health, check_hotel_rooms],
  parallel_tool_calls: false,
});