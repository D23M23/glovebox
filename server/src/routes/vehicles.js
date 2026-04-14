const router = require('express').Router();
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

function toVehicle(row) {
  if (!row) return null;
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    licensePlate: row.license_plate,
    vin: row.vin || '',
    type: row.type,
    color: row.color || '',
    notes: row.notes || '',
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    createdByName: row.created_by_name || null,
  };
}

router.get('/vehicles', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT v.*, u.name as created_by_name
    FROM vehicles v LEFT JOIN users u ON v.created_by = u.id
    WHERE v.is_active = 1
    ORDER BY v.created_at DESC
  `).all();
  res.json(rows.map(toVehicle));
});

router.post('/vehicles', requireAuth, (req, res) => {
  const { make, model, year, licensePlate, vin, type, color, notes } = req.body;
  if (!make || !model || !year || !licensePlate) {
    return res.status(400).json({ message: 'make, model, year and licensePlate are required' });
  }
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO vehicles (id, make, model, year, license_plate, vin, type, color, notes, is_active, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `).run(id, make, model, year, licensePlate, vin || null, type || 'rental', color || null, notes || null, now, now, req.user.id);

  const row = db.prepare('SELECT v.*, u.name as created_by_name FROM vehicles v LEFT JOIN users u ON v.created_by = u.id WHERE v.id = ?').get(id);
  res.status(201).json(toVehicle(row));
});

router.put('/vehicles/:id', requireAuth, (req, res) => {
  const { make, model, year, licensePlate, vin, type, color, notes } = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE vehicles SET make=?, model=?, year=?, license_plate=?, vin=?, type=?, color=?, notes=?, updated_at=?
    WHERE id=?
  `).run(make, model, year, licensePlate, vin || null, type || 'rental', color || null, notes || null, now, req.params.id);

  const row = db.prepare('SELECT v.*, u.name as created_by_name FROM vehicles v LEFT JOIN users u ON v.created_by = u.id WHERE v.id = ?').get(req.params.id);
  res.json(toVehicle(row));
});

router.delete('/vehicles/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required to remove vehicles.' });
  }
  // Soft delete
  db.prepare('UPDATE vehicles SET is_active = 0, updated_at = ? WHERE id = ?')
    .run(new Date().toISOString(), req.params.id);
  res.status(204).end();
});

module.exports = router;
