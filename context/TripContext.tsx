import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../services/supabaseClient";
import { normalizePlace } from "../services/placeService";

export type Place = {
  id: string; // Internal UUID
  slug: string; // Readable string ID (e.g. 'lingaraj-temple')
  title: string;
  category?: string;
  location?: string;
  location_display?: string;
  description?: string;
  description_short?: string;
  description_full?: string;
  image?: any;
  likes?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  avg_duration_mins?: number;
  opening_time?: string;
  closing_time?: string;
  best_visit_time?: string;
  entry_fee?: string;
  arrivalTime?: string;
  departureTime?: string;
  travelTimeMinutes?: number;
};

export type SavedTrip = {
  id: string;
  title: string;
  dates: string;
  status: 'COMPLETE' | 'DRAFT';
  statusColor: string;
  image: any;
  days: { 
    day: number; 
    places: Place[]; 
    totalDistanceKm?: number;
    estimatedDurationMins?: number;
    startTime?: string;
    endTime?: string;
  }[];
  stayLocation: Place | null;
  dateCreated: string;
  visitedPlaces: string[]; // Stores UUIDs
};

export type UserProfile = {
  name: string;
  avatar: string | null;
  level: number;
};

interface TripContextType {
  selectedPlaces: Place[];
  stayLocation: Place | null;
  numberOfDays: number;
  optimizedJourney: { 
    day: number; 
    places: Place[];
    totalDistanceKm?: number;
    estimatedDurationMins?: number;
    startTime?: string;
    endTime?: string;
    finalTransitMinutes?: number;
  }[];
  visitedPlaces: string[]; // For current active trip
  lifetimeVisitedPlaces: string[]; // For global stats/profile
  savedTrips: SavedTrip[];
  activeTripId: string | null;
  addToTrip: (place: Place) => void;
  removeFromTrip: (id: string) => void;
  setStayLocation: (place: Place | null) => void;
  setNumberOfDays: (days: number) => void;
  setOptimizedJourney: (journey: { 
    day: number; 
    places: Place[];
    totalDistanceKm?: number;
    estimatedDurationMins?: number;
    startTime?: string;
    endTime?: string;
    finalTransitMinutes?: number;
  }[]) => void;
  likedPlaces: Place[];
  toggleVisited: (id: string) => void;
  isVisited: (id: string) => boolean;
  toggleLike: (place: Place) => void;
  isLiked: (id: string) => boolean;
  saveActiveTrip: () => void;
  loadSavedTrip: (trip: SavedTrip) => void;
  clearTrip: () => void;
  isPlaceSelected: (id: string) => boolean;
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  syncWithCloud: () => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [stayLocation, setStayLocation] = useState<Place | null>(null);
  const [numberOfDays, setNumberOfDays] = useState<number>(3);
  const [optimizedJourney, setOptimizedJourney] = useState<{ 
    day: number; 
    places: Place[];
    totalDistanceKm?: number;
    estimatedDurationMins?: number;
    startTime?: string;
    endTime?: string;
    finalTransitMinutes?: number;
  }[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [lifetimeVisitedPlaces, setLifetimeVisitedPlaces] = useState<string[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [likedPlaces, setLikedPlaces] = useState<Place[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Demo Traveler",
    avatar: null,
    level: 1
  });

  // Load profile / Auth Sync & Global Listener
  useEffect(() => {
    // 1. Initial Data Load from Storage
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem("@wtg_user_profile");
        if (saved) setUserProfile(JSON.parse(saved));
      } catch (e) {
        console.log("Initial profile load failed", e);
      }
    };
    loadData();

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[TripContext] Auth Event: ${event}`);
      if (session?.user) {
        await syncWithCloud();
      } else if (event === 'SIGNED_OUT') {
        clearLocalState();
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const clearLocalState = () => {
    setSelectedPlaces([]);
    setStayLocation(null);
    setOptimizedJourney([]);
    setVisitedPlaces([]);
    setLifetimeVisitedPlaces([]);
    setLikedPlaces([]);
    setSavedTrips([]);
    setActiveTripId(null);
    setUserProfile({
        name: "Demo Traveler",
        avatar: null,
        level: 1
    });
  };

  const syncWithCloud = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Sync Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
        setUserProfile({
            name: profile.name,
            avatar: profile.avatar_url,
            level: profile.level
        });
    }

    // 2. Sync Activity (UUID based)
    const { data: activity } = await supabase.from('user_activity').select('*, places(*)').eq('user_id', user.id);
    if (activity) {
        const liked = activity.filter(a => a.is_liked && a.places).map(a => normalizePlace(a.places));
        const visited = activity.filter(a => a.is_visited).map(a => a.place_id);
        setLikedPlaces(liked);
        setLifetimeVisitedPlaces(visited);
        // DO NOT overwrite visitedPlaces here, as that is trip-specific
    }

    // 3. Sync Trips (UUID based)
    const { data: trips } = await supabase.from('trips').select('*').eq('user_id', user.id);
    if (trips) {
        const mappedTrips = trips.map(t => ({
            id: t.id,
            title: t.title,
            dates: t.dates_display,
            status: t.status,
            statusColor: t.status_color,
            image: t.image_url,
            days: t.trip_data as any[],
            stayLocation: null,
            dateCreated: t.created_at,
            visitedPlaces: t.visited_places || []
        }));
        setSavedTrips(mappedTrips);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    
    try {
      await AsyncStorage.setItem("@wtg_user_profile", JSON.stringify(newProfile));
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          await supabase.from('profiles').upsert({
              id: user.id,
              name: newProfile.name,
              avatar_url: newProfile.avatar,
              level: newProfile.level
          });
      }
    } catch (e) {
      console.log("Failed to update profile", e);
    }
  };

  const addToTrip = (place: Place) => {
    setSelectedPlaces((prev) => {
      // UUID check
      if (prev.find((p) => p.id === place.id)) return prev;
      return [...prev, place];
    });
  };

  const removeFromTrip = (id: string) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== id));
    setVisitedPlaces((prev) => prev.filter((pid) => pid !== id));
  };

  const toggleLike = async (place: Place) => {
    const isLiking = !likedPlaces.some(p => p.id === place.id);
    setLikedPlaces((prev) => {
      if (prev.find((p) => p.id === place.id)) {
        return prev.filter(p => p.id !== place.id);
      }
      return [...prev, place];
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('user_activity').upsert({
            user_id: user.id,
            place_id: place.id, // UUID
            is_liked: isLiking
        }, { onConflict: 'user_id,place_id' });
    }
  };

  const isLiked = (id: string) => {
    // ID can be slug or UUID if coming from different parts of UI
    // We try to find in context where likedPlaces stores full objects
    return likedPlaces.some(p => p.id === id || p.slug === id);
  };

  const toggleVisited = async (id: string) => {
    // id should be UUID here
    const isInTripCheckIn = visitedPlaces.includes(id);
    const isLifetimeVisited = lifetimeVisitedPlaces.includes(id);

    // 1. Update Trip-Specific Check-ins (Toggle)
    setVisitedPlaces((prev) => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );

    // 2. Update Lifetime Visited (If checking in for the first time or explicitly toggling)
    // For now, checking in on a trip automatically marks it as visited in lifetime
    if (!isLifetimeVisited) {
        setLifetimeVisitedPlaces(prev => [...prev, id]);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('user_activity').upsert({
            user_id: user.id,
            place_id: id,
            is_visited: !isInTripCheckIn // If checking in, mark as visited
        }, { onConflict: 'user_id,place_id' });
    }
  };

  const isVisited = (id: string) => {
    return lifetimeVisitedPlaces.includes(id);
  };

  const saveActiveTrip = async () => {
    if (optimizedJourney.length === 0) return;

    const uniqueTripPlaceIds = Array.from(new Set(optimizedJourney.flatMap(d => d.places.map(p => p.id))));
    const isComplete = uniqueTripPlaceIds.length > 0 && uniqueTripPlaceIds.every(id => visitedPlaces.includes(id));
    
    const { data: { user } } = await supabase.auth.getUser();

    if (activeTripId) {
      const tripToUpdate = savedTrips.find(t => t.id === activeTripId);
      if (!tripToUpdate) return;

      const updatedTrip = {
        ...tripToUpdate,
        status: isComplete ? 'COMPLETE' : 'DRAFT' as const,
        statusColor: isComplete ? '#00bcd4' : '#FF9800', // Cyan for complete, Orange for draft
        days: [...optimizedJourney],
        visitedPlaces: [...visitedPlaces],
        stayLocation: stayLocation,
      };

      setSavedTrips(prev => prev.map(t => t.id === activeTripId ? updatedTrip : t));

      if (user) {
        await supabase.from('trips').update({
          title: updatedTrip.title,
          status: updatedTrip.status,
          trip_data: updatedTrip.days,
          visited_places: updatedTrip.visitedPlaces
        }).eq('id', activeTripId);
      }
      return;
    }

    const tempId = Date.now().toString();
    const newTrip: SavedTrip = {
      id: tempId,
      title: `Trip to ${stayLocation?.location_display || "Bhubaneswar"}`,
      dates: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " - " + 
             new Date(Date.now() + 86400000 * (numberOfDays || 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: isComplete ? 'COMPLETE' : 'DRAFT',
      statusColor: isComplete ? '#00bcd4' : '#FF9800',
      image: optimizedJourney[0]?.places[0]?.image || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600",
      days: [...optimizedJourney],
      stayLocation: stayLocation,
      dateCreated: new Date().toISOString(),
      visitedPlaces: [...visitedPlaces]
    };

    setSavedTrips(prev => [newTrip, ...prev]);
    setActiveTripId(tempId);

    if (user) {
        const { data } = await supabase.from('trips').insert({
            user_id: user.id,
            title: newTrip.title,
            dates_display: newTrip.dates,
            status: newTrip.status,
            status_color: newTrip.statusColor,
            image_url: typeof newTrip.image === 'string' ? newTrip.image : null,
            trip_data: newTrip.days,
            visited_places: newTrip.visitedPlaces,
            stay_location_id: stayLocation?.id // UUID
        }).select().single();
        
        if (data) {
            setSavedTrips(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id } : t));
            setActiveTripId(data.id);
        }
    }
  };

  const loadSavedTrip = (trip: SavedTrip) => {
    setOptimizedJourney(trip.days);
    setStayLocation(trip.stayLocation);
    setVisitedPlaces(trip.visitedPlaces);
    setActiveTripId(trip.id);
    const allPlaces = trip.days.flatMap(d => d.places);
    setSelectedPlaces(allPlaces);
    setNumberOfDays(trip.days.length);
  };

  const clearTrip = () => {
    setSelectedPlaces([]);
    setStayLocation(null);
    setNumberOfDays(3);
    setOptimizedJourney([]);
    setVisitedPlaces([]);
    setActiveTripId(null);
  };

  const deleteTrip = async (id: string) => {
    setSavedTrips(prev => prev.filter(t => t.id !== id));
    if (activeTripId === id) {
        clearTrip();
    }
    
    try {
        await supabase.from('trips').delete().eq('id', id);
    } catch (e) {
        console.error("Cloud deletion failed", e);
    }
  };

  const isPlaceSelected = (id: string) => {
    return selectedPlaces.some((p) => p.id === id || p.slug === id);
  };

  return (
    <TripContext.Provider
      value={{
        selectedPlaces,
        stayLocation,
        numberOfDays,
        optimizedJourney,
        visitedPlaces,
        lifetimeVisitedPlaces,
        savedTrips,
        activeTripId,
        addToTrip,
        removeFromTrip,
        setStayLocation,
        setNumberOfDays,
        setOptimizedJourney,
        toggleVisited,
        isVisited,
        likedPlaces,
        toggleLike,
        isLiked,
        saveActiveTrip,
        loadSavedTrip,
        clearTrip,
        isPlaceSelected,
        userProfile,
        updateProfile,
        syncWithCloud,
        deleteTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error("useTrip must be used within a TripProvider");
  }
  return context;
}
