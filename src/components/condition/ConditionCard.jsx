import { format } from 'date-fns';
import { Calendar, Gauge, User, Camera, Trash2, Edit, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { useState } from 'react';
import { RatingDisplay } from '../shared/RatingStars';
import PhotoLightbox from '../shared/PhotoLightbox';

function fmt(d) {
  if (!d) return null;
  try { return format(new Date(d + 'T12:00:00'), 'MMM d, yyyy'); } catch { return d; }
}

export default function ConditionCard({ entry, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const photos = entry.photos ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <RatingDisplay value={entry.rating} showLabel />
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

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
          {entry.date && <Chip icon={Calendar} label={fmt(entry.date)} />}
          {entry.mileageAtInspection && <Chip icon={Gauge} label={`${Number(entry.mileageAtInspection).toLocaleString()} mi`} />}
          {entry.inspector && <Chip icon={User} label={entry.inspector} />}
          {entry.location && <Chip icon={MapPin} label={entry.location} />}
          {photos.length > 0 && <Chip icon={Camera} label={`${photos.length} photo${photos.length !== 1 ? 's' : ''}`} />}
        </div>

        {entry.notes && <p className="text-sm text-gray-600">{entry.notes}</p>}

        {entry.createdByName && (
          <p className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-400">
            Logged by <span className="font-medium text-gray-500">{entry.createdByName}</span>
          </p>
        )}
      </div>

      {photos.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 font-medium"
          >
            {expanded ? 'Hide photos' : `Show ${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="grid grid-cols-2 gap-1 p-2 bg-gray-50">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setLightboxIndex(i)}
                  className="relative rounded-lg overflow-hidden aspect-video bg-gray-100 group focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`View photo ${i + 1}${p.caption ? ': ' + p.caption : ''}`}
                >
                  <img src={`/uploads/${p.filename}`} alt={p.caption || 'Vehicle photo'} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Camera size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                  {p.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <p className="text-white text-[10px] truncate">{p.caption}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <PhotoLightbox
        photos={photos}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChange={setLightboxIndex}
      />
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
