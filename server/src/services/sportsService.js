import axios from "axios";
import Standings from "../models/standings.js";
import { ENV } from "../config/env.js";
import Fixture from "../models/fixture.js";
import { canMakeRequest, trackRequest } from "./quotaService.js";
import { generateMatchReport } from "./aiService.js";


const api = axios.create({
  baseURL: ENV.BASE_URL,
  headers: {
    "X-RapidAPI-Key": ENV.API_FOOTBALL_KEY,
    "X-RapidAPI-Host": "v3.football.api-sports.io",
  },
});

export const fetchFixtures = async (leagueId, season) => {
  if (!(await canMakeRequest())) {
    console.log("🚫 API limit reached");
    return [];
  }

  try {
    const response = await api.get("/fixtures", {
      params: { league: leagueId, season },
    });

    await trackRequest(); // ✅ track usage

    return response.data.response;
  } catch (error) {
    console.error("API Error:", error.message);
    return [];
  }
};
export const getLiveMatches = async (leagueId, season) => {
  return await Fixture.find({
    leagueId,
    season,
    status: { $in: ["1H", "2H", "HT"] }, // API-Football live states
  });
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

  // ✅ Generate AI reports for big finished matches
  for (let match of apiData) {
    const isBigMatch =
      ["Arsenal", "Chelsea", "Man United", "Liverpool"].includes(
        match.teams.home.name
      ) ||
      ["Arsenal", "Chelsea", "Man United", "Liverpool"].includes(
        match.teams.away.name
      );

    if (match.fixture.status.short === "FT" && isBigMatch) {
      await generateMatchReport({
        fixtureId: match.fixture.id,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        goals: match.goals,
      });
    }
  }

  return await Fixture.find({ leagueId, season });
};

export const getStandings = async (leagueId, season) => {
  const existing = await Standings.findOne({ leagueId, season });

  const now = new Date();

  if (existing) {
    const diff = (now - existing.lastUpdated) / (1000 * 60);

    // ⛔ Cache for 6 hours
    if (diff < 360) {
      return existing.table;
    }
  }

  const table = await fetchStandings(leagueId, season);

  await Standings.findOneAndUpdate(
    { leagueId, season },
    {
      leagueId,
      season,
      table,
      lastUpdated: new Date(),
    },
    { upsert: true },
  );

  return table;
};

export const fetchStandings = async (leagueId, season) => {
  try {
    const response = await api.get("/standings", {
      params: { league: leagueId, season },
    });

    await trackRequest();

    return response.data.response[0]?.standings || [];
  } catch (error) {
    console.error("API Error:", error.message);
    return [];
  }
};