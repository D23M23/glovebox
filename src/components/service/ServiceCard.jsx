import { format } from 'date-fns';
import { Wrench, Calendar, Gauge, DollarSign, User, Trash2, Edit } from 'lucide-react';

function fmt(d) {
  if (!d) return null;
  try { return format(new Date(d + 'T12:00:00'), 'MMM d, yyyy'); } catch { return d; }
}

export default function ServiceCard({ entry, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {entry.serviceType}
          </span>
        </div>
        <div className="flex gap-1 shrink-0">
          {onEdit && (
            <button onClick={() => onEdit(entry)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <Edit size={15} />
            </button>
          )}
          <button onClick={() => onDelete(entry.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {entry.description && (
        <p className="text-sm text-gray-800 mb-3">{entry.description}</p>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
        {entry.date && (
          <Chip icon={Calendar} label={fmt(entry.date)} />
        )}
        {entry.mileageAtService && (
          <Chip icon={Gauge} label={`${Number(entry.mileageAtService).toLocaleString()} mi`} />
        )}
        {entry.cost != null && entry.cost !== '' && (
          <Chip icon={DollarSign} label={`$${Number(entry.cost).toFixed(2)}`} />
        )}
        {entry.technician && (
          <Chip icon={User} label={entry.technician} />
        )}
      </div>

      {(entry.nextServiceDue || entry.nextServiceMileage) && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
          <span className="font-medium text-gray-700">Next service: </span>
          {[
            entry.nextServiceDue && fmt(entry.nextServiceDue),
            entry.nextServiceMileage && `${Number(entry.nextServiceMileage).toLocaleString()} mi`,
          ].filter(Boolean).join(' or ')}
        </div>
      )}

      {entry.notes && (
        <p className="mt-2 text-xs text-gray-500 italic">{entry.notes}</p>
      )}
    </div>
  );
}

function Chip({ icon: Icon, label }) {
  return (
    <span className="flex items-center gap-1">
      <Icon size={12} className="shrink-0" />
      {label}
    </span>
  );
}
