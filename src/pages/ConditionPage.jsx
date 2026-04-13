import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import { useConditionLogs } from '../hooks/useConditionLogs';
import ConditionForm from '../components/condition/ConditionForm';
import EmptyState from '../components/shared/EmptyState';
import PageHeader from '../components/layout/PageHeader';

export default function ConditionPage() {
  const { vehicles } = useVehicles();
  const [vehicleId, setVehicleId] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const { addLog } = useConditionLogs(vehicleId || null);
  const active = vehicles.filter((v) => v.isActive !== false);

  function handleSubmit(data) {
    addLog(data);
    setDone(true);
  }

  if (active.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Log Condition" />
        <EmptyState
          icon={ClipboardCheck}
          title="No vehicles yet"
          description="Add a vehicle first before logging condition."
        />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Log Condition" />
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <ClipboardCheck size={28} className="text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900">Condition logged!</p>
          <div className="flex gap-3">
            <button
              onClick={() => { setDone(false); setVehicleId(''); }}
              className="px-4 py-2.5 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log Another
            </button>
            <button
              onClick={() => navigate(`/vehicles/${vehicleId}`)}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-semibold hover:bg-emerald-700"
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
      <PageHeader title="Log Condition" />
      <div className="max-w-lg mx-auto w-full pb-24">
        <div className="px-4 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-1"
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
          <ConditionForm
            onSubmit={handleSubmit}
            submitLabel="Save Condition Log"
          />
        )}
      </div>
    </div>
  );
}
