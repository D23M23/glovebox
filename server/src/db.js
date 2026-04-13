const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'glovebox.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    license_plate TEXT NOT NULL,
    vin TEXT,
    type TEXT NOT NULL DEFAULT 'rental',
    color TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS service_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    mileage_at_service INTEGER,
    service_type TEXT NOT NULL,
    description TEXT,
    cost REAL,
    technician TEXT,
    next_service_due TEXT,
    next_service_mileage INTEGER,
    notes TEXT,
    location TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS condition_logs (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    mileage_at_inspection INTEGER,
    rating INTEGER NOT NULL,
    inspector TEXT,
    notes TEXT,
    location TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by TEXT REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS condition_photos (
    id TEXT PRIMARY KEY,
    condition_log_id TEXT NOT NULL REFERENCES condition_logs(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    caption TEXT,
    taken_at TEXT NOT NULL
  );
`);

try { db.exec('ALTER TABLE condition_logs ADD COLUMN damage_markers TEXT'); } catch (_) {}

module.exports = { db, DATA_DIR, UPLOADS_DIR };
