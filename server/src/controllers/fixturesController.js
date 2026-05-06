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

  try {
    const data = await getStandings(leagueId, season);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching standings" });
  }
};
