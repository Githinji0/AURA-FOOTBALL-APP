import express from "express";
import { getLeagueFixtures, getLeagueStandings } from "../controllers/fixturesController.js";

const router = express.Router();

router.get("/:leagueId/:season", getLeagueFixtures);
router.get("/standings/:leagueId/:season", getLeagueStandings);

export default router;