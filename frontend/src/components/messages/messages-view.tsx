"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { PageBackdrop } from "@/components/common/page-backdrop";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SideNav } from "@/components/layout/side-nav";
import { ChatPanel } from "@/components/messages/chat-panel";
import { useChatRealtime } from "@/components/messages/chat-provider";
import { ConversationSidebar } from "@/components/messages/conversation-sidebar";
import { ProfileSummaryCard } from "@/components/newsfeed/profile-summary-card";
import { Button } from "@/components/ui/button";
import { messagesPath } from "@/constants/navigation";
import { useActiveConversation } from "@/hooks/use-active-conversation";
import { useConversations } from "@/hooks/use-conversations";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/types/auth";
import type { Message } from "@/types/conversation";

interface MessagesViewProps {
  user: AuthUser;
  selectedConversationId: string | null;
  onLogout: () => void;
}

export function MessagesView({ user, selectedConversationId, onLogout }: MessagesViewProps) {
  const router = useRouter();
  const { socket, reconnectCount, refreshUnreadCount } = useChatRealtime();
  const conversationsState = useConversations(socket, reconnectCount);
  const { upsertConversation, markRead, removeConversation } = conversationsState;
  const known = conversationsState.conversations.find((conversation) => conversation.id === selectedConversationId);
  const active = useActiveConversation(selectedConversationId, known);
  const activeConversation = active.conversation;
  const hasSelection = selectedConversationId !== null;

  const handleSent = useCallback(
    (message: Message) => {
      if (activeConversation) upsertConversation({ ...activeConversation, lastMessage: message });
    },
    [activeConversation, upsertConversation],
  );

  const handleRead = useCallback(
    (conversationId: string) => {
      markRead(conversationId);
      void refreshUnreadCount();
    },
    [markRead, refreshUnreadCount],
  );

  const handleDeleted = useCallback(
    (conversationId: string) => {
      removeConversation(conversationId);
      if (conversationId === selectedConversationId) router.push(messagesPath());
    },
    [removeConversation, router, selectedConversationId],
  );

  // Another tab may delete the conversation that is open here
  useEffect(() => {
    if (!socket) return;
    const onDeleted = ({ conversationId }: { conversationId: string }) => handleDeleted(conversationId);
    socket.on("conversation:deleted", onDeleted);
    return () => {
      socket.off("conversation:deleted", onDeleted);
    };
  }, [handleDeleted, socket]);

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:h-dvh lg:min-h-0 lg:flex-none lg:overflow-hidden">
      <PageBackdrop />
      <AppHeader user={user} onLogout={onLogout} />
      <main className="mx-auto grid w-full max-w-360 flex-1 gap-6 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 lg:min-h-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:gap-8 lg:px-8 lg:pt-6 lg:pb-6 xl:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside className="hidden lg:flex lg:min-h-0 lg:flex-col lg:gap-4">
          <ProfileSummaryCard user={user} />
          <SideNav userId={user.id} onLogout={onLogout} />
        </aside>

        <section
          aria-label="Tin nhắn"
          className="flex h-[calc(100dvh-13rem)] min-h-96 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-md shadow-brand-600/5 lg:h-full lg:min-h-0"
        >
          <div
            className={cn(
              "min-h-0 w-full flex-col lg:flex lg:w-88 lg:shrink-0 lg:border-r lg:border-brand-100",
              hasSelection ? "hidden" : "flex",
            )}
          >
            <ConversationSidebar
              currentUserId={user.id}
              activeConversationId={selectedConversationId}
              conversationsState={conversationsState}
              onSelectConversation={(conversation) => router.push(messagesPath(conversation.id))}
            />
          </div>

          <div className={cn("min-h-0 min-w-0 flex-1 flex-col lg:flex", hasSelection ? "flex" : "hidden")}>
            {active.status === "idle" && (
              <CenteredState icon={<MessageCircle className="size-10 text-brand-400" aria-hidden="true" />}>
                <p className="font-semibold text-brand-900">Chọn một cuộc trò chuyện</p>
                <p className="text-sm text-zinc-500">Chọn hội thoại ở danh sách bên trái hoặc tìm người để nhắn tin.</p>
              </CenteredState>
            )}
            {active.status === "loading" && (
              <CenteredState icon={<Loader2 className="size-6 animate-spin text-brand-500" aria-hidden="true" />}>
                <p className="text-sm text-zinc-500">Đang tải cuộc trò chuyện...</p>
              </CenteredState>
            )}
            {active.status === "notFound" && (
              <CenteredState icon={<AlertCircle className="size-8 text-zinc-400" aria-hidden="true" />}>
                <p className="font-semibold text-brand-900">Không tìm thấy cuộc trò chuyện</p>
                <p className="text-sm text-zinc-500">Cuộc trò chuyện này không tồn tại hoặc bạn không có quyền xem.</p>
                <Button variant="outline" className="w-auto" onClick={() => router.push(messagesPath())}>
                  Quay lại danh sách
                </Button>
              </CenteredState>
            )}
            {active.status === "error" && (
              <CenteredState icon={<AlertCircle className="size-8 text-rose-500" aria-hidden="true" />}>
                <p className="text-sm text-zinc-600">Không thể tải cuộc trò chuyện. Vui lòng thử lại.</p>
                <Button variant="outline" className="w-auto" onClick={active.retry}>
                  Thử lại
                </Button>
              </CenteredState>
            )}
            {active.status === "ready" && activeConversation && (
              <ChatPanel
                key={activeConversation.id}
                conversation={activeConversation}
                currentUserId={user.id}
                socket={socket}
                reconnectCount={reconnectCount}
                onSent={handleSent}
                onRead={handleRead}
                onDeleted={handleDeleted}
                onBack={() => router.push(messagesPath())}
              />
            )}
          </div>
        </section>
      </main>
      <MobileNav userId={user.id} />
    </div>
  );
}

function CenteredState({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      {icon}
      {children}
    </div>
  );
}
