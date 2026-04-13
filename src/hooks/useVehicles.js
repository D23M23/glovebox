import { useState, useEffect, useCallback } from 'react';
import { getVehicles, saveVehicle, deleteVehicle } from '../lib/storage';

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    setVehicles(getVehicles());
  }, []);

  const addVehicle = useCallback((data) => {
    const vehicle = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    saveVehicle(vehicle);
    setVehicles(getVehicles());
    return vehicle;
  }, []);

  const updateVehicle = useCallback((id, data) => {
    const vehicles = getVehicles();
    const existing = vehicles.find((v) => v.id === id);
    if (!existing) return;
    const updated = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    saveVehicle(updated);
    setVehicles(getVehicles());
  }, []);

  const removeVehicle = useCallback((id) => {
    deleteVehicle(id);
    setVehicles(getVehicles());
  }, []);

  return { vehicles, addVehicle, updateVehicle, removeVehicle };
}
