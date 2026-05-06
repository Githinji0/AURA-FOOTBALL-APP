import express from "express";
import { getLeagueFixtures } from "../controllers/fixturesController.js";

const router = express.Router();

router.get("/:leagueId/:season", getLeagueFixtures);

export default router;