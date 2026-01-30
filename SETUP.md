# OutfitFlow 설치 가이드

## 1. 기본 의존성 설치

### 사전 요구사항 (macOS)
- Node.js (LTS 버전 권장)
- Watchman (`brew install watchman`)
- Xcode (iOS 시뮬레이터용)

```bash
# 스크립트 실행 권한 부여
chmod +x setup.sh

# 자동 설치 스크립트 실행
./setup.sh
```

## 2. 환경 변수 설정

```bash
cp .env.example .env
```

### 필수 API 키 발급처

| 서비스 | 발급처 | 용도 |
|--------|--------|------|
| Firebase | [Firebase Console](https://console.firebase.google.com) | 인증, DB, Storage |
| Cloudinary | [Cloudinary Dashboard](https://cloudinary.com/console) | 이미지 업로드 |
| Gemini AI | [Google AI Studio](https://aistudio.google.com/apikey) | AI 코디 추천 |
| OpenWeather | [OpenWeatherMap](https://openweathermap.org/api) | 날씨 정보 |
| Naver Shopping | [Naver Developers](https://developers.naver.com/apps/#/register) | 쇼핑 검색 |

## 3. Vercel 배포 (쇼핑 API 서버)

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 환경 변수 설정 (Vercel 대시보드에서도 가능)
vercel env add NAVER_CLIENT_ID
vercel env add NAVER_CLIENT_SECRET

# 프로덕션 배포
vercel --prod
```

배포 후 URL을 `.env`에 추가:
```env
VERCEL_API_URL=https://your-app.vercel.app
```

## 4. 앱 실행

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# 개발 서버
npx expo start
```

## 5. 문제 해결

### 네이버 쇼핑 API
- 애플리케이션 등록 시 "검색 > 쇼핑" API 선택 필수
- 401 에러: Vercel 환경 변수 확인

### Expo 관련
- `npx expo prebuild` 실행 후 네이티브 빌드 필요
