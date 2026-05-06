import cron from "node-cron";
import { getFixtures } from "../services/sportsService.js";

const leagues = [
  { leagueId: 39, season: 2025 }, // EPL
  { leagueId: 2, season: 2025 },  // UCL
];

// Runs every 10 minutes
export const startScheduler = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("⏱ Running scheduler...");

    for (let league of leagues) {
      // 🔥 Only fetch if needed (basic version)
      await getFixtures(league.leagueId, league.season);
    }
  });
};