# 🌍 WhereToGo: The Premium AI Travel Curator

![App Header](https://img.shields.io/badge/Status-Demo--Ready-brightgreen)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Tech](https://img.shields.io/badge/Tech-React%20Native%20%7C%20Expo-61DAFB)

**WhereToGo** is an immersive, high-end travel planning and curation engine designed to showcase the beauty of Odisha, India. Built with a focus on cinematic aesthetics and intelligent pathfinding, it transforms trip planning from a chore into an editorial experience.

---

## ✨ Key Features

### 🎬 Cinematic Discovery Feed
Experience Odisha like never before. The discovery feed uses a reel-based navigation system with:
- **High-Resolution Media**: Integrated 4K video clips and professional photography.
- **Cinematic Backdrop**: Real-time background blurring (25px) and dark tinting (35%) to ensure a premium, readable interface.
- **Dynamic Fallbacks**: Seamless transition between video and static imagery for all connection speeds.

### 🧠 AI-Powered "Curator" Engine
Our custom-built route optimization engine calculates the most efficient exploration paths:
- **Smart Pathfinding**: Uses Haversine distance calculations and Clarke-Wright savings algorithms.
- **Multi-Day Planning**: Automatically distributes 30+ locations across multiple days based on transit time and visit duration.
- **Time Windows**: Intelligent arrival and departure estimation for every stop.

### 👤 Digital Identity & Gamification
Manage your traveler persona through a personalized dashboard:
- **Identity Manager**: Dynamic avatar and name management synced across the app.
- **Milestones**: Track visited locations and unlock "Explorer Levels" (Cultural Custodian, Nature Nomad, etc.).
- **Digital Passport**: A unified view of your saved journeys and travel stats.

### 🛡️ Safe Demo Mode
Designed for high-stakes presentations, the app operates in a fully stable "Safe Demo Mode":
- **Local Persistence**: Zero cloud dependencies using `AsyncStorage` for 100% offline reliability.
- **Pre-Mapped Assets**: Over 150+ verified media assets mapped to a local slug-based database.

---

## 🛠️ Technology Stack

- **Core**: React Native & Expo (v54+)
- **Navigation**: Expo Router (File-based routing)
- **State**: React Context API (`TripContext`)
- **Animation**: 
  - `react-native-reanimated` (Fluid transitions & UI micro-interactions)
  - `expo-linear-gradient` (Tonal layering & premium overlays)
- **Mapping**: `react-native-maps` with Google Maps integration.
- **Media**: `expo-video` and `expo-image` for high-performance rendering.

---

## 📂 Project Structure

```text
WhereToGo/
├── app/                  # File-based routing (Tabs, Shared Screens)
│   ├── (tabs)/           # Home, Discovery, Saved, Profile
│   ├── planner.tsx       # AI Optimization Entry
│   ├── journey.tsx       # Optimized Itinerary View
│   └── loader.tsx        # System status & calculation animation
├── components/           # Reusable UI (Buttons, Cards, Modals)
├── constants/            # Styled tokens & verified Database (places.ts)
├── context/              # Global State (TripContext.tsx)
├── services/             # Core Logic (Route Engine, Auth Mockup)
└── PlaceDB/              # 150+ Verified Local Media Assets
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Expo Go](https://expo.dev/expo-go) app (for mobile testing)
- [Git](https://git-scm.com/)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sudiptermux/WhereToGo.git
   cd WhereToGo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Launch the app**:
   - Scan the QR code with **Expo Go** (Android/iOS).
   - Press `w` to launch in a web browser.

---

## 💎 Curator Highlights
- **34+ Premium Locations**: Including Puri, Konark, Bhawanipatna, and Sambalpur.
- **34+ Cinematic Reels**: Custom-mapped video backgrounds.
- **Pixel-Perfect UI**: Editorial typography and glassmorphism components.

---

## 📜 License
This project is private and intended for demonstration purposes.

*Curated with ❤️ by the WhereToGo Team.*
