import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Users, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const isAdmin = me?.role === 'admin';

  async function reload() {
    const data = await api.get('/auth/users');
    setUsers(data);
  }

  useEffect(() => { reload(); }, []);

  async function onSubmit(data) {
    setError('');
    try {
      await api.post('/auth/users', data);
      reset();
      setShowForm(false);
      reload();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    await api.delete(`/auth/users/${id}`);
    setDeleteTarget(null);
    reload();
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Users" backTo="/" />

      <div className="max-w-lg mx-auto w-full px-4 py-4 pb-24 space-y-3">
        {/* User list */}
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl px-4 py-3 border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              {u.role === 'admin' ? <ShieldCheck size={18} className="text-blue-600" /> : <Users size={18} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{u.name}</p>
              <p className="text-xs text-gray-500">@{u.username} · {u.role}</p>
            </div>
            {u.id !== me.id && isAdmin && (
              <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            )}
            {u.id === me.id && <span className="text-xs text-gray-400">You</span>}
          </div>
        ))}

        {/* Add User — admin only */}
        {isAdmin && (
          <div className="pt-1">
            <button
              onClick={() => { setShowForm(!showForm); setError(''); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
              {showForm ? 'Cancel' : 'Add User'}
            </button>

            {showForm && (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-3 bg-white rounded-2xl p-4 border border-blue-200 space-y-3">
                <p className="font-medium text-gray-700 text-sm">New User</p>
                <div className="grid grid-cols-2 gap-3">
                  <input {...register('name', { required: true })} placeholder="Full name" className={inp(errors.name)} />
                  <input {...register('username', { required: true })} placeholder="Username" autoCapitalize="none" className={inp(errors.username)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="password" {...register('password', { required: true, minLength: 6 })} placeholder="Password (min 6)" className={inp(errors.password)} />
                  <select {...register('role')} className={inp()}>
                    <option value="user">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
                  Create User
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove ${deleteTarget?.name}?`}
        message="This will delete their account. Their log entries will remain."
        confirmLabel="Remove User"
        onConfirm={() => handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function inp(error) {
  return `w-full px-3 py-2 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;
}
