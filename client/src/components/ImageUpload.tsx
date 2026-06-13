import { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { normalizeImageFile, isImageFile } from '../lib/image';

interface Props {
  label: string;
  currentUrl?: string | null;
  onSelect: (file: File | null) => void;
}

export default function ImageUpload({ label, currentUrl, onSelect }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [converting, setConverting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file) {
      onSelect(null);
      setPreview(currentUrl ?? null);
      return;
    }
    if (!isImageFile(file)) return;
    try {
      setConverting(true);
      const normalized = await normalizeImageFile(file); // HEIC -> JPEG if needed
      onSelect(normalized);
      setPreview(URL.createObjectURL(normalized));
    } finally {
      setConverting(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-muted">{label}</label>
      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-line">
          <img src={preview} alt="" className="h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => {
              handleFile(null);
              setPreview(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-ink/70 text-paper"
            title="Remove"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition ${
            dragOver
              ? 'border-terracotta bg-blush/40 text-terracotta'
              : 'border-line bg-paper text-muted hover:border-terracotta hover:text-terracotta'
          }`}
        >
          {converting ? (
            <>
              <Loader2 size={26} className="animate-spin" />
              <span className="text-sm font-medium">Converting photo…</span>
            </>
          ) : (
            <>
              <ImagePlus size={28} />
              <span className="text-sm font-medium">Drag a photo here, or click to choose</span>
              <span className="text-xs">JPG, PNG, HEIC, WebP — any phone photo works</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
