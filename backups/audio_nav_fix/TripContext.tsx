import React, { createContext, useContext, useState, ReactNode } from "react";

export type Place = {
  id: string;
  title: string;
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
};

export type SavedTrip = {
  id: string;
  title: string;
  dates: string;
  status: 'COMPLETE' | 'DRAFT';
  statusColor: string;
  image: any;
  days: { day: number; places: Place[] }[];
  stayLocation: Place | null;
  dateCreated: string;
};

interface TripContextType {
  selectedPlaces: Place[];
  stayLocation: Place | null;
  numberOfDays: number;
  optimizedJourney: { day: number; places: Place[] }[];
  visitedPlaces: string[];
  savedTrips: SavedTrip[];
  addToTrip: (place: Place) => void;
  removeFromTrip: (id: string) => void;
  setStayLocation: (place: Place | null) => void;
  setNumberOfDays: (days: number) => void;
  setOptimizedJourney: (journey: { day: number; places: Place[] }[]) => void;
  toggleVisited: (id: string) => void;
  saveActiveTrip: () => void;
  clearTrip: () => void;
  isPlaceSelected: (id: string) => boolean;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>([]);
  const [stayLocation, setStayLocation] = useState<Place | null>(null);
  const [numberOfDays, setNumberOfDays] = useState<number>(3);
  const [optimizedJourney, setOptimizedJourney] = useState<{ day: number; places: Place[] }[]>([]);
  const [visitedPlaces, setVisitedPlaces] = useState<string[]>([]);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  const addToTrip = (place: Place) => {
    setSelectedPlaces((prev) => {
      if (prev.find((p) => p.id === place.id)) return prev;
      return [...prev, place];
    });
  };

  const removeFromTrip = (id: string) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== id));
    setVisitedPlaces((prev) => prev.filter((pid) => pid !== id));
  };

  const toggleVisited = (id: string) => {
    setVisitedPlaces((prev) => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const saveActiveTrip = () => {
    if (optimizedJourney.length === 0) return;

    const totalStops = optimizedJourney.reduce((acc, d) => acc + d.places.length, 0);
    const isComplete = visitedPlaces.length === totalStops && totalStops > 0;
    
    const newTrip: SavedTrip = {
      id: Date.now().toString(),
      title: `Trip to ${stayLocation?.location_display || "Bhubaneswar"}`,
      dates: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + " - " + 
             new Date(Date.now() + 86400000 * numberOfDays).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: isComplete ? 'COMPLETE' : 'DRAFT',
      statusColor: isComplete ? '#00bcd4' : '#7c5a0b',
      image: optimizedJourney[0]?.places[0]?.image || "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=600",
      days: [...optimizedJourney],
      stayLocation: stayLocation,
      dateCreated: new Date().toISOString()
    };

    setSavedTrips(prev => [newTrip, ...prev]);
  };

  const clearTrip = () => {
    setSelectedPlaces([]);
    setStayLocation(null);
    setNumberOfDays(3);
    setOptimizedJourney([]);
    setVisitedPlaces([]);
  };

  const isPlaceSelected = (id: string) => {
    return selectedPlaces.some((p) => p.id === id);
  };

  return (
    <TripContext.Provider
      value={{
        selectedPlaces,
        stayLocation,
        numberOfDays,
        optimizedJourney,
        visitedPlaces,
        savedTrips,
        addToTrip,
        removeFromTrip,
        setStayLocation,
        setNumberOfDays,
        setOptimizedJourney,
        toggleVisited,
        saveActiveTrip,
        clearTrip,
        isPlaceSelected,
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
