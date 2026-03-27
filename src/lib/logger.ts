export const logger = {
  info(message: string, payload?: unknown) {
    console.log(JSON.stringify({ level: "info", message, payload }));
  },
  warn(message: string, payload?: unknown) {
    console.warn(JSON.stringify({ level: "warn", message, payload }));
  },
  error(message: string, payload?: unknown) {
    console.error(JSON.stringify({ level: "error", message, payload }));
  }
};
