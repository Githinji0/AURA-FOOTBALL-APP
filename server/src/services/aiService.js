import AIReport from "../models/AIReport.js";

// Placeholder for Gemini
export const generateMatchReport = async (match) => {
  const report = `
⚽ ${match.homeTeam} vs ${match.awayTeam}

Final Score: ${match.goals.home} - ${match.goals.away}

A thrilling encounter showcasing tactical intensity and key moments.
`;

  await AIReport.create({
    fixtureId: match.fixtureId,
    content: report,
    createdAt: new Date(),
  });

  return report;
};