import { FileX, ShieldX } from "lucide-react";

type UnavailableKind = "removed-post" | "removed-original" | "missing-original";

const COPY: Record<UnavailableKind, { title: string; description: string }> = {
  "removed-post": {
    title: "Bài viết đã bị gỡ",
    description: "Nội dung này đã bị gỡ vì vi phạm nên không còn hiển thị.",
  },
  "removed-original": {
    title: "Bài viết gốc đã bị gỡ",
    description: "Nội dung này đã bị gỡ vì vi phạm nên không còn hiển thị.",
  },
  "missing-original": {
    title: "Bài viết gốc không còn tồn tại",
    description: "Bài viết đã bị xóa hoặc không còn trên Kircle.",
  },
};

export function UnavailableContent({ kind }: { kind: UnavailableKind }) {
  const removed = kind !== "missing-original";
  const Icon = removed ? ShieldX : FileX;
  const copy = COPY[kind];

  return (
    <div
      className={
        removed
          ? "flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4"
          : "flex items-start gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-4"
      }
    >
      <span
        className={
          removed
            ? "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600"
            : "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-500"
        }
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className={removed ? "text-sm font-semibold text-rose-800" : "text-sm font-semibold text-zinc-700"}>
          {copy.title}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">{copy.description}</p>
      </div>
    </div>
  );
}
