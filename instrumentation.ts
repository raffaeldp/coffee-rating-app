// Fail fast at startup: validate MACHINES and run DB migrations before serving.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./instrumentation-node");
}
