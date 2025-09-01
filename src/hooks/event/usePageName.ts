import { useState, useEffect } from "react";

interface UsePageNameReturn {
  currentPageName: string | null;
}

export function usePageName(pageId: string | null): UsePageNameReturn {
  const [currentPageName, setCurrentPageName] = useState<string | null>(null);

  // Fetch page name
  useEffect(() => {
    if (!pageId) {
      setCurrentPageName(null);
      return;
    }

    const cachedName = sessionStorage.getItem(`pageName_${pageId}`);
    if (cachedName) {
      setCurrentPageName(cachedName);
      return;
    }

    fetch(`/api/pages/${pageId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.page) {
          setCurrentPageName(data.page.title);
          sessionStorage.setItem(`pageName_${pageId}`, data.page.title);
        }
      })
      .catch(() => {
        // Set a fallback name if API fails
        setCurrentPageName("Events");
      });
  }, [pageId]);

  return {
    currentPageName,
  };
}
