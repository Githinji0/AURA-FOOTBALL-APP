import mongoose from "mongoose";

const leagueSchema = new mongoose.Schema({
    leagueId: Number,
    name: String,
    country: String,
    logo: String,
    flag: String,
    season: Number,
    lastUpdated: Date
})


export default mongoose.model("League", leagueSchema)