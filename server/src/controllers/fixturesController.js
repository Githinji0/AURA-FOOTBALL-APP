import { getFixtures, getStandings } from "../services/sportsService.js";

export const getLeagueFixtures = async (req, res) => {
  const { leagueId, season } = req.params;

  try {
    const data = await getFixtures(leagueId, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getLeagueStandings = async (req, res) => {
  const { leagueId, season } = req.params;
  
  console.log(`🔵 getLeagueStandings CONTROLLER: leagueId=${leagueId} season=${season}`);

  try {
    const data = await getStandings(leagueId, season);
    console.log(`🟢 Standings returned: ${data?.length || 0} rows`);
    res.json(data);
  } catch (error) {
    console.error(`🔴 Standings error: ${error.message}`);
    res.status(500).json({ error: "Error fetching standings" });
  }
};
