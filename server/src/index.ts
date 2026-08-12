import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection, getYDoc } from "./lib/wsUtils.js";
import * as Y from "yjs";
import { loadDocument, saveDocument } from "./lib/documents.js";
dotenv.config();
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/room.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Koinon server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Tracks which rooms have already been loaded from DB + have a save listener attached
const initializedRooms = new Set<string>();
const saveTimers = new Map<string, NodeJS.Timeout>();

wss.on("connection", async (ws, req) => {
  const roomId = req.url?.slice(1).split("?")[0] || "default";
  const doc = getYDoc(roomId);

  // Only do this ONCE per room (not once per connection)
  if (!initializedRooms.has(roomId)) {
    initializedRooms.add(roomId);

    // Load any previously saved state from the database
    const saved = await loadDocument(roomId);
    if (saved) Y.applyUpdate(doc, saved);

    // Attach a single debounced auto-save listener for this room
    doc.on("update", () => {
      if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId)!);
      const timer = setTimeout(() => saveDocument(roomId, doc), 3000);
      saveTimers.set(roomId, timer);
    });
  }

  setupWSConnection(ws, roomId);
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`HTTP + WebSocket server running on http://localhost:${PORT}`);
});
