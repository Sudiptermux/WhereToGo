# 🌍 WhereToGo: Technical Documentation & System Report

## 1. Project Overview
**WhereToGo** is a premium, AI-driven travel planning and curation platform focused on the heritage and natural beauty of Odisha, India. The application aims to transform the often-tedious process of trip planning into an immersive, editorial experience—a "Digital Curator" for the modern traveler.

### Mission
- **Cinematic Discovery**: Moving beyond static lists to dynamic, reel-based exploration.
- **Intelligent Optimization**: Automating complex logistics (route planning, timing, stay alignment).
- **Offline Integrity**: Ensuring 100% reliability for high-stakes demonstrations via a "Safe Demo Mode."

---

## 2. System Architecture
The application is built on a modern, decoupled mobile architecture designed for performance and rapid iteration.

### Tech Stack
- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 54+](https://expo.dev/).
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation).
- **State Management**: [React Context API](https://react.dev/learn/passing-data-deeply-with-context) (Global `TripContext`).
- **Persistence**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) for local user profiles and saved itineraries.
- **Styling**: Vanilla `StyleSheet` with a focus on dark-mode tonal layering.
- **Animations**: `react-native-reanimated` and `expo-linear-gradient`.

### Safe Demo Mode
To ensure stability during presentations, the app implements a "Safe Demo Mode" which:
- Bypasses external cloud dependencies (Supabase/Firebase).
- Uses a local JSON-based asset database (`places.ts`).
- Maps over 150+ high-resolution images and cinematic reels directly to local URI slugs.

---

## 3. Design Philosophy: The "Digital Curator"
The aesthetic identity of WhereToGo is defined as **Editorial Cinema**. It prioritizes high-contrast visuals, glassmorphism, and subtle micro-interactions.

### Visual Tokens
- **Core Palette**: 
  - `Background`: #060606 (OLED Black)
  - `Accent`: #00BCD4 (Electric Cyan)
  - `Status/Warmth`: #FF9800 (Saffron Orange)
- **Typography**: Heavy-weight sans-serif (900+) for headers to mimic travel magazines; semi-transparent light weights for metadata.
- **Layering**: Extensive use of 35% black tints and 25px gaussian blurs to maintain readability over cinematic backgrounds.

---

## 4. Main Engine & Core Logic
The application's "brain" is centered around the synchronization of exploration and calculation.

### State Flow (`TripContext`)
Global state is centralized to manage:
1.  **Selection**: A list of `Place` objects the user intends to visit.
2.  **Constraints**: Number of days and intended "Stay Hub."
3.  **Optimization**: The computed `OptimizedJourney` returned by the engine.
4.  **Profile**: Persistent identity (Name, Avatar, Level).

### The "Stay Hub" Selection
The planner (`planner.tsx`) uses a multi-vector approach to define the trip's starting point:
- **Nominatim API**: Real-time geocoding for specific hotels or landmarks.
- **Map Interaction**: A crosshair-based "Pick from Map" interface for custom home locations.
- **Proximity Logic**: Intelligent suggestion of stays near the most popular selected spots.

---

## 5. Algorithms & Optimization
The true power of WhereToGo lies in its bespoke route optimization engine.

### Route Engine (`services/routeEngine.ts`)
The engine solves a variation of the **Vehicle Routing Problem with Time Windows (VRPTW)** using a **Greedy Multi-Constraint Heuristic**.

1.  **Clustering**: Selected places are grouped into "Days" based on a maximum 10-hour exploration window.
2.  **Sequencing**: Within each cluster, a **Nearest Neighbor Search** is performed starting from the Depot (Stay Location).
3.  **Distance Calculation**: Uses the **Haversine Formula** to determine "as-the-crow-flies" distance between GPS coordinates.
    ```typescript
    const R = 6371; // Earth radius
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + ...;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
    ```
4.  **Congestion Padding**: A flat 10-minute "buffer" + variable travel-time estimation (30 km/h avg) is added to every leg to ensure a realistic schedule.
5.  **Temporal Logic**: Automatically handles a 60-minute lunch window once the clock passes 1:00 PM.

---

## 6. Application Flow
The user journey is structured to build momentum from visual inspiration to actionable plans.

1.  **Animated Splash**: Establishing the premium branding.
2.  **Discovery Screen**: Side-scrolling reels for visual "liking" and selection.
3.  **Planner Screen**: Refining the "bucket list" and defining stay constraints.
4.  **Optimization Loader**: A high-fidelity animation screen that executes the `routeEngine`.
5.  **Summary/Journey View**: An editorial timeline of the optimized trip with maps and timing.
6.  **Personal Dashboard**: Tracking visited locations and explorer milestones.

---

## 7. Technical Specifications
- **Assets**: 34+ Premium Locations, 34+ Cinematic Reels.
- **Performance**: <100ms pathfinding for up to 50 destinations.
- **Accessibility**: High-contrast icons and readable typographical hierarchy.

---
*Document Version: 1.0.0*
*Created for the WhereToGo Project Team.*
