export type ExploreTab = "users" | "posts";

export const parseExploreTab = (value: string | null): ExploreTab => (value === "posts" ? "posts" : "users");

export const buildExplorePath = (query: string, tab: ExploreTab = "users"): string => {
  const params = new URLSearchParams();
  const term = query.trim();
  if (term) params.set("q", term);
  if (tab === "posts") params.set("tab", "posts");
  const search = params.toString();
  return search ? `/explore?${search}` : "/explore";
};
