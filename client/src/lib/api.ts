import type { RecipeDraft } from './types';
import { normalizeImageFile } from './image';
import { supabase } from './supabase';

// In dev, client/.env sets this to the local Express server (http://localhost:3001).
// In production (Vercel), it's left unset → '' → same-origin calls to /api/extract,
// which the serverless function handles (no CORS, no separate server).
const API_URL = import.meta.env.VITE_API_URL ?? '';

// Strip the "data:image/png;base64," prefix → bare base64 the API expects.
function readFileAsBase64(file: File): Promise<{ media_type: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [meta, data] = result.split(',');
      const media_type = meta.match(/data:(.*?);base64/)?.[1] || file.type;
      resolve({ media_type, data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callExtract(body: unknown): Promise<RecipeDraft> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch(`${API_URL}/api/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.details || err.error || `Extraction failed (${res.status})`);
  }
  const { recipe } = await res.json();
  return recipe as RecipeDraft;
}

export async function extractFromImage(file: File): Promise<RecipeDraft> {
  const normalized = await normalizeImageFile(file); // HEIC -> JPEG if needed
  const { media_type, data } = await readFileAsBase64(normalized);
  return callExtract({ type: 'image', media_type, data });
}

export async function extractFromText(text: string): Promise<RecipeDraft> {
  return callExtract({ type: 'text', text });
}
