import mongoose from "mongoose";

const apiUsageSchema = new mongoose.Schema({
  date: String,
  count: Number,
});

export default mongoose.model("ApiUsage", apiUsageSchema);
