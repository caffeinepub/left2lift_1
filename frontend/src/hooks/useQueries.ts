import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Donation, DonationStatus, FoodType, StorageCondition, AppUserRole, UserProfile } from '../backend';
import type { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetCurrentRole() {
  const { actor, isFetching } = useActor();
  return useQuery<AppUserRole | null>({
    queryKey: ['currentRole'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCurrentRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyHotelDonations() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ['myHotelDonations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyHotelDonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyNGODonations() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ['myNGODonations'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNGODonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyVolunteerAssignments() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ['myVolunteerAssignments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyVolunteerAssignments();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias kept for backward compatibility
export function useSystemAnalytics() {
  return useGetSystemAnalytics();
}

export function useGetSystemAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['systemAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.systemAnalytics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyNGOProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['myNGOProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyNGOProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyHotelProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['myHotelProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyHotelProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyVolunteerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['myVolunteerProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyVolunteerProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// Fetch a specific hotel profile by principal
export function useGetHotelProfile(hotelId: Principal) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['hotelProfile', hotelId.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHotelProfile(hotelId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      foodType: FoodType;
      quantityKg: number;
      timeSinceCooked: number;
      storageCondition: StorageCondition;
      pickupAddress: string;
      pickupDeadline: bigint;
      city: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitDonation(
        params.foodType,
        params.quantityKg,
        params.timeSinceCooked,
        params.storageCondition,
        params.pickupAddress,
        params.pickupDeadline,
        params.city
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHotelDonations'] });
    },
  });
}

export function useAcceptDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptDonation(donationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNGODonations'] });
    },
  });
}

export function useRejectDonation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectDonation(donationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNGODonations'] });
    },
  });
}

export function useUpdateDonationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { donationId: bigint; newStatus: DonationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDonationStatus(params.donationId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVolunteerAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['myNGODonations'] });
      queryClient.invalidateQueries({ queryKey: ['allDonations'] });
    },
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { donationId: bigint; rating: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitFeedback(params.donationId, params.rating, params.comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNGODonations'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['currentRole'] });
    },
  });
}

export function useRegisterHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerHotel(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterNGO() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      orgName: string;
      locationAddress: string;
      foodTypePreferences: FoodType[];
      dailyCapacityKg: number;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerNGO(
        params.orgName,
        params.locationAddress,
        params.foodTypePreferences,
        params.dailyCapacityKg
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterVolunteer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; city: string; availabilityStatus: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerVolunteer(params.name, params.city, params.availabilityStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentRole'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myVolunteerProfile'] });
    },
  });
}

export function useListAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllDonations() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['allDonations'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllDonations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeactivateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deactivateUser(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}
