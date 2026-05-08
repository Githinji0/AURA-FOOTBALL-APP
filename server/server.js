import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { ENV } from "./src/config/env.js";
import { startScheduler } from "./src/jobs/jobScheduler.js";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Subscribe to live matches
  socket.on("subscribe:live", (data) => {
    const room = `live:${data.leagueId}:${data.season}`;
    socket.join(room);
    console.log(`📡 Client subscribed to live matches: ${room}`);
  });

  // Subscribe to standings
  socket.on("subscribe:standings", (data) => {
    const room = `standings:${data.leagueId}:${data.season}`;
    socket.join(room);
    console.log(`📡 Client subscribed to standings: ${room}`);
  });

  // Subscribe to fixtures
  socket.on("subscribe:fixtures", (data) => {
    const room = `fixtures:${data.leagueId}:${data.season}`;
    socket.join(room);
    console.log(`📡 Client subscribed to fixtures: ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Expose io to app
app.locals.io = io;

const start = async () => {
  await connectDB();
  startScheduler();

  httpServer.listen(ENV.PORT, () => {
    console.log(`🚀 Server running on port ${ENV.PORT}`);
  });
};

start();