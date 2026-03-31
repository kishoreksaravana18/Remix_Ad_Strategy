import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const getAiClient = () => {
    const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
    if (!apiKey) {
      throw new Error("NVIDIA_API_KEY not found in environment.");
    }
    return new OpenAI({
      apiKey: apiKey,
      baseURL: "https://integrate.api.nvidia.com/v1",
    });
  };

  // API Routes
  app.post("/api/extract-offer", async (req, res) => {
    const { url, prompt } = req.body;
    try {
      const openai = getAiClient();
      const response = await openai.chat.completions.create({
        model: "meta/llama-3.1-405b-instruct",
        messages: [
          { role: "system", content: "You are a highly accurate direct response marketing analyst. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      res.json(JSON.parse(response.choices[0].message.content || "{}"));
    } catch (error: any) {
      console.error("Extract Offer Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate-strategy", async (req, res) => {
    const { prompt } = req.body;
    try {
      const openai = getAiClient();
      const response = await openai.chat.completions.create({
        model: "meta/llama-3.1-405b-instruct",
        messages: [
          { role: "system", content: "You are a world-class Google Ads strategist. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });
      res.json(JSON.parse(response.choices[0].message.content || "{}"));
    } catch (error: any) {
      console.error("Generate Strategy Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
