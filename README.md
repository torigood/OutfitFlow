# OutfitFlow

AI 기반 옷장 관리 및 코디 추천 앱

---

## 소개

OutfitFlow는 개인 옷장을 디지털로 관리하고, Google Gemini AI를 활용해 날씨 기반 스타일링 추천을 제공하는 크로스 플랫폼(iOS, Android, Web) 애플리케이션입니다.

---

## 주요 기능

- **옷장 관리**: 옷 추가/수정/삭제, 카테고리·색상·브랜드·계절 정보 관리
- **검색 및 필터**: 카테고리, 계절, 이름/브랜드로 검색
- **이미지 최적화**: 자동 리사이징 및 압축 (Cloudinary)
- **AI 코디 추천**: Google Gemini AI 기반 스마트 코디 분석 및 추천
- **현재 위치 기반 날씨**: GPS 위치로 실시간 날씨 정보 자동 수집 (OpenWeatherMap API)
- **크로스 플랫폼**: iOS, Android, Web 완전 지원

---

## 기술 스택

### Frontend

- React Native 0.81.5
- Expo SDK 54
- TypeScript 5.9.2
- React Navigation v7

### Backend & APIs

- **Firebase Firestore**: 데이터베이스
- **Cloudinary**: 이미지 저장 및 최적화
- **Google Gemini AI**: AI 패션 분석 (Gemini 2.5 Flash)
- **OpenWeatherMap**: 실시간 날씨 정보

---

## 필수 설치 항목

- **Node.js** v18 이상
- **npm** 또는 **yarn**
- **Git**
- **Expo CLI** (자동 설치)

---

## 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone https://github.com/torigood/OutfitFlow.git
cd OutfitFlow
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성 후 API 키 입력:

```bash
cp .env.example .env
```

`.env` 파일 예시:

```env
# Firebase Config
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Gemini AI Config
GEMINI_API_KEY=your_gemini_api_key

# OpenWeatherMap Config
OPENWEATHER_API_KEY=your_openweather_api_key
```

⚠️ **중요**: `.env` 파일은 절대 GitHub에 커밋하지 마세요!

### 3. 앱 실행

```bash
npm start
# 또는
npx expo start
```

실행 후:

- **Android**: `a` 키 입력
- **iOS**: `i` 키 입력 (macOS만 가능)
- **Web**: `w` 키 입력
- **모바일**: QR 코드 스캔 (Expo Go 앱)

---

## API 설정 가이드

각 API 서비스별 설정 방법:

### 1. Firebase

- [Firebase Console](https://console.firebase.google.com) 접속
- "프로젝트 추가" → Firestore 데이터베이스 생성 (테스트 모드)
- 프로젝트 설정에서 웹 앱 추가 → SDK 설정 정보 복사 → `.env` 입력

### 2. Cloudinary

- [Cloudinary](https://cloudinary.com) 가입 (무료)
- Dashboard → Settings → Upload → "Add upload preset" 클릭
- **Preset name**: `outfitflow_unsigned`, **Signing Mode**: **Unsigned** 선택
- Cloud Name과 Upload Preset 이름을 `.env`에 입력

### 3. Google Gemini AI

- [Google AI Studio](https://aistudio.google.com/apikey) 접속
- "Create API Key" 클릭 → API 키 복사 → `.env` 입력

### 4. OpenWeatherMap

- [OpenWeatherMap](https://openweathermap.org/api) 가입
- API Keys 탭에서 API 키 복사 → `.env` 입력

---

## 파일 구조

```
OutfitFlow/
├── src/
│   ├── components/        # 재사용 컴포넌트
│   ├── config/            # Firebase, Cloudinary 설정
│   ├── navigation/        # 네비게이션 설정
│   ├── screens/           # 화면 컴포넌트
│   │   ├── WardrobeScreen.tsx      # 옷장 관리
│   │   ├── AIRecommendScreen.tsx   # AI 코디 추천
│   │   └── ...
│   ├── services/          # API 서비스 로직
│   │   ├── wardrobeService.ts      # Firestore CRUD
│   │   ├── cloudinaryService.ts    # 이미지 업로드/삭제
│   │   ├── geminiService.ts        # Gemini AI 분석
│   │   ├── fashionAIService.ts     # AI 코디 로직
│   │   └── weatherService.ts       # 날씨 API
│   └── types/             # TypeScript 타입 정의
├── .env                   # 환경 변수 (비공개)
├── app.json               # Expo 설정
└── package.json           # 의존성 관리
```

---

## 오류 해결

### 웹에서 수정/삭제 버튼이 작동하지 않는 경우

✅ **해결 완료**: 웹 플랫폼용 `showConfirm()` 함수 구현됨 (브라우저 네이티브 confirm 사용)

### 웹에서 이미지 업로드 실패

✅ **해결 완료**: 웹은 Blob 기반, 모바일은 FormData 기반으로 플랫폼별 최적화 완료

**추가 확인 사항**:

1. 브라우저 콘솔(F12)에서 오류 확인
2. Cloudinary Upload Preset이 **Unsigned**로 설정되었는지 확인
3. 파일 크기 10MB 이하 권장

### Firestore 연결 오류 (Permission denied)

- Firebase Console → Firestore → Rules에서 테스트 모드 규칙 확인:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 모바일에서 이미지 권한 오류

- **iOS/Android**: 설정 → 앱 → 권한에서 사진 및 카메라 권한 허용

### AI 추천 오류

- Gemini API 키 확인
- 모델명이 최신인지 확인 (현재: `gemini-2.0-flash-exp`)
- 네트워크 연결 확인

---

## 개발 진행도

### Phase 1 (완료)

- ✅ Firebase + Cloudinary 연동
- ✅ 옷장 CRUD 기능
- ✅ 검색/필터 기능
- ✅ AI 코디 추천 (Gemini AI)
- ✅ 현재 위치 기반 날씨: GPS 윛로 실시간 날씨 정보 자동 수집
- ✅ 크로스 플랫폼 지원 (iOS, Android, Web)
- ✅ 이미지 자동 정리 시스템

### Phase 2 (현재)

- ✅ AI 코디 추천 시스템 고도화
  - ✅ 날씨 기반 자동 계절 필터링
  - ✅색상 조화 분석 및 보색 추천
  - ✅ 스타일 일관성 평가
- [ ] 웹 최적화 (이미지 갤러리, 반응형 디자인)
- [ ] 코디 저장 및 관리
- [ ] 캘린더 기능 (입은 옷 기록)
- [ ] 옷 선택 창 업데이트

### Phase 3 (계획)

- [ ] 사용자 인증 (Firebase Auth)
  - [ ] 이메일/비밀번호
  - [ ] 소셜 로그인 (Google, Apple)
- [ ] 커뮤니티 기능
  - [ ] 코디 공유
  - [ ] 좋아요/댓글/팔로우
- [ ] 쇼핑 추천
  - [ ] 부족한 아이템 추천
  - [ ] 쇼핑몰 링크 연동
- [ ] 검색 알고리즘 보강

---

## 문의

프로젝트 관련 문의 및 버그 리포트: [GitHub Issues](https://github.com/torigood/OutfitFlow/issues)

---

**OutfitFlow** - 당신의 옷장을 스마트하게 ✨
