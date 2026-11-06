import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreContainer } from "@/components/explore/explore-container";
import { FullPageLoader } from "@/components/common/full-page-loader";

export const metadata: Metadata = {
  title: "Khám phá - Kircle",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<FullPageLoader message="Đang tải khám phá..." />}>
      <ExploreContainer />
    </Suspense>
  );
}
