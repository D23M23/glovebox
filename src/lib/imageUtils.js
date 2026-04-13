import Compressor from 'compressorjs';

/**
 * Compress an image File and return a base64 dataUrl.
 * @param {File} file
 * @returns {Promise<string>} dataUrl
 */
export function compressAndEncode(file) {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1200,
      maxHeight: 1200,
      convertSize: 200000, // convert PNG > 200KB to JPEG
      success(result) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(result);
      },
      error: reject,
    });
  });
}
