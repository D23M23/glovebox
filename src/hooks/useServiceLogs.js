import { useState, useEffect, useCallback } from 'react';
import { getServiceLogs, saveServiceLog, deleteServiceLog } from '../lib/storage';

export function useServiceLogs(vehicleId) {
  const [logs, setLogs] = useState([]);

  const reload = useCallback(() => {
    setLogs(getServiceLogs(vehicleId));
  }, [vehicleId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addLog = useCallback((data) => {
    const entry = {
      ...data,
      vehicleId,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveServiceLog(entry);
    reload();
    return entry;
  }, [vehicleId, reload]);

  const updateLog = useCallback((id, data) => {
    const all = getServiceLogs();
    const existing = all.find((e) => e.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    saveServiceLog(updated);
    reload();
  }, [reload]);

  const removeLog = useCallback((id) => {
    deleteServiceLog(id);
    reload();
  }, [reload]);

  return { logs, addLog, updateLog, removeLog };
}
