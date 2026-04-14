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

// ─── Panel geometry ───────────────────────────────────────────────────────────
// ViewBox: 0 0 300 420
// Centre column tapers like a real car — bumpers narrow, cabin wide.
// Side columns hold the four doors, vertically aligned with the cabin span.
//
//  x: bumper edge  = 105 / 195  (90 px wide)
//  x: hood/trunk   =  88 / 212  (124 px wide, tapers from cabin)
//  x: cabin/door   =  82 / 218  (136 px wide, widest point)
//  x: door outer   =   0 / 300

const PANELS = [
  // ── Centre column ──────────────────────────────────────────────────────────
  {
    id: 'front-bumper', label: 'Front Bumper',
    // narrowed rounded rect
    shape: 'rect', x: 103, y: 14, w: 94, h: 28, rx: 9,
    cx: 150, cy: 28, style: 'bumper',
  },
  {
    id: 'hood', label: 'Hood',
    // trapezoid: narrow at bumper end, wide at windshield end
    shape: 'poly', pts: '103,42 197,42 214,122 86,122',
    cx: 150, cy: 82, style: 'body',
  },
  {
    id: 'windshield', label: 'Windshield',
    shape: 'poly', pts: '86,122 214,122 208,156 92,156',
    cx: 150, cy: 139, style: 'glass',
  },
  {
    id: 'roof', label: 'Roof',
    shape: 'rect', x: 82, y: 156, w: 136, h: 84,
    cx: 150, cy: 198, style: 'roof',
  },
  {
    id: 'rear-window', label: 'Rear Window',
    shape: 'poly', pts: '92,240 208,240 214,274 86,274',
    cx: 150, cy: 257, style: 'glass',
  },
  {
    id: 'trunk', label: 'Trunk',
    // mirror of hood
    shape: 'poly', pts: '86,274 214,274 197,354 103,354',
    cx: 150, cy: 314, style: 'body',
  },
  {
    id: 'rear-bumper', label: 'Rear Bumper',
    shape: 'rect', x: 103, y: 354, w: 94, h: 28, rx: 9,
    cx: 150, cy: 368, style: 'bumper',
  },

  // ── Left doors ─────────────────────────────────────────────────────────────
  { id: 'front-left',  label: ['Front', 'Left'],  shape: 'rect', x: 0,   y: 156, w: 82, h: 84, cx: 41,  cy: 198, style: 'door' },
  { id: 'rear-left',   label: ['Rear',  'Left'],  shape: 'rect', x: 0,   y: 240, w: 82, h: 84, cx: 41,  cy: 282, style: 'door' },

  // ── Right doors ────────────────────────────────────────────────────────────
  { id: 'front-right', label: ['Front', 'Right'], shape: 'rect', x: 218, y: 156, w: 82, h: 84, cx: 259, cy: 198, style: 'door' },
  { id: 'rear-right',  label: ['Rear',  'Right'], shape: 'rect', x: 218, y: 240, w: 82, h: 84, cx: 259, cy: 282, style: 'door' },
];

