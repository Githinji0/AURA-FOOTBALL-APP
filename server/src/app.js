import express from "express";
import cors from "cors";
import fixturesRoutes from "./routes/fixturesRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/fixtures", fixturesRoutes);

export default app;