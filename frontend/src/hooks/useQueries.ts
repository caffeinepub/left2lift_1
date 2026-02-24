import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  Donation,
  DonationStatus,
  FoodType,
  StorageCondition,
  NGOProfile,
  HotelProfile,
  SystemAnalytics,
  UserProfile,
  AppUserRole,
} from '../backend';
import type { Principal } from '@dfinity/principal';

// ===== Hotel Queries =====

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

export function useGetMyHotelProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<HotelProfile | null>({
    queryKey: ['myHotelProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyHotelProfile();
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
    }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.submitDonation(
        params.foodType,
        params.quantityKg,
        params.timeSinceCooked,
        params.storageCondition,
        params.pickupAddress,
        params.pickupDeadline
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHotelDonations'] });
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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myHotelProfile'] });
    },
  });
}

// ===== NGO Queries =====

export function useGetMyNGOProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<NGOProfile | null>({
    queryKey: ['myNGOProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyNGOProfile();
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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myNGOProfile'] });
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

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      donationId: bigint;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitFeedback(params.donationId, params.rating, params.comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myNGODonations'] });
    },
  });
}

export function useGetHotelProfile(hotelPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<HotelProfile | null>({
    queryKey: ['hotelProfile', hotelPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !hotelPrincipal) return null;
      return actor.getHotelProfile(hotelPrincipal);
    },
    enabled: !!actor && !isFetching && !!hotelPrincipal,
  });
}

export function useGetHotelAverageRating(hotelPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ['hotelRating', hotelPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !hotelPrincipal) return 0;
      return actor.getHotelAverageRating(hotelPrincipal);
    },
    enabled: !!actor && !isFetching && !!hotelPrincipal,
  });
}

// ===== Admin Queries =====

export function useListAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<[HotelProfile[], NGOProfile[]]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [[], []];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllDonations() {
  const { actor, isFetching } = useActor();
  return useQuery<Donation[]>({
    queryKey: ['allDonations'],
    queryFn: async () => {
      if (!actor) return [];
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

export function useUpdateDonationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { donationId: bigint; newStatus: DonationStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDonationStatus(params.donationId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDonations'] });
      queryClient.invalidateQueries({ queryKey: ['myHotelDonations'] });
      queryClient.invalidateQueries({ queryKey: ['myNGODonations'] });
    },
  });
}

export function useSystemAnalytics() {
  const { actor, isFetching } = useActor();
  return useQuery<SystemAnalytics>({
    queryKey: ['systemAnalytics'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.systemAnalytics();
    },
    enabled: !!actor && !isFetching,
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
    },
  });
}
