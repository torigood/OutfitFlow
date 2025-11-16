# OutfitFlow ✨

> AI-Powered Personal Wardrobe Management & Style Recommendation Service

## Project Overview

A mobile application that digitally manages your personal wardrobe and provides optimal styling recommendations using **Google Gemini AI** and **real-time weather data**.

### Key Value Propositions

- AI-driven outfit recommendations based on weather and personal style
- Fully isolated personal wardrobe with user-specific data management
- Native iOS and Android app experience

---

## Features

### 🔐 User Authentication

- Firebase Authentication (Email/Password, Google Social Login)
- Complete data isolation per user (`users/{userId}/wardrobe`)

### 👔 Wardrobe Management

- Full CRUD operations (Create, Read, Update, Delete)
- Advanced filtering by category, season, and brand
- Cloudinary-powered image optimization and CDN delivery

### 🤖 AI-Powered Outfit Recommendations

- **Google Gemini 2.0 Flash** model integration
- **Real-time location-based weather API** (OpenWeatherMap)
- Color harmony analysis and complementary color suggestions
- Style consistency evaluation
- Personalized new item recommendations based on existing wardrobe

### 📱 Mobile Native App

- Built with React Native for iOS and Android
- Intuitive tab navigation UI
- Smooth screen transition animations

---

## Tech Stack

| Category             | Technologies                                             |
| -------------------- | -------------------------------------------------------- |
| **Frontend**         | React Native 0.81.5, Expo SDK 54, TypeScript 5.9.2       |
| **State Management** | React Context API                                        |
| **Navigation**       | React Navigation v7                                      |
| **Authentication**   | Firebase Authentication (Email/Password, Google Sign-In) |
| **Database**         | Firebase Firestore (NoSQL)                               |
| **Image Storage**    | Cloudinary CDN                                           |
| **AI/ML**            | Google Gemini 2.0 Flash                                  |
| **External API**     | OpenWeatherMap API                                       |
| **Styling**          | React Native StyleSheet, Expo Linear Gradient            |

---

## Architecture

### Data Structure

```
Firestore
└── users/{userId}
    └── wardrobe (subcollection)
        ├── {clothingId}
        │   ├── name, category, color, brand
        │   ├── seasons: ["Spring", "Summer"]
        │   ├── imageUrl (Cloudinary CDN)
        │   └── createdAt, updatedAt
```

### Key Design Patterns

- **Subcollection Architecture**: User data isolation and scalability
- **Context API**: Global authentication state management
- **Native Optimization**: Optimized UI/UX for iOS/Android platforms

---

## Quick Start

### Installation & Execution

```bash
# 1. Clone repository
git clone https://github.com/torigood/OutfitFlow.git
cd OutfitFlow

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Add API keys for Firebase, Cloudinary, Gemini, and OpenWeather in .env

# 4. Build native project
npx expo prebuild

# 5. Run the app
# iOS Simulator (Mac required)
npx expo run:ios

# Android Emulator or physical device
npx expo run:android
```

### Required API Keys

The following service API keys are required to run the project:

- **Firebase** ([Console](https://console.firebase.google.com)): Authentication + Firestore
- **Cloudinary** ([Dashboard](https://cloudinary.com)): Image upload (Free tier available)
- **Google Gemini** ([AI Studio](https://aistudio.google.com/apikey)): AI recommendations (Free tier available)
- **OpenWeatherMap** ([API](https://openweathermap.org/api)): Weather data (Free tier available)

<details>
<summary>View Detailed Setup Guide</summary>

#### Firebase Setup

1. Create a project in Firebase Console
2. Enable Authentication → Email/Password and Google Sign-In
3. Create Firestore Database (Test mode)
4. Copy SDK configuration from Project Settings → Add to `.env`

#### Cloudinary Setup

1. Sign up for a free account
2. Settings → Upload → Create an Unsigned Preset
3. Copy Cloud Name and Preset name → Add to `.env`

</details>

---

## Project Structure

```
src/
├── config/          # Firebase, Cloudinary configuration
├── contexts/        # AuthContext (Global auth state)
├── screens/         # Screen components
│   ├── auth/       # Landing, Login, Signup
│   └── ...         # Wardrobe, AIRecommend, Settings
├── services/        # API service layer
│   ├── authService.ts
│   ├── wardrobeService.ts
│   ├── fashionAIService.ts
│   └── weatherService.ts
└── types/           # TypeScript type definitions
```

---

## Completed Features

### ✅ Core Features (Phase 1-2)

**Authentication System**

- Firebase Authentication (Email/Password, Google Social Login)
- User-specific data isolation (`users/{userId}/wardrobe`)

**Wardrobe Management**

- Full CRUD operations (Create, Read, Update, Delete)
- Search and filter by category, season, and brand
- Cloudinary-based image upload and optimization

**AI Outfit Recommendations**

- Google Gemini 2.0 Flash model integration
- Real-time location-based weather API integration
- Color harmony and style consistency analysis
- Wardrobe-based new item recommendations

**UI/UX**

- Landing page with animated blobs and gradient design
- Native tab navigation UI
- Smooth screen transition animations (React Navigation Stack)

### 📝 Future Roadmap

- Outfit saving and favorites
- Community features (outfit sharing, likes/comments)
- Calendar functionality (outfit history tracking)
- Shopping recommendations (style-based product suggestions)
- Wardrobe utilization and trend analysis

---

## Key Technical Challenges Solved

1. **Native Google Sign-In Implementation**

   - Integrated React Native Google Sign-In SDK
   - Built secure authentication flow with Firebase Authentication integration
   - Optimized platform-specific configurations for iOS/Android

2. **User Data Isolation**

   - Designed Firestore subcollection structure (`users/{userId}/wardrobe`)
   - Enhanced security by adding userId parameter to all service functions

3. **Image Upload Optimization**

   - Integrated Expo Image Picker with Cloudinary
   - Optimized for native environment with FormData-based upload
   - Improved image loading speed using CDN

4. **AI Prompt Engineering**
   - Designed complex analysis prompts considering weather, style, and color
   - Standardized response format for stable JSON parsing

---

## Screenshots

<!-- 방법 2: 테이블 레이아웃 -->
<table style="border-collapse:collapse; margin:0 auto;">
  <tr>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/f00071a7-165f-4408-9ac7-c284547fb2d0" alt="Image1" width="250" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/4133b08f-ad78-4488-9679-62106fa30564" alt="Image2" width="250" style="display:block;" /></td>
      <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/1ceaea43-3df3-4105-b8f6-4d6eec99925a"  alt="Image4" width="250" style="display:block;" /></td>
  </tr>
  <tr>
   <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/05babb4e-6c04-4f04-a6cd-5fb73a2b578f" alt="Image5" width="250" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/968d432f-f76b-4d90-a665-5a395613f6da" alt="Image3" width="250" style="display:block;" /></td>
    
  </tr>
</table>


---

## License & Contact

- **Repository**: [GitHub - OutfitFlow](https://github.com/torigood/OutfitFlow)
- **Issues**: [GitHub Issues](https://github.com/torigood/OutfitFlow/issues)

---

<div align="center">

**OutfitFlow** - Your Personal AI Stylist ✨

Made with using React Native & Google Gemini AI

[🇰🇷 한국어 README](./README.md)

</div>
