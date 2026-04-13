import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import { useServiceLogs } from '../hooks/useServiceLogs';
import ServiceForm from '../components/service/ServiceForm';
import EmptyState from '../components/shared/EmptyState';
import PageHeader from '../components/layout/PageHeader';

// Quick service log from the bottom nav — user picks a vehicle then logs
export default function ServicePage() {
  const { vehicles } = useVehicles();
  const [vehicleId, setVehicleId] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const { addLog } = useServiceLogs(vehicleId || null);
  const active = vehicles.filter((v) => v.isActive !== false);

  function handleSubmit(data) {
    addLog(data);
    setDone(true);
  }

  if (active.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Log Service" />
        <EmptyState
          icon={Wrench}
          title="No vehicles yet"
          description="Add a vehicle first before logging service."
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Log Service" />
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Wrench size={28} className="text-green-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Service logged!</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setDone(false); setVehicleId(''); }}
              className="px-4 py-2.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log Another
            </button>
            <button
              onClick={() => navigate(`/vehicles/${vehicleId}`)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-semibold hover:bg-blue-700"
            >
              View Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Log Service" />
      <div className="max-w-lg mx-auto w-full pb-24">
        <div className="px-4 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1"
          >
            <option value="">Select a vehicle...</option>
            {active.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model} — {v.licensePlate}
              </option>
            ))}
          </select>
        </div>
        {vehicleId && (
          <ServiceForm
            onSubmit={handleSubmit}
            submitLabel="Save Service Log"
          />
        )}
      </div>
    </div>
  );
}
