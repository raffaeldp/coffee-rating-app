import { getMachines } from "./lib/machines";

// Next only logs errors thrown from instrumentation, so exit explicitly.
try {
  getMachines();
  await import("./lib/db");
} catch (e) {
  console.error(e);
  process.exit(1);
}
