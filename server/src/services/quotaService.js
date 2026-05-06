import ApiUsage from "../models/apiUsage.js";

const DAILY_LIMIT = 100;

const today = () => new Date().toISOString().split("T")[0];

// ✅ Check if safe to call API
export const canMakeRequest = async () => {
  const record = await ApiUsage.findOne({ date: today() });

  if (!record) return true;

  return record.count < DAILY_LIMIT;
};

// ✅ Track API usage
export const trackRequest = async () => {
  const record = await ApiUsage.findOne({ date: today() });

  if (!record) {
    await ApiUsage.create({ date: today(), count: 1 });
  } else {
    record.count += 1;
    await record.save();
  }
};
