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

const fetchFixtures = async (leagueId, season, extraParams = {}) => {
  if (!(await canMakeRequest())) {
    console.log("🚫 API limit reached");
    return [];
  }

  try {
    const response = await api.get("/fixtures", {
      params: { league: leagueId, season, ...extraParams },
    });

    await trackRequest(); // ✅ track usage

    return response.data.response;
  } catch (error) {
    console.error("API Error:", error.response?.status || error.message);
    if (error.response?.data) {
      console.error("API Error payload:", JSON.stringify(error.response.data));
    }
    return [];
  }
};

const fetchEplGameweekFixtures = async (leagueId, season) => {
  const upcomingFixtures = await fetchFixtures(leagueId, season, { next: 20 });

  if (Array.isArray(upcomingFixtures) && upcomingFixtures.length > 0) {
    const round = upcomingFixtures[0]?.league?.round || null;
    const sameRoundFixtures = round
      ? upcomingFixtures.filter((match) => match.league?.round === round)
      : upcomingFixtures;

    if (sameRoundFixtures.length > 0) {
      return {
        round,
        fixtures: sameRoundFixtures,
      };
    }
  }

  const today = new Date();
  const from = today.toISOString().split("T")[0];
  const toDate = new Date(today);
  toDate.setDate(toDate.getDate() + 10);
  const to = toDate.toISOString().split("T")[0];

  const dateWindowFixtures = await fetchFixtures(leagueId, season, { from, to });

  if (!Array.isArray(dateWindowFixtures) || dateWindowFixtures.length === 0) {
    return { round: null, fixtures: [] };
  }

  const round = dateWindowFixtures[0]?.league?.round || null;
  const sameRoundFixtures = round
    ? dateWindowFixtures.filter((match) => match.league?.round === round)
    : dateWindowFixtures;

  return {
    round,
    fixtures: sameRoundFixtures,
  };
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
  const useRoundBasedFetch = Number(leagueId) === 39;
  let currentRound = null;
  let query = { leagueId, season };

  if (useRoundBasedFetch) {
    const roundData = await fetchEplGameweekFixtures(leagueId, season);
    currentRound = roundData.round;
    query = currentRound ? { leagueId, season, round: currentRound } : query;

    const existing = await Fixture.find(query).sort({ date: 1 });

    if (existing.length > 0) {
      const lastUpdated = existing[0].lastUpdated;

      const diffMinutes = (now - lastUpdated) / (1000 * 60);

      if (diffMinutes < 15) {
        return existing;
      }
    }

    const apiData = roundData.fixtures.length > 0
      ? roundData.fixtures
      : await fetchFixtures(leagueId, season);

    const bulkOps = apiData.map((match) => ({
      updateOne: {
        filter: { fixtureId: match.fixture.id },
        update: {
          fixtureId: match.fixture.id,
          leagueId,
          season,
          round: match.league?.round || currentRound,
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

    if (bulkOps.length > 0) {
      await Fixture.deleteMany({ leagueId, season });
      await Fixture.bulkWrite(bulkOps);
    }

    for (let match of apiData) {
      const isBigMatch =
        ["Arsenal", "Chelsea", "Man United", "Liverpool"].includes(
          match.teams.home.name
        ) ||
        ["Arsenal", "Chelsea", "Man United", "Liverpool"].includes(
          match.teams.away.name
        );

      if (match.fixture.status.short === "FT" && isBigMatch) {
        (async () => {
          try {
            await generateMatchReport({
              fixtureId: match.fixture.id,
              homeTeam: match.teams.home.name,
              awayTeam: match.teams.away.name,
              goals: match.goals,
            });
          } catch (err) {
            console.error("AI report error:", err?.message || err);
          }
        })();
      }
    }

    return await Fixture.find(query).sort({ date: 1 });
  }

  const existing = await Fixture.find(query).sort({ date: 1 });

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
        round: match.league?.round || currentRound,
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

  if (bulkOps.length > 0) {
    await Fixture.bulkWrite(bulkOps);
  }

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
      (async () => {
        try {
          await generateMatchReport({
            fixtureId: match.fixture.id,
            homeTeam: match.teams.home.name,
            awayTeam: match.teams.away.name,
            goals: match.goals,
          });
        } catch (err) {
          console.error("AI report error:", err?.message || err);
        }
      })();
    }
  }

  return await Fixture.find(query).sort({ date: 1 });
};

export const getStandings = async (leagueId, season) => {
  const start = Date.now();
  console.log(`📋 getStandings START: league=${leagueId} season=${season}`);

  const existing = await Standings.findOne({ leagueId, season });

  const now = new Date();

  if (existing) {
    const diff = (now - existing.lastUpdated) / (1000 * 60);
    const cachedRows = existing.table?.length || 0;

    console.log(`🗂️  Standings cache check: league=${leagueId} season=${season} ageMinutes=${Math.round(diff)} tableLength=${cachedRows}`);
    // ⛔ Cache for 6 hours
    if (diff < 360 && cachedRows > 0) {
      console.log(`✅ Cache HIT: returning ${existing.table?.length || 0} rows in ${Date.now() - start}ms`);
      return existing.table;
    }

    if (cachedRows === 0) {
      console.log(`⚠️  Cached standings are empty, forcing upstream refresh.`);
    }
  }

  console.log(`🔄 Cache MISS or STALE: fetching fresh data...`);
  const table = await fetchStandings(leagueId, season);
  console.log(`📥 Fetch complete: received ${table?.length || 0} rows, saving to DB...`);

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

  console.log(`📋 getStandings END: league=${leagueId} season=${season} totalTime=${Date.now() - start}ms`);
  return table;
};

export const fetchStandings = async (leagueId, season) => {
  const start = Date.now();
  console.log(`📡 fetchStandings CALL START: league=${leagueId} season=${season}`);
  
  try {
    console.log(`📡 Making API request to /standings...`);
    const response = await api.get("/standings", {
      params: { league: leagueId, season },
    });
    const apiDuration = Date.now() - start;

    await trackRequest();

    const respArrayLen = Array.isArray(response.data?.response)
      ? response.data.response.length
      : "n/a";
    const standingsData = response.data?.response?.[0]?.standings;
    const standingsGroups = Array.isArray(standingsData) ? standingsData.length : "n/a";

    console.log(
      `✅ fetchStandings API SUCCESS: league=${leagueId} season=${season} status=${response.status} apiDuration=${apiDuration}ms responseArrayLen=${respArrayLen} standingsGroupsCount=${standingsGroups}`
    );
    
    if (!standingsData || standingsData.length === 0) {
      console.warn(`⚠️  WARNING: standings data is empty or missing! response.data keys=${Object.keys(response.data || {}).join(',')}`);
    }

    return standingsData || [];
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `❌ fetchStandings API ERROR: league=${leagueId} season=${season} duration=${duration}ms status=${error.response?.status || 'no-status'} message=${error.message}`
    );
    if (error.response?.data) {
      try {
        const payload = JSON.stringify(error.response.data).slice(0, 500);
        console.error(`   Error payload: ${payload}`);
      } catch (e) {
        // ignore stringify errors
      }
    }
    return [];
  }
};