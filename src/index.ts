import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info("API listening", {
    port: env.PORT,
    appUrl: env.SHOPIFY_APP_URL
  });
});
