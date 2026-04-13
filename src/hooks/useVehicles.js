import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/vehicles');
      setVehicles(data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const addVehicle = useCallback(async (data) => {
    const vehicle = await api.post('/vehicles', data);
    await reload();
    return vehicle;
  }, [reload]);

  const updateVehicle = useCallback(async (id, data) => {
    await api.put(`/vehicles/${id}`, data);
    await reload();
  }, [reload]);

  const removeVehicle = useCallback(async (id) => {
    await api.delete(`/vehicles/${id}`);
    await reload();
  }, [reload]);

  return { vehicles, loading, addVehicle, updateVehicle, removeVehicle };
}
