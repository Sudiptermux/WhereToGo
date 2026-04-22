import { Place } from "../context/TripContext";

/**
 * Advanced Route Optimization Engine v2.0
 * Specialized for Travel Itineraries (VRP with Time Windows)
 */

interface OptimizedDay {
  day: number;
  places: Place[];
  totalDistanceKm: number;
  estimatedDurationMins: number;
  startTime: string;
  endTime: string;
  finalTransitMinutes?: number;
}

const AVERAGE_SPEED_KMH = 30; // More conservative city traffic
const BUFFER_MINS = 20; // Extra padding between stops for parking/entry
const LUNCH_BREAK_MINS = 60;
const IDEAL_START_HOUR = 9; // 9:00 AM
const IDEAL_END_HOUR = 20; // 08:00 PM

/**
 * Calculates distance between two coordinates in Kilometers
 */
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Estimates travel time in minutes based on distance
 */
const getTravelTime = (distance: number): number => {
  const rawMinutes = (distance / AVERAGE_SPEED_KMH) * 60;
  // Add a flat 10-minute 'Congestion Padding' for city obstacles (signals, parking, etc.)
  return Math.ceil(rawMinutes + 10);
};

/**
 * The Main Optimization Core
 */
export const optimizeRoute = (
  selectedPlaces: Place[],
  stayLocation: Place | null,
  requestedDays: number
): { journey: OptimizedDay[]; message?: string } => {
  if (selectedPlaces.length === 0) return { journey: [] };

  // 1. Initial Data Prep
  const places = [...selectedPlaces];
  const depot = stayLocation || { lat: 20.2450, lng: 85.8200, title: "Center" }; // Fallback to city center
  const depotLat = depot.lat || depot.coordinates?.latitude || 20.2450;
  const depotLng = depot.lng || depot.coordinates?.longitude || 85.8200;

  // 2. Greedy Clustering & Sequencing (Combined for small n)
  // We want to fill each day as close to 10 hours as possible, starting from depot.
  const journey: OptimizedDay[] = [];
  let remainingPlaces = [...places];
  let currentDay = 1;

  while (remainingPlaces.length > 0) {
    const dayPlaces: Place[] = [];
    let currentLat = depotLat;
    let currentLng = depotLng;
    let currentTimeMins = IDEAL_START_HOUR * 60;
    let totalDist = 0;
    let lunchTaken = false;

    // Build the day
    while (remainingPlaces.length > 0) {
      // Find nearest neighbor to current location
      let nearestIndex = -1;
      let minDistance = Infinity;

      remainingPlaces.forEach((p, idx) => {
        const pLat = p.lat || p.coordinates?.latitude || depotLat;
        const pLng = p.lng || p.coordinates?.longitude || depotLng;
        const dist = getDistance(currentLat, currentLng, pLat, pLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = idx;
        }
      });

      const nextPlace = remainingPlaces[nearestIndex];
      const pLat = nextPlace.lat || nextPlace.coordinates?.latitude || depotLat;
      const pLng = nextPlace.lng || nextPlace.coordinates?.longitude || depotLng;
      
      const travelTime = getTravelTime(minDistance);
      const stayDuration = nextPlace.avg_duration_mins || 120;
      const expectedArrival = currentTimeMins + travelTime;
      const expectedDeparture = expectedArrival + stayDuration;

      // Handle Lunch Break around 1:00 PM (780 mins)
      let lunchPadding = 0;
      if (!lunchTaken && expectedArrival >= 780) {
        lunchPadding = LUNCH_BREAK_MINS;
        lunchTaken = true;
      }

      // CHECK FEASIBILITY: 
      // 1. Check if the day is getting too long (> 20:00)
      if (expectedDeparture + lunchPadding + getTravelTime(getDistance(pLat, pLng, depotLat, depotLng)) > IDEAL_END_HOUR * 60) {
        // If we already have places this day, stop and move to next day
        if (dayPlaces.length > 0) break;
      }

      // Add to current day with timing metadata
      const placeWithTimes: Place = {
        ...nextPlace,
        arrivalTime: formatTime(expectedArrival + lunchPadding),
        departureTime: formatTime(expectedDeparture + lunchPadding),
        travelTimeMinutes: travelTime
      };

      dayPlaces.push(placeWithTimes);
      remainingPlaces.splice(nearestIndex, 1);
      
      totalDist += minDistance;
      currentTimeMins = expectedDeparture + lunchPadding + BUFFER_MINS;
      currentLat = pLat;
      currentLng = pLng;
    }

    // Wrap up the day: Return to Depot
    const finalReturnDist = getDistance(currentLat, currentLng, depotLat, depotLng);
    totalDist += finalReturnDist;
    const finalReturnTime = getTravelTime(finalReturnDist);
    const dayEndTime = currentTimeMins + finalReturnTime;

    journey.push({
      day: currentDay,
      places: dayPlaces,
      totalDistanceKm: Number(totalDist.toFixed(1)),
      estimatedDurationMins: dayEndTime - (IDEAL_START_HOUR * 60),
      startTime: formatTime(IDEAL_START_HOUR * 60),
      endTime: formatTime(dayEndTime),
      finalTransitMinutes: finalReturnTime
    });

    currentDay++;
  }

  // 3. User Intelligence Messaging
  let message = "";
  if (journey.length < requestedDays) {
    message = `We've optimized your trip into ${journey.length} highly efficient days to avoid unnecessary travel!`;
  } else if (journey.length > requestedDays) {
    message = `To visit all these spots comfortably, we suggest an extra ${journey.length - requestedDays} day(s).`;
  }

  return { journey, message };
};

/**
 * Lightweight Preview Optimization for Map Selection
 * Returns a sorted array of places based on shortest path
 */
export const previewRoute = (
  selectedPlaces: Place[],
  stayLocation: Place | null
): Place[] => {
  if (selectedPlaces.length <= 1) return selectedPlaces;

  const places = [...selectedPlaces];
  const depot = stayLocation || { lat: 20.2450, lng: 85.8200 };
  const depotLat = depot.lat || (depot as any).coordinates?.latitude || 20.2450;
  const depotLng = depot.lng || (depot as any).coordinates?.longitude || 85.8200;

  const ordered: Place[] = [];
  let currentLat = depotLat;
  let currentLng = depotLng;
  let remaining = [...places];

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;

    remaining.forEach((p, idx) => {
      const pLat = p.lat || p.coordinates?.latitude || depotLat;
      const pLng = p.lng || p.coordinates?.longitude || depotLng;
      const d = getDistance(currentLat, currentLng, pLat, pLng);
      if (d < minDist) {
        minDist = d;
        nearestIdx = idx;
      }
    });

    const next = remaining[nearestIdx];
    ordered.push(next);
    remaining.splice(nearestIdx, 1);
    currentLat = next.lat || next.coordinates?.latitude || depotLat;
    currentLng = next.lng || next.coordinates?.longitude || depotLng;
  }

  return ordered;
};

/**
 * Formats minutes to HH:MM AM/PM
 */
const formatTime = (totalMins: number): string => {
  const hours = Math.floor(totalMins / 60);
  const minutes = Math.floor(totalMins % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${displayHours}:${displayMinutes} ${ampm}`;
};
