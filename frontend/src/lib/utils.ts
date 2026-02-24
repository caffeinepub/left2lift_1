import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DonationStatus, FoodType, StorageCondition } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFoodType(ft: FoodType): string {
  const map: Record<FoodType, string> = {
    [FoodType.rice]: 'Rice',
    [FoodType.curry]: 'Curry',
    [FoodType.bread]: 'Bread',
    [FoodType.desserts]: 'Desserts',
    [FoodType.vegetables]: 'Vegetables',
    [FoodType.fish]: 'Fish',
    [FoodType.dairy]: 'Dairy',
    [FoodType.other]: 'Other',
  };
  return map[ft] ?? ft;
}

export function formatStorageCondition(sc: StorageCondition): string {
  const map: Record<StorageCondition, string> = {
    [StorageCondition.refrigerated]: 'Refrigerated',
    [StorageCondition.roomTemperature]: 'Room Temperature',
    [StorageCondition.hot]: 'Hot',
  };
  return map[sc] ?? sc;
}

export function formatDonationStatus(status: DonationStatus): string {
  const map: Record<DonationStatus, string> = {
    [DonationStatus.pending]: 'Pending',
    [DonationStatus.matched]: 'Matched',
    [DonationStatus.unmatched]: 'Unmatched',
    [DonationStatus.accepted]: 'Accepted',
    [DonationStatus.inTransit]: 'In Transit',
    [DonationStatus.completed]: 'Completed',
    [DonationStatus.rejected]: 'Rejected',
  };
  return map[status] ?? status;
}

export function getStatusColor(status: DonationStatus): string {
  const map: Record<DonationStatus, string> = {
    [DonationStatus.pending]: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    [DonationStatus.matched]: 'bg-primary-100 text-primary-700 border-primary-200',
    [DonationStatus.unmatched]: 'bg-muted text-muted-foreground border-border',
    [DonationStatus.accepted]: 'bg-primary-100 text-primary-700 border-primary-200',
    [DonationStatus.inTransit]: 'bg-secondary-100 text-secondary-700 border-secondary-200',
    [DonationStatus.completed]: 'bg-primary-100 text-primary-700 border-primary-200',
    [DonationStatus.rejected]: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}

export function formatTimestamp(ts: bigint): string {
  // Backend timestamps are in nanoseconds
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRemainingHours(pickupDeadline: bigint): number {
  const deadlineMs = Number(pickupDeadline) / 1_000_000;
  const nowMs = Date.now();
  const diffMs = deadlineMs - nowMs;
  return Math.max(0, diffMs / (1000 * 60 * 60));
}

export function dateToNanoseconds(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1_000_000);
}
