import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Textarea } from "@/components/ui/textarea";
import { POST_MAX_LENGTH } from "@/constants/post";

interface PostEditFormProps {
  draft: string;
  length: number;
  isTooLong: boolean;
  canSave: boolean;
  isSaving: boolean;
  error: string | null;
  maxLength?: number;
  ariaLabel?: string;
  overLimitMessage?: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PostEditForm({
  draft,
  length,
  isTooLong,
  canSave,
  isSaving,
  error,
  maxLength = POST_MAX_LENGTH,
  ariaLabel = "Nội dung bài viết",
  overLimitMessage = "Nội dung bài viết không được vượt quá 5.000 ký tự.",
  onChange,
  onSave,
  onCancel,
}: PostEditFormProps) {
  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <Textarea
        autoFocus
        aria-label={ariaLabel}
        aria-invalid={isTooLong}
        value={draft}
        disabled={isSaving}
        onChange={(event) => onChange(event.target.value)}
      />
      {isTooLong && (
        <p role="alert" className="text-sm text-rose-600">
          {overLimitMessage}
        </p>
      )}
      {error && <FormAlert variant="error">{error}</FormAlert>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CharacterCounter length={length} maxLength={maxLength} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="h-10 w-auto px-4" onClick={onCancel} disabled={isSaving}>
            Hủy
          </Button>
          <Button type="submit" className="h-10 w-auto px-4" disabled={!canSave} isLoading={isSaving}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </form>
  );
}
