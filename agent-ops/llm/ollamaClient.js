import { OpenAI } from "openai";
import { setDefaultOpenAIClient } from "@openai/agents";
import "dotenv/config";

// Initialize OpenAI SDK to talk to local Ollama[cite: 1, 3]
const ollamaClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "http://localhost:11434/v1",
  apiKey: process.env.OPENAI_API_KEY || "ollama",
});

// Force the @openai/agents framework to use this custom client
setDefaultOpenAIClient(ollamaClient);

export default ollamaClient;