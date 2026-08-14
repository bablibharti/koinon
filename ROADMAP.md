# Project Roadmap

> This was the original planning document, written before development started. 
> It reflects the initial plan and the reasoning behind each technology choice. 
> The actual build deviated in a few places as real constraints came up — see 
> `README.md` for what was actually shipped, the final architecture decisions, 
> and known trade-offs (Redis and refresh tokens were consciously deferred as 
> future improvements, and the WebSocket sync layer was custom-built rather 
> than using third-party server packages, due to dependency conflicts between 
> Yjs versions).

---

## Phase 0 — Setup & Planning

**Tools:**
- **Git + GitHub** — version control; a clean commit history shows organic, incremental development rather than a single dump.
- **Excalidraw** — for a simple architecture diagram, useful as an interview reference.
- **Node.js (v20+) + pnpm** — pnpm is more disk-efficient than npm and better suited to monorepo workspaces.

**Deliverables:**
- Monorepo structure: `/client`, `/server`, `/packages/shared` (shared TypeScript types across frontend and backend).
- README started early, with architecture decisions logged as they're made rather than reconstructed at the end.

---

## Phase 1 — Frontend Foundation

**Tools:**
- **React 18 + TypeScript + Vite** — Vite over Create React App: faster HMR, a modern build pipeline, and CRA is no longer actively maintained.
- **Monaco Editor** (`@monaco-editor/react`) — the same editor engine that powers VS Code, with IntelliSense out of the box.
- **TailwindCSS** — utility-first styling for fast, consistent UI without hand-written CSS.
- **Zustand** — lighter than Redux, minimal boilerplate, a good fit for the small amount of shared state a real-time app needs.

**Deliverables:**
- Code editor screen with a language selector and dark/light theme toggle.
- Room join/create UI (initially with local/dummy state, before the backend existed).

---

## Phase 2 — Real-Time Sync Core

**Tools:**
- **Yjs** — the CRDT engine that manages shared document state and conflict resolution.
- **y-monaco** — the official binding connecting a Yjs document directly to the Monaco editor.
- **y-websocket** — WebSocket provider used on the client side to broadcast Yjs changes.
- **y-protocols/awareness** — cursor position and presence (who's online, where their cursor is).

**Why CRDTs over Operational Transformation:**
- OT (the original approach behind Google Docs) requires a central server to sequence operations — complex to implement correctly from scratch.
- CRDTs let each client resolve conflicts independently with mathematically guaranteed convergence, with no central authority required.
- This is the same approach used by modern collaborative tools like Figma and Linear.

**Deliverables:**
- Real-time text sync verified across two browser tabs in the same room.
- Live cursor/presence indicators.

---

## Phase 3 — Backend & WebSocket Server

**Tools:**
- **Node.js + Express** — REST endpoints for auth and room management.
- **ws** — a raw WebSocket library, chosen over Socket.io for a more direct integration with Yjs.
- A server-side utility to manage Yjs documents per room (originally planned as a third-party package; see the note above).

**Why Node for the whole stack:**
- One language front-to-back reduces context switching.
- Node's event loop is naturally suited to many concurrent WebSocket connections, since the workload is I/O-bound rather than CPU-bound.

**Deliverables:**
- REST endpoints: `/api/rooms`, `/api/auth/login`, `/api/auth/register`.
- A WebSocket server that manages Yjs documents on a per-room basis.

---

## Phase 4 — Database Layer

**Tools:**
- **PostgreSQL** — relational storage for users, rooms, and permissions.
- **Prisma ORM** — type-safe queries and migrations, with strong TypeScript integration.
- A binary/blob column for storing Yjs document snapshots.

**Why PostgreSQL over MongoDB:**
- The core data is relational — a user belongs to many rooms, and a room has many collaborators, with clear foreign keys and joins.
- A blob column gives relational integrity for the metadata alongside flexible storage for the CRDT payload, without reaching for NoSQL on a dataset that's fundamentally relational.

**Deliverables:**
- Schema: `users`, `rooms`, `room_members` (with a role: owner/editor/viewer), `documents`.
- Periodic Yjs snapshot persistence for crash recovery.

---

## Phase 5 — Auth & Authorization

**Tools:**
- **JWT** — stateless, scalable authentication.
- **bcrypt** — password hashing.
- **Role-based access control** — owner/editor/viewer, scoped per room.

**Why this matters:**
- Going beyond a simple "logged in or not" check to real per-resource roles reflects how production systems are actually built, not just CRUD.

---

## Phase 6 — Presence & Scaling Layer

**Tools:**
- **Redis** — ephemeral state such as who's online, live cursor positions, and typing indicators.
- **Redis Pub/Sub** — for keeping multiple WebSocket server instances in sync.

**Why Redis matters here:**
- Hitting PostgreSQL on every cursor movement would be slow and wasteful.
- Redis Pub/Sub enables horizontal scaling — multiple server instances stay in sync through Redis instead of each relying solely on its own in-memory state.

---

## Phase 7 — Additional Features

**Ideas:**
- Multi-language syntax highlighting (built into Monaco).
- Optional code execution sandbox (e.g. Judge0 API or a Docker-based sandbox).
- Shareable room links with expiry.
- Version history, built from Yjs snapshots.
- Optional chat sidebar per room.

---

## Phase 8 — Testing

**Tools:**
- **Vitest** — unit tests for frontend and backend logic.
- **Playwright** — an end-to-end test simulating two users editing the same room simultaneously, verifying real-time sync.

---

## Phase 9 — Observability & Polish

**Tools:**
- **Pino** — structured logging.
- A `/health` endpoint, signaling production-readiness.
- **Sentry** (optional, free tier) — error tracking.

---

## Phase 10 — Deployment

**Tools:**
- **Docker + Docker Compose** — a reproducible local environment (Postgres, Redis, backend in one command).
- A hosting platform for the backend, database, and Redis.
- **Vercel** for the frontend.

**Why Docker:**
- Reproducible environments solve the "works on my machine" problem, and keep local development close to production.

---

## Phase 11 — Documentation & Portfolio Polish

**Deliverables:**
- A README with an architecture diagram, the "why X over Y" decisions above, setup instructions, and a live demo link.
- A short demo video showing two tabs syncing in real time.
- A one-line pitch for a resume or LinkedIn summary.

---

## Planned Tech Stack Summary

| Layer | Tool | Why |
|---|---|---|
| Editor | Monaco | Production-grade, the same engine behind VS Code |
| Language | TypeScript | Type safety across the sync layer |
| State | Zustand | Lightweight, minimal boilerplate vs. Redux |
| Sync | Yjs (CRDT) | No central sequencer, guaranteed convergence |
| Transport | WebSockets | Bidirectional, low-latency vs. polling/SSE |
| Backend | Node + Express | Event loop suited to I/O-bound WebSocket connections |
| Database | PostgreSQL + Prisma | Relational data, type-safe queries |
| Cache/Presence | Redis | Ephemeral state, horizontal scaling via Pub/Sub |
| Auth | JWT + bcrypt | Stateless, scalable, supports role-based access |
| Testing | Vitest + Playwright | Unit coverage plus a real multi-user E2E simulation |
| Deployment | Docker + hosting platforms | Reproducible environment, a real live demo link |
