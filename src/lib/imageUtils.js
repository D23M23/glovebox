import Compressor from 'compressorjs';
import { api } from './api';

/**
 * Compress an image File to a Blob.
 */
function compressToBlob(file) {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1200,
      maxHeight: 1200,
      convertSize: 200000,
      success: resolve,
      error: reject,
    });
  });
}

/**
 * Compress and upload a photo to the server.
 * Returns { id, filename, takenAt }
 */
export async function compressAndUpload(file) {
  const blob = await compressToBlob(file);
  const form = new FormData();
  form.append('photo', blob, file.name || 'photo.jpg');
  return api.upload('/uploads', form);
}
