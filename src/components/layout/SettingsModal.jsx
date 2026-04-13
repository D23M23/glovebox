import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Check, Lock, Palette, Monitor, Smartphone } from 'lucide-react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';

export default function SettingsModal({ open, onClose }) {
  const { theme, setTheme, layout, setLayout } = useTheme();
  const [tab, setTab] = useState('theme');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  async function handlePasswordChange(data) {
    setPwError('');
    setPwSuccess(false);
    if (data.newPassword !== data.confirmPassword) {
      setPwError("New passwords don't match");
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPwSuccess(true);
      reset();
    } catch (e) {
      setPwError(e.message);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="settings-modal relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="settings-header flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-base font-semibold settings-title">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-full settings-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex settings-tabs border-b px-5 shrink-0">
          <button
            onClick={() => setTab('theme')}
            className={`flex items-center gap-1.5 py-2.5 px-1 mr-5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'theme' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <Palette size={14} /> Theme
          </button>
          <button
            onClick={() => setTab('password')}
            className={`flex items-center gap-1.5 py-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
              tab === 'password' ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <Lock size={14} /> Password
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {tab === 'theme' && (
            <div className="space-y-5">
              {/* Theme picker */}
              <div>
                <p className="text-xs settings-desc mb-3">Choose how GloveBox looks on this device.</p>
                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`theme-card relative rounded-2xl p-3 text-left border-2 transition-all ${
                        theme === t.id ? 'theme-card-active' : 'theme-card-inactive'
                      }`}
                    >
                      {/* Preview swatch */}
                      <div className="flex gap-1 mb-2.5 rounded-lg overflow-hidden h-10">
                        {t.preview.map((c, i) => (
                          <div key={i} className="flex-1 rounded" style={{ background: c }} />
                        ))}
                      </div>
                      <p className="text-sm font-semibold settings-card-title">{t.label}</p>
                      <p className="text-xs settings-card-desc">{t.desc}</p>
                      {theme === t.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout picker */}
              <div>
                <p className="text-xs font-semibold settings-label mb-1">Layout</p>
                <p className="text-xs settings-desc mb-3">Switch between mobile and desktop navigation.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'mobile', label: 'Mobile', desc: 'Bottom tab bar', icon: Smartphone },
                    { id: 'desktop', label: 'Desktop', desc: 'Side navigation', icon: Monitor },
                  ].map(({ id, label, desc, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setLayout(id)}
                      className={`theme-card relative rounded-2xl p-3 text-left border-2 transition-all ${
                        layout === id ? 'theme-card-active' : 'theme-card-inactive'
                      }`}
                    >
                      <div className="flex items-center justify-center h-10 mb-2.5">
                        <Icon size={28} className={layout === id ? 'text-blue-600' : 'settings-card-desc'} />
                      </div>
                      <p className="text-sm font-semibold settings-card-title">{label}</p>
                      <p className="text-xs settings-card-desc">{desc}</p>
                      {layout === id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
              <p className="text-xs settings-desc mb-4">Change your account password.</p>

              <div>
                <label className="block text-sm font-medium settings-label mb-1">Current Password</label>
                <input
                  type="password"
                  {...register('currentPassword', { required: 'Required' })}
                  placeholder="••••••••"
                  className={inp(errors.currentPassword)}
                />
                {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium settings-label mb-1">New Password</label>
                <input
                  type="password"
                  {...register('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  placeholder="••••••••"
                  className={inp(errors.newPassword)}
                />
                {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium settings-label mb-1">Confirm New Password</label>
                <input
                  type="password"
                  {...register('confirmPassword', { required: 'Required' })}
                  placeholder="••••••••"
                  className={inp(errors.confirmPassword)}
                />
              </div>

              {pwError && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-xl">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl">Password updated successfully.</p>}

              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700">
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function inp(error) {
  return `settings-input w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400' : ''} text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;
}
