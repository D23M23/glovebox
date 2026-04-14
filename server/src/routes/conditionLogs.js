const router = require('express').Router();
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

function toLog(row, photos) {
  if (!row) return null;
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.date,
    mileageAtInspection: row.mileage_at_inspection,
    rating: row.rating,
    inspector: row.inspector || '',
    notes: row.notes || '',
    location: row.location || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    createdByName: row.created_by_name || null,
    photos: (photos || []).map((p) => ({
      id: p.id,
      filename: p.filename,
      caption: p.caption || '',
      takenAt: p.taken_at,
    })),
    damageMarkers: (() => { try { return row.damage_markers ? JSON.parse(row.damage_markers) : []; } catch { return []; } })(),
  };
}

function getPhotos(logId) {
  return db.prepare('SELECT * FROM condition_photos WHERE condition_log_id = ? ORDER BY taken_at').all(logId);
}

// GET all for a vehicle
router.get('/vehicles/:vehicleId/condition-logs', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT c.*, u.name as created_by_name
    FROM condition_logs c LEFT JOIN users u ON c.created_by = u.id
    WHERE c.vehicle_id = ?
    ORDER BY c.date DESC, c.created_at DESC
  `).all(req.params.vehicleId);

  res.json(rows.map((r) => toLog(r, getPhotos(r.id))));
});

// POST new
router.post('/vehicles/:vehicleId/condition-logs', requireAuth, (req, res) => {
  const { date, mileageAtInspection, rating, inspector, notes, location, photos = [], damageMarkers = [] } = req.body;
  if (!date || !rating) return res.status(400).json({ message: 'date and rating are required' });

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  db.prepare(`
    INSERT INTO condition_logs
      (id, vehicle_id, date, mileage_at_inspection, rating, inspector, notes, location, damage_markers, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.vehicleId, date, mileageAtInspection || null, rating, inspector || null, notes || null, location || null, JSON.stringify(damageMarkers), now, now, req.user.id);

  const insertPhoto = db.prepare('INSERT INTO condition_photos (id, condition_log_id, filename, caption, taken_at) VALUES (?, ?, ?, ?, ?)');
  for (const p of photos) {
    insertPhoto.run(p.id || crypto.randomUUID(), id, p.filename, p.caption || null, p.takenAt || now);
  }

  const row = db.prepare('SELECT c.*, u.name as created_by_name FROM condition_logs c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?').get(id);
  res.status(201).json(toLog(row, getPhotos(id)));
});

// PUT update
router.put('/condition-logs/:id', requireAuth, (req, res) => {
  const { date, mileageAtInspection, rating, inspector, notes, location, photos = [], damageMarkers = [] } = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE condition_logs SET date=?, mileage_at_inspection=?, rating=?, inspector=?, notes=?, location=?, damage_markers=?, updated_at=?
    WHERE id=?
  `).run(date, mileageAtInspection || null, rating, inspector || null, notes || null, location || null, JSON.stringify(damageMarkers), now, req.params.id);

  // Replace photos
  db.prepare('DELETE FROM condition_photos WHERE condition_log_id = ?').run(req.params.id);
  const insertPhoto = db.prepare('INSERT INTO condition_photos (id, condition_log_id, filename, caption, taken_at) VALUES (?, ?, ?, ?, ?)');
  for (const p of photos) {
    insertPhoto.run(p.id || crypto.randomUUID(), req.params.id, p.filename, p.caption || null, p.takenAt || now);
  }

  const row = db.prepare('SELECT c.*, u.name as created_by_name FROM condition_logs c LEFT JOIN users u ON c.created_by = u.id WHERE c.id = ?').get(req.params.id);
  res.json(toLog(row, getPhotos(req.params.id)));
});

// DELETE
router.delete('/condition-logs/:id', requireAuth, (req, res) => {
  const log = db.prepare('SELECT created_by FROM condition_logs WHERE id = ?').get(req.params.id);
  if (!log) return res.status(404).json({ message: 'Not found.' });
  if (log.created_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only the original author or an admin can delete this entry.' });
  }
  db.prepare('DELETE FROM condition_logs WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
