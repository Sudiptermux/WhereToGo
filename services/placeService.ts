import { supabase } from "./supabaseClient";

/**
 * Helper to transform Supabase objects to match the expected UI schema.
 */
export const normalizePlace = (p: any) => {
    if (!p) return null;
    
    const finalImage = p.image_url || require("../assets/images/coming-soon.png");

    const media: any[] = [];
    media.push({ 
        url: finalImage, 
        media_type: 'image', 
        is_primary: true,
        isPlaceholder: !p.image_url 
    });

    if (p.video_url) {
        media.push({ url: p.video_url, media_type: 'video', is_primary: true });
    }
    
    if (p.gallery && Array.isArray(p.gallery)) {
        p.gallery.forEach((g: any) => media.push({ 
            url: typeof g === 'string' ? g : g.url, 
            media_type: 'image', 
            is_primary: false 
        }));
    }

    const description = p.description || "";

    return {
        ...p,
        // UI expects 'id' to be the slug for routing in current implementation
        // But internal relations should use the UUID 'id'
        id: p.id, 
        slug: p.slug,
        title: p.title,
        image: finalImage,
        isMissingMedia: !p.image_url,
        hasVideo: !!p.video_url,
        place_media: media,
        lat: p.lat,
        lng: p.lng,
        location_display: p.location,
        description_full: description,
        description_short: p.description_short || (description.length > 50 
            ? description.substring(0, 50) + '...' 
            : description)
    };
};

export const placeService = {
  /**
   * Fetch by UUID
   */
  async getPlaceById(id: string) {
    const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) return null;
    return normalizePlace(data);
  },

  /**
   * Fetch by Slug (for routing)
   */
  async getPlaceBySlug(slug: string) {
    const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('slug', slug)
        .single();
    
    if (error) return null;
    return normalizePlace(data);
  },

  /**
   * Smart Fetcher: Tries UUID first, then Slug
   */
  async getPlaceByIdentifier(identifier: string) {
    if (!identifier) return null;

    // Check if it's a UUID
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(identifier);

    if (isUUID) {
       const resp = await this.getPlaceById(identifier);
       if (resp) return resp;
    }

    // Try by slug
    return await this.getPlaceBySlug(identifier);
  },

  async getRandomPlaces(limit = 4) {
    const { data, error } = await supabase
        .from('places')
        .select('*')
        .limit(limit);
        
    if (error) return [];
    return (data || []).map(normalizePlace);
  },

  async searchPlaces(query: string) {
    const { data, error } = await supabase
        .from('places')
        .select('*')
        .or(`title.ilike.%${query}%,location.ilike.%${query}%,slug.ilike.%${query}%`);

    if (error) return [];
    return (data || []).map(normalizePlace);
  },

  async getPlaceWithAreaMates(identifier: string) {
    // Try UUID first, then Slug
    const { data: seed } = await supabase
        .from('places')
        .select('*')
        .or(`id.eq.${identifier},slug.eq.${identifier}`)
        .single();
    
    if (!seed) return [];

    const { data: mates } = await supabase
        .from('places')
        .select('*')
        .neq('id', seed.id)
        .eq('location', seed.location)
        .limit(5);
    
    const resultMates = (mates && mates.length > 0) ? mates : [];
    return [normalizePlace(seed), ...resultMates.map(normalizePlace)];
  },

  async getNearby(lat: number, lng: number, limit = 3) {
    const { data } = await supabase
        .from('places')
        .select('*')
        .limit(limit);

    return (data || []).map(normalizePlace);
  }
};
