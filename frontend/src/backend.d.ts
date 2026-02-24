import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Donation {
    id: bigint;
    status: DonationStatus;
    spoilageSafe: boolean;
    city: string;
    submittedAt: Time;
    pickupDeadline: Time;
    pickupAddress: string;
    storageCondition: StorageCondition;
    hotelPrincipal: Principal;
    timeSinceCooked: number;
    matchedNGOPrincipal?: Principal;
    quantityKg: number;
    foodType: FoodType;
}
export type Time = bigint;
export interface SystemAnalytics {
    totalVolunteers: bigint;
    wasteReducedKg: number;
    co2SavedKg: number;
    totalUsers: bigint;
    totalDonations: bigint;
    citywiseStats: Array<CitywiseStats>;
    totalKgRedistributed: number;
}
export interface NGOProfile {
    principal: Principal;
    active: boolean;
    orgName: string;
    foodTypePreferences: Array<FoodType>;
    dailyCapacityKg: number;
    currentDailyReceivedKg: number;
    locationAddress: string;
}
export interface HotelProfile {
    principal: Principal;
    active: boolean;
    name: string;
}
export interface VolunteerProfile {
    principal: Principal;
    active: boolean;
    city: string;
    name: string;
    availabilityStatus: string;
}
export interface UserProfile {
    displayName: string;
    appRole: AppUserRole;
}
export interface CitywiseStats {
    city: string;
    totalKg: number;
    donationCount: bigint;
}
export enum AppUserRole {
    ngo = "ngo",
    admin = "admin",
    hotel = "hotel",
    volunteer = "volunteer"
}
export enum DonationStatus {
    pending = "pending",
    completed = "completed",
    inTransit = "inTransit",
    unmatched = "unmatched",
    matched = "matched",
    rejected = "rejected",
    accepted = "accepted"
}
export enum FoodType {
    desserts = "desserts",
    other = "other",
    fish = "fish",
    rice = "rice",
    curry = "curry",
    bread = "bread",
    vegetables = "vegetables",
    dairy = "dairy"
}
export enum StorageCondition {
    hot = "hot",
    roomTemperature = "roomTemperature",
    refrigerated = "refrigerated"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptDonation(donationId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deactivateUser(principal: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentRole(): Promise<AppUserRole | null>;
    getDonation(donationId: bigint): Promise<Donation | null>;
    getHotelAverageRating(hotelPrincipal: Principal): Promise<number>;
    getHotelProfile(hotelId: Principal): Promise<HotelProfile | null>;
    getMyHotelDonations(): Promise<Array<Donation>>;
    getMyHotelProfile(): Promise<HotelProfile | null>;
    getMyNGODonations(): Promise<Array<Donation>>;
    getMyNGOProfile(): Promise<NGOProfile | null>;
    getMyVolunteerAssignments(): Promise<Array<Donation>>;
    getMyVolunteerProfile(): Promise<VolunteerProfile | null>;
    getNGOProfile(ngoId: Principal): Promise<NGOProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVolunteerProfile(volunteerId: Principal): Promise<VolunteerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllDonations(): Promise<Array<Donation>>;
    listAllUsers(): Promise<[Array<HotelProfile>, Array<NGOProfile>, Array<VolunteerProfile>]>;
    listVolunteerAssignments(): Promise<Array<Donation>>;
    registerHotel(name: string): Promise<void>;
    registerNGO(orgName: string, locationAddress: string, foodTypePreferences: Array<FoodType>, dailyCapacityKg: number): Promise<void>;
    /**
     * / Register the caller as a Volunteer. Requires authenticated user.
     */
    registerVolunteer(name: string, city: string, availabilityStatus: string): Promise<void>;
    rejectDonation(donationId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitDonation(foodType: FoodType, quantityKg: number, timeSinceCooked: number, storageCondition: StorageCondition, pickupAddress: string, pickupDeadline: Time, city: string): Promise<[boolean, Principal | null]>;
    submitFeedback(donationId: bigint, rating: bigint, comment: string): Promise<void>;
    systemAnalytics(): Promise<SystemAnalytics>;
    updateDonationStatus(donationId: bigint, newStatus: DonationStatus): Promise<void>;
    updateVolunteerStatus(active: boolean, availabilityStatus: string): Promise<void>;
}
