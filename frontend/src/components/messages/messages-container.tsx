"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { ChatProvider } from "@/components/messages/chat-provider";
import { MessagesView } from "@/components/messages/messages-view";
import { Button } from "@/components/ui/button";
import { messagesPath } from "@/constants/navigation";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogout } from "@/hooks/use-logout";
import { buildLoginUrl } from "@/lib/redirect";

export function MessagesContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");
  const { status, user, refresh } = useAuthUser();
  const { logout } = useLogout();
  const returnTo = messagesPath(conversationId ?? undefined);

  useEffect(() => {
    if (status === "unauthenticated") router.replace(buildLoginUrl(returnTo));
  }, [returnTo, router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return <FullPageLoader message="Đang tải tin nhắn..." />;
  }

  if (status === "error" || !user) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="size-10 text-rose-500" aria-hidden="true" />
        <p className="max-w-sm text-sm text-zinc-600">Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại.</p>
        <Button variant="outline" className="w-auto" onClick={() => void refresh()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <ChatProvider>
      <MessagesView user={user} selectedConversationId={conversationId} onLogout={() => void logout()} />
    </ChatProvider>
  );
}
