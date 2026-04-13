import { useParams, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import VehicleForm from '../components/vehicle/VehicleForm';
import PageHeader from '../components/layout/PageHeader';

export default function EditVehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, updateVehicle } = useVehicles();
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) return <div className="p-8 text-center text-gray-500">Vehicle not found.</div>;

  function handleSubmit(data) {
    updateVehicle(id, data);
    navigate(`/vehicles/${id}`, { replace: true });
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Edit Vehicle" backTo={`/vehicles/${id}`} />
      <div className="max-w-lg mx-auto w-full pb-24">
        <VehicleForm defaultValues={vehicle} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  );
}
