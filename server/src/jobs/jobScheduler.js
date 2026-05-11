import cron from "node-cron";
import { getFixtures, getLiveMatches } from "../services/sportsService.js";
import { canMakeRequest, trackRequest } from "../services/quotaService.js";

const leagues = [
  { leagueId: 39, season: 2024 }, // EPL
  { leagueId: 2, season: 2025 },  // UCL
  { leagueId: 1, season: 2026 },  // World Cup
  { leagueId: 45, season: 2025 }, // FA Cup
];

export const startScheduler = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("⚡ Smart Scheduler Running...");

    for (let league of leagues) {
      const liveMatches = await getLiveMatches(league.leagueId, league.season);

      // 🔴 PRIORITY: Live matches
      if (liveMatches.length > 0) {
        if (await canMakeRequest()) {
          console.log("🔴 Live matches → frequent updates");
          await getFixtures(league.leagueId, league.season);
          await trackRequest();
        }
        continue;
      }

      // 🟡 NON-LIVE: Reduced frequency (every 30 mins)
      const minute = new Date().getMinutes();

      if (minute % 30 === 0) {
        if (await canMakeRequest()) {
          console.log("🟡 No live matches → slow polling");
          await getFixtures(league.leagueId, league.season);
          await trackRequest();
        }
      }
    }
  });
};