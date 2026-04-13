import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Users, ShieldCheck } from 'lucide-react';
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
      <PageHeader
        title="Users"
        backTo="/"
        actions={
          <button onClick={() => setShowForm(!showForm)} className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={20} />
          </button>
        }
      />

      <div className="max-w-lg mx-auto w-full px-4 py-4 pb-24 space-y-3">
        {showForm && (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-4 border border-blue-200 space-y-3">
            <p className="font-medium text-gray-700">New User</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input {...register('name', { required: true })} placeholder="Full name" className={inp(errors.name)} />
              </div>
              <div>
                <input {...register('username', { required: true })} placeholder="Username" autoCapitalize="none" className={inp(errors.username)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="password" {...register('password', { required: true, minLength: 6 })} placeholder="Password (min 6)" className={inp(errors.password)} />
              <select {...register('role')} className={inp()}>
                <option value="user">Worker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Create User</button>
            </div>
          </form>
        )}

        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-2xl px-4 py-3 border border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              {u.role === 'admin' ? <ShieldCheck size={18} className="text-blue-600" /> : <Users size={18} className="text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{u.name}</p>
              <p className="text-xs text-gray-500">@{u.username} · {u.role}</p>
            </div>
            {u.id !== me.id && (
              <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 size={16} />
              </button>
            )}
            {u.id === me.id && <span className="text-xs text-gray-400">You</span>}
          </div>
        ))}
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
