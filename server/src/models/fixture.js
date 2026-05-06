import mongoose from "mongoose";

const fixtureSchema = new mongoose.Schema({
  fixtureId: Number,
  leagueId: Number,
  season: Number,

  homeTeam: String,
  awayTeam: String,

  status: String, // LIVE | FINISHED | UPCOMING
  date: Date,

  goals: {
    home: Number,
    away: Number,
  },

  lastUpdated: Date,
});

export default mongoose.model("Fixture", fixtureSchema);
