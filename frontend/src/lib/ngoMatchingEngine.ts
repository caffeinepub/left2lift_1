export interface NGOData {
  id: string;
  name: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  capacityScore: number;
}

export interface NGOMatchResult {
  ngoName: string;
  ngoArea: string;
  city: string;
  distanceKm: number;
  estimatedPickupMinutes: number;
  urgencyScore: number;
}

export const maharashtraNGOs: NGOData[] = [
  { id: 'rha-andheri', name: 'Robin Hood Army', city: 'Mumbai', area: 'Andheri', lat: 19.1136, lng: 72.8697, capacityScore: 0.9 },
  { id: 'rb-dadar', name: 'Roti Bank', city: 'Mumbai', area: 'Dadar', lat: 19.0176, lng: 72.8422, capacityScore: 0.8 },
  { id: 'fi-bandra', name: 'Feeding India', city: 'Mumbai', area: 'Bandra', lat: 19.0544, lng: 72.8402, capacityScore: 0.85 },
  { id: 'af-kothrud', name: 'Annadaan Foundation', city: 'Pune', area: 'Kothrud', lat: 18.5018, lng: 73.8077, capacityScore: 0.75 },
  { id: 'ss-shivajinagar', name: 'Seva Sahayog', city: 'Pune', area: 'Shivajinagar', lat: 18.5308, lng: 73.8474, capacityScore: 0.8 },
  { id: 'bst-dharampeth', name: 'Bhojan Seva Trust', city: 'Nagpur', area: 'Dharampeth', lat: 21.1458, lng: 79.0882, capacityScore: 0.7 },
  { id: 'gnn-sitabuldi', name: 'Green Nagpur NGO', city: 'Nagpur', area: 'Sitabuldi', lat: 21.1497, lng: 79.0809, capacityScore: 0.65 },
  { id: 'nf-nashik', name: 'Nashik Food Bank', city: 'Nashik', area: 'Nashik Road', lat: 19.9975, lng: 73.7898, capacityScore: 0.7 },
  { id: 'af-aurangabad', name: 'Aurangabad Relief Trust', city: 'Aurangabad', area: 'Cidco', lat: 19.8762, lng: 75.3433, capacityScore: 0.65 },
  { id: 'kf-kolhapur', name: 'Kolhapur Food Mission', city: 'Kolhapur', area: 'Rajarampuri', lat: 16.7050, lng: 74.2433, capacityScore: 0.6 },
];

export const maharashtraCityCenters: Record<string, { lat: number; lng: number }> = {
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Aurangabad: { lat: 19.8762, lng: 75.3433 },
  Kolhapur: { lat: 16.7050, lng: 74.2433 },
};

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestNGO(city: string, remainingHours: number): NGOMatchResult | null {
  const cityCenter = maharashtraCityCenters[city];
  if (!cityCenter) return null;

  const cityNGOs = maharashtraNGOs.filter((ngo) => ngo.city === city);
  if (cityNGOs.length === 0) {
    // Fallback: use all NGOs
    const allNGOs = maharashtraNGOs;
    if (allNGOs.length === 0) return null;
    const ngo = allNGOs[0];
    const distanceKm = haversineDistance(cityCenter.lat, cityCenter.lng, ngo.lat, ngo.lng);
    return {
      ngoName: ngo.name,
      ngoArea: ngo.area,
      city: ngo.city,
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedPickupMinutes: Math.round(distanceKm / 0.5),
      urgencyScore: 0,
    };
  }

  let bestNGO: NGOData | null = null;
  let bestScore = -Infinity;
  let bestDistance = 0;

  for (const ngo of cityNGOs) {
    const distanceKm = haversineDistance(cityCenter.lat, cityCenter.lng, ngo.lat, ngo.lng);
    const urgencyScore =
      remainingHours * 0.4 + (1 / Math.max(distanceKm, 0.1)) * 0.4 + ngo.capacityScore * 0.2;

    if (urgencyScore > bestScore) {
      bestScore = urgencyScore;
      bestNGO = ngo;
      bestDistance = distanceKm;
    }
  }

  if (!bestNGO) return null;

  return {
    ngoName: bestNGO.name,
    ngoArea: bestNGO.area,
    city: bestNGO.city,
    distanceKm: Math.round(bestDistance * 10) / 10,
    estimatedPickupMinutes: Math.round(bestDistance / 0.5),
    urgencyScore: Math.round(bestScore * 100) / 100,
  };
}
