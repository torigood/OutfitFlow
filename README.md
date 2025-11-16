# OutfitFlow ✨

> AI가 추천하는 나만의 스타일 - 스마트 옷장 관리 및 코디 추천 모바일 앱

## 프로젝트 개요

개인 옷장을 디지털로 관리하고, **Google Gemini AI**와 **실시간 날씨 정보**를 활용해 최적의 스타일링을 추천하는 모바일 애플리케이션입니다.

### 핵심 가치

- 날씨와 스타일을 고려한 AI 기반 코디 추천
- 사용자별 완전 격리된 개인 옷장 관리
- iOS/Android 네이티브 앱으로 최적화된 사용자 경험

---

## 주요 기능

### 🔐 사용자 인증

- Firebase Authentication (이메일/비밀번호, Google 소셜 로그인)
- 사용자별 데이터 완전 격리 (`users/{userId}/wardrobe`)

### 👔 옷장 관리

- CRUD 기능 (추가/수정/삭제/조회)
- 카테고리, 계절, 브랜드별 검색 및 필터링
- Cloudinary 기반 이미지 최적화 및 CDN 제공

### 🤖 AI 코디 추천

- **Google Gemini 2.0 Flash** 모델 기반 스마트 분석
- **실시간 위치 기반 날씨 API** (OpenWeatherMap)
- 색상 조화, 스타일 일관성 평가
- 옷장에 어울리는 신규 아이템 추천

### 📱 모바일 네이티브 앱

- React Native 기반 iOS/Android 네이티브 앱
- 직관적인 탭 네비게이션 UI
- 부드러운 화면 전환 애니메이션

---

## 기술 스택

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

## 아키텍처

### 데이터 구조

```
Firestore
└── users/{userId}
    └── wardrobe (subcollection)
        ├── {clothingId}
        │   ├── name, category, color, brand
        │   ├── seasons: ["봄", "여름"]
        │   ├── imageUrl (Cloudinary CDN)
        │   └── createdAt, updatedAt
```

### 주요 설계 패턴

- **서브컬렉션 구조**: 사용자별 데이터 격리 및 확장성 확보
- **Context API**: 전역 인증 상태 관리
- **네이티브 최적화**: iOS/Android 플랫폼별 최적화된 UI/UX

---

## 빠른 시작

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/torigood/OutfitFlow.git
cd OutfitFlow

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에 Firebase, Cloudinary, Gemini, OpenWeather API 키 입력

# 4. 네이티브 프로젝트 빌드
npx expo prebuild

# 5. 앱 실행
# iOS 시뮬레이터 (Mac 필요)
npx expo run:ios