const BASE = {
  bumper: { fill: '#e5e7eb', stroke: '#9ca3af' },
  body:   { fill: '#e9edf2', stroke: '#9ca3af' },
  glass:  { fill: '#dbeafe', stroke: '#93c5fd' },
  roof:   { fill: '#f1f5f9', stroke: '#94a3b8' },
  door:   { fill: '#e9edf2', stroke: '#9ca3af' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function VehicleDamageMap({ markers = [], onChange, readonly = false }) {
  const [selectedId, setSelectedId] = useState(null);
  const [editType,   setEditType]   = useState('');
  const [editNote,   setEditNote]   = useState('');

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
    onChange([...markers.filter((m) => m.panelId !== selectedId), { panelId: selectedId, type: editType, note: editNote }]);
    setSelectedId(null);
  }

  function remove() {
    onChange(markers.filter((m) => m.panelId !== selectedId));
    setSelectedId(null);
  }

  const selectedPanel    = PANELS.find((p) => p.id === selectedId);
  const existingSelected = byPanel[selectedId];

  return (
    <div className="space-y-3">

      {/* ── SVG diagram ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 overflow-x-auto">
        <svg viewBox="0 0 300 420" className="w-full max-w-[300px] mx-auto block" style={{ userSelect: 'none', minWidth: 220 }}>

          {/* Direction labels */}
          <text x="150" y="10"  textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="sans-serif" letterSpacing="1.5">FRONT</text>
          <text x="150" y="416" textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="sans-serif" letterSpacing="1.5">REAR</text>

          {/* Fold-line hints at door hinges */}
          <line x1="82" y1="156" x2="82" y2="324" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3"/>
          <line x1="218" y1="156" x2="218" y2="324" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3"/>

          {/* Side mirrors on front doors */}
          <rect x="68" y="152" width="16" height="9" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>
          <rect x="216" y="152" width="16" height="9" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1"/>

          {/* Wheel arches — subtle curves on door outer edges */}
          <path d="M0,195 Q-4,198 0,201" fill="none" stroke="#cbd5e1" strokeWidth="1.5"/>
          <path d="M0,279 Q-4,282 0,285" fill="none" stroke="#cbd5e1" strokeWidth="1.5"/>
          <path d="M300,195 Q304,198 300,201" fill="none" stroke="#cbd5e1" strokeWidth="1.5"/>
          <path d="M300,279 Q304,282 300,285" fill="none" stroke="#cbd5e1" strokeWidth="1.5"/>

          {/* ── Panels ──────────────────────────────────────────────────── */}
          {PANELS.map((panel) => {
            const damage     = byPanel[panel.id];
            const dmgType    = damage ? DAMAGE_TYPES.find((t) => t.id === damage.type) : null;
            const isSelected = panel.id === selectedId;
            const base       = BASE[panel.style];

            const fill   = dmgType ? dmgType.color + '28' : base.fill;
            const stroke = isSelected ? '#2563eb' : dmgType ? dmgType.color : base.stroke;
            const sw     = isSelected ? 2.5 : 1.5;

            const labelLines = Array.isArray(panel.label) ? panel.label : [panel.label];
            const fontSize   = panel.style === 'bumper' ? 7.5 : panel.style === 'glass' ? 8 : 9;
            const labelStartY = panel.cy - (labelLines.length - 1) * 6;

            return (
              <g key={panel.id} onClick={() => openPanel(panel.id)} style={{ cursor: readonly ? 'default' : 'pointer' }}>

                {/* Panel shape */}
                {panel.shape === 'rect' && (
                  <rect x={panel.x + 0.75} y={panel.y + 0.75} width={panel.w - 1.5} height={panel.h - 1.5}
                    rx={panel.rx ?? 3} fill={fill} stroke={stroke} strokeWidth={sw}/>
                )}
                {panel.shape === 'poly' && (
                  <polygon points={panel.pts} fill={fill} stroke={stroke} strokeWidth={sw}/>
                )}

                {/* Door window inset */}
                {panel.style === 'door' && (
                  <rect
                    x={panel.x + 7} y={panel.y + 7}
                    width={panel.w - 14} height={panel.h * 0.44}
                    rx="3"
                    fill={dmgType ? dmgType.color + '15' : '#eff6ff'}
                    stroke={dmgType ? dmgType.color + '70' : '#bfdbfe'}
                    strokeWidth="1"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Door handle */}
                {panel.style === 'door' && (
                  <rect
                    x={panel.x + panel.w - 18} y={panel.cy - 4}
                    width={12} height={7} rx="3"
                    fill="#d1d5db" stroke="#9ca3af" strokeWidth="0.75"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Damage indicator dot */}
                {dmgType && (
                  <circle cx={panel.cx + (panel.w ? panel.w / 2 - 10 : 22)} cy={panel.cy - (panel.h ? panel.h / 2 - 10 : 16)}
                    r="6" fill={dmgType.color} style={{ pointerEvents: 'none' }}/>
                )}

                {/* Panel label */}
                {labelLines.map((line, i) => (
                  <text key={i}
                    x={panel.cx} y={labelStartY + i * 12}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fill={isSelected ? '#1d4ed8' : '#6b7280'}
                    fontWeight={isSelected ? '600' : '400'}
                    fontFamily="sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >{line}</text>
                ))}
              </g>
            );
          })}

          {/* B-pillar on roof */}
          <line x1="150" y1="158" x2="150" y2="238" stroke="#cbd5e1" strokeWidth="1.5" style={{ pointerEvents: 'none' }}/>
          {/* Front/rear door seam on roof */}
          <line x1="83" y1="240" x2="217" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" style={{ pointerEvents: 'none' }}/>
        </svg>
      </div>

      {/* ── Panel editor ─────────────────────────────────────────────────── */}
      {selectedPanel && !readonly && (
        <div className="rounded-xl border border-blue-200 bg-gray-50 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">
              {Array.isArray(selectedPanel.label) ? selectedPanel.label.join(' ') : selectedPanel.label}
            </p>
            <button type="button" onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600">
              <X size={15}/>
            </button>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-2">Damage type</p>
            <div className="flex flex-wrap gap-1.5">
              {DAMAGE_TYPES.map((t) => (
                <button key={t.id} type="button" onClick={() => setEditType(t.id)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium border-2 transition-all"
                  style={{
                    borderColor: editType === t.id ? t.color : 'transparent',
                    backgroundColor: t.color + (editType === t.id ? '28' : '14'),
                    color: t.color,
                  }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1.5">Notes <span className="text-gray-400">(optional)</span></p>
            <input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && editType && save()}
              placeholder="e.g. 3-inch scratch near handle"
              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-2">
            {existingSelected && (
              <button type="button" onClick={remove}
                className="px-3 py-2 text-xs text-red-500 border border-red-200 rounded-lg hover:bg-red-50 font-medium">
                Remove
              </button>
            )}
            <button type="button" onClick={save} disabled={!editType}
              className="flex-1 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
              {existingSelected ? 'Update' : 'Mark Damage'}
            </button>
          </div>
        </div>
      )}

      {/* ── Damage summary ────────────────────────────────────────────────── */}
      {markers.length > 0 ? (
        <ul className="space-y-1.5">
          {markers.map((m) => {
            const panel   = PANELS.find((p) => p.id === m.panelId);
            const dmgType = DAMAGE_TYPES.find((t) => t.id === m.type) ?? DAMAGE_TYPES[5];
            const label   = panel ? (Array.isArray(panel.label) ? panel.label.join(' ') : panel.label) : m.panelId;
            return (
              <li key={m.panelId} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: dmgType.color }}/>
                <span className="font-medium text-gray-700 shrink-0">{label}</span>
                <span className="font-medium shrink-0" style={{ color: dmgType.color }}>{dmgType.label}</span>
                {m.note && <span className="text-gray-400 truncate">— {m.note}</span>}
                {!readonly && (
                  <button type="button" onClick={() => openPanel(m.panelId)}
                    className="ml-auto shrink-0 text-xs text-gray-400 hover:text-blue-500">Edit</button>
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
