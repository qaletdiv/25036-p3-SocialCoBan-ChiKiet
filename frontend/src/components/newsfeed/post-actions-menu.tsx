"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Flag, Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface PostActionsMenuProps {
  label?: string;
  editLabel?: string;
  deleteLabel?: string;
  onEdit?: () => void;
  onPrivacy?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

const ITEM_STYLES =
  "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium outline-none";

export function PostActionsMenu({
  label = "Tùy chọn bài viết",
  editLabel = "Chỉnh sửa bài viết",
  deleteLabel = "Xóa bài viết",
  onEdit,
  onPrivacy,
  onDelete,
  onReport,
}: PostActionsMenuProps) {
  if (!onEdit && !onPrivacy && !onDelete && !onReport) return null;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={label}
        className="-mr-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
      >
        <MoreHorizontal className="size-5" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 w-60 rounded-2xl border border-brand-100 bg-white p-1.5 shadow-xl shadow-brand-900/10"
        >
          {onEdit && (
            <DropdownMenu.Item
              onSelect={onEdit}
              className={`${ITEM_STYLES} text-zinc-700 data-highlighted:bg-brand-50 data-highlighted:text-brand-700`}
            >
              <Pencil className="size-4" aria-hidden="true" />
              {editLabel}
            </DropdownMenu.Item>
          )}
          {onPrivacy && (
            <DropdownMenu.Item
              onSelect={onPrivacy}
              className={`${ITEM_STYLES} text-zinc-700 data-highlighted:bg-brand-50 data-highlighted:text-brand-700`}
            >
              <Lock className="size-4" aria-hidden="true" />
              Quyền riêng tư
            </DropdownMenu.Item>
          )}
          {onReport && (
            <DropdownMenu.Item
              onSelect={onReport}
              className={`${ITEM_STYLES} text-rose-600 data-highlighted:bg-rose-50`}
            >
              <Flag className="size-4" aria-hidden="true" />
              Báo cáo
            </DropdownMenu.Item>
          )}
          {onDelete && (
            <DropdownMenu.Item
              onSelect={onDelete}
              className={`${ITEM_STYLES} text-rose-600 data-highlighted:bg-rose-50`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {deleteLabel}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
