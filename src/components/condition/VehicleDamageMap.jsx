import { useState } from 'react';
import { X } from 'lucide-react';

export const DAMAGE_TYPES = [
  { id: 'scratch', label: 'Scratch', color: '#f97316' },
  { id: 'dent',    label: 'Dent',    color: '#ef4444' },
  { id: 'chip',    label: 'Chip',    color: '#eab308' },
  { id: 'crack',   label: 'Crack',   color: '#3b82f6' },
  { id: 'missing', label: 'Missing', color: '#8b5cf6' },
  { id: 'other',   label: 'Other',   color: '#6b7280' },
];

// ─── Panel definitions ────────────────────────────────────────────────────────
// Layout: center column (x 85–215) flanked by door columns (x 0–85, 215–300).
// Doors are vertically aligned with the windshield→rear-window span.
const CX = 85;   // center column left edge
const CW = 130;  // center column width
const SW = 85;   // side column width

const PANELS = [
  // Centre column — top to bottom
  { id: 'front-bumper', label: 'Front Bumper', x: CX,       y: 14,  w: CW, h: 30,  style: 'bumper' },
  { id: 'hood',         label: 'Hood',         x: CX,       y: 44,  w: CW, h: 72,  style: 'body' },
  { id: 'windshield',   label: 'Windshield',   x: CX,       y: 116, w: CW, h: 32,  style: 'glass' },
  { id: 'roof',         label: 'Roof',         x: CX,       y: 148, w: CW, h: 80,  style: 'roof' },
  { id: 'rear-window',  label: 'Rear Window',  x: CX,       y: 228, w: CW, h: 32,  style: 'glass' },
  { id: 'trunk',        label: 'Trunk',        x: CX,       y: 260, w: CW, h: 72,  style: 'body' },
  { id: 'rear-bumper',  label: 'Rear Bumper',  x: CX,       y: 332, w: CW, h: 30,  style: 'bumper' },
  // Left door column
  { id: 'front-left',   label: ['Front', 'Left'],  x: 0,    y: 116, w: SW, h: 72,  style: 'door' },
  { id: 'rear-left',    label: ['Rear', 'Left'],   x: 0,    y: 188, w: SW, h: 72,  style: 'door' },
  // Right door column
  { id: 'front-right',  label: ['Front', 'Right'], x: CX+CW, y: 116, w: SW, h: 72, style: 'door' },
  { id: 'rear-right',   label: ['Rear', 'Right'],  x: CX+CW, y: 188, w: SW, h: 72, style: 'door' },
];

