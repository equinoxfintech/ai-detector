import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectText } from "./typesafeClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MIN_LENGTH = 40;
const MAX_LENGTH = 20000;

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "200kb" }));
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.post("/api/detect", async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (text.length < MIN_LENGTH) {
      res.status(400).json({
        error: `Please provide at least ${MIN_LENGTH} characters of text.`,
      });
      return;
    }
    if (text.length > MAX_LENGTH) {
      res.status(400).json({
        error: `Text is too long (max ${MAX_LENGTH} characters).`,
      });
      return;
    }

    try {
      const result = await detectText(text);
      res.json(result);
    } catch (err) {
      console.error("Detection failed:", err);
      res.status(502).json({
        error: "Detection service is currently unavailable. Please try again.",
      });
    }
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.TYPESAFE_API_KEY?.trim()) {
    console.warn(
      "Warning: TYPESAFE_API_KEY is not set. Copy .env.example to .env and add your key, " +
        "or detection requests will fail.",
    );
  }

  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`AI detector listening on http://localhost:${port}`);
  });
}
