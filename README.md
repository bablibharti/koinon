# Collaborative Code Editor (Real-Time, CRDT-based)

> Full-stack real-time collaborative code editor. Built to demonstrate distributed
> state sync, not just CRUD.

## Architecture

```
client/    -> React + TypeScript + Vite + Monaco Editor + Yjs
server/    -> Node.js + Express + WebSocket (y-websocket) + Postgres + Redis
packages/  -> shared TypeScript types used by both client and server
```

## Architecture Decision Log

_(Fill this in as you build — each entry is one paragraph: what you chose, what
you rejected, and why. This becomes your interview cheat-sheet.)_

- **2026-08-11** — Repo initialized. Monorepo structure chosen (client/server/shared)
  over separate repos so shared TypeScript types stay in sync without publishing
  a package.

## Local Setup

```bash
npm install
npm run dev:client   # starts Vite dev server
npm run dev:server   # starts Express + WebSocket server
```

## Roadmap

See `ROADMAP.md` for the full phase-by-phase build plan.
