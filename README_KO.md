# OutfitFlow

> Google Gemini와 OpenWeather 데이터를 결합해 옷장과 날씨를 분석하고 맞춤형 코디를 추천하는 React Native 애플리케이션입니다.

## 한눈에 보기
- Gemini 2.0 Flash 추론과 OpenWeather 정보를 조합해 기온·날씨·TPO를 고려한 코디 카드 생성.
- Firebase Authentication + Firestore 서브컬렉션으로 사용자별 옷장/설정 데이터 완전 분리.
- Expo 빌드 파이프라인, Cloudinary 이미지 CDN, 부드러운 내비게이션으로 네이티브급 UX 제공.

## 핵심 기능
**인증 & 개인화**  
- Firebase Authentication(이메일·비밀번호, Google)  
- `users/{userId}/wardrobe` 구조로 사용자별 데이터 격리

**옷장 관리**  
- 의류 CRUD, 카테고리·계절·브랜드 필터  
- Cloudinary 업로드 + CDN 썸네일 최적화

**AI 코디 추천**  
- Gemini 2.0 Flash 프롬프트로 옷장, 드레스코드, 색 조합 분석  
- OpenWeatherMap 실시간 날씨 연동  
- 어울림/색감/규율을 점검한 코디 카드 출력

**모바일 경험**  
- React Native + Expo Router 기반 내비게이션  
- 라이트/다크 테마와 부드러운 화면 전환  
- iOS/Android 타깃에 맞춘 번들 최적화

## 기술 스택
| 영역 | 사용 기술 |
| --- | --- |
| App | React Native 0.81, Expo SDK 54, TypeScript |
| State/UI | React Context API, React Navigation, Expo Linear Gradient |
| Backend | Firebase Authentication & Firestore |
| Media | Cloudinary CDN |
| AI/데이터 | Google Gemini 2.0 Flash, OpenWeatherMap API |

## 빠른 시작
```bash
git clone https://github.com/torigood/OutfitFlow.git
cd OutfitFlow
npm install
cp .env.example .env   # Firebase, Cloudinary, Gemini, OpenWeather 키 입력
npx expo run:ios       # macOS + iOS 시뮬레이터 필요
npx expo run:android   # Android 에뮬레이터 또는 실기기
```

## 필수 API 키
- Firebase Console: Authentication + Firestore
- Cloudinary Dashboard: Cloud name, unsigned preset
- Google AI Studio: Gemini API Key
- OpenWeatherMap: Current Weather API Key

## 폴더 구조
```
src/
├─ config/        # Firebase, Cloudinary 설정
├─ contexts/      # AuthContext 등 글로벌 상태
├─ screens/       # Auth, Wardrobe, AIRecommend, Settings
├─ services/      # authService, wardrobeService, fashionAIService, weatherService
└─ types/         # 공용 타입 정의
```

## 스크린샷
<table style="border-collapse:collapse; margin:0 auto;">
  <tr>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/99829b77-357e-46d1-9bc2-080a1c5bbc0f" alt="Image1" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/6b5bc2ad-1265-4caa-a5ef-9542f5708848" alt="Image2" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/7411c4f1-5f1e-42ea-a0bb-8fd0e80cb38d" alt="Image3" width="240" style="display:block;" /></td>
  </tr>
  <tr>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/8397f4fb-49a0-4ed1-a66f-aaa94e18505a" alt="Image4" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/393381bd-3398-4bbf-bc4c-b0d85596f89a" alt="Image5" width="240" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/ff0b7263-e599-48af-acbf-ab3d736e5a9c" alt="Image5" width="240" style="display:block;" /></td>
  </tr>
</table>

## 문의
- Issue 또는 Discussion: [GitHub Issues](https://github.com/torigood/OutfitFlow/issues)
- 영어 버전은 [`README.md`](./README.md)를 참고하세요.
