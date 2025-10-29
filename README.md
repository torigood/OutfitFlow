# OutfitFlow

AI 기반 옷장 관리 및 코디 추천 앱

React Native(Expo) + Firebase + Cloudinary 기반의 크로스 플랫폼 옷장 관리 애플리케이션

---

## 📱 프로젝트 소개

OutfitFlow는 개인의 옷장을 디지털로 관리하고, AI를 활용해 스타일링 추천을 제공하는 모바일/웹 애플리케이션입니다.

### 주요 기능
- 🗂️ **옷장 관리**: 옷 사진 업로드, 카테고리/색상/브랜드/계절 정보 관리
- 🔍 **검색 및 필터**: 카테고리, 계절, 이름/브랜드로 옷 검색
- ✏️ **CRUD 기능**: 옷 추가, 수정, 삭제
- 📸 **이미지 최적화**: 자동 리사이징 및 압축 (Cloudinary)
- 🤖 **AI 코디 추천**: Google Gemini AI 기반 스마트 코디 추천, 날씨 연동
- 🌤️ **날씨 연동**: 실시간 날씨 기반 옷차림 추천
- 🌐 **크로스 플랫폼**: iOS, Android, Web 지원

---

## 🚀 시작하기

### 필수 요구사항
- **Node.js** v18 이상
- **npm** 또는 **yarn**
- **Expo CLI** (자동 설치됨)
- **Git**

### 설치

```bash
# 저장소 클론
git clone https://github.com/torigood/OutfitFlow.git
cd OutfitFlow

# 의존성 설치
npm install
```

### 환경 변수 설정

프로젝트를 실행하기 전에 환경 변수를 설정해야 합니다.

1. `.env.example` 파일을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. `.env` 파일을 열어 실제 값으로 수정:
   ```env
   # Firebase Config (Firebase Console에서 확인)
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Cloudinary Config (Cloudinary Dashboard에서 확인)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_UPLOAD_PRESET=your_upload_preset

   # Gemini AI Config (Google AI Studio에서 확인)
   GEMINI_API_KEY=your_gemini_api_key

   # OpenWeatherMap API Config (OpenWeatherMap에서 확인)
   OPENWEATHER_API_KEY=your_openweather_api_key
   ```

3. Firebase, Cloudinary, Gemini AI, OpenWeatherMap 설정은 아래 **환경 설정** 섹션 참조

⚠️ **중요**: `.env` 파일은 절대 GitHub에 커밋하지 마세요! (이미 `.gitignore`에 추가되어 있음)

### 실행

```bash
# 개발 서버 시작
npm start
# 또는
npx expo start
```

### 플랫폼별 실행

개발 서버가 시작되면 다음 키를 눌러 원하는 플랫폼에서 실행:

- **Android**: `a` - Android 에뮬레이터 또는 실제 기기
- **iOS**: `i` - iOS 시뮬레이터 (macOS만 가능)
- **Web**: `w` - 웹 브라우저
- **Expo Go**: QR 코드 스캔 (모바일)

---

## 🛠️ 기술 스택

### Frontend
- **React Native** 0.81.5
- **Expo** SDK 54
- **React** 19.1.0
- **TypeScript** 5.9.2
- **React Navigation** v7 (Stack, Tabs, Drawer)

### Backend & Services
- **Firebase**
  - Firestore (데이터베이스)
  - Firebase SDK 12.4.0
- **Cloudinary** (이미지 저장 및 최적화)
  - 자동 이미지 압축/리사이징
  - 25GB 무료 저장소
- **Google Gemini AI** (AI 패션 분석)
  - Gemini 2.5 Flash 모델
  - 이미지 기반 코디 분석
- **OpenWeatherMap** (날씨 정보)
  - 실시간 날씨 API
  - 온도 기반 계절 추천

### 주요 라이브러리
- `expo-image-picker` - 이미지 선택/촬영
- `expo-image-manipulator` - 이미지 압축/리사이징 (모바일)
- `@expo/vector-icons` - 아이콘

### 플랫폼별 최적화
- **모바일 (iOS/Android)**: 이미지 자동 압축 및 리사이징 (최대 1200px 너비)
- **웹**: Blob 기반 이미지 업로드, 브라우저 네이티브 파일 선택기

