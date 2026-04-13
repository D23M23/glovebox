import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Download, Plus, Wrench, ClipboardCheck } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import { useServiceLogs } from '../hooks/useServiceLogs';
import { useConditionLogs } from '../hooks/useConditionLogs';
import ServiceCard from '../components/service/ServiceCard';
import ServiceForm from '../components/service/ServiceForm';
import ConditionCard from '../components/condition/ConditionCard';
import ConditionForm from '../components/condition/ConditionForm';
import EmptyState from '../components/shared/EmptyState';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import PageHeader from '../components/layout/PageHeader';
import { exportServiceCSV, exportConditionCSV, downloadCSV, exportVehiclePDF } from '../lib/export';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, removeVehicle } = useVehicles();
  const { logs: serviceLogs, addLog: addService, updateLog: updateService, removeLog: removeService } = useServiceLogs(id);
  const { logs: conditionLogs, addLog: addCondition, updateLog: updateCondition, removeLog: removeCondition } = useConditionLogs(id);

  const [tab, setTab] = useState('service');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Inline form state
  const [serviceForm, setServiceForm] = useState(null); // null | 'new' | entry object
  const [conditionForm, setConditionForm] = useState(null);

  const vehicle = vehicles.find((v) => v.id === id);
  if (!vehicle) return <div className="p-8 text-center text-gray-500">Vehicle not found.</div>;

  function handleDeleteVehicle() {
    removeVehicle(id);
    navigate('/', { replace: true });
  }

  function handleServiceSubmit(data) {
    if (serviceForm && serviceForm.id) {
      updateService(serviceForm.id, data);
    } else {
      addService(data);
    }
    setServiceForm(null);
  }

  function handleConditionSubmit(data) {
    if (conditionForm && conditionForm.id) {
      updateCondition(conditionForm.id, data);
    } else {
      addCondition(data);
    }
    setConditionForm(null);
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        backTo="/"
        actions={
          <div className="flex gap-1">
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                title="Export"
              >
                <Download size={18} />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50 w-44">
                  <button onClick={() => { downloadCSV(exportServiceCSV(vehicle, serviceLogs), `${vehicle.licensePlate}_service.csv`); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50">
                    Service CSV
                  </button>
                  <button onClick={() => { downloadCSV(exportConditionCSV(vehicle, conditionLogs), `${vehicle.licensePlate}_condition.csv`); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50">
                    Condition CSV
                  </button>
                  <button onClick={() => { exportVehiclePDF(vehicle, serviceLogs, conditionLogs); setExportOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50">
                    Full PDF
                  </button>
                </div>
              )}
            </div>
            <Link to={`/vehicles/${id}/edit`} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <Edit size={18} />
            </Link>
            <button onClick={() => setDeleteDialog(true)} className="p-2 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500">
              <Trash2 size={18} />
            </button>
          </div>
        }
      />

      {/* Vehicle info strip */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex flex-wrap gap-3 text-sm text-gray-600 max-w-lg mx-auto w-full">
        {vehicle.licensePlate && <span className="font-medium">{vehicle.licensePlate}</span>}
        {vehicle.vin && <span className="text-gray-400">VIN: {vehicle.vin}</span>}
        {vehicle.color && <span>{vehicle.color}</span>}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full self-center ${vehicle.type === 'fleet' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
          {vehicle.type === 'fleet' ? 'Fleet' : 'Rental'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200 max-w-lg mx-auto w-full">
        <button
          onClick={() => { setTab('service'); setServiceForm(null); setConditionForm(null); }}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${tab === 'service' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
        >
          <Wrench size={15} /> Service ({serviceLogs.length})
        </button>
        <button
          onClick={() => { setTab('condition'); setServiceForm(null); setConditionForm(null); }}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${tab === 'condition' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500'}`}
        >
          <ClipboardCheck size={15} /> Condition ({conditionLogs.length})
        </button>
      </div>

      <div className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {tab === 'service' && (
          <div className="space-y-3">
            {/* Inline form */}
            {serviceForm !== null ? (
              <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden">
                <p className="px-4 pt-4 font-medium text-gray-700">{serviceForm?.id ? 'Edit Service Entry' : 'New Service Entry'}</p>
                <ServiceForm
                  defaultValues={serviceForm?.id ? serviceForm : undefined}
                  onSubmit={handleServiceSubmit}
                  onCancel={() => setServiceForm(null)}
                />
              </div>
            ) : (
              <button
                onClick={() => setServiceForm('new')}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-medium text-sm hover:bg-blue-50 transition-colors"
              >
                <Plus size={18} /> Add Service Entry
              </button>
            )}

            {serviceLogs.length === 0 && serviceForm === null && (
              <EmptyState icon={Wrench} title="No service records yet" description="Tap 'Add Service Entry' to log the first service." />
            )}

            {serviceLogs.map((e) => (
              <ServiceCard
                key={e.id}
                entry={e}
                onEdit={(entry) => setServiceForm(entry)}
                onDelete={removeService}
              />
            ))}
          </div>
        )}

        {tab === 'condition' && (
          <div className="space-y-3">
            {conditionForm !== null ? (
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
                <p className="px-4 pt-4 font-medium text-gray-700">{conditionForm?.id ? 'Edit Condition Entry' : 'New Condition Entry'}</p>
                <ConditionForm
                  defaultValues={conditionForm?.id ? conditionForm : undefined}
                  onSubmit={handleConditionSubmit}
                  onCancel={() => setConditionForm(null)}
                />
              </div>
            ) : (
              <button
                onClick={() => setConditionForm('new')}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-600 font-medium text-sm hover:bg-emerald-50 transition-colors"
              >
                <Plus size={18} /> Add Condition Entry
              </button>
            )}

            {conditionLogs.length === 0 && conditionForm === null && (
              <EmptyState icon={ClipboardCheck} title="No condition records yet" description="Tap 'Add Condition Entry' to log the first inspection." />
            )}

            {conditionLogs.map((e) => (
              <ConditionCard
                key={e.id}
                entry={e}
                onEdit={(entry) => setConditionForm(entry)}
                onDelete={removeCondition}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog}
        title="Delete Vehicle?"
        message="This will permanently delete this vehicle and all its service and condition logs."
        confirmLabel="Delete Vehicle"
        onConfirm={handleDeleteVehicle}
        onCancel={() => setDeleteDialog(false)}
      />
    </div>
  );
}
