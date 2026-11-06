import type { Metadata } from "next";
import { NewsfeedContainer } from "@/components/newsfeed/newsfeed-container";

export const metadata: Metadata = {
  title: "Bảng tin - Kircle",
};

export default function NewsfeedPage() {
  return <NewsfeedContainer />;
}
