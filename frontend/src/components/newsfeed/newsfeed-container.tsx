"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { ChatProvider } from "@/components/messages/chat-provider";
import { NewsfeedView } from "@/components/newsfeed/newsfeed-view";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogout } from "@/hooks/use-logout";
import { buildLoginUrl } from "@/lib/redirect";

export function NewsfeedContainer() {
  const router = useRouter();
  const { status, user, refresh } = useAuthUser();
  const { logout } = useLogout();

  useEffect(() => {
    if (status === "unauthenticated") router.replace(buildLoginUrl("/newsfeed"));
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <FullPageLoader message="Đang tải bảng tin..." />;
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
      <NewsfeedView user={user} onLogout={() => void logout()} />
    </ChatProvider>
  );
}
