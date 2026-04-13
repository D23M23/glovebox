const express = require('express');
const cors = require('cors');
const { UPLOADS_DIR } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
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
