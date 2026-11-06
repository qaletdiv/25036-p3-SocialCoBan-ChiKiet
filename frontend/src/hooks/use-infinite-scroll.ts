"use client";

import { useCallback, useEffect, useRef } from "react";

interface InfiniteScrollOptions {
  enabled: boolean;
  onReachEnd: () => void;
}

const PRELOAD_DISTANCE = "400px";

// Remount the sentinel (change its key) after each page so the observer fires again if it is still visible
export const useInfiniteScroll = ({ enabled, onReachEnd }: InfiniteScrollOptions) => {
  const onReachEndRef = useRef(onReachEnd);

  useEffect(() => {
    onReachEndRef.current = onReachEnd;
  }, [onReachEnd]);

  return useCallback(
    (node: HTMLElement | null) => {
      if (!node || !enabled) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) onReachEndRef.current();
        },
        { rootMargin: PRELOAD_DISTANCE },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [enabled],
  );
};
