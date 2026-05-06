import mongoose from "mongoose";

const aiReportSchema = new mongoose.Schema({
  fixtureId: Number,
  content: String,
  createdAt: Date,
});

export default mongoose.model("AIReport", aiReportSchema);