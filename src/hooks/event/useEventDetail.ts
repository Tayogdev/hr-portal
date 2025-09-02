import { useState, useEffect } from "react";
import {
  EventDetails,
  ApplicantProfile,
  QuestionnaireData,
  EventStats,
} from "@/types/event/eventDetail";

interface UseEventDetailReturn {
  eventDetails: EventDetails | null;
  applicants: ApplicantProfile[];
  questionnaireData: QuestionnaireData | null;
  eventStats: EventStats;
  loading: boolean;
  error: string | null;
  isPageOwner: boolean;
  refetch: () => void;
}

export function useEventDetail(eventId: string): UseEventDetailReturn {
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [applicants, setApplicants] = useState<ApplicantProfile[]>([]);
  const [questionnaireData, setQuestionnaireData] =
    useState<QuestionnaireData | null>(null);
  const [eventStats, setEventStats] = useState<EventStats>({
    allRegistrations: 0,
    finalAttendees: 0,
    approvedApplicants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPageOwner, setIsPageOwner] = useState(false);

  const fetchEventData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch event details
      const eventResponse = await fetch(`/api/events/${eventId}`);
      const eventData = await eventResponse.json();

      if (eventData.success) {
        const event = eventData.data;
        setEventDetails({
          id: event.id,
          title: event.title,
          type: event.type,
          isOnline: event.isOnline,
          createdAt: event.createdAt,
          regEndDate: event.regEndDate,
          description: event.description || "",
          startDate: event.startDate || "",
          endDate: event.endDate || "",
          regStartDate: event.regStartDate || "",
          seat: event.seat || 0,
          price: event.price || 0,
          website: event.website || "",
          email: event.email || "",
          contact: event.contact || "",
        });
      } else {
        // Fallback to static data if event not found
        setEventDetails({
          id: eventId,
          title: "Sample Event",
          type: "Conference",
          isOnline: true,
          createdAt: new Date().toISOString(),
          regEndDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          description: "",
          startDate: "",
          endDate: "",
          regStartDate: "",
          seat: 0,
          price: 0,
          website: "",
          email: "",
          contact: "",
        });
      }

      // Fetch registered users for this event
      const applicantsResponse = await fetch(
        `/api/events/${eventId}/applicants?page=1&limit=50`
      );
      const applicantsData = await applicantsResponse.json();

      if (applicantsData.success) {
        const registeredUsers = applicantsData.data.registeredUsers;

        // Update stats
        setEventStats({
          allRegistrations: applicantsData.data.pagination.total,
          finalAttendees: registeredUsers.filter(
            (user: { bookingStatus: string }) =>
              user.bookingStatus === "SUCCESS"
          ).length,
          approvedApplicants: registeredUsers.filter(
            (user: { status: string }) => user.status === "FINAL"
          ).length,
        });

        // Transform registered users to match ApplicantProfile interface
        const transformedApplicants: ApplicantProfile[] = registeredUsers.map(
          (user: any) => ({
            id: user.id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            image: user.image || "",
            type: user.type || "Applicant",
            title: user.title || "",
            tags: user.tags || [],
            appliedDate:
              user.appliedDate || user.createdAt || new Date().toISOString(),
            score: user.score || Math.floor(Math.random() * 100),
            status: user.status || "PENDING",
            resumePath: user.resumePath,
            phoneNo: user.phoneNo,
            state: user.state,
            country: user.country,
            bookingStatus: user.bookingStatus,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            maritalStatus: user.maritalStatus,
            profession: user.profession,
            organizationName: user.organizationName,
            zipCode: user.zipCode,
          })
        );

        setApplicants(transformedApplicants);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load event data"
      );
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchEventData();
  };

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  return {
    eventDetails,
    applicants,
    questionnaireData,
    eventStats,
    loading,
    error,
    isPageOwner,
    refetch,
  };
}
