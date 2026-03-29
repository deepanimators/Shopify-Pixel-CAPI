import type { Server } from "node:http";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

export function startServer() {
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info("API listening", {
      port: env.PORT,
      appUrl: env.SHOPIFY_APP_URL
    });
  });

  registerShutdown(server);
  return server;
}

function registerShutdown(server: Server) {
  const shutdown = (signal: string) => {
    logger.info("Shutting down API", { signal });
    server.close((error) => {
      if (error) {
        logger.error("Server shutdown failed", {
          signal,
          message: error.message
        });
        process.exitCode = 1;
      }
    });
  };

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => shutdown(signal));
  }
}