---

## 📁 프로젝트 구조

```
OutfitFlow/
├── .github/
│   └── workflows/
│       └── cleanup-cloudinary.yml    # GitHub Actions 자동화
├── scripts/
│   └── cleanup-orphaned-images.js    # 이미지 정리 스크립트
├── src/
│   ├── components/
│   │   └── Sidebar.tsx               # 웹 사이드바
│   ├── config/
│   │   ├── firebase.ts               # Firebase 초기화
│   │   └── cloudinary.ts             # Cloudinary 설정
│   ├── layouts/
│   │   └── WebLayout.tsx             # 웹 레이아웃
│   ├── navigation/
│   │   └── AppNavigator.tsx          # 네비게이션 설정
│   ├── screens/
│   │   ├── HomeScreen.tsx            # 홈 화면
│   │   ├── WardrobeScreen.tsx        # 옷장 관리 (메인)
│   │   ├── AIRecommendScreen.tsx     # AI 코디 추천
│   │   ├── FeedScreen.tsx            # 커뮤니티 피드 (예정)
│   │   ├── ShoppingScreen.tsx        # 쇼핑 추천 (예정)
│   │   └── SettingScreen.tsx         # 설정
│   ├── services/
│   │   ├── cloudinaryService.ts      # Cloudinary 업로드/삭제
│   │   ├── wardrobeService.ts        # Firestore CRUD
│   │   ├── geminiService.ts          # Gemini AI 이미지 분석
│   │   ├── fashionAIService.ts       # AI 코디 추천 로직
│   │   └── weatherService.ts         # OpenWeatherMap API
│   └── types/
│       ├── wardrobe.ts               # 옷장 타입 정의
│       └── ai.ts                     # AI 분석 타입 정의
├── index.ts                          # 앱 진입점
├── app.json                          # Expo 설정
├── firebase.json                     # Firebase 설정
├── package.json                      # 의존성 관리
├── tsconfig.json                     # TypeScript 설정
├── CLEANUP_SETUP.md                  # 이미지 정리 설정 가이드
└── README.md                         # 이 파일
```

---

## ⚙️ 환경 설정

### 1. Firebase 설정

#### Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: `OutfitFlow`)

#### Firestore 데이터베이스 생성
1. Firebase Console → Firestore Database
2. "데이터베이스 만들기" 클릭
3. **테스트 모드**로 시작
4. **리전**: `northamerica-northeast2` (토론토) 또는 가까운 리전

#### Firebase 설정 정보 가져오기
1. Firebase Console → 프로젝트 설정 (톱니바퀴)
2. "내 앱"에서 웹 앱 추가 (`</>` 아이콘)
3. Firebase SDK 설정 정보 복사
4. `.env` 파일에 값 입력:

```env
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**참고**: 설정 정보는 `.env` 파일에서 관리되며, `src/config/firebase.ts`에서 자동으로 불러옵니다.

---

### 2. Cloudinary 설정

#### Cloudinary 계정 생성
1. [Cloudinary](https://cloudinary.com) 접속
2. "Sign Up For Free" 클릭
3. 계정 생성 (무료)

#### Upload Preset 생성
1. Dashboard → Settings → Upload
2. "Add upload preset" 클릭
3. 설정:
   - **Preset name**: `outfitflow_unsigned`
   - **Signing Mode**: **Unsigned** 선택 ⚠️
   - **Folder**: `wardrobe`
   - **Public ID**: Auto-generate
   - **Prepend path**: `wardrobe/`
4. "Save" 클릭

#### Cloudinary 설정 정보
1. Dashboard 상단에서 확인:
   - **Cloud Name**: 예) `dyf22p7zb`
   - **Upload Preset**: 위에서 생성한 preset 이름
2. `.env` 파일에 값 입력:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**참고**: 설정 정보는 `.env` 파일에서 관리되며, `src/config/cloudinary.ts`에서 자동으로 불러옵니다.

---

### 3. Google Gemini AI 설정

#### Gemini API Key 생성
1. [Google AI Studio](https://aistudio.google.com/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사
4. `.env` 파일에 값 입력:

```env
GEMINI_API_KEY=your_gemini_api_key
```

**참고**: Gemini 2.5 Flash 모델을 사용하며, 무료 티어로 이용 가능합니다.

---

### 4. OpenWeatherMap API 설정

#### OpenWeather API Key 생성
1. [OpenWeatherMap](https://openweathermap.org/api) 접속
2. "Sign Up" 후 로그인
3. API Keys 탭으로 이동
4. API 키 복사 (또는 새로 생성)
5. `.env` 파일에 값 입력:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
```

