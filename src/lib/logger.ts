/** Logs only in development — avoids leaking details in production consoles. */
export function logError(context: string, err?: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, err);
  }
}
