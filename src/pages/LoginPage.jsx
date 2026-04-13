import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export default function LoginPage() {
  const { login, setup, user } = useAuth();
  const navigate = useNavigate();
  const [needsSetup, setNeedsSetup] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) { navigate('/', { replace: true }); return; }
    api.get('/auth/setup-status').then(({ needsSetup: ns }) => setNeedsSetup(ns));
  }, [user, navigate]);

  async function onSubmit(data) {
    setError('');
    setSubmitting(true);
    try {
      if (needsSetup) {
        await setup(data.name, data.username, data.password);
      } else {
        await login(data.username, data.password);
      }
      navigate('/', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (needsSetup === null) return null;

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-3 shadow-lg">
            <Package size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GloveBox</h1>
          <p className="text-sm text-gray-500 mt-1">
            {needsSetup ? 'Create your admin account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {needsSetup && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                {...register('name', { required: 'Required' })}
                placeholder="John Smith"
                className={inp(errors.name)}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              {...register('username', { required: 'Required' })}
              placeholder="johnsmith"
              autoCapitalize="none"
              autoCorrect="off"
              className={inp(errors.username)}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
              placeholder="••••••••"
              className={inp(errors.password)}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:opacity-60 mt-2"
          >
            {submitting ? 'Please wait...' : needsSetup ? 'Create Admin Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function inp(error) {
  return `w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;
}
