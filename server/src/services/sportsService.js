import axios from "axios";
import Standings from "../models/standings.js";
import { ENV } from "../config/env.js";
import fixture from "../models/fixture.js";

const api = axios.create({
  baseURL: ENV.BASE_URL,
  headers: {
    "X-RapidAPI-Key": ENV.API_FOOTBALL_KEY,
    "X-RapidAPI-Host": "v3.football.api-sports.io",
  },
});

export const fetchFixtures = async (leagueId, season) => {
  try {
    const response = await api.get("/fixtures", {
      params: {
        league: leagueId,
        season: season,
      },
    });
    return { data: res.data };
  } catch (error) {
    return { error: error.message };
    console.error("Error fetching fixtures:", error.message);
  }
};

export const fetchFixtures = async (leagueId, season) => {
  try {
    const response = await api.get("/fixtures", {
      params: { league: leagueId, season },
    });

    return response.data.response;
  } catch (error) {
    console.error("API Error:", error.message);
    return [];
  }
};

export const getFixtures = async (leagueId, season) => {
  const now = new Date();

  const existing = await Fixture.find({ leagueId, season });

  if (existing.length > 0) {
    const lastUpdated = existing[0].lastUpdated;

    const diffMinutes = (now - lastUpdated) / (1000 * 60);

    // ⛔ If fresh, return cached
    if (diffMinutes < 15) {
      return existing;
    }
  }

  // ✅ Fetch new data
  const apiData = await fetchFixtures(leagueId, season);

  // 🔄 Save/update DB
  const bulkOps = apiData.map((match) => ({
    updateOne: {
      filter: { fixtureId: match.fixture.id },
      update: {
        fixtureId: match.fixture.id,
        leagueId,
        season,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        status: match.fixture.status.short,
        date: match.fixture.date,
        goals: {
          home: match.goals.home,
          away: match.goals.away,
        },
        lastUpdated: new Date(),
      },
      upsert: true,
    },
  }));

  await Fixture.bulkWrite(bulkOps);

  return await Fixture.find({ leagueId, season });
};
