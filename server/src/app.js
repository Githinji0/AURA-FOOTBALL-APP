import express from "express";
import fixturesRoutes from "./routes/fixturesRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/fixtures", fixturesRoutes);

export default app;