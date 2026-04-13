import { NavLink } from 'react-router-dom';
import { Car, Wrench, ClipboardCheck } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Vehicles', icon: Car, end: true },
  { to: '/service', label: 'Service', icon: Wrench },
  { to: '/condition', label: 'Condition', icon: ClipboardCheck },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
