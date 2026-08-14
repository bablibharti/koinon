# Koinon — Real-Time Collaborative Code Editor

🔗 **[Live Demo](https://koinon-client.vercel.app)** · Real-time collaborative code editor built with Yjs (CRDT), a custom WebSocket sync protocol, and role-based access control.

> Full-stack project built to demonstrate distributed state synchronization — not just CRUD.

> **Note:** The backend runs on Render's free tier and spins down after inactivity. The first request after idle may take 30–50 seconds to wake up.

---

## Features

- Real-time collaborative text editing (Monaco Editor + Yjs CRDT)
- Custom-built WebSocket sync protocol (no third-party sync server)
- JWT authentication with bcrypt password hashing
- Role-based room access (owner / editor)
- Document persistence with debounced auto-save and crash recovery
- End-to-end tested with Playwright (simulated multi-user sync)

---

## Architecture

```
client/    -> React + TypeScript + Vite + Monaco Editor + Yjs
server/    -> Node.js + Express + custom WebSocket sync (yjs + y-protocols) + PostgreSQL (Prisma)
packages/  -> shared TypeScript types used by both client and server
```

![Architecture Diagram](./architecture.svg)

---

## Architecture Decision Log

- **Monorepo structure** (client/server/shared) over separate repos, so shared TypeScript types stay in sync without publishing a package.
- **pnpm** over npm — better suited for monorepos/workspaces, more disk-space efficient (symlinked `node_modules` instead of duplicating packages).
- **ESLint** over Oxlint — Oxlint is newer and faster (Rust-based), but ESLint is the industry standard with a wider plugin ecosystem and broader team/interview familiarity.
- **Yjs (CRDT)** over Operational Transformation — CRDTs resolve conflicts independently on each client with guaranteed convergence, without needing a central sequencing server. Used by Figma and Linear for the same reason.
- **Custom WebSocket sync protocol** over `y-websocket-server` — the available server packages had unresolved dependency conflicts between Yjs v13 and v14. Implemented the sync handler directly using `y-protocols` and `lib0`, matching what those packages do internally.
- **PostgreSQL + Prisma** over MongoDB — the core data (users, rooms, memberships) is relational, with clear foreign keys and joins. A `Bytes` column stores Yjs binary snapshots for persistence, giving relational integrity and flexible blob storage in one database.

---

## Local Setup

### Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop (for local Postgres)

### Steps

```bash
git clone https://github.com/<your-username>/koinon.git
cd koinon
docker compose up -d          # starts local Postgres
pnpm install

cd server
pnpm exec prisma migrate dev
pnpm dev                      # runs on http://localhost:4000

# in a separate terminal
cd client
pnpm dev                      # runs on http://localhost:5173
```

### Environment Variables

`server/.env`
```
DATABASE_URL=postgresql://koinon:koinon_dev_password@localhost:<port>/koinon_db
JWT_SECRET=your-secret-key
PORT=4000
```

`client/.env`
```
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

---

## Running Tests

```bash
cd client
pnpm exec playwright test
```

Runs an end-to-end test that simulates two independent users registering, joining the same room, and verifies real-time text synchronization between them.

---

## Future Improvements

- **Refresh tokens** — currently using long-lived JWT access tokens (7 days). In production, I'd split this into short-lived access tokens plus server-stored refresh tokens, so a leaked token has a smaller window and can be revoked.
- **Viewer role enforcement** — the `role` field (owner/editor/viewer) exists in the schema, but read-only enforcement in the editor UI isn't wired up yet.
- **Redis for presence/scaling** — presence (cursors, online status) currently lives in memory on a single server instance. For horizontal scaling across multiple instances, this would move to Redis Pub/Sub so all instances stay in sync.

---

## Roadmap

See `ROADMAP.md` for the full phase-by-phase build plan.
