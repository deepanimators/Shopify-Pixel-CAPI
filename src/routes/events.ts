import { Router } from "express";

import { InMemoryEventRepository } from "../modules/events/repository.js";
import { incomingEventSchema } from "../modules/events/schema.js";
import { EventService } from "../modules/events/service.js";

const eventService = new EventService(new InMemoryEventRepository());

export function createEventsRouter() {
  const router = Router();

  router.post("/", async (request, response) => {
    const parsed = incomingEventSchema.safeParse(request.body);

    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid event payload",
        issues: parsed.error.flatten()
      });
    }

    const result = await eventService.ingest(parsed.data);

    return response.status(result.duplicate ? 200 : 202).json(result);
  });

  return router;
}
