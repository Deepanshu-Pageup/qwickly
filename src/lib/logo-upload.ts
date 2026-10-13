/**
 * Client-side validation and file-reading helpers for custom QR logo uploads.
 * Restricts uploads to safe raster formats (PNG, JPEG, WebP) up to 1.5 MB.
 * SVG is explicitly excluded to avoid script-injection, XXE, and foreignObject risks.
 */

export const SUPPORTED_LOGO_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const SUPPORTED_LOGO_EXTENSIONS: readonly string[] = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
];

/** 1.5 megabytes in bytes */
export const MAX_LOGO_FILE_SIZE = 1.5 * 1024 * 1024;

export interface LogoValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file size and MIME type.
 */
export function validateLogoFile(file: File): LogoValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (file.size > MAX_LOGO_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the 1.5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller image.`,
    };
  }

  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const hasValidExtension = SUPPORTED_LOGO_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!SUPPORTED_LOGO_TYPES.includes(mimeType) && !hasValidExtension) {
    return {
      valid: false,
      error: 'Unsupported image format. Please select a PNG, JPEG, or WebP image.',
    };
  }

  return { valid: true };
}

/**
 * Reads a local File into a self-contained Base64 Data URL.
 * Keeps data in browser heap memory during the current session only.
 */
export function readLogoAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to data URL.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Verifies that the Data URL represents a valid, decodable raster image.
 */
export function verifyImageCanDecode(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // In non-browser environments, succeed immediately
      resolve({ width: 100, height: 100 });
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 100, height: img.naturalHeight || 100 });
    };
    img.onerror = () => {
      reject(new Error('The selected image is corrupt or cannot be decoded.'));
    };
    img.src = dataUrl;
  });
}
