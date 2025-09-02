import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageContext } from "@/components/PageContext";

interface UsePageNavigationReturn {
  pageId: string | null;
  urlPageId: string | null;
}

export function usePageNavigation(): UsePageNavigationReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedPageId } = usePageContext();
  const lastSyncedPageId = useRef<string | null>(null);

  // Get pageId from URL params and session context
  const urlPageId = searchParams.get("pageId");
  
  // Prioritize URL params when they exist, otherwise use session data
  const pageId = urlPageId || selectedPageId;

  // Only sync URL when session changes and URL is different, but avoid loops
  useEffect(() => {
    if (
      selectedPageId && 
      selectedPageId !== urlPageId && 
      selectedPageId !== lastSyncedPageId.current
    ) {
      lastSyncedPageId.current = selectedPageId;
      const currentPath = window.location.pathname;
      router.replace(`${currentPath}?pageId=${selectedPageId}`, { scroll: false });
    }
  }, [selectedPageId, urlPageId, router]);

  return {
    pageId,
    urlPageId,
  };
}