# Android 에뮬레이터 또는 실제 기기
npx expo run:android
```

### 필요한 API 키

프로젝트 실행을 위해 다음 서비스의 API 키가 필요합니다:

- **Firebase** ([Console](https://console.firebase.google.com)): Authentication + Firestore
- **Cloudinary** ([Dashboard](https://cloudinary.com)): 이미지 업로드 (무료)
- **Google Gemini** ([AI Studio](https://aistudio.google.com/apikey)): AI 추천 (무료)
- **OpenWeatherMap** ([API](https://openweathermap.org/api)): 날씨 정보 (무료)

<details>
<summary>상세 설정 가이드 보기</summary>

#### Firebase 설정

1. Firebase Console에서 프로젝트 생성
2. Authentication → 이메일/비밀번호, Google 로그인 활성화
3. Firestore Database 생성 (테스트 모드)
4. 프로젝트 설정 → SDK 구성 정보 → `.env`에 입력

#### Cloudinary 설정

1. 무료 계정 가입
2. Settings → Upload → Unsigned Preset 생성
3. Cloud Name 및 Preset 이름 → `.env`에 입력

</details>

---

## 프로젝트 구조

```
src/
├── config/          # Firebase, Cloudinary 설정
├── contexts/        # AuthContext (전역 인증 상태)
├── screens/         # 화면 컴포넌트
│   ├── auth/       # Landing, Login, Signup
│   └── ...         # Wardrobe, AIRecommend, Settings
├── services/        # API 서비스 레이어
│   ├── authService.ts
│   ├── wardrobeService.ts
│   ├── fashionAIService.ts
│   └── weatherService.ts
└── types/           # TypeScript 타입 정의
```

---

## 구현 완료 기능

### ✅ 핵심 기능 (Phase 1-2)

**인증 시스템**

- Firebase Authentication (이메일/비밀번호, Google 소셜 로그인)
- 사용자별 데이터 격리 (`users/{userId}/wardrobe`)
- 크로스 플랫폼 세션 관리

**옷장 관리**

- CRUD 기능 (추가/수정/삭제/조회)
- 카테고리, 계절, 브랜드별 검색/필터
- Cloudinary 기반 이미지 업로드 및 최적화

**AI 코디 추천**

- Google Gemini 2.0 Flash 모델 통합
- 실시간 위치 기반 날씨 API 연동
- 색상 조화, 스타일 일관성 분석
- 옷장 기반 신규 아이템 추천

**UI/UX**

- 랜딩 페이지 (애니메이션 블롭, 그라디언트 디자인)
- 네이티브 탭 네비게이션 UI
- 부드러운 화면 전환 애니메이션 (React Navigation Stack)

### 📝 향후 계획

- 코디 저장 및 즐겨찾기
- 커뮤니티 기능 (코디 공유, 좋아요/댓글)
- 캘린더 기능 (입은 옷 기록)
- 쇼핑 추천 (스타일 기반 상품 추천)
- 옷장 활용도 및 트렌드 분석

---

## 개발 과정에서 해결한 주요 과제

1. **네이티브 Google Sign-In 구현**

   - React Native Google Sign-In SDK 통합
   - Firebase Authentication과 연동하여 안전한 인증 플로우 구축
   - iOS/Android 플랫폼별 설정 최적화

2. **사용자별 데이터 격리**

   - Firestore 서브컬렉션 구조 설계 (`users/{userId}/wardrobe`)
   - 모든 서비스 함수에 userId 인자 추가로 보안 강화

3. **모바일 이미지 업로드 최적화**

   - Expo Image Picker와 Cloudinary 연동
   - FormData 기반 업로드로 네이티브 환경 최적화
   - CDN 활용으로 이미지 로딩 속도 개선

4. **AI 프롬프트 엔지니어링**
   - 날씨, 스타일, 색상을 고려한 복합 분석 프롬프트 설계
   - JSON 파싱 안정성 확보를 위한 응답 포맷 표준화

---

## 라이선스 & 문의

- **Contact**: [GitHub Issues](https://github.com/torigood/OutfitFlow/issues)

---

## 스크린샷

<!-- 방법 2: 테이블 레이아웃 -->
<table style="border-collapse:collapse; margin:0 auto;">
  <tr>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/d1d56589-9bfe-4413-9dce-45226f85f927" alt="Image1" width="250" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/7bb9dd8e-aa9e-402c-8c55-cea9793c1ab9" alt="Image2" width="250" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/38153bf3-84b4-4872-9eac-a5001c56b3fa" alt="Image3" width="250" style="display:block;" /></td>
  </tr>
  <tr>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/199ce328-9367-4a84-9c80-e2754529f3b3" alt="Image4" width="250" style="display:block;" /></td>
    <td style="padding:6px;"><img src="https://github.com/user-attachments/assets/1ab49642-b238-4ec4-8016-651a382f7487" alt="Image5" width="250" style="display:block;" /></td>
  </tr>
</table>


---

<div align="center">

**OutfitFlow** - AI가 추천하는 나만의 스타일 ✨

Made with using React Native & Google Gemini AI

[🇺🇸 English README](./README_EN.md)

</div>
