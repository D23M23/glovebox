import { Star } from 'lucide-react';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export function RatingDisplay({ value, showLabel = false }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
        />
      ))}
      {showLabel && <span className="text-xs text-gray-600 ml-1">{LABELS[value]}</span>}
    </span>
  );
}

export function RatingInput({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="flex flex-col items-center gap-0.5"
        >
          <Star
            size={28}
            className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
          />
          <span className="text-[10px] text-gray-500">{n}</span>
        </button>
      ))}
      {value > 0 && (
        <span className="self-center text-sm text-gray-600 ml-1">{LABELS[value]}</span>
      )}
    </div>
  );
}
