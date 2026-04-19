import { ALL_PLACES } from "../constants/places";

/**
 * Helper to transform local objects to match the expected UI schema.
 * This ensures consistency across the app while using local data.
 */
const normalizePlace = (p: any) => {
    if (!p) return null;
    
    // Fallback image if missing
    const hasOriginalImage = !!p.image;
    const finalImage = hasOriginalImage ? p.image : require("../PlaceDB/Images/coming-soon.png");

    // Generate media array from local fields if not already present
    const media: any[] = [];
    media.push({ 
        url: finalImage, 
        media_type: 'image', 
        is_primary: true,
        isPlaceholder: !hasOriginalImage 
    });

    if (p.video) {
        media.push({ url: p.video, media_type: 'video', is_primary: true });
    }
    
    if (p.gallery && p.gallery.length > 0) {
        p.gallery.forEach((g: any) => media.push({ url: g, media_type: 'image', is_primary: false }));
    }

    const description = p.description || p.description_full || "";

    return {
        ...p,
        image: finalImage,
        isMissingMedia: !hasOriginalImage,
        hasVideo: !!p.video,
        place_media: media,
        // Ensure lat/lng are top-level for the unified coordinate system
        lat: p.lat || p.coordinates?.latitude,
        lng: p.lng || p.coordinates?.longitude,
        location_display: p.location || p.location_display,
        description_full: description,
        description_short: p.description_short || (description.length > 50 
            ? description.substring(0, 50) + '...' 
            : description)
    };
};

export const placeService = {
  /**
   * Fetch a single place by ID
   */
  async getPlaceById(id: string) {
    const p = ALL_PLACES.find(item => item.id === id);
    return normalizePlace(p);
  },

  /**
   * Fetch a random set of places
   */
  async getRandomPlaces(limit = 4) {
    const shuffled = [...ALL_PLACES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit).map(normalizePlace);
  },

  /**
   * Search places by keyword (title or location)
   */
  async searchPlaces(query: string) {
    const q = query.toLowerCase();
    const filtered = ALL_PLACES.filter(p => 
        p.title.toLowerCase().includes(q) || 
        (p.location && p.location.toLowerCase().includes(q))
    );
    return filtered.map(normalizePlace);
  },

  /**
   * Recommendation Logic: Get a place AND its neighbors in the same area
   */
  async getPlaceWithAreaMates(placeId: string) {
    const seed = ALL_PLACES.find(p => p.id === placeId);
    if (!seed) return [];

    // "Area Mates" find places in the same city/area
    const mates = ALL_PLACES.filter(p => 
        p.id !== placeId && 
        p.location && seed.location &&
        p.location.toLowerCase() === seed.location.toLowerCase()
    );
    
    // If we have mates in the same area, show them. Otherwise show randoms.
    const resultMates = mates.length > 0 ? mates : ALL_PLACES.filter(p => p.id !== placeId);
    
    return [normalizePlace(seed), ...resultMates.slice(0, 5).map(normalizePlace)];
  },

  /**
   * GPS Logic (Mocked for Demo stability)
   */
  async getNearby(lat: number, lng: number, limit = 3) {
    // For now, return random places as "Nearby"
    return ALL_PLACES.slice(0, limit).map(normalizePlace);
  }
};
