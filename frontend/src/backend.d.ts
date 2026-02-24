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
    wasteReducedKg: number;
    totalUsers: bigint;
    totalDonations: bigint;
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
export interface UserProfile {
    displayName: string;
    appRole: AppUserRole;
}
export enum AppUserRole {
    ngo = "ngo",
    admin = "admin",
    hotel = "hotel"
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
    /**
     * / Accept a donation. Only the matched NGO principal can call this.
     */
    acceptDonation(donationId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Deactivate a user (hotel or NGO). Admin only.
     */
    deactivateUser(principal: Principal): Promise<void>;
    /**
     * / Get the caller's own UserProfile. Requires authenticated user.
     */
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentRole(): Promise<AppUserRole | null>;
    /**
     * / Get a donation record. Any authenticated user can view.
     */
    getDonation(donationId: bigint): Promise<Donation | null>;
    /**
     * / Get average rating for a hotel based on feedback on its completed donations.
     */
    getHotelAverageRating(hotelPrincipal: Principal): Promise<number>;
    /**
     * / Get a hotel profile. Any authenticated user can view.
     */
    getHotelProfile(hotelId: Principal): Promise<HotelProfile | null>;
    /**
     * / Get all donations for the calling hotel. Hotel role only.
     */
    getMyHotelDonations(): Promise<Array<Donation>>;
    /**
     * / Get the calling hotel's own profile. Hotel role only.
     */
    getMyHotelProfile(): Promise<HotelProfile | null>;
    /**
     * / Get all donations matched to the calling NGO. NGO role only.
     */
    getMyNGODonations(): Promise<Array<Donation>>;
    /**
     * / Get the calling NGO's own profile. NGO role only.
     */
    getMyNGOProfile(): Promise<NGOProfile | null>;
    /**
     * / Get an NGO profile. Any authenticated user can view.
     */
    getNGOProfile(ngoId: Principal): Promise<NGOProfile | null>;
    /**
     * / Get another user's profile. Caller can view own profile; admins can view any.
     */
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all donations with enriched info. Admin only.
     */
    listAllDonations(): Promise<Array<Donation>>;
    /**
     * / List all hotel and NGO profiles. Admin only.
     */
    listAllUsers(): Promise<[Array<HotelProfile>, Array<NGOProfile>]>;
    /**
     * / Register the caller as a Hotel. Requires authenticated user.
     */
    registerHotel(name: string): Promise<void>;
    /**
     * / Register the caller as an NGO. Requires authenticated user.
     */
    registerNGO(orgName: string, locationAddress: string, foodTypePreferences: Array<FoodType>, dailyCapacityKg: number): Promise<void>;
    /**
     * / Reject a donation and attempt re-matching. Only the matched NGO principal can call this.
     */
    rejectDonation(donationId: bigint): Promise<void>;
    /**
     * / Save the caller's own UserProfile. Requires authenticated user.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Submit a food donation. Only Hotel role users can call this.
     */
    submitDonation(foodType: FoodType, quantityKg: number, timeSinceCooked: number, storageCondition: StorageCondition, pickupAddress: string, pickupDeadline: Time): Promise<[boolean, Principal | null]>;
    /**
     * / Submit feedback for a completed donation. Only NGO role users can call this.
     */
    submitFeedback(donationId: bigint, rating: bigint, comment: string): Promise<void>;
    /**
     * / System analytics. Admin only.
     */
    systemAnalytics(): Promise<SystemAnalytics>;
    /**
     * / Update any donation's status. Admin only.
     */
    updateDonationStatus(donationId: bigint, newStatus: DonationStatus): Promise<void>;
}
