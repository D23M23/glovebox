import { Link } from 'react-router-dom';
import { Car, Truck, ChevronRight } from 'lucide-react';

export default function VehicleCard({ vehicle }) {
  const Icon = vehicle.type === 'fleet' ? Truck : Car;
  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
    >
      <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        <Icon size={22} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {[vehicle.licensePlate, vehicle.color].filter(Boolean).join(' · ')}
        </p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        vehicle.type === 'fleet' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {vehicle.type === 'fleet' ? 'Fleet' : 'Rental'}
      </span>
      <ChevronRight size={18} className="text-gray-400 shrink-0" />
    </Link>
  );
}
