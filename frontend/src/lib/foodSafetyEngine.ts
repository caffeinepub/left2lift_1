export type FoodSafetyStatus = 'Safe' | 'Urgent' | 'Unsafe';

export interface FoodSafetyResult {
  status: FoodSafetyStatus;
  remainingHours: number;
  message: string;
  badgeClass: string;
}

const HIGH_TEMP_CITIES = ['Mumbai', 'Nashik', 'Aurangabad', 'Nagpur'];

export function calculateFoodSafety(
  foodType: string,
  quantityKg: number,
  timeSinceCooked: number,
  storageCondition: string,
  city: string
): FoodSafetyResult {
  // Base thresholds in hours
  let baseThreshold: number;
  switch (storageCondition) {
    case 'refrigerated':
      baseThreshold = 24;
      break;
    case 'hot':
      baseThreshold = 4;
      break;
    case 'roomTemperature':
    default:
      baseThreshold = 6;
      break;
  }

  // Perishable food adjustment
  const isPerishable = foodType === 'fish' || foodType === 'dairy';
  if (isPerishable) {
    baseThreshold -= 2;
  }

  // Maharashtra climate factor
  const isHighTempCity = HIGH_TEMP_CITIES.includes(city);
  if (isHighTempCity) {
    baseThreshold -= 0.5;
  }

  // Ensure threshold is at least 0
  baseThreshold = Math.max(0, baseThreshold);

  const remainingHours = Math.max(0, baseThreshold - timeSinceCooked);

  let status: FoodSafetyStatus;
  let message: string;
  let badgeClass: string;

  if (remainingHours >= 3) {
    status = 'Safe';
    message = `Safe for ${remainingHours.toFixed(1)} more hours`;
    badgeClass = 'safe-badge';
  } else if (remainingHours >= 1) {
    status = 'Urgent';
    message = `Urgent: ${remainingHours.toFixed(1)} hours remaining`;
    badgeClass = 'urgent-badge';
  } else {
    status = 'Unsafe';
    message = remainingHours <= 0 ? 'Unsafe: Food has expired' : `Unsafe: Only ${(remainingHours * 60).toFixed(0)} minutes remaining`;
    badgeClass = 'unsafe-badge';
  }

  return { status, remainingHours, message, badgeClass };
}
