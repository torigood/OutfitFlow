# OutfitFlow

AI 기반 옷장 관리 및 코디 추천 앱

## 시작하기

### 설치

```bash
npm install
```

### 실행

```bash
npx expo start
```

또는

```bash
npm start
```

### 개발 모드에서 앱 열기

- **Android**: `a` 키를 누르거나 Android 에뮬레이터 실행
- **iOS**: `i` 키를 누르거나 iOS 시뮬레이터 실행 (macOS 필요)
- **Web**: `w` 키를 눌러 웹 브라우저에서 실행
- **Expo Go**: QR 코드를 스캔하여 모바일에서 실행

## 프로젝트 구조

```
OutfitFlow/
├── src/
│   ├── components/    # 재사용 가능한 컴포넌트
│   ├── screens/       # 화면 컴포넌트
│   ├── navigation/    # 네비게이션 설정
│   ├── services/      # API, Firebase 등 서비스
│   ├── utils/         # 유틸리티 함수
│   └── types/         # TypeScript 타입 정의
├── assets/            # 이미지, 폰트 등 리소스
├── App.tsx           # 앱 진입점
└── app.json          # Expo 설정

```

## 기술 스택

- **React Native** with Expo
- **TypeScript**
- **React Navigation** - 화면 네비게이션
- PostgreSQL (계획)
- AWS S3 / Cloudflare R2 (이미지 저장)
- AI APIs (Google Vision / Roboflow, Claude)

## 개발 단계

현재: Phase 0 - 초기 세팅 완료
다음: 단계별로 기능 구현 예정
