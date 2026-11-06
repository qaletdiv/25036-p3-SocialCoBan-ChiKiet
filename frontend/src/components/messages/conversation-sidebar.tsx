"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, Loader2, MessageCircle, Search, X } from "lucide-react";
import { ContactResultItem } from "@/components/messages/contact-result-item";
import { ConversationListItem } from "@/components/messages/conversation-list-item";
import { Button } from "@/components/ui/button";
import { CONTACT_SEARCH_MAX_LENGTH } from "@/constants/message";
import { useContactSearch } from "@/hooks/use-contact-search";
import type { ConversationsState } from "@/hooks/use-conversations";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useOpenConversation } from "@/hooks/use-open-conversation";
import type { Conversation } from "@/types/conversation";

interface ConversationSidebarProps {
  currentUserId: string;
  activeConversationId: string | null;
  conversationsState: ConversationsState;
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationSidebar({
  currentUserId,
  activeConversationId,
  conversationsState,
  onSelectConversation,
}: ConversationSidebarProps) {
  const [query, setQuery] = useState("");
  const search = useContactSearch(query);
  const openConversation = useOpenConversation();
  const isSearching = search.term.length > 0;
  const sentinelRef = useInfiniteScroll({
    enabled: !isSearching && conversationsState.status === "ready" && conversationsState.hasMore && !conversationsState.loadMoreFailed,
    onReachEnd: () => void conversationsState.loadMore(),
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b border-brand-100 px-4 py-4">
        <h1 className="text-xl font-bold text-brand-900">Tin nhắn</h1>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            maxLength={CONTACT_SEARCH_MAX_LENGTH}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên người dùng"
            aria-label="Tìm hội thoại theo tên"
            className="h-11 w-full rounded-xl border border-brand-100 bg-brand-50/40 pr-10 pl-10 text-sm transition placeholder:text-zinc-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xóa nội dung tìm kiếm"
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-brand-100 hover:text-brand-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
        {openConversation.error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {openConversation.error}
          </p>
        )}
      </div>

      <div className="scroll-area min-h-0 flex-1 overflow-y-auto p-2">
        {isSearching ? (
          <SearchBody
            term={search.term}
            status={search.status}
            users={search.users}
            openingUserId={openConversation.openingUserId}
            onRetry={search.retry}
            onOpen={(userId) => void openConversation.open(userId)}
          />
        ) : (
          <>
            {conversationsState.status === "loading" && <ListSkeleton />}
            {conversationsState.status === "error" && (
              <StateMessage
                icon={<AlertCircle className="size-8 text-rose-500" aria-hidden="true" />}
                text="Không thể tải danh sách hội thoại."
                action={
                  <Button variant="outline" className="w-auto" onClick={() => void conversationsState.reload()}>
                    Thử lại
                  </Button>
                }
              />
            )}
            {conversationsState.status === "ready" && conversationsState.conversations.length === 0 && (
              <StateMessage
                icon={<MessageCircle className="size-8 text-brand-500" aria-hidden="true" />}
                text="Bạn chưa có cuộc trò chuyện nào. Hãy tìm người bạn theo dõi hoặc mở trang cá nhân để bắt đầu nhắn tin."
              />
            )}
            {conversationsState.status === "ready" && conversationsState.conversations.length > 0 && (
              <>
                <ul className="space-y-1">
                  {conversationsState.conversations.map((conversation) => (
                    <ConversationListItem
                      key={conversation.id}
                      conversation={conversation}
                      currentUserId={currentUserId}
                      isActive={conversation.id === activeConversationId}
                      onSelect={() => onSelectConversation(conversation)}
                    />
                  ))}
                </ul>
                <div
                  key={conversationsState.conversations.length}
                  ref={sentinelRef}
                  aria-hidden="true"
                  className="h-px -translate-y-96"
                />
                {conversationsState.isLoadingMore && (
                  <p className="flex items-center justify-center gap-2 py-3 text-sm text-zinc-500">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Đang tải thêm
                  </p>
                )}
                {conversationsState.loadMoreFailed && (
                  <div className="flex justify-center py-3">
                    <Button variant="outline" className="w-auto" onClick={() => void conversationsState.loadMore()}>
                      Tải lại
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface SearchBodyProps {
  term: string;
  status: ReturnType<typeof useContactSearch>["status"];
  users: ReturnType<typeof useContactSearch>["users"];
  openingUserId: string | null;
  onRetry: () => void;
  onOpen: (userId: string) => void;
}

function SearchBody({ term, status, users, openingUserId, onRetry, onOpen }: SearchBodyProps) {
  if (status === "idle" || status === "loading") return <ListSkeleton />;

  if (status === "error") {
    return (
      <StateMessage
        icon={<AlertCircle className="size-8 text-rose-500" aria-hidden="true" />}
        text="Không thể tìm kiếm lúc này."
        action={
          <Button variant="outline" className="w-auto" onClick={onRetry}>
            Thử lại
          </Button>
        }
      />
    );
  }

  if (users.length === 0) {
    return (
      <StateMessage
        icon={<Search className="size-8 text-brand-500" aria-hidden="true" />}
        text={`Không tìm thấy người nào tên “${term}” trong danh sách bạn đang theo dõi hoặc đã nhắn tin.`}
      />
    );
  }

  return (
    <ul className="space-y-1" aria-label="Kết quả tìm kiếm">
      {users.map((contact) => (
        <ContactResultItem
          key={contact.id}
          contact={contact}
          isOpening={openingUserId === contact.id}
          disabled={openingUserId !== null}
          onSelect={() => onOpen(contact.id)}
        />
      ))}
    </ul>
  );
}

function StateMessage({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      {icon}
      <p className="max-w-xs text-sm text-zinc-600">{text}</p>
      {action}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div role="status" aria-label="Đang tải" className="space-y-1">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="flex animate-pulse items-center gap-3 px-3 py-3">
          <div className="size-11 rounded-full bg-brand-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 rounded-full bg-brand-100" />
            <div className="h-3 w-48 rounded-full bg-brand-50" />
          </div>
        </div>
      ))}
    </div>
  );
}
