import { Router } from "express";

import type { AppContainer } from "../container.js";
import { incomingEventSchema } from "../modules/events/schema.js";
import type { IncomingEvent } from "../modules/events/types.js";

export function createEventsRouter(container: AppContainer) {
  const router = Router();

  router.post("/", async (request, response) => {
    const body =
      typeof request.body === "string" ? safeJsonParse(request.body) : request.body;
    const parsed = incomingEventSchema.safeParse(body);

    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid event payload",
        issues: parsed.error.flatten()
      });
    }

    try {
      const result = await container.eventService.ingest(parsed.data as IncomingEvent);

      return response.status(result.duplicate ? 200 : 202).json(result);
    } catch (error) {
      return response.status(404).json({
        error: error instanceof Error ? error.message : "Unable to ingest event"
      });
    }
  });

  return router;
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}
