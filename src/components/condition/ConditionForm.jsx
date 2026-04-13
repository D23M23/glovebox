import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { useState } from 'react';
import { RatingInput } from '../shared/RatingStars';
import PhotoCapture from './PhotoCapture';

export default function ConditionForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save' }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [photos, setPhotos] = useState(defaultValues?.photos ?? []);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: defaultValues || { date: today, rating: 3 },
  });

  function handleFormSubmit(data) {
    onSubmit({ ...data, photos });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 px-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date *" error={errors.date?.message}>
          <input type="date" {...register('date', { required: 'Required' })} className={inp(errors.date)} />
        </Field>
        <Field label="Mileage">
          <input type="number" {...register('mileageAtInspection', { valueAsNumber: true })} placeholder="50000" className={inp()} />
        </Field>
      </div>

      <Field label="Condition Rating *" error={errors.rating?.message}>
        <Controller
          name="rating"
          control={control}
          rules={{ required: true, min: 1 }}
          render={({ field }) => (
            <RatingInput value={field.value} onChange={field.onChange} />
          )}
        />
      </Field>

      <Field label="Inspector">
        <input {...register('inspector')} placeholder="Your name" className={inp()} />
      </Field>

      <Field label="Location">
        <input {...register('location')} placeholder="Bay 3, East Lot, etc." className={inp()} />
      </Field>

      <Field label="Notes">
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Describe the vehicle condition, damage, wear, etc."
          className={inp() + ' resize-none'}
        />
      </Field>

      <Field label="Photos">
        <PhotoCapture photos={photos} onChange={setPhotos} />
      </Field>

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
        )}
        <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700">
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
  return `w-full px-3 py-2.5 rounded-xl border ${error ? 'border-red-400' : 'border-gray-200'} bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`;
}
