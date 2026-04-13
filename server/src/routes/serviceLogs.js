const router = require('express').Router();
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

function toLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.date,
    mileageAtService: row.mileage_at_service,
    serviceType: row.service_type,
    description: row.description || '',
    cost: row.cost,
    technician: row.technician || '',
    nextServiceDue: row.next_service_due || '',
    nextServiceMileage: row.next_service_mileage,
    notes: row.notes || '',
    location: row.location || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    createdByName: row.created_by_name || null,
  };
}

// GET all for a vehicle
router.get('/vehicles/:vehicleId/service-logs', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.name as created_by_name
    FROM service_logs s LEFT JOIN users u ON s.created_by = u.id
    WHERE s.vehicle_id = ?
    ORDER BY s.date DESC, s.created_at DESC
  `).all(req.params.vehicleId);
  res.json(rows.map(toLog));
});

// POST new
router.post('/vehicles/:vehicleId/service-logs', requireAuth, (req, res) => {
  const { date, mileageAtService, serviceType, description, cost, technician, nextServiceDue, nextServiceMileage, notes, location } = req.body;
  if (!date || !serviceType) return res.status(400).json({ message: 'date and serviceType are required' });

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO service_logs
      (id, vehicle_id, date, mileage_at_service, service_type, description, cost, technician, next_service_due, next_service_mileage, notes, location, created_at, updated_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.vehicleId, date, mileageAtService || null, serviceType, description || null, cost ?? null, technician || null, nextServiceDue || null, nextServiceMileage || null, notes || null, location || null, now, now, req.user.id);

  const row = db.prepare('SELECT s.*, u.name as created_by_name FROM service_logs s LEFT JOIN users u ON s.created_by = u.id WHERE s.id = ?').get(id);
  res.status(201).json(toLog(row));
});

// PUT update
router.put('/service-logs/:id', requireAuth, (req, res) => {
  const { date, mileageAtService, serviceType, description, cost, technician, nextServiceDue, nextServiceMileage, notes, location } = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE service_logs SET date=?, mileage_at_service=?, service_type=?, description=?, cost=?, technician=?, next_service_due=?, next_service_mileage=?, notes=?, location=?, updated_at=?
    WHERE id=?
  `).run(date, mileageAtService || null, serviceType, description || null, cost ?? null, technician || null, nextServiceDue || null, nextServiceMileage || null, notes || null, location || null, now, req.params.id);

  const row = db.prepare('SELECT s.*, u.name as created_by_name FROM service_logs s LEFT JOIN users u ON s.created_by = u.id WHERE s.id = ?').get(req.params.id);
  res.json(toLog(row));
});

// DELETE
router.delete('/service-logs/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM service_logs WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
