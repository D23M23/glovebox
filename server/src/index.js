const express = require('express');
const cors = require('cors');
const { UPLOADS_DIR } = require('./db');

// Fail fast if required secrets are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');

// CORS — lock down to a specific origin via CORS_ORIGIN env var if set
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '1mb' }));

// Serve uploaded photos directly
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1y', immutable: true }));

// API routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api',         require('./routes/vehicles'));
app.use('/api',         require('./routes/serviceLogs'));
app.use('/api',         require('./routes/conditionLogs'));
app.use('/api/uploads', require('./routes/uploads'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`GloveBox API running on :${PORT}`));
