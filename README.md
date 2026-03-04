# OutfitFlow

> React Native app that turns your wardrobe and local weather into tailored outfit recommendations powered by AI.

## At a Glance

- AI outfits blend OpenRouter's multi-model support with OpenWeather data for TPO-aware looks.
- FastAPI backend provides flexible AI model selection (GPT-4, Claude, Llama, etc.).
- Firebase Authentication + Firestore subcollections keep every user’s wardrobe isolated.
- Expo toolchain, Cloudinary image CDN, and navigation polish deliver native-quality UX.

## Key Features

**Auth & Personalization**

- Firebase Authentication (Email/Password, Google)
- `users/{userId}/wardrobe` schema for hard data separation

**Wardrobe Management**

- CRUD for garments plus category/season/brand filters
- Cloudinary uploads with CDN thumbnails

**AI Outfit Picks**

- OpenRouter API with multiple AI models (Claude, GPT-4, Llama) analyzes closet, rules, and colors
- OpenWeatherMap feeds real-time conditions
- Generates cards with color harmony and dress-code checks

**Mobile Experience**

- React Native + Expo Router navigation
- Light/Dark themes and smooth stack transitions
- Optimized bundles for iOS and Android targets

## Tech Stack

| Area     | Tools                                                     |
| -------- | --------------------------------------------------------- |
| App      | React Native 0.81, Expo SDK 54, TypeScript                |
| State/UI | React Context API, React Navigation, Expo Linear Gradient |
| Backend  | FastAPI (Python), Firebase Authentication & Firestore     |
| Media    | Cloudinary CDN                                            |
| AI/Data  | OpenRouter API (GPT-4, Claude, Llama), OpenWeatherMap API |

## Quick Start

```bash
git clone https://github.com/torigood/OutfitFlow.git
cd OutfitFlow
npm install
cp .env.example .env   # add Firebase, Cloudinary, OpenWeather keys

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # add OpenRouter API key
python -m uvicorn main:app --reload

# Run mobile app (new terminal)
npx expo run:ios       # requires macOS + simulator
npx expo run:android   # emulator or USB device
```

## Required API Keys

- Firebase Console: Authentication & Firestore config
- Cloudinary Dashboard: cloud name + unsigned preset
- OpenRouter: AI API Key (https://openrouter.ai/keys) - supports GPT-4, Claude, Llama, etc.
- OpenWeatherMap: Current Weather API Key

## Folder Snapshot

```
src/
├─ config/        # Firebase, Cloudinary configs
├─ contexts/      # AuthContext, global state
├─ screens/       # Auth, Wardrobe, AIRecommend, Settings
├─ services/      # authService, wardrobeService, fashionAIService, weatherService
└─ types/         # Shared TypeScript types

backend/
├─ routers/
│  ├─ ai.py       # OpenRouter API integration
│  ├─ image.py    # Image processing
│  └─ weather.py  # Weather data
├─ main.py        # FastAPI server
└─ requirements.txt
```

## Screenshots

<table style="border-collapse:collapse; margin:0 auto;">
  <tr>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/01c2ea9c-c19c-4bd4-96c1-a1dbcc5dc0f5" alt="Image1" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/42ba0c61-d8a0-4d7a-b97e-186a2917650f" alt="Image2" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/15f18193-410e-46d7-8ba8-41e9a1cded7d"" alt="Image3" width="240" style="display:block;" /></td>
  </tr>
  <tr>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/53437a25-4b96-4dc7-ad3e-53920c9a0ee3"" alt="Image5" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/026ed22c-2e4f-4a5b-a68e-36988d8e9401" alt="Image5" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/20caf8f6-035c-4c21-9ea4-bea3cd6cbff3" alt="Image4" width="240" style="display:block;" /></td>
  </tr>
</table>

## Contact

- Issues & feedback: [GitHub Issues](https://github.com/torigood/OutfitFlow/issues)
- Korean version available at [`README_KO.md`](./README_KO.md)
