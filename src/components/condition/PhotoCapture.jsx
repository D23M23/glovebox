import { useRef, useState } from 'react';
import { Camera, ImagePlus, X, Edit2, Check } from 'lucide-react';
import { compressAndEncode } from '../../lib/imageUtils';

export default function PhotoCapture({ photos = [], onChange }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [captionEdit, setCaptionEdit] = useState(null); // { id, value }
  const [loading, setLoading] = useState(false);

  async function handleFiles(files) {
    setLoading(true);
    const newPhotos = [];
    for (const file of files) {
      try {
        const dataUrl = await compressAndEncode(file);
        newPhotos.push({
          id: crypto.randomUUID(),
          dataUrl,
          caption: '',
          takenAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Photo compression failed', err);
      }
    }
    onChange([...photos, ...newPhotos]);
    setLoading(false);
  }

  function removePhoto(id) {
    onChange(photos.filter((p) => p.id !== id));
  }

  function saveCaption(id, caption) {
    onChange(photos.map((p) => (p.id === id ? { ...p, caption } : p)));
    setCaptionEdit(null);
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          <Camera size={16} /> Take Photo
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          <ImagePlus size={16} /> Upload
        </button>
        {loading && <span className="self-center text-sm text-gray-500">Processing...</span>}
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.length && handleFiles(Array.from(e.target.files))}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files?.length && handleFiles(Array.from(e.target.files))}
      />

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
              <img src={photo.dataUrl} alt={photo.caption || 'Vehicle photo'} className="w-full h-full object-cover" />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
              >
                <X size={12} />
              </button>

              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                {captionEdit?.id === photo.id ? (
                  <div className="flex gap-1">
                    <input
                      autoFocus
                      value={captionEdit.value}
                      onChange={(e) => setCaptionEdit({ id: photo.id, value: e.target.value })}
                      className="flex-1 text-xs bg-transparent text-white placeholder-white/70 outline-none"
                      placeholder="Add caption..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveCaption(photo.id, captionEdit.value);
                        if (e.key === 'Escape') setCaptionEdit(null);
                      }}
                    />
                    <button type="button" onClick={() => saveCaption(photo.id, captionEdit.value)}>
                      <Check size={12} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCaptionEdit({ id: photo.id, value: photo.caption || '' })}
                    className="flex items-center gap-1 w-full text-left"
                  >
                    <span className="text-xs text-white/90 flex-1 truncate">
                      {photo.caption || 'Add caption...'}
                    </span>
                    <Edit2 size={10} className="text-white/60 shrink-0" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
