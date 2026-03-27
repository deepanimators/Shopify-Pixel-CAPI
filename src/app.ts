import express from "express";

import { createEventsRouter } from "./routes/events.js";
import { createHealthRouter } from "./routes/health.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));
  app.use("/health", createHealthRouter());
  app.use("/api/events", createEventsRouter());

  return app;
}
