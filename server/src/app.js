import express from "express";
import cors from "cors";
import fixturesRoutes from "./routes/fixturesRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`🔷 ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/fixtures", fixturesRoutes);

export default app;