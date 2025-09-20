import { useEffect, useState, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

interface UseInfiniteScrollReturn {
  sentinelRef: React.RefObject<HTMLDivElement>;
  isNearBottom: boolean;
}

export const useInfiniteScroll = ({
  threshold = 0.1,
  rootMargin = "100px",
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
  const [isNearBottom, setIsNearBottom] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastFetchAtRef = useRef<number>(0);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        setIsNearBottom(true);
        const now = Date.now();
        const COOLDOWN_MS = 500;
        if (
          hasNextPage &&
          !isFetchingNextPage &&
          now - lastFetchAtRef.current > COOLDOWN_MS
        ) {
          if (import.meta.env?.DEV) {
            console.log("🔄 InfiniteScroll: Triggering fetchNextPage", {
              hasNextPage,
              isFetchingNextPage,
              cooldown: now - lastFetchAtRef.current,
            });
          }
          lastFetchAtRef.current = now;
          fetchNextPage();
        } else {
          if (import.meta.env?.DEV) {
            console.log("🔄 InfiniteScroll: Not triggering", {
              hasNextPage,
              isFetchingNextPage,
              cooldown: now - lastFetchAtRef.current,
              reason: hasNextPage
                ? isFetchingNextPage
                  ? "fetching"
                  : "cooldown"
                : "no next page",
            });
          }
        }
      } else {
        setIsNearBottom(false);
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersect, threshold, rootMargin]);

  return {
    sentinelRef,
    isNearBottom,
  };
};

export default useInfiniteScroll;
