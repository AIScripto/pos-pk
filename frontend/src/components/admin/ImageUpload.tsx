import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL, SERVER_URL } from '@/config/api';

/** Resolves a stored imagePath (relative) to a full display URL */
export function resolveImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  return `${SERVER_URL}${imagePath}`;
}

interface Props {
  value: string;
  onChange: (url: string) => void;
  module?: string;       // e.g. "products", "categories"
  label?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  module = 'general',
  label = 'Image',
  disabled = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const token = localStorage.getItem('pos-app-token');
      const form = new FormData();
      form.append('image', file);

      const res = await fetch(`${API_URL}/admin/uploads/image/${module}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? 'Upload failed');
      // Store only the relative path — domain-agnostic
      onChange(json.data.imagePath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={resolveImageUrl(value)}
            alt="Preview"
            className="h-32 w-32 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* URL input + Browse button */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="https://... or browse to upload"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          className="flex-1 text-sm"
        />
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="shrink-0"
          >
            {uploading ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Uploading…
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Browse
              </span>
            )}
          </Button>
        )}
      </div>

      {/* No-preview placeholder */}
      {!value && (
        <div className="flex items-center justify-center h-20 w-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400">
          <ImageIcon className="w-8 h-8" />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