const STYLE_DEFAULTS = {
  bumper: { fill: '#e5e7eb', stroke: '#9ca3af' },
  body:   { fill: '#f3f4f6', stroke: '#9ca3af' },
  glass:  { fill: '#eff6ff', stroke: '#93c5fd' },
  roof:   { fill: '#f9fafb', stroke: '#9ca3af' },
  door:   { fill: '#f3f4f6', stroke: '#9ca3af' },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function VehicleDamageMap({ markers = [], onChange, readonly = false }) {
  const [selectedId, setSelectedId] = useState(null);
  const [editType, setEditType] = useState('');
  const [editNote, setEditNote] = useState('');

  // Index markers by panelId for O(1) lookup
  const byPanel = Object.fromEntries(markers.map((m) => [m.panelId, m]));

  function openPanel(panelId) {
    if (readonly) return;
    const existing = byPanel[panelId];
    setSelectedId(panelId);
    setEditType(existing?.type ?? '');
    setEditNote(existing?.note ?? '');
  }

  function save() {
    if (!editType) return;
    const rest = markers.filter((m) => m.panelId !== selectedId);
    onChange([...rest, { panelId: selectedId, type: editType, note: editNote }]);
    setSelectedId(null);
  }

  function remove() {
    onChange(markers.filter((m) => m.panelId !== selectedId));
    setSelectedId(null);
  }

  const selectedPanel = PANELS.find((p) => p.id === selectedId);
  const existingOnSelected = byPanel[selectedId];

  return (
    <div className="space-y-3">
      {/* ── SVG diagram ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 overflow-x-auto">
        <svg
          viewBox="0 0 300 380"
          className="w-full max-w-[300px] mx-auto block"
          style={{ userSelect: 'none', minWidth: 220 }}
        >
          {/* FRONT / REAR direction labels */}
          <text x="150" y="10" textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="sans-serif" letterSpacing="1.5">FRONT</text>
          <text x="150" y="376" textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="sans-serif" letterSpacing="1.5">REAR</text>

          {/* Fold-line hints where doors meet the body */}
          <line x1={CX}     y1={116} x2={CX}     y2={260} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
          <line x1={CX+CW}  y1={116} x2={CX+CW}  y2={260} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

          {/* Wheel arch indicators on door panels */}
          {/* Front-left wheel arch */}
          <path d="M 0,188 Q 20,160 42,188" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Rear-left wheel arch */}
          <path d="M 0,260 Q 20,232 42,260" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Front-right wheel arch */}
          <path d={`M ${CX+CW},188 Q ${CX+CW+20},160 ${CX+CW+42},188`} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Rear-right wheel arch */}
          <path d={`M ${CX+CW},260 Q ${CX+CW+20},232 ${CX+CW+42},260`} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* ── Panels ──────────────────────────────────────────────── */}
          {PANELS.map((panel) => {
            const damage  = byPanel[panel.id];
            const dmgType = damage ? DAMAGE_TYPES.find((t) => t.id === damage.type) : null;
            const isSelected = panel.id === selectedId;
            const defaults = STYLE_DEFAULTS[panel.style];

            const fillColor   = dmgType  ? dmgType.color + '28' : defaults.fill;
            const strokeColor = isSelected ? '#2563eb' : dmgType ? dmgType.color : defaults.stroke;
            const strokeWidth = isSelected ? 2.5 : 1.5;

            const labelLines = Array.isArray(panel.label) ? panel.label : [panel.label];
            const labelY = panel.y + panel.h / 2 + (labelLines.length > 1 ? -5 : 4);

            return (
              <g
                key={panel.id}
                onClick={() => openPanel(panel.id)}
                style={{ cursor: readonly ? 'default' : 'pointer' }}
              >
                <rect
                  x={panel.x + 1} y={panel.y + 1}
                  width={panel.w - 2} height={panel.h - 2}
                  rx={panel.style === 'bumper' ? 6 : 3}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />

                {/* Window inset for door panels */}
                {panel.style === 'door' && (
                  <rect
                    x={panel.x + 8} y={panel.y + 8}
                    width={panel.w - 16} height={panel.h * 0.45}
                    rx="3"
                    fill={dmgType ? dmgType.color + '15' : '#eff6ff'}
                    stroke={dmgType ? dmgType.color + '60' : '#93c5fd'}
                    strokeWidth="1"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Damage dot */}
                {dmgType && (
                  <circle
                    cx={panel.x + panel.w - 9} cy={panel.y + 9}
                    r="6" fill={dmgType.color}
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Panel label */}
                {labelLines.map((line, i) => (
                  <text
                    key={i}
                    x={panel.x + panel.w / 2}
                    y={labelY + i * 11}
                    textAnchor="middle"
                    fontSize={panel.h < 34 ? '8' : '9'}
                    fill={isSelected ? '#1d4ed8' : '#6b7280'}
                    fontWeight={isSelected ? '600' : '400'}
                    fontFamily="sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Panel editor ────────────────────────────────────────────── */}
      {selectedPanel && !readonly && (
        <div className="rounded-xl border border-blue-200 bg-gray-50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">
              {Array.isArray(selectedPanel.label) ? selectedPanel.label.join(' ') : selectedPanel.label}
            </p>
            <button type="button" onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">
              <X size={15} />
            </button>
          </div>

          {/* Damage type */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Damage type</p>
            <div className="flex flex-wrap gap-1.5">
              {DAMAGE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditType(t.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border-2 transition-all"
                  style={{
                    borderColor: editType === t.id ? t.color : 'transparent',
                    backgroundColor: t.color + (editType === t.id ? '28' : '14'),
                    color: t.color,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Notes <span className="text-gray-400">(optional)</span></p>
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && editType && save()}
              placeholder="e.g. 3-inch scratch near door handle"
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {existingOnSelected && (
              <button type="button" onClick={remove}
                className="px-3 py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 font-medium">
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!editType}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {existingOnSelected ? 'Update' : 'Mark Damage'}
            </button>
          </div>
        </div>
      )}

      {/* ── Damage summary ──────────────────────────────────────────── */}
      {markers.length > 0 ? (
        <ul className="space-y-1.5">
          {markers.map((m) => {
            const panel   = PANELS.find((p) => p.id === m.panelId);
            const dmgType = DAMAGE_TYPES.find((t) => t.id === m.type) ?? DAMAGE_TYPES[5];
            const label   = panel ? (Array.isArray(panel.label) ? panel.label.join(' ') : panel.label) : m.panelId;
            return (
              <li key={m.panelId} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dmgType.color }} />
                <span className="font-medium text-gray-700 shrink-0">{label}</span>
                <span className="font-medium shrink-0" style={{ color: dmgType.color }}>{dmgType.label}</span>
                {m.note && <span className="text-gray-400 truncate">— {m.note}</span>}
                {!readonly && (
                  <button type="button" onClick={() => openPanel(m.panelId)}
                    className="ml-auto shrink-0 text-xs text-gray-400 hover:text-blue-500">
                    Edit
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        !readonly && <p className="text-xs text-center text-gray-400 py-1">Tap a panel to mark damage</p>
      )}
    </div>
  );
}
