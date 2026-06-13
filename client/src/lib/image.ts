const HEIC_RE = /heic|heif/i;

// Re-encode any browser-decodable image to JPEG via a canvas. Works for HEIC on
// Safari (native decode) and as a general fallback.
async function canvasToJpeg(file: File, quality = 0.9): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return await drawToJpeg(img, img.naturalWidth, img.naturalHeight, file.name, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Browser could not decode this image'));
    i.src = url;
  });
}

async function drawToJpeg(
  img: HTMLImageElement,
  w: number,
  h: number,
  name: string,
  quality: number,
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
  if (!blob) throw new Error('Could not encode JPEG');
  return new File([blob], name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

// Convert HEIC/HEIF (the default iPhone/Mac format, unreadable by browsers and the
// vision model) to JPEG. Tries the heic2any WASM decoder first (lazy-loaded to keep
// the bundle small), then a native canvas re-encode (Safari can decode HEIC).
async function heicToJpeg(file: File): Promise<File> {
  let heicError: unknown;
  try {
    const { default: heic2any } = await import('heic2any');
    const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(out) ? out[0] : out;
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
      type: 'image/jpeg',
    });
  } catch (e) {
    heicError = e;
    console.error('heic2any failed, trying canvas fallback:', e);
  }
  try {
    return await canvasToJpeg(file);
  } catch (e) {
    const detail = (heicError as Error)?.message || (e as Error)?.message || String(e);
    throw new Error(`HEIC conversion failed (${detail}).`);
  }
}

// Downscale to a sensible max (Claude reads images best around 1568px on the long
// edge anyway) and re-encode to JPEG — keeps uploads small, fast, cheaper, and well
// under serverless request-size limits. Falls back to the original on any failure.
export async function downscaleImage(file: File, maxDim = 1568, quality = 0.85): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    return await drawToJpeg(img, w, h, file.name, quality);
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Used everywhere a user provides a photo: convert HEIC if needed, then downscale.
export async function normalizeImageFile(file: File): Promise<File> {
  const isHeic = HEIC_RE.test(file.type) || HEIC_RE.test(file.name);
  const decodable = isHeic ? await heicToJpeg(file) : file;
  return downscaleImage(decodable);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || HEIC_RE.test(file.name);
}
