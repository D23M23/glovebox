import { Link } from 'react-router-dom';
import { Plus, Car } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import VehicleCard from '../components/vehicle/VehicleCard';
import EmptyState from '../components/shared/EmptyState';
import PageHeader from '../components/layout/PageHeader';

export default function VehiclesPage() {
  const { vehicles } = useVehicles();
  const active = vehicles.filter((v) => v.isActive !== false);

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="GloveBox"
        actions={
          <Link to="/vehicles/new" className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={20} />
          </Link>
        }
      />

      <div className="flex-1 px-4 py-4 pb-24 space-y-3 max-w-lg mx-auto w-full">
        {active.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No vehicles yet"
            description="Add your first vehicle to start logging service and condition history."
            action={
              <Link to="/vehicles/new" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-2xl hover:bg-blue-700">
                Add Vehicle
              </Link>
            }
          />
        ) : (
          active.map((v) => <VehicleCard key={v.id} vehicle={v} />)
        )}
      </div>
    </div>
  );
}
