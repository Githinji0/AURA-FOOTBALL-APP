import express from "express";
import { getLeagueFixtures, getLeagueStandings } from "../controllers/fixturesController.js";

const router = express.Router();

// Order matters: specific routes MUST come before generic routes
router.get("/standings/:leagueId/:season", getLeagueStandings);
router.get("/:leagueId/:season", getLeagueFixtures);

export default router;