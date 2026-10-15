import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Agent, run, setDefaultOpenAIClient, tool } from "@openai/agents";
import { z } from "zod";

// Disable tracing to keep console clean
process.env.OPENAI_TRACING_ENABLED = "false";

// Connect to your local Ollama model
const ollamaClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "http://host.docker.internal:11434/v1",
  apiKey: "ollama",
});
setDefaultOpenAIClient(ollamaClient);

const BASE_URL = process.env.HOTEL_API_URL || "http://localhost:3000";

// --- Tool 1: Log the ticket ---
const create_maintenance_ticket = tool({
  name: "create_maintenance_ticket",
  description: "Log a maintenance issue into the maintenance_tickets database collection.",
  parameters: z.object({
    roomNumber: z.string().describe("The room number"),
    issue: z.string().describe("Summary of the problem"),
    priority: z.enum(["Low", "Medium", "High", "Critical"]),
    outOfOrder: z.boolean().describe("Whether this issue forced the room Out of Order"),
  }),
  execute: async (args) => {
    console.log("[Agent Tool] Creating Ticket:", args);
    const res = await fetch(`${BASE_URL}/api/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    return await res.json();
  },
});

// --- Tool 2: Take room offline ---
const set_room_out_of_order = tool({
  name: "set_room_out_of_order",
  description: "Mark a room's status as 'Out of Order' in MongoDB to prevent bookings.",
  parameters: z.object({
    roomNumber: z.string().describe("The room number to take out of order"),
  }),
  execute: async ({ roomNumber }) => {
    console.log(`[Agent Tool] Marking Room ${roomNumber} Out of Order`);
    const res = await fetch(`${BASE_URL}/api/rooms`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomNumber, status: "Out of Order" }),
    });
    return await res.json();
  },
});

// --- Agent Logic ---
const MaintenanceAgent = new Agent({
  name: "Hotel Maintenance Agent",
  model: "qwen2.5",
  instructions: `You are the Hotel Maintenance Operations Agent.
Your tasks:
1. Review the guest's reported issue and room number.
2. Check against the STRICT "Out of Order" criteria:
   - Water/Plumbing (active leak, flooding, overflowing toilet)
   - Electricity (exposed wire, sparking outlet, total room blackout)
   - Security/Safety (broken lock, shattered glass/window, smoke smell)
   - Climate Control (broken AC or heating)
3. If ANY of those 4 conditions match:
   - Call set_room_out_of_order(roomNumber).
   - Set priority to "Critical" or "High" and outOfOrder to true.
   - Otherwise, set priority to "Low" or "Medium" and outOfOrder to false.
4. Always call create_maintenance_ticket with roomNumber, issue summary, priority, and outOfOrder status.
5. FINAL OUTPUT: Write ONLY a warm, empathetic, personalized apology directly addressed to the guest. Acknowledge their exact issue and assure them that the maintenance staff has been dispatched to fix it immediately. Do not include your thought process in the final output.`,
  tools: [create_maintenance_ticket, set_room_out_of_order],
});

export async function POST(request) {
  try {
    const { roomNumber, description } = await request.json();

    if (!roomNumber || !description) {
      return NextResponse.json({ error: "Missing room number or description" }, { status: 400 });
    }

    const prompt = `Room: ${roomNumber}\nReported Issue: ${description}`;
    
    const result = await run(MaintenanceAgent, prompt);
    await result.completed;

    return NextResponse.json({
      success: true,
      message: result.finalOutput,
    });
  } catch (error) {
    console.error("Maintenance agent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}