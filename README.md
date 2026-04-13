# GloveBox

A self-hosted, mobile-first fleet and rental vehicle service and condition logger — built as an open alternative to [LubeLogger](https://github.com/hargata/lubelog).

Designed for warehouse teams sharing a single URL: log service history, capture condition walkthroughs with photos, and export records as CSV or PDF.

---

## Features

- **Vehicle management** — fleet and rental vehicles with make, model, year, plate, VIN, color
- **Service logging** — oil changes, inspections, repairs, costs, technician, next service due
- **Condition logging** — 1–5 star ratings, photos (taken in-app or uploaded), notes, location
- **Who / What / Where / When** — every entry records the logged-in user, details, location, and timestamp
- **Export** — per-vehicle CSV (service or condition) and full PDF with embedded photos
- **Multi-user** — admin creates accounts for each team member; entries are attributed by name
- **Mobile-first** — bottom tab navigation, camera capture, works on any phone browser
- **Self-hosted** — all data stays on your server in a SQLite database

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express, better-sqlite3 |
| Auth | JWT (7-day sessions), bcrypt |
| Photos | Compressed via compressorjs, stored as files |
| Export | jsPDF + autotable, PapaParse |
| Serving | nginx (reverse proxy + static files) |
| Runtime | Docker + Docker Compose |

---

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/D23M23/glovebox.git
cd glovebox
cp .env.example .env
```

Edit `.env` — at minimum set a real `JWT_SECRET`:

```bash
# Generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
docker compose up --build -d
```

Open `http://YOUR-SERVER-IP:7070` — the first visit will prompt you to create an admin account.

### Dockhand

See `.env.dockhand` for the full variable reference.

| Variable | Type | Description |
|---|---|---|
| `APP_PORT` | Regular | Port exposed on your host (default `7070`) |
| `VITE_APP_TITLE` | Regular | Browser tab title (default `GloveBox`) |
| `JWT_SECRET` | **Secret** | Long random string — use Dockhand's Secrets tab |

---

## First Run

1. Open the app URL
2. Create your **admin account** (name, username, password)
3. Add vehicles via the **Vehicles** tab
4. Log service or condition records from the vehicle detail page or the bottom nav tabs
5. Create accounts for your team under the **Users** tab (admin only)

---

## Data Persistence

All data is stored in a Docker named volume (`glovebox_data`):

- `glovebox.db` — SQLite database (vehicles, logs, users)
- `uploads/` — condition photo files

The volume survives container rebuilds and updates. Back it up by copying `/var/lib/docker/volumes/glovebox_data` or using `docker cp`.

---

## Development

```bash
# Frontend (hot reload at localhost:5173)
npm install
npm run dev

# Backend (requires Node 20+)
cd server
npm install   # needs Python + make + g++ for better-sqlite3
node src/index.js
```

> **Windows note:** `better-sqlite3` requires native build tools. Run the server in Docker or install [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) for local dev. The frontend dev server works fine without the backend running.

---

## License

MIT
