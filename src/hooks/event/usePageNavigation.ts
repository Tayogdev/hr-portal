import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePageContext } from "@/components/PageContext";

interface UsePageNavigationReturn {
  pageId: string | null;
  urlPageId: string | null;
}

export function usePageNavigation(): UsePageNavigationReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedPageId, setSelectedPageId } = usePageContext();

  // Get pageId from URL params first, then from context
  const urlPageId = searchParams.get("pageId");
  const pageId = urlPageId || selectedPageId;

  // Auto-redirect to stored pageId if none in URL
  useEffect(() => {
    if (!urlPageId && selectedPageId) {
      router.replace(`/events?pageId=${selectedPageId}`);
    }
  }, [urlPageId, selectedPageId, router]);

  // Update context when pageId changes
  useEffect(() => {
    if (urlPageId && urlPageId !== selectedPageId) {
      setSelectedPageId(urlPageId);
    }
  }, [urlPageId, selectedPageId, setSelectedPageId]);

  return {
    pageId,
    urlPageId,
  };
}
