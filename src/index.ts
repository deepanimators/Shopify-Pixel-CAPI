import { startServer } from "./server.js";

startServer().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(message);
  process.exit(1);
});
