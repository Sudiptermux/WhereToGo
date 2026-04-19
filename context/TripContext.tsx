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

interface TripContextType {
  selectedPlaces: Place[];
  stayLocation: Place | null;
  numberOfDays: number;
  optimizedJourney: { day: number; places: Place[] }[];
  visitedPlaces: string[];
  addToTrip: (place: Place) => void;
  removeFromTrip: (id: string) => void;
  setStayLocation: (place: Place | null) => void;
  setNumberOfDays: (days: number) => void;
  setOptimizedJourney: (journey: { day: number; places: Place[] }[]) => void;
  toggleVisited: (id: string) => void;
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
        addToTrip,
        removeFromTrip,
        setStayLocation,
        setNumberOfDays,
        setOptimizedJourney,
        toggleVisited,
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
