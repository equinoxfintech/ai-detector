import {
  APIConnectionError,
  AuthenticationError,
  PermissionDeniedError,
  RateLimitError,
  TypeSafeError,
} from "@typesafe-ai/sdk";
import { config as loadEnv } from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectText } from "./typesafeClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve .env relative to the project root, not process.cwd(), so it loads
// regardless of the directory the process was started from.
const envPath = path.join(__dirname, "..", ".env");
const { error: envError } = loadEnv({ path: envPath });
if (envError && envError.code !== "ENOENT") {
  console.warn(`Could not read ${envPath}: ${envError.message}`);
}

const MIN_LENGTH = 40;
const MAX_LENGTH = 20000;

function messageFor(err) {
  if (err instanceof AuthenticationError) {
    return "TYPESAFE_API_KEY is missing or invalid. Check your .env file.";
  }
  if (err instanceof PermissionDeniedError) {
    return `Access to the TypeSafe API was denied: ${err.message}`;
  }
  if (err instanceof RateLimitError) {
    return "TypeSafe API rate limit reached. Please try again shortly.";
  }
  if (err instanceof APIConnectionError) {
    return "Could not reach the TypeSafe API (network issue or timeout).";
  }
  if (err instanceof TypeSafeError) {
    return `TypeSafe configuration error: ${err.message}`;
  }
  return "Detection service is currently unavailable. Please try again.";
}

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
      res.status(502).json({ error: messageFor(err) });
    }
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      `Warning: TYPESAFE_API_KEY is not set (looked for it in ${envPath} and the ` +
        "environment). Copy .env.example to .env and add your key, or detection " +
        "requests will fail.",
    );
  } else {
    console.log(
      `TYPESAFE_API_KEY loaded (${apiKey.length} chars, starts with "${apiKey.slice(0, 4)}...").`,
    );
  }

  const port = process.env.PORT || 3000;
  createApp().listen(port, () => {
    console.log(`AI detector listening on http://localhost:${port}`);
  });
}
