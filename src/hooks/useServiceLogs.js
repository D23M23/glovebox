import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useServiceLogs(vehicleId) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!vehicleId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await api.get(`/vehicles/${vehicleId}/service-logs`);
      setLogs(data ?? []);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => { reload(); }, [reload]);

  const addLog = useCallback(async (data) => {
    const entry = await api.post(`/vehicles/${vehicleId}/service-logs`, data);
    await reload();
    return entry;
  }, [vehicleId, reload]);

  const updateLog = useCallback(async (id, data) => {
    await api.put(`/service-logs/${id}`, data);
    await reload();
  }, [reload]);

  const removeLog = useCallback(async (id) => {
    await api.delete(`/service-logs/${id}`);
    await reload();
  }, [reload]);

  return { logs, loading, addLog, updateLog, removeLog };
}
