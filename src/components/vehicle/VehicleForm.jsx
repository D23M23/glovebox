import { useForm } from 'react-hook-form';

const CURRENT_YEAR = new Date().getFullYear();

export default function VehicleForm({ defaultValues, onSubmit, submitLabel = 'Save Vehicle' }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || { type: 'rental', year: CURRENT_YEAR },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Make *" error={errors.make?.message}>
          <input
            {...register('make', { required: 'Required' })}
            placeholder="Ford"
            className={input(errors.make)}
          />
        </Field>
        <Field label="Model *" error={errors.model?.message}>
          <input
            {...register('model', { required: 'Required' })}
            placeholder="Transit"
            className={input(errors.model)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Year *" error={errors.year?.message}>
          <input
            type="number"
            {...register('year', { required: 'Required', valueAsNumber: true, min: 1900, max: CURRENT_YEAR + 2 })}
            className={input(errors.year)}
          />
        </Field>
        <Field label="Type">
          <select {...register('type')} className={input()}>
            <option value="rental">Rental</option>
            <option value="fleet">Fleet</option>
          </select>
        </Field>
      </div>

      <Field label="License Plate *" error={errors.licensePlate?.message}>
        <input
          {...register('licensePlate', { required: 'Required' })}
          placeholder="ABC-1234"
          className={input(errors.licensePlate)}
          style={{ textTransform: 'uppercase' }}
        />
      </Field>

      <Field label="VIN">
        <input
          {...register('vin', {
            maxLength: { value: 17, message: 'VIN must be 17 characters or fewer' },
          })}
          placeholder="17-character VIN (optional)"
          className={input(errors.vin)}
          style={{ textTransform: 'uppercase' }}
        />
      </Field>

      <Field label="Color">
        <input {...register('color')} placeholder="White" className={input()} />
      </Field>

      <Field label="Notes">
        <textarea
          {...register('notes')}
          placeholder="Any additional notes..."
          rows={3}
          className={input() + ' resize-none'}
        />
      </Field>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 mt-2"
      >
        {submitLabel}
      </button>
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

function input(error) {
  return `w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`;
}
