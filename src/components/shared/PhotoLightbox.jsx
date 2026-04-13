import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Full-screen photo lightbox.
 * Props:
 *   photos  – array of { id, filename, caption }
 *   index   – currently visible index (null = closed)
 *   onClose – called when dismissed
 *   onChange – called with new index when navigating
 */
export default function PhotoLightbox({ photos = [], index, onClose, onChange }) {
  const open = index !== null && index !== undefined;
  const photo = open ? photos[index] : null;
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  const prev = useCallback(() => { if (hasPrev) onChange(index - 1); }, [hasPrev, index, onChange]);
  const next = useCallback(() => { if (hasNext) onChange(index + 1); }, [hasNext, index, onChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, prev, next]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95">
      {/* Backdrop click closes */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
        aria-label="Close"
      >
        <X size={22} />
      </button>

      {/* Counter */}
      {photos.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm font-medium">
          {index + 1} / {photos.length}
        </div>
      )}

      {/* Prev arrow */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-3 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          aria-label="Previous photo"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image */}
      <img
        key={photo.filename}
        src={`/uploads/${photo.filename}`}
        alt={photo.caption || 'Vehicle photo'}
        className="relative z-[1] max-w-[92vw] max-h-[85vh] object-contain rounded-lg select-none"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next arrow */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-3 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors"
          aria-label="Next photo"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Caption */}
      {photo.caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 max-w-sm w-full px-4">
          <p className="text-center text-white/90 text-sm bg-black/50 rounded-xl px-3 py-2">
            {photo.caption}
          </p>
        </div>
      )}
    </div>
  );
}
