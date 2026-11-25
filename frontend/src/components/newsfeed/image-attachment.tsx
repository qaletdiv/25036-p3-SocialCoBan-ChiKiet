import { ImagePlus, X } from "lucide-react";
import { ZoomableImage } from "@/components/common/zoomable-image";
import { IMAGE_ACCEPT } from "@/lib/image-file";

interface ImageFileButtonProps {
  hasImage?: boolean;
  disabled?: boolean;
  onSelect: (file: File) => void;
}

export function ImageFileButton({ hasImage = false, disabled = false, onSelect }: ImageFileButtonProps) {
  return (
    <label className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 has-[:disabled]:pointer-events-none has-[:disabled]:opacity-60">
      <ImagePlus className="size-4" aria-hidden="true" />
      {hasImage ? "Đổi ảnh" : "Thêm ảnh"}
      <input
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onSelect(file);
        }}
      />
    </label>
  );
}

interface ImagePreviewProps {
  src: string;
  disabled?: boolean;
  onClear: () => void;
}

export function ImagePreview({ src, disabled = false, onClear }: ImagePreviewProps) {
  return (
    <div className="relative">
      <ZoomableImage src={src} alt="Ảnh đã chọn" className="max-h-80 w-full rounded-2xl object-cover" />
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm hover:text-rose-600 disabled:opacity-60"
      >
        <X className="size-3.5" aria-hidden="true" />
        Gỡ ảnh
      </button>
    </div>
  );
}

interface ImageAttachmentProps {
  previewUrl: string | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
}

export function ImageAttachment({ previewUrl, disabled = false, onSelect, onClear }: ImageAttachmentProps) {
  return (
    <div className="space-y-2">
      {previewUrl && <ImagePreview src={previewUrl} disabled={disabled} onClear={onClear} />}
      <ImageFileButton hasImage={previewUrl !== null} disabled={disabled} onSelect={onSelect} />
    </div>
  );
}
