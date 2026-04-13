import { NavLink } from 'react-router-dom';
import { Car, Wrench, ClipboardCheck, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SideNav() {
  const { user } = useAuth();
  if (!user) return null;

  const tabs = [
    { to: '/', label: 'Vehicles', icon: Car, end: true },
    { to: '/service', label: 'Service', icon: Wrench },
    { to: '/condition', label: 'Condition', icon: ClipboardCheck },
    ...(user.role === 'admin' ? [{ to: '/users', label: 'Users', icon: Users }] : []),
  ];

  return (
    <nav className="side-nav sticky top-0 h-screen w-52 shrink-0 flex flex-col z-40 border-r">
      {/* Logo */}
      <div className="side-nav-header flex items-center gap-2.5 px-4 py-4 border-b">
        <img src="/logo.svg" alt="" className="w-8 h-8 shrink-0" />
        <span className="font-bold text-base side-nav-title">GloveBox</span>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-3 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'side-nav-item-active'
                  : 'side-nav-item'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
