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

## 프로젝트 개요
개인 옷장 관리 + AI 코디 추천 + 소셜 피드 + 멀티 쇼핑몰 통합 플랫폼

## 타겟 사용자
- 연령대: 10대 ~ 50-60대
- 옷 구매와 스타일링에 시간을 절약하고 싶은 사람
- 현재 가진 옷으로 다양한 조합을 찾고 싶은 사람

## 핵심 기능

### Phase 1 (필수 - 현재 개발 중)
- [ ] 옷장 등록 (사진 + 세부사항)
- [ ] 간단한 AI 코디 추천
- [ ] 코디 저장 기능

### Phase 2 (중요)
- [ ] 온도 기반 필터링
- [ ] 아웃핏 공유 피드
- [ ] 쇼핑 섹션

### Phase 3 (부가)
- [ ] 소셜 기능 (좋아요/댓글/팔로우)
- [ ] 고급 AI 기능
- [ ] 사이즈 맞춤 추천

## 기술 스택

### Frontend
- **React Native** (Expo): iOS/Android 크로스 플랫폼

### Backend
- **Firebase**: 인증, 실시간 데이터베이스
- **PostgreSQL**: 구조화된 데이터 저장
  - 사용자 정보
  - 옷 메타데이터
  - 아웃핏 게시물
  - 좋아요/댓글/팔로우 관계

### Storage
- **AWS S3 / Cloudflare R2**: 이미지 파일 저장
  - 옷 사진
  - 아웃핏 사진
  - 프로필 사진

### AI/ML
- **Google Vision API / Roboflow**: 이미지 인식 및 분석
- **Claude API**: 스타일 분석 및 추천


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

## 개발 시작하기

### 필수 도구
- Node.js (v22+)
- npm
- Git
- Expo Go 앱 (스마트폰)

### 앱 실행하기

```bash
cd mobile
npm start
```

그 다음:
- 스마트폰에 Expo Go 앱 설치
- QR 코드 스캔
- 또는 웹에서 테스트: `w` 키 입력

## 다음 단계
1. Firebase 프로젝트 설정
2. 기본 UI/UX 스크린 구성
3. 옷장 등록 기능 구현
4. AI API 연동

## 문서

## 개발 단계

현재: Phase 0 - 초기 세팅 완료
다음: 단계별로 기능 구현 예정
