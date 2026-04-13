import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import VehicleForm from '../components/vehicle/VehicleForm';
import PageHeader from '../components/layout/PageHeader';

export default function AddVehiclePage() {
  const navigate = useNavigate();
  const { addVehicle } = useVehicles();

  function handleSubmit(data) {
    const v = addVehicle(data);
    navigate(`/vehicles/${v.id}`, { replace: true });
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Add Vehicle" backTo="/" />
      <div className="max-w-lg mx-auto w-full pb-24">
        <VehicleForm onSubmit={handleSubmit} submitLabel="Add Vehicle" />
      </div>
    </div>
  );
}
