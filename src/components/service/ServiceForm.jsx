import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

const SERVICE_TYPES = [
  'Oil Change', 'Tire Rotation', 'Tire Replacement', 'Brake Service',
  'Transmission', 'AC / Heat', 'Battery', 'Inspection', 'Detailing',
  'Recall', 'Fluid Top-Off', 'Alignment', 'Windshield', 'Other',
];

export default function ServiceForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save' }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || { date: today, serviceType: 'Oil Change' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date *" error={errors.date?.message}>
          <input type="date" {...register('date', { required: 'Required' })} className={inp(errors.date)} />
        </Field>
        <Field label="Mileage">
          <input type="number" {...register('mileageAtService', { valueAsNumber: true })} placeholder="50000" className={inp()} />
        </Field>
      </div>

      <Field label="Service Type *" error={errors.serviceType?.message}>
        <select {...register('serviceType', { required: 'Required' })} className={inp(errors.serviceType)}>
          {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register('description')}
          placeholder="Details about the service performed..."
          rows={3}
          className={inp() + ' resize-none'}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cost ($)">
          <input type="number" step="0.01" {...register('cost', { valueAsNumber: true })} placeholder="0.00" className={inp()} />
        </Field>
        <Field label="Technician / Shop">
          <input {...register('technician')} placeholder="Name or shop" className={inp()} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Next Service Date">
          <input type="date" {...register('nextServiceDue')} className={inp()} />
        </Field>
        <Field label="Next Service Mileage">
          <input type="number" {...register('nextServiceMileage', { valueAsNumber: true })} placeholder="55000" className={inp()} />
        </Field>
      </div>

      <Field label="Location">
        <input {...register('location')} placeholder="Bay 3, East Lot, etc." className={inp()} />
      </Field>

      <Field label="Notes">
        <textarea {...register('notes')} rows={2} placeholder="Any additional notes..." className={inp() + ' resize-none'} />
      </Field>

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        )}
        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inp(error) {
  return `w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;
}