**참고**: 무료 티어로 분당 60회 호출 가능하며, 현재 날씨 정보를 AI 코디 추천에 활용합니다.

---

### 5. GitHub Secrets 설정 (자동 정리 기능용)

이미지 자동 정리 기능을 사용하려면 GitHub Secrets 설정이 필요합니다.

상세 가이드: [CLEANUP_SETUP.md](./CLEANUP_SETUP.md)

---

## 🎯 주요 기능

### 옷장 관리 (Wardrobe)

**✅ 구현 완료:**
- 옷 추가 (이미지 + 정보)
  - 갤러리에서 선택 또는 카메라 촬영 (모바일)
  - 파일 선택기 (웹)
  - 이름, 카테고리, 색상, 브랜드, 계절 입력
  - 자동 이미지 압축 및 Cloudinary 업로드
  - 플랫폼별 최적화된 이미지 처리
- 옷 목록 조회
  - Firestore 실시간 동기화
  - 그리드 레이아웃
  - **Pull-to-Refresh**: 화면을 아래로 당겨서 새로고침
- 옷 수정
  - 모든 정보 수정 가능
  - 이미지 재업로드
- 옷 삭제
  - 확인 후 삭제
  - Firestore 데이터 삭제
  - Cloudinary public_id 추적
- 검색 및 필터
  - 카테고리 필터 (전체, 상의, 하의, 아우터, 신발, 악세사리)
  - 계절 필터 (전체, 봄, 여름, 가을, 겨울)
  - 이름/브랜드 검색
- 반응형 디자인
  - iOS, Android, Web 완전 지원
  - 플랫폼별 최적화된 UI 및 이미지 처리

**🔄 자동 이미지 정리:**
- GitHub Actions로 매주 일요일 자동 실행
- Cloudinary의 고아 이미지 자동 삭제
- 30일 안전 기간

---

### AI 코디 추천

**✅ 구현 완료:**
- 스마트 코디 추천 시스템
  - 유저가 0개 이상의 아이템 선택 가능
  - 선택한 아이템을 무조건 포함한 코디 추천
  - AI가 부족한 카테고리를 자동으로 채워서 완성
- 날씨 기반 추천
  - OpenWeatherMap API 연동
  - 실시간 온도, 습도, 날씨 상태 반영
  - 계절별 자동 필터링 (온도에 따라 봄/여름/가을/겨울 아이템 선택)
- Google Gemini AI 분석
  - 이미지 기반 스타일 분석
  - 색상 조화 점수 및 보색 추천
  - 스타일 일관성 평가
  - 코디 개선 제안
- 스타일 선택
  - 캐주얼, 미니멀, 스트릿, 포멀, 스포티 등
- 추가 아이템 추천
  - 옷장에 없는 새로운 아이템 구매 추천
  - 기존 옷장과 중복되지 않는 아이템만 추천
  - 현재 온도를 고려한 시즌별 추천

---

### 커뮤니티 (개발 예정)

**📋 계획:**
- 코디 공유
- 좋아요/댓글
- 팔로우 기능

---

## 📊 데이터 구조

### Firestore 컬렉션

```
wardrobe/ (collection)
  └── {itemId} (auto-generated document ID)
      ├── id: string
      ├── name: string
      ├── category: string (상의, 하의, 아우터, 신발, 악세사리)
      ├── color: string
      ├── brand: string
      ├── seasons: string (쉼표로 구분, 예: "봄, 여름")
      ├── imageUrl: string (Cloudinary URL)
      ├── cloudinaryPublicId: string (정리용)
      ├── createdAt: Timestamp
      └── updatedAt: Timestamp
```

