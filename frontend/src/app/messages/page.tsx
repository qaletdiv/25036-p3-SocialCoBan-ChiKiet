import { Suspense } from "react";
import type { Metadata } from "next";
import { FullPageLoader } from "@/components/common/full-page-loader";
import { MessagesContainer } from "@/components/messages/messages-container";

export const metadata: Metadata = {
  title: "Tin nhắn - Kircle",
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<FullPageLoader message="Đang tải tin nhắn..." />}>
      <MessagesContainer />
    </Suspense>
  );
}
