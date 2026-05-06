import mongoose from "mongoose";

const standingsSchema = new mongoose.Schema({
  leagueId: Number,
  season: Number,
  table: Array,
  lastUpdated: Date,
});
export default mongoose.model("Standings", standingsSchema);