### Cloudinary 저장 구조

```
wardrobe/
  ├── abc123xyz.jpg
  ├── def456uvw.jpg
  └── ...
```

---

## 🧪 테스트

### TypeScript 타입 체크
```bash
npx tsc --noEmit
```

### 이미지 정리 스크립트 테스트
```bash
# 환경 변수 설정 후
npm run cleanup
```

---

## 🔧 문제 해결

### 웹에서 수정/삭제 버튼이 작동하지 않는 경우

**증상**: 웹 브라우저에서 삭제 버튼 클릭 시 반응 없음

**원인**: React Native의 `Alert.alert`는 웹에서 지원되지 않음

**해결 완료**: ✅
- 웹 플랫폼용 `showAlert()` 및 `showConfirm()` 래퍼 함수 구현
- 웹: 브라우저 네이티브 `window.alert()` 및 `window.confirm()` 사용
- 모바일: React Native `Alert.alert()` 사용
- 모든 플랫폼에서 삭제, 수정, 추가 정상 작동

### 웹에서 이미지 업로드가 안 되는 경우

**증상**: 웹 브라우저에서 옷 추가/수정 시 이미지 업로드 실패

**해결 완료**: ✅
- 웹: Blob 기반 이미지 업로드
- 모바일: FormData with URI 기반 업로드
- 플랫폼별 최적화된 이미지 처리

**추가 확인 사항**:
1. 브라우저 콘솔(F12)에서 오류 확인
2. Cloudinary 설정 확인:
   - [src/config/cloudinary.ts](src/config/cloudinary.ts)에서 `CLOUD_NAME`과 `uploadPreset` 확인
   - Upload Preset이 **Unsigned**로 설정되어 있는지 확인
3. 파일 크기 확인: 10MB 이하 권장
4. 지원되는 이미지 형식: JPEG, PNG, WebP

### Firestore 연결 오류

**증상**: "Permission denied" 또는 연결 실패

**해결 방법**:
1. Firebase Console → Firestore Database → Rules 확인
2. 테스트 모드 규칙:
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
3. [src/config/firebase.ts](src/config/firebase.ts)의 설정 정보 확인

### 모바일에서 이미지 권한 오류

**증상**: "권한 필요" 알림

**해결 방법**:
- **iOS**: 설정 → 앱 → 권한에서 사진 및 카메라 권한 허용
- **Android**: 설정 → 앱 → 권한에서 저장소 및 카메라 권한 허용

---

## 📈 향후 계획

### Phase 1 (현재)
- ✅ Firebase + Cloudinary 연동 완료
- ✅ 옷장 CRUD 기능 완료
- ✅ 검색/필터 기능 완료
- ✅ 이미지 자동 정리 시스템 완료
- ✅ 크로스 플랫폼 지원 완료 (iOS, Android, Web)

### Phase 2 (다음)
- [ ] AI 코디 추천 기능
  - OpenAI GPT-4 Vision 연동
  - 날씨 API 연동
  - 추천 알고리즘 구현
- [ ] 코디 저장 및 관리
- [ ] 캘린더 기능 (입은 옷 기록)

### Phase 3 (미래)
- [ ] 사용자 인증 (Firebase Auth)
  - 이메일/비밀번호
  - 소셜 로그인 (Google, Kakao, Apple)
- [ ] 커뮤니티 기능
  - 코디 공유
  - 좋아요/댓글
  - 팔로우 시스템
- [ ] 쇼핑 추천
  - 부족한 아이템 추천
  - 외부 쇼핑몰 연동

---

## 🤝 기여

이 프로젝트는 개인 학습 프로젝트입니다.

---

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

## 📞 문의

프로젝트 관련 문의: [GitHub Issues](https://github.com/torigood/OutfitFlow/issues)

---

## 🙏 감사

- **Expo** - React Native 개발 플랫폼
- **Firebase** - 백엔드 서비스
- **Cloudinary** - 이미지 관리 서비스
- **React Navigation** - 네비게이션 라이브러리

---

**OutfitFlow** - 당신의 옷장을 스마트하게 ✨
