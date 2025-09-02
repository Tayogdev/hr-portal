export interface Event {
  id: string;
  eventName: string;
  status: "Live" | "Closed";
  eventType: string;
  postedOn: string;
  dueDate: string;
  totalRegistration: number;
  active: boolean;
}

export interface EventsPageProps {
  pageId?: string | null;
  currentPageName?: string | null;
  userEmail?: string;
}
