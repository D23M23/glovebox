import { useState, useEffect, useRef } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SettingsModal from './SettingsModal';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <div ref={ref} className="fixed top-3 right-3 z-[60]">
        {/* Avatar button */}
        <button
          onClick={() => setOpen(!open)}
          className="user-avatar w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-transform active:scale-95"
          aria-label="User menu"
        >
          {initials}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="user-dropdown absolute right-0 top-11 w-52 rounded-2xl shadow-xl border overflow-hidden">
            {/* User info */}
            <div className="user-dropdown-header px-4 py-3 border-b">
              <p className="text-sm font-semibold user-dropdown-name truncate">{user.name}</p>
              <p className="text-xs user-dropdown-meta">@{user.username} · {user.role}</p>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={() => { setSettingsOpen(true); setOpen(false); }}
                className="user-dropdown-item w-full flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <Settings size={16} className="shrink-0" /> Settings
              </button>
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="user-dropdown-item user-dropdown-logout w-full flex items-center gap-3 px-4 py-2.5 text-sm"
              >
                <LogOut size={16} className="shrink-0" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
