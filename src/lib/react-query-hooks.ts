import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api-client';
import { invalidateCache } from './cacheManager';

// Query keys for React Query
export const queryKeys = {
  pages: ['pages'] as const,
  page: (id: string) => ['page', id] as const,
  events: (pageId: string) => ['events', pageId] as const,
  event: (id: string) => ['event', id] as const,
  eventApplicants: (id: string) => ['event', id, 'applicants'] as const,
  opportunities: (pageId: string) => ['opportunities', pageId] as const,
  opportunity: (id: string) => ['opportunity', id] as const,
  opportunityApplicants: (id: string) => ['opportunity', id, 'applicants'] as const,
  applicants: ['applicants'] as const,
  applicant: (id: string) => ['applicant', id] as const,
} as const;

// Pages hooks
export const usePages = () => {
  return useQuery({
    queryKey: queryKeys.pages,
    queryFn: () => api.pages.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePage = (id: string) => {
  return useQuery({
    queryKey: queryKeys.page(id),
    queryFn: () => api.pages.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Events hooks
export const useEvents = (pageId: string) => {
  return useQuery({
    queryKey: queryKeys.events(pageId),
    queryFn: () => api.events.getAll(pageId),
    enabled: !!pageId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => api.events.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useEventApplicants = (id: string) => {
  return useQuery({
    queryKey: queryKeys.eventApplicants(id),
    queryFn: () => api.events.getApplicants(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes for applicant data
    gcTime: 5 * 60 * 1000,
  });
};

// Opportunities hooks
export const useOpportunities = (pageId: string) => {
  return useQuery({
    queryKey: queryKeys.opportunities(pageId),
    queryFn: () => api.opportunities.getAll(pageId),
    enabled: !!pageId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: queryKeys.opportunity(id),
    queryFn: () => api.opportunities.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useOpportunityApplicants = (id: string) => {
  return useQuery({
    queryKey: queryKeys.opportunityApplicants(id),
    queryFn: () => api.opportunities.getApplicants(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Applicants hooks
export const useApplicants = () => {
  return useQuery({
    queryKey: queryKeys.applicants,
    queryFn: () => api.applicants.getAll(),
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useApplicant = (id: string) => {
  return useQuery({
    queryKey: queryKeys.applicant(id),
    queryFn: () => api.applicants.getById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Mutation hooks with cache invalidation
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.events.create(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      invalidateCache.pages();
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.events.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific event and related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.event(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      invalidateCache.event(variables.id);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.events.delete(id),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events });
      invalidateCache.event(variables);
    },
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => api.opportunities.create(data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      invalidateCache.pages();
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.opportunities.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific opportunity and related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunity(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      invalidateCache.opportunity(variables.id);
    },
  });
};

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => api.opportunities.delete(id),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
      invalidateCache.opportunity(variables);
    },
  });
};

export const useUpdateApplicant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.applicants.update(id, data),
    onSuccess: (data, variables) => {
      // Invalidate applicant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.applicant(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants });
      invalidateCache.applicants();
    },
  });
};

// Utility hook for prefetching data
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchPages: () => queryClient.prefetchQuery({ queryKey: queryKeys.pages, queryFn: () => api.pages.getAll() }),
    prefetchEvents: (pageId: string) => queryClient.prefetchQuery({ queryKey: queryKeys.events(pageId), queryFn: () => api.events.getAll(pageId) }),
    prefetchOpportunities: (pageId: string) => queryClient.prefetchQuery({ queryKey: queryKeys.opportunities(pageId), queryFn: () => api.opportunities.getAll(pageId) }),
  };
}; 