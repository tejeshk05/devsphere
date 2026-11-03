import { runIngestion, seedInitialSnapshotsIfNeeded } from "../src/lib/services/ingestion";

async function main() {
  console.log("=== DEVSPHERE SCHEDULED INGESTION WORKER ===");
  console.log("Timestamp:", new Date().toISOString());

  // 1. Seed initial data if database is clean
  await seedInitialSnapshotsIfNeeded();

  // 2. Run ingestion across AI categories
  console.log("Querying GitHub API for latest repository star snapshots...");
  const result = await runIngestion();

  console.log("\n--- INGESTION WORKER SUMMARY ---");
  console.log("Success:", result.success);
  console.log("Total Repositories Processed:", result.totalProcessed);
  console.log("New Hourly Snapshots Recorded:", result.newSnapshots);
  console.log("Duplicates Skipped (Same Hour Bucket):", result.duplicatesSkipped);
  if (result.rateLimitRemaining !== undefined) {
    console.log("GitHub API Rate Limit Remaining:", result.rateLimitRemaining);
  }
  if (result.errors.length > 0) {
    console.warn("Errors Encountered:", result.errors);
  }
  console.log("============================================\n");
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
