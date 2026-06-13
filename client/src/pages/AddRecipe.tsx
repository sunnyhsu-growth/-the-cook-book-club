import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, ClipboardType, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { extractFromImage, extractFromText } from '../lib/api';
import { normalizeImageFile, isImageFile } from '../lib/image';
import {
  createRecipe,
  updateRecipe,
  uploadImage,
  getRecipe,
} from '../lib/recipes';
import { emptyDraft, type RecipeDraft } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../lib/admin';
import RecipeForm from '../components/RecipeForm';

type Mode = 'capture' | 'form';
type Tab = 'photo' | 'text';

export default function AddRecipe() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>(isEdit ? 'form' : 'capture');
  const [tab, setTab] = useState<Tab>('photo');
  const [draft, setDraft] = useState<RecipeDraft>(emptyDraft());

  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [dishFile, setDishFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [extracting, setExtracting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [convertingSource, setConvertingSource] = useState(false);

  async function handleSourceFile(file: File | null) {
    if (!file) return;
    if (!isImageFile(file)) {
      setError('Please choose an image (JPG, PNG, HEIC, WebP).');
      return;
    }
    setError(null);
    try {
      setConvertingSource(true);
      setSourceFile(await normalizeImageFile(file)); // HEIC -> JPEG if needed
    } catch (e: any) {
      console.error('source photo conversion failed:', e);
      setError(e?.message ?? "Couldn't read that photo. Try a JPG or PNG.");
    } finally {
      setConvertingSource(false);
    }
  }

  // Edit mode: load the existing recipe.
  useEffect(() => {
    if (!isEdit || !id) return;
    getRecipe(id).then((r) => {
      if (!r) {
        navigate('/');
        return;
      }
      if (user && r.user_id !== user.id && !isAdmin(user)) {
        navigate(`/recipe/${id}`);
        return;
      }
      setDraft({
        title: r.title,
        description: r.description ?? '',
        ingredients: r.ingredients?.length ? r.ingredients : [{ quantity: '', item: '' }],
        steps: r.steps?.length ? r.steps : [''],
        prep_minutes: r.prep_minutes,
        cook_minutes: r.cook_minutes,
        servings: r.servings,
        category: r.category ?? '',
        tags: r.tags ?? [],
        notes: r.notes ?? '',
        contributor: r.contributor ?? '',
        video_url: r.video_url ?? '',
      });
      setExistingImageUrl(r.image_url);
    });
  }, [isEdit, id, user, navigate]);

  async function runExtraction() {
    setError(null);
    setExtracting(true);
    try {
      let result: RecipeDraft;
      if (tab === 'photo') {
        if (!sourceFile) throw new Error('Please choose a photo first.');
        result = await extractFromImage(sourceFile);
      } else {
        if (!pastedText.trim()) throw new Error('Please paste some recipe text.');
        result = await extractFromText(pastedText);
      }
      // Ensure at least one empty row so the form is editable.
      if (!result.ingredients?.length) result.ingredients = [{ quantity: '', item: '' }];
      if (!result.steps?.length) result.steps = [''];
      // The contributor is the person adding it, not from the recipe — prefill with
      // their account name (editable in the form).
      result.contributor =
        (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || '';
      result.video_url = result.video_url ?? '';
      setDraft(result);
      setMode('form');
    } catch (e: any) {
      setError(e.message ?? 'Extraction failed.');
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit() {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      let imageUrl = existingImageUrl;
      if (dishFile) imageUrl = await uploadImage('recipe-images', dishFile, user.id);

      if (isEdit && id) {
        await updateRecipe(id, draft, imageUrl);
        navigate(`/recipe/${id}`);
      } else {
        let sourceUrl: string | null = null;
        if (sourceFile) {
          sourceUrl = await uploadImage('recipe-sources', sourceFile, user.id).catch(
            () => null,
          );
        }
        const created = await createRecipe(draft, user.id, imageUrl, sourceUrl);
        navigate(`/recipe/${created.id}`);
      }
    } catch (e: any) {
      setError(e.message ?? 'Could not save the recipe.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">
        {isEdit ? 'Edit recipe' : 'Add a recipe'}
      </h1>

      {mode === 'capture' && (
        <>
          <p className="mt-2 text-muted">
            Snap a photo of a handwritten card or screenshot, or paste the text — we'll
            turn it into a clean recipe you can tidy up before publishing.
          </p>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setTab('photo')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${
                tab === 'photo'
                  ? 'border-terracotta bg-terracotta/10 text-terracotta'
                  : 'border-line bg-paper text-muted'
              }`}
            >
              <Camera size={18} /> Upload photo
            </button>
            <button
              onClick={() => setTab('text')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${
                tab === 'text'
                  ? 'border-terracotta bg-terracotta/10 text-terracotta'
                  : 'border-line bg-paper text-muted'
              }`}
            >
              <ClipboardType size={18} /> Paste text
            </button>
          </div>

          <div className="mt-4">
            {tab === 'photo' ? (
              <div
                onClick={() => sourceInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleSourceFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition ${
                  dragOver
                    ? 'border-terracotta bg-blush/40 text-terracotta'
                    : 'border-line bg-paper text-muted hover:border-terracotta hover:text-terracotta'
                }`}
              >
                {convertingSource ? (
                  <>
                    <Loader2 size={30} className="animate-spin" />
                    <span className="font-medium">Converting photo…</span>
                  </>
                ) : sourceFile ? (
                  <img
                    src={URL.createObjectURL(sourceFile)}
                    alt=""
                    className="h-full w-full rounded-2xl object-contain p-2"
                  />
                ) : (
                  <>
                    <Camera size={32} />
                    <span className="font-medium">Drag a photo here, or click to choose</span>
                    <span className="text-xs">
                      handwriting, screenshot, or cookbook page · JPG, PNG, HEIC, WebP
                    </span>
                  </>
                )}
                <input
                  ref={sourceInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  className="hidden"
                  onChange={(e) => handleSourceFile(e.target.files?.[0] ?? null)}
                />
              </div>
            ) : (
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={10}
                placeholder="Paste the recipe a friend texted you…"
                className="w-full rounded-2xl border border-line bg-paper p-4 outline-none focus:border-terracotta"
              />
            )}
          </div>

          {error && <p className="mt-3 text-sm text-terracotta-dark">{error}</p>}

          <button
            onClick={runExtraction}
            disabled={extracting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-3 text-lg font-semibold text-paper transition hover:bg-terracotta-dark disabled:opacity-60"
          >
            {extracting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Reading your recipe…
              </>
            ) : (
              <>
                <Sparkles size={20} /> Extract recipe
              </>
            )}
          </button>
          <p className="mt-2 text-center text-xs text-muted">
            You'll review and fix everything before it's published.
          </p>
        </>
      )}

      {mode === 'form' && (
        <>
          {!isEdit && (
            <button
              onClick={() => setMode('capture')}
              className="mt-3 flex items-center gap-1 text-sm text-muted hover:text-ink"
            >
              <ArrowLeft size={15} /> Back to capture
            </button>
          )}
          <p className="mb-4 mt-2 text-muted">
            Review and tidy up, add a dish photo, then publish.
          </p>
          {error && <p className="mb-3 text-sm text-terracotta-dark">{error}</p>}
          <RecipeForm
            draft={draft}
            onChange={setDraft}
            currentImageUrl={existingImageUrl}
            onImageSelect={setDishFile}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={isEdit ? 'Save changes' : 'Publish recipe'}
          />
        </>
      )}
    </div>
  );
}
