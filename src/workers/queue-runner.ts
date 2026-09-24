import { JobWorker } from "@/lib/queue/worker";
import { prisma } from "@/lib/prisma";
import { ProviderCircuitBreaker } from "@/lib/sms/circuit-breaker";

/**
 * Standalone High-Throughput Queue Runner Daemon.
 * Designed to execute independently from Next.js web handlers in containerized,
 * multi-process environments (Docker, PM2, Kubernetes, or standalone VPS).
 * 
 * Features:
 * - Persistent execution immune to HTTP request timeouts.
 * - Graceful shutdown on SIGTERM / SIGINT signals.
 * - Periodic orphaned lease recovery sweeper.
 * - Dynamic adaptive polling frequency.
 */

let isRunning = true;
let isProcessing = false;

const BATCH_SIZE = parseInt(process.env.WORKER_BATCH_SIZE || "25", 10);
const IDLE_DELAY_MS = parseInt(process.env.WORKER_IDLE_DELAY_MS || "2000", 10);
const BUSY_DELAY_MS = parseInt(process.env.WORKER_BUSY_DELAY_MS || "250", 10);
const SWEEP_INTERVAL_MS = 60000; // 1 minute

async function main() {
  console.log("==================================================");
  console.log("  RANGE BULK SMS — STANDALONE WORKER DAEMON");
  console.log(`  Process ID: ${process.pid}`);
  console.log(`  Batch Size: ${BATCH_SIZE}`);
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Started At: ${new Date().toISOString()}`);
  console.log("==================================================");

  // Setup graceful termination hooks
  const shutdown = async (signal: string) => {
    console.log(`\n[WORKER_DAEMON] Received ${signal}. Initiating graceful shutdown...`);
    isRunning = false;

    // Wait for in-flight job execution to finalize
    let waitCycles = 0;
    while (isProcessing && waitCycles < 15) {
      console.log(`[WORKER_DAEMON] Waiting for in-flight batch to conclude (${waitCycles + 1}/15)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      waitCycles++;
    }

    try {
      await prisma.$disconnect();
      console.log("[WORKER_DAEMON] Database connections closed. Process exiting cleanly.");
    } catch (err) {
      console.error("[WORKER_DAEMON] Error closing database connections:", err);
    }

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  let lastSweep = Date.now();

  while (isRunning) {
    try {
      // 1. Check Global Emergency Halt
      if (ProviderCircuitBreaker.isGloballyHalted()) {
        console.warn("[WORKER_DAEMON] Emergency dispatch halt is active. Sleeping...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      // 2. Periodic Orphaned Job Lease Sweeper
      if (Date.now() - lastSweep > SWEEP_INTERVAL_MS) {
        lastSweep = Date.now();
        await JobWorker.recoverStaleJobs();
      }

      // 3. Process Batch
      isProcessing = true;
      const results = await JobWorker.processQueue(BATCH_SIZE);
      isProcessing = false;

      const processedCount = results.filter((r) => r.status === "SUCCEEDED" || r.status === "DEAD_LETTER").length;

      // 4. Adaptive backoff: Sleep longer when queue is dry
      const delay = processedCount > 0 ? BUSY_DELAY_MS : IDLE_DELAY_MS;
      if (processedCount > 0) {
        console.log(`[WORKER_DAEMON] Processed ${processedCount} jobs. Next batch in ${delay}ms...`);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      isProcessing = false;
      console.error("[WORKER_DAEMON_LOOP_ERROR]", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

main().catch((err) => {
  console.error("[FATAL_WORKER_ERROR]", err);
  process.exit(1);
});
