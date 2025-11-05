# OutfitFlow ✨

> AI-Powered Personal Wardrobe Management & Style Recommendation Service

## Project Overview

A cross-platform mobile and web application that digitally manages your personal wardrobe and provides optimal styling recommendations using **Google Gemini AI** and **real-time weather data**.

### Key Value Propositions

- AI-driven outfit recommendations based on weather and personal style
- Fully isolated personal wardrobe with user-specific data management
- Seamless experience across Web, iOS, and Android platforms

---

## Features

### 🔐 User Authentication

- Firebase Authentication (Email/Password, Google Social Login)
- Complete data isolation per user (`users/{userId}/wardrobe`)
- Cross-platform session management

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

### 📱 Cross-Platform Support

- Built with React Native for iOS, Android, and Web
- Responsive design (Sidebar navigation for web / Tab navigation for mobile)

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
- **Platform-specific Logic**: Optimized for Web and Native environments

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

# 4. Run the app
npm start
# Web: w / iOS: i / Android: a
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
- Cross-platform session management

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
- Responsive web design with sidebar navigation
- iOS/Android/Web cross-platform support

### 📝 Future Roadmap

- Outfit saving and favorites
- Community features (outfit sharing, likes/comments)
- Calendar functionality (outfit history tracking)
- Shopping recommendations (style-based product suggestions)
- Wardrobe utilization and trend analysis

---

## Key Technical Challenges Solved

1. **Cross-Platform Authentication Implementation**

   - Integrated different Google Sign-In SDKs for Web and Mobile (`signInWithPopup` vs `GoogleSignin`)
   - Achieved unified user experience through platform-specific logic

2. **User Data Isolation**

   - Designed Firestore subcollection structure (`users/{userId}/wardrobe`)
   - Enhanced security by adding userId parameter to all service functions

3. **Image Upload Optimization**

   - Implemented platform-specific handling (Web: Blob-based / Mobile: FormData-based)
   - Improved image loading speed using Cloudinary CDN

4. **AI Prompt Engineering**
   - Designed complex analysis prompts considering weather, style, and color
   - Standardized response format for stable JSON parsing

---

## Screenshots

> [Coming Soon] Add screenshots of Landing Page, Wardrobe Management, AI Recommendations

---

## License & Contact

- **Repository**: [GitHub - OutfitFlow](https://github.com/torigood/OutfitFlow)
- **Issues**: [GitHub Issues](https://github.com/torigood/OutfitFlow/issues)

---

<div align="center">

**OutfitFlow** - Your Personal AI Stylist ✨

Made with ❤️ using React Native & Google Gemini AI

[🇰🇷 한국어 README](./README.md)

</div>
