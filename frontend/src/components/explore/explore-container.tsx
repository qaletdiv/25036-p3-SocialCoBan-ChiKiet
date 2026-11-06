"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { ExploreView } from "@/components/explore/explore-view";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { ChatProvider } from "@/components/messages/chat-provider";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useLogout } from "@/hooks/use-logout";
import { buildLoginUrl } from "@/lib/redirect";

export function ExploreContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { status, user, refresh } = useAuthUser();
  const { logout } = useLogout();
  const returnTo = query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : "/explore";

  useEffect(() => {
    if (status === "unauthenticated") router.replace(buildLoginUrl(returnTo));
  }, [returnTo, router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return <FullPageLoader message="Đang tải khám phá..." />;
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
      <ExploreView user={user} query={query} onLogout={() => void logout()} />
    </ChatProvider>
  );
}
