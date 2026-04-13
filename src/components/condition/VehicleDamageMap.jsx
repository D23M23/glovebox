import { useState } from 'react';

export const DAMAGE_TYPES = [
  { id: 'scratch', label: 'Scratch', color: '#f97316' },
  { id: 'dent',    label: 'Dent',    color: '#ef4444' },
  { id: 'chip',    label: 'Chip',    color: '#eab308' },
  { id: 'crack',   label: 'Crack',   color: '#3b82f6' },
  { id: 'missing', label: 'Missing', color: '#8b5cf6' },
  { id: 'other',   label: 'Other',   color: '#6b7280' },
];

function damageColor(type) {
  return DAMAGE_TYPES.find((d) => d.id === type)?.color ?? '#6b7280';
}

export default function VehicleDamageMap({ markers = [], onChange, readonly = false }) {
  const [pending, setPending] = useState(null);   // { x, y } percentages
  const [editing, setEditing] = useState(null);   // marker id

  const editingMarker = markers.find((m) => m.id === editing);

  function handleSvgClick(e) {
    if (readonly) return;
    // If we're editing an existing marker, close it instead of placing new
    if (editing) { setEditing(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPending({ x, y });
    setEditing(null);
  }

  function confirmType(type) {
    if (!pending) return;
    const newMarker = {
      id: crypto.randomUUID(),
      x: pending.x,
      y: pending.y,
      type,
      note: '',
    };
    onChange([...markers, newMarker]);
    setPending(null);
  }

  function cancelPending() {
    setPending(null);
  }

  function handleMarkerClick(e, id) {
    if (readonly) return;
    e.stopPropagation();
    setPending(null);
    setEditing(editing === id ? null : id);
  }

  function updateNote(note) {
    onChange(markers.map((m) => (m.id === editing ? { ...m, note } : m)));
  }

  function removeMarker() {
    onChange(markers.filter((m) => m.id !== editing));
    setEditing(null);
  }

  return (
    <div className="space-y-3">
      {/* SVG Map */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 flex justify-center">
        <svg
          viewBox="0 0 160 370"
          overflow="visible"
          className={`w-full max-w-[160px] ${!readonly ? 'cursor-crosshair' : ''}`}
          onClick={handleSvgClick}
        >
          {/* Main body */}
          <path d="M32,30 L128,30 C143,30 147,45 147,62 L147,295 C147,318 130,338 80,340 C30,338 13,318 13,295 L13,62 C13,45 17,30 32,30 Z" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.5" />
          {/* Hood */}
          <path d="M32,30 L128,30 C140,30 145,42 145,58 L145,108 L15,108 L15,58 C15,42 20,30 32,30 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
          {/* Front windshield */}
          <path d="M25,108 L135,108 L130,130 L30,130 Z" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
          {/* Cabin */}
          <rect x="19" y="130" width="122" height="130" rx="3" fill="#f9fafb" stroke="#9ca3af" strokeWidth="1" />
          {/* Door seam */}
          <line x1="19" y1="196" x2="141" y2="196" stroke="#d1d5db" strokeWidth="1" />
          {/* B-pillar */}
          <line x1="80" y1="130" x2="80" y2="260" stroke="#e5e7eb" strokeWidth="2" />
          {/* Rear windshield */}
          <path d="M30,260 L130,260 L135,282 L25,282 Z" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
          {/* Trunk */}
          <path d="M15,282 L145,282 L145,295 C145,318 130,338 80,340 C30,338 15,318 15,295 Z" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
          {/* Headlights */}
          <rect x="22" y="23" width="32" height="10" rx="3" fill="#fef9c3" stroke="#fbbf24" />
          <rect x="106" y="23" width="32" height="10" rx="3" fill="#fef9c3" stroke="#fbbf24" />
          {/* Tail lights */}
          <rect x="22" y="337" width="32" height="10" rx="3" fill="#fee2e2" stroke="#f87171" />
          <rect x="106" y="337" width="32" height="10" rx="3" fill="#fee2e2" stroke="#f87171" />
          {/* Grille */}
          <rect x="50" y="20" width="60" height="8" rx="2" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1" />
          {/* Wheels */}
          <rect x="1" y="82" width="14" height="50" rx="5" fill="#6b7280" />
          <rect x="145" y="82" width="14" height="50" rx="5" fill="#6b7280" />
          <rect x="1" y="228" width="14" height="50" rx="5" fill="#6b7280" />
          <rect x="145" y="228" width="14" height="50" rx="5" fill="#6b7280" />
          {/* Labels */}
          <text x="80" y="14" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="sans-serif" letterSpacing="1">FRONT</text>
          <text x="80" y="360" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="sans-serif" letterSpacing="1">REAR</text>

          {/* Confirmed markers */}
          {markers.map((m, i) => {
            const cx = (m.x / 100) * 160;
            const cy = (m.y / 100) * 370;
            const color = damageColor(m.type);
            const isEditing = m.id === editing;
            return (
              <g key={m.id} onClick={(e) => handleMarkerClick(e, m.id)} style={{ cursor: readonly ? 'default' : 'pointer' }}>
                <circle
                  cx={cx} cy={cy} r="9"
                  fill={color}
                  stroke={isEditing ? '#fff' : color}
                  strokeWidth={isEditing ? 2 : 1}
                  opacity={0.92}
                />
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Pending ghost marker */}
          {pending && (
            <circle
              cx={(pending.x / 100) * 160}
              cy={(pending.y / 100) * 370}
              r="9"
              fill="none"
              stroke="#6b7280"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              opacity={0.7}
            />
          )}
        </svg>
      </div>

      {/* Pending: type selector */}
      {!readonly && pending && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
          <p className="text-xs font-medium text-gray-600">Select damage type:</p>
          <div className="flex flex-wrap gap-2">
            {DAMAGE_TYPES.map((dt) => (
              <button
                key={dt.id}
                type="button"
                onClick={() => confirmType(dt.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: dt.color }}
              >
                {dt.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={cancelPending} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
      )}

      {/* Editing panel */}
      {!readonly && editing && editingMarker && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: damageColor(editingMarker.type) }}
            />
            <span className="text-xs font-semibold text-gray-700 capitalize">{editingMarker.type}</span>
            <span className="text-xs text-gray-400">— Marker #{markers.findIndex((m) => m.id === editing) + 1}</span>
          </div>
          <input
            type="text"
            value={editingMarker.note}
            onChange={(e) => updateNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <button type="button" onClick={removeMarker} className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium">
              Remove
            </button>
            <button type="button" onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      {markers.length > 0 && (
        <ul className="space-y-1">
          {markers.map((m, i) => {
            const color = damageColor(m.type);
            const dtLabel = DAMAGE_TYPES.find((d) => d.id === m.type)?.label ?? m.type;
            return (
              <li key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-bold shrink-0"
                  style={{ backgroundColor: color, fontSize: '9px' }}
                >
                  {i + 1}
                </span>
                <span className="font-medium capitalize">{dtLabel}</span>
                {m.note && <span className="text-gray-400 truncate max-w-[160px]">{m.note}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
