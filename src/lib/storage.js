// Storage service — all localStorage operations go through here.
// Swap this file's internals to migrate to IndexedDB or a REST API.

const KEYS = {
  vehicles: 'fleetapp_vehicles',
  serviceLogs: 'fleetapp_service_logs',
  conditionLogs: 'fleetapp_condition_logs',
};

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Vehicles ---

export function getVehicles() {
  return read(KEYS.vehicles);
}

export function saveVehicle(vehicle) {
  const vehicles = read(KEYS.vehicles);
  const idx = vehicles.findIndex((v) => v.id === vehicle.id);
  if (idx >= 0) {
    vehicles[idx] = vehicle;
  } else {
    vehicles.unshift(vehicle);
  }
  write(KEYS.vehicles, vehicles);
}

export function deleteVehicle(id) {
  write(KEYS.vehicles, read(KEYS.vehicles).filter((v) => v.id !== id));
  // cascade delete
  write(KEYS.serviceLogs, read(KEYS.serviceLogs).filter((e) => e.vehicleId !== id));
  write(KEYS.conditionLogs, read(KEYS.conditionLogs).filter((e) => e.vehicleId !== id));
}

// --- Service Logs ---

export function getServiceLogs(vehicleId) {
  const all = read(KEYS.serviceLogs);
  return vehicleId ? all.filter((e) => e.vehicleId === vehicleId) : all;
}

export function saveServiceLog(entry) {
  const logs = read(KEYS.serviceLogs);
  const idx = logs.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    logs[idx] = entry;
  } else {
    logs.unshift(entry);
  }
  write(KEYS.serviceLogs, logs);
}

export function deleteServiceLog(id) {
  write(KEYS.serviceLogs, read(KEYS.serviceLogs).filter((e) => e.id !== id));
}

// --- Condition Logs ---

export function getConditionLogs(vehicleId) {
  const all = read(KEYS.conditionLogs);
  return vehicleId ? all.filter((e) => e.vehicleId === vehicleId) : all;
}

export function saveConditionLog(entry) {
  const logs = read(KEYS.conditionLogs);
  const idx = logs.findIndex((e) => e.id === entry.id);
  if (idx >= 0) {
    logs[idx] = entry;
  } else {
    logs.unshift(entry);
  }
  write(KEYS.conditionLogs, logs);
}

export function deleteConditionLog(id) {
  write(KEYS.conditionLogs, read(KEYS.conditionLogs).filter((e) => e.id !== id));
}

// --- Storage usage estimate ---

export function getStorageUsageKB() {
  let total = 0;
  for (const key of Object.values(KEYS)) {
    const item = localStorage.getItem(key);
    if (item) total += item.length * 2; // UTF-16, 2 bytes per char
  }
  return Math.round(total / 1024);
}
