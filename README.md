# Collaborative Code Editor (Real-Time, CRDT-based)

> Full-stack real-time collaborative code editor. Built to demonstrate distributed
> state sync, not just CRUD.

## Architecture

```
client/    -> React + TypeScript + Vite + Monaco Editor + Yjs
server/    -> Node.js + Express + WebSocket (y-websocket) + Postgres + Redis
packages/  -> shared TypeScript types used by both client and server
```

## Architecture

![Architecture Diagram](./architecture.svg)

## Architecture Decision Log

_(Fill this in as you build — each entry is one paragraph: what you chose, what
you rejected, and why. This becomes your interview cheat-sheet.)_

- **2026-08-11** — Repo initialized. Monorepo structure chosen (client/server/shared)
  over separate repos so shared TypeScript types stay in sync without publishing
  a package.

- **2026-08-11** — Chose **pnpm** over npm as the package manager. pnpm is 
  better suited for monorepos/workspaces and is more disk-space efficient 
  (uses symlinked node_modules instead of duplicating packages across projects).

- **2026-08-11** — Chose **ESLint** over Oxlint for linting. Oxlint is newer 
  and faster (Rust-based), but ESLint is the industry standard — wider plugin 
  ecosystem, larger community support, and more familiar in team/interview contexts.


  ## Future Improvements

- **Refresh tokens**: Currently using long-lived JWT access tokens (7 days). 
  In production, I'd split into short-lived access tokens + refresh tokens 
  stored server-side, so leaked tokens have a smaller window and can be revoked.
- **Viewer role enforcement**: Role field exists in the schema (owner/editor/viewer), 
  but read-only enforcement in the editor UI isn't wired up yet.

  - **Redis for presence/scaling**: Currently presence (cursors, online status) is 
  handled in-memory on a single server instance. For horizontal scaling across 
  multiple server instances, I'd move this to Redis Pub/Sub so all instances 
  stay in sync instead of each holding its own in-memory state.

## Local Setup

```bash
npm install
npm run dev:client   # starts Vite dev server
npm run dev:server   # starts Express + WebSocket server
```

## Roadmap

See `ROADMAP.md` for the full phase-by-phase build plan.
