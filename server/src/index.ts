import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "@y/websocket-server/utils";
dotenv.config();
import authRoutes from "./routes/auth";
import roomRoutes from "./routes/room";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Koinon server is running" });
});

app.use("/api/auth", authRoutes);

app.use("/api/rooms", roomRoutes);

// Create a raw HTTP server so both Express (REST) and WebSocket
// can share the same port
const server = createServer(app);

// Attach a WebSocket server on top of the same HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  // setupWSConnection handles all Yjs sync logic:
  // room joining (via URL path), broadcasting changes, awareness (cursors)
  setupWSConnection(ws, req);
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server running on http://localhost:${PORT}`);
});
