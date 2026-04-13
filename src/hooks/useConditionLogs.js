import { useState, useEffect, useCallback } from 'react';
import { getConditionLogs, saveConditionLog, deleteConditionLog } from '../lib/storage';

export function useConditionLogs(vehicleId) {
  const [logs, setLogs] = useState([]);

  const reload = useCallback(() => {
    setLogs(getConditionLogs(vehicleId));
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
    saveConditionLog(entry);
    reload();
    return entry;
  }, [vehicleId, reload]);

  const updateLog = useCallback((id, data) => {
    const all = getConditionLogs();
    const existing = all.find((e) => e.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    saveConditionLog(updated);
    reload();
  }, [reload]);

  const removeLog = useCallback((id) => {
    deleteConditionLog(id);
    reload();
  }, [reload]);

  return { logs, addLog, updateLog, removeLog };
}
