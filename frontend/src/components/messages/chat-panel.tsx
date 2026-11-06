"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/common/user-avatar";
import { MessageComposer } from "@/components/messages/message-composer";
import { MessageList } from "@/components/messages/message-list";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { userProfilePath } from "@/constants/navigation";
import { useChat } from "@/hooks/use-chat";
import { useDeleteConversation } from "@/hooks/use-delete-conversation";
import { useTyping } from "@/hooks/use-typing";
import type { ChatSocket } from "@/lib/chat-socket";
import type { Conversation, Message } from "@/types/conversation";

interface ChatPanelProps {
  conversation: Conversation;
  currentUserId: string;
  socket: ChatSocket | null;
  reconnectCount: number;
  onSent: (message: Message) => void;
  onRead: (conversationId: string) => void;
  onDeleted: (conversationId: string) => void;
  onBack: () => void;
}

export function ChatPanel({
  conversation,
  currentUserId,
  socket,
  reconnectCount,
  onSent,
  onRead,
  onDeleted,
  onBack,
}: ChatPanelProps) {
  const { participant } = conversation;
  const chat = useChat({ conversationId: conversation.id, currentUserId, socket, reconnectCount, onSent, onRead });
  const typing = useTyping({ socket, conversationId: conversation.id, participantId: participant.id });
  const deletion = useDeleteConversation(conversation.id, onDeleted);
  const [recallTarget, setRecallTarget] = useState<Message | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const closeRecallDialog = () => {
    setRecallTarget(null);
    chat.clearRecallError();
  };

  const confirmRecall = async () => {
    if (recallTarget && (await chat.recall(recallTarget.id))) closeRecallDialog();
  };

  const handleDeleteOpenChange = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) deletion.clearError();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-brand-100 bg-white px-3 py-3 sm:px-4">
        <Button
          type="button"
          variant="ghost"
          className="size-9 shrink-0 px-0 lg:hidden"
          aria-label="Quay lại danh sách hội thoại"
          onClick={onBack}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>
        <Link href={userProfilePath(participant.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl">
          <UserAvatar fullName={participant.fullName} avatarUrl={participant.avatarUrl} size="sm" />
          <span className="truncate font-semibold text-brand-900 hover:underline">{participant.fullName}</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          className="size-9 shrink-0 px-0 text-zinc-500 hover:bg-rose-50 hover:text-rose-600"
          aria-label="Xóa cuộc trò chuyện"
          title="Xóa cuộc trò chuyện"
          onClick={() => setIsDeleteOpen(true)}
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </Button>
      </header>

      {chat.status === "loading" && (
        <div role="status" className="flex flex-1 items-center justify-center gap-2 text-sm text-zinc-500">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Đang tải tin nhắn...
        </div>
      )}

      {chat.status === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <AlertCircle className="size-8 text-rose-500" aria-hidden="true" />
          <p className="text-sm text-zinc-600">Không thể tải tin nhắn. Vui lòng thử lại.</p>
          <Button variant="outline" className="w-auto" onClick={() => void chat.reload()}>
            Thử lại
          </Button>
        </div>
      )}

      {chat.status === "ready" && (
        <>
          <MessageList
            messages={chat.messages}
            currentUserId={currentUserId}
            participantName={participant.fullName}
            hasOlder={chat.hasOlder}
            isLoadingOlder={chat.isLoadingOlder}
            loadOlderFailed={chat.loadOlderFailed}
            onLoadOlder={() => void chat.loadOlder()}
            onRecall={setRecallTarget}
          />
          <p aria-live="polite" className="h-6 truncate bg-white px-5 text-xs text-zinc-500">
            {typing.isPeerTyping && `${participant.fullName} đang nhập...`}
          </p>
          <MessageComposer
            isSending={chat.isSending}
            error={chat.sendError}
            onSend={chat.send}
            onTyping={typing.reportTyping}
          />
        </>
      )}

      <ConfirmDeleteDialog
        open={recallTarget !== null}
        title="Thu hồi tin nhắn?"
        description="Tin nhắn sẽ bị thu hồi với cả hai bên và không thể khôi phục. Bạn chỉ thu hồi được trong vòng 24 giờ sau khi gửi."
        confirmLabel="Thu hồi"
        isDeleting={chat.isRecalling}
        error={chat.recallError}
        onOpenChange={(open) => !open && closeRecallDialog()}
        onConfirm={() => void confirmRecall()}
      />
      <ConfirmDeleteDialog
        open={isDeleteOpen}
        title="Xóa cuộc trò chuyện?"
        description={`Cuộc trò chuyện chỉ bị xóa ở phía bạn, ${participant.fullName} vẫn giữ nguyên lịch sử tin nhắn. Nếu họ nhắn tiếp, cuộc trò chuyện sẽ hiện lại và chỉ có tin nhắn mới.`}
        confirmLabel="Xóa cuộc trò chuyện"
        isDeleting={deletion.isDeleting}
        error={deletion.error}
        onOpenChange={handleDeleteOpenChange}
        onConfirm={() => void deletion.remove()}
      />
    </div>
  );
}
