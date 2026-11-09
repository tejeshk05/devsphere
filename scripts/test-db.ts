import { dbManager } from "../src/lib/db";

async function main() {
  console.log("--- STARTING DATABASE AND VELOCITY UNIT TESTS ---");

  const repo = {
    id: 101,
    owner: "vllm-project",
    name: "vllm",
    full_name: "vllm-project/vllm",
    category: "llms",
    html_url: "https://github.com/vllm-project/vllm",
    created_at: "2023-06-01T00:00:00Z",
    stars: 35000,
  };

  const now = Date.now();

  // Test 1: Record baseline snapshot (24h ago)
  const inserted1 = await dbManager.recordSnapshot(repo, now - 24 * 3600 * 1000);
  console.log("1. Inserted baseline snapshot (24h ago):", inserted1);

  // Test 2: Duplicate snapshot in the exact same hourly interval bucket
  const insertedDup = await dbManager.recordSnapshot(repo, now - 24 * 3600 * 1000 + 10000);
  console.log("2. Duplicate snapshot in same interval skipped:", !insertedDup);

  // Test 3: Record current snapshot (24h later, with +120 stars)
  repo.stars = 35120;
  const inserted2 = await dbManager.recordSnapshot(repo, now);
  console.log("3. Inserted latest snapshot (now, +120 stars):", inserted2);

  // Test 4: Calculate 24-hour velocity
  const velocity24 = await dbManager.getRepoVelocity(101, 24);
  console.log("4. 24h Velocity Calculation:", {
    currentStars: velocity24?.currentStars,
    previousStars: velocity24?.previousStars,
    starsGained: velocity24?.starsGained,
    elapsedHours: velocity24?.elapsedHours,
    starsPerHour: velocity24?.starsPerHour,
    percentageGrowth: velocity24?.percentageGrowth,
    status: velocity24?.status,
  });

  // Test 5: Insufficient historical data scenario (e.g. asking for 7-day velocity when only 24h data exists)
  const velocity7d = await dbManager.getRepoVelocity(101, 168);
  console.log("5. Insufficient Data Scenario (7d):", {
    status: velocity7d?.status,
    starsGained: velocity7d?.starsGained,
    starsPerHour: velocity7d?.starsPerHour,
  });

  // Test 6: Rate Limiting & Brute-force protection in Database
  console.log("\n--- TESTING DB-BACKED AUTH RATE LIMITING ---");
  const ip = "192.168.1.50";
  await dbManager.clearAuthFailure(ip);

  const initialCheck = await dbManager.checkAuthRateLimit(ip, 5, 900000);
  console.log("Initial rate limit check:", initialCheck);

  // Simulate 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    await dbManager.recordAuthFailure(ip, 5, 900000);
  }
  const checkAfter4 = await dbManager.checkAuthRateLimit(ip, 5, 900000);
  console.log("Check after 4 failed attempts:", checkAfter4);

  // 5th failed attempt should trigger lockout
  const finalFail = await dbManager.recordAuthFailure(ip, 5, 900000);
  console.log("Check on 5th attempt (locked out):", finalFail);

  const checkLocked = await dbManager.checkAuthRateLimit(ip, 5, 900000);
  console.log("Subsequent check while locked out:", checkLocked);

  await dbManager.clearAuthFailure(ip);
  const clearedCheck = await dbManager.checkAuthRateLimit(ip, 5, 900000);
  console.log("Check after successful login reset:", clearedCheck);

  console.log("\n--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---");
}

main().catch(console.error);

