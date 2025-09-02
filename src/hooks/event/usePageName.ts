import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { CustomSession } from "@/types/auth-interface";

interface UsePageNameReturn {
  currentPageName: string | null;
}

export function usePageName(pageId: string | null): UsePageNameReturn {
  const [currentPageName, setCurrentPageName] = useState<string | null>(null);
  const { data: session } = useSession();
  const customSession = session as CustomSession;

  // Memoize the session page name to avoid unnecessary re-renders
  const sessionPageName = useMemo(() => {
    if (customSession?.view?.id === pageId && customSession?.view?.name) {
      return customSession.view.name;
    }
    return null;
  }, [customSession?.view?.id, customSession?.view?.name, pageId]);

  // Fetch page name
  useEffect(() => {
    if (!pageId) {
      setCurrentPageName(null);
      return;
    }

    if (sessionPageName) {
      setCurrentPageName(sessionPageName);
      return;
    }

    if (!currentPageName) {
      setCurrentPageName(null);
    }

    fetch(`/api/pages/${pageId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.page) {
          setCurrentPageName(data.page.title);
        }
      })
      .catch(() => {
        setCurrentPageName("Events");
      });
  }, [pageId, sessionPageName, currentPageName]);

  return {
    currentPageName,
  };
}
