# Cloudinary 자동 정리 설정 가이드

OutfitFlow는 Firestore에서 삭제된 옷의 이미지가 Cloudinary에 남아있는 "삭제된 이미지"를 자동으로 정리합니다.

## 🎯 개요

- **자동 실행**: 매주 일요일 오전 3시 (UTC)
- **안전 기간**: 30일 이상 된 삭제된 이미지만 삭제
- **자동화**: GitHub Actions
- **비용**: 완전 무료

## ⚙️ GitHub Secrets 설정

GitHub Actions가 Cloudinary와 Firebase에 접근하려면 다음 Secrets을 설정해야 합니다.

### 1. GitHub 저장소 Settings로 이동

```
GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret
```

### 2. 다음 4개의 Secrets 추가

#### `CLOUDINARY_CLOUD_NAME`

- **값**: `dyf22p7zb`
- **설명**: Cloudinary Cloud Name

#### `CLOUDINARY_API_KEY`

- **값**: Cloudinary Dashboard 상단에서 복사
- **위치**: https://cloudinary.com/console → Account Details → API Key
- **예시**: `123456789012345`

#### `CLOUDINARY_API_SECRET`

- **값**: Cloudinary Dashboard 상단에서 복사 (Show 버튼 클릭)
- **위치**: https://cloudinary.com/console → Account Details → API Secret
- **예시**: `abcd_efgh_ijklmnop`
- ⚠️ **중요**: 절대 코드에 포함하지 마세요!

#### `FIREBASE_SERVICE_ACCOUNT`

- **값**: Firebase Service Account JSON 파일 전체 내용
- **생성 방법**:
  1. Firebase Console → 프로젝트 설정 (톱니바퀴) → 서비스 계정
  2. "새 비공개 키 생성" 버튼 클릭
  3. 다운로드된 JSON 파일 열기
  4. **전체 내용**을 복사해서 Secret 값에 붙여넣기

**예시 형식**:

```json
{
  "type": "service_account",
  "project_id": "outfitflow-xxxxx",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@outfitflow-xxxxx.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 3. Secrets 확인

모든 Secrets이 추가되면 다음과 같이 표시됩니다:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FIREBASE_SERVICE_ACCOUNT`

---

## 🚀 사용 방법

### 자동 실행 (기본)

매주 일요일 오전 3시(UTC)에 자동으로 실행됩니다. 아무것도 할 필요 없습니다!

### 수동 실행 (GitHub Actions)

1. GitHub 저장소 → **Actions** 탭
2. 왼쪽에서 **"Cleanup Cloudinary Orphaned Images"** 선택
3. **"Run workflow"** 버튼 클릭
4. **Dry run mode** 선택:
   - `false`: 실제 삭제 (기본값)
   - `true`: 테스트 모드 (삭제 안 함, 로그만)
5. **"Run workflow"** 버튼 클릭

### 로컬에서 수동 실행

개발 중 테스트하려면 로컬에서 실행할 수 있습니다:

```bash
# 환경 변수 설정 (PowerShell)
$env:CLOUDINARY_CLOUD_NAME="dyf22p7zb"
$env:CLOUDINARY_API_KEY="[여기에 입력]"
$env:CLOUDINARY_API_SECRET="[여기에 입력]"
$env:FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", ...}'
$env:DRY_RUN="true"  # 테스트 모드

# 실행
npm run cleanup
```

---

## 📊 동작 방식

```
1. Firestore 연결
   ↓
2. wardrobe 컬렉션의 모든 cloudinaryPublicId 수집
   ↓
3. Cloudinary API 호출
   - wardrobe/ 폴더의 모든 이미지 가져오기
   ↓
4. 각 이미지 분석:
   - 생성일이 30일 이상?
   - Firestore에 없음?
   → 삭제된 이미지로 분류
   ↓
5. 삭제된 이미지 배치 삭제
   ↓
6. 로그 출력 및 완료
```

### 안전 장치

1. **30일 안전 기간**: 최근 30일 이내 생성된 이미지는 절대 삭제하지 않습니다
2. **Dry run 모드**: 테스트 실행으로 삭제 전 확인 가능
3. **로그 기록**: 어떤 이미지가 삭제될지 미리 확인
4. **배치 삭제**: Cloudinary API 한 번 호출로 효율적으로 삭제

---

## 📈 예상 결과

### 첫 실행 시

```
🧹 Cloudinary 삭제된 이미지 정리 시작...
📅 안전 기간: 30일
🔧 모드: 실제 삭제

📂 Firestore에서 데이터 가져오는 중...
✅ Firestore에서 10개의 이미지 참조 발견

☁️  Cloudinary에서 이미지 목록 가져오는 중...
✅ Cloudinary에서 15개의 이미지 발견

🔍 삭제된 이미지 분석 중...
  🗑️  wardrobe/old123.jpg (45일 전 생성)
  🗑️  wardrobe/old456.jpg (60일 전 생성)
  ⏳ wardrobe/recent789.jpg (10일 전 생성, 너무 최근이라 보호)

📊 분석 결과:
  - Firestore 이미지: 10개
  - Cloudinary 이미지: 15개
  - 삭제된 이미지 (30일 이상): 2개

🗑️  삭제된 이미지 삭제 중...
✅ 삭제 완료!
  - 성공: 2개
    ✓ wardrobe/old123.jpg
    ✓ wardrobe/old456.jpg

🎉 정리 작업 완료!
```

### 정상 운영 중

```
✨ 삭제할 삭제된 이미지가 없습니다. 모든 이미지가 정상적으로 사용 중입니다!
```

---

## 🔧 문제 해결

### "Permission denied" 오류

**원인**: Firebase Service Account 권한 문제

**해결**:

1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. 새 비공개 키 생성
3. 다운로드한 JSON 파일 **전체 내용**을 `FIREBASE_SERVICE_ACCOUNT` Secret에 복사

### "Invalid signature" 오류

**원인**: Cloudinary API Secret이 잘못됨

**해결**:

1. Cloudinary Dashboard → Account Details
2. API Secret "Show" 버튼 클릭
3. 정확한 값을 `CLOUDINARY_API_SECRET` Secret에 복사

### 아무것도 삭제 안 됨

**원인**: 30일 안전 기간

**설명**: 최근 30일 이내 생성된 이미지는 고의로 삭제하지 않습니다. 이는 정상 동작입니다.

**확인**: Dry run 모드로 실행해서 로그 확인:

```bash
$env:DRY_RUN="true"
npm run cleanup
```

### "Max results exceeded" 오류

**원인**: Cloudinary에 이미지가 500개 초과

**해결**: `scripts/cleanup-orphaned-images.js` 파일에서 `max_results` 값 증가:

```javascript
max_results: 1000, // 500에서 1000으로 증가
```

### GitHub Actions 실행 안 됨

**확인사항**:

1. GitHub Secrets이 모두 설정되었는지 확인
2. Actions 탭에서 워크플로우가 활성화되었는지 확인
3. 저장소가 Public인지 Private인지 확인 (Private는 Actions 제한 있음)

---

## 💰 비용

### GitHub Actions

- **Public 저장소**: 완전 무료
- **Private 저장소**: 2000분/월 무료
- **사용량**: 약 3-5분/주 = 12-20분/월

### Cloudinary API

- **무료 티어**: 25,000 호출/월
- **사용량**: 약 500 호출/주 = 2,000 호출/월

### Firebase Firestore

- **무료 티어**: 50,000 읽기/일
- **사용량**: 약 100 읽기/주

**결론**: 모두 무료 범위 내에서 사용 가능합니다! 💚

---

## 📝 추가 정보

### 로그 확인

GitHub Actions 실행 로그를 보려면:

1. GitHub 저장소 → Actions 탭
2. 최근 워크플로우 실행 클릭
3. "Run cleanup script" 단계 확인

### 일정 변경

매주 일요일이 아닌 다른 시간에 실행하려면 `.github/workflows/cleanup-cloudinary.yml` 파일 수정:

```yaml
schedule:
  - cron: "0 3 * * 0" # 매주 일요일 오전 3시 (UTC)
  # 변경 예시:
  # - cron: '0 3 * * 1'  # 매주 월요일
  # - cron: '0 3 1 * *'  # 매달 1일
```

Cron 표현식 도구: https://crontab.guru/

### 안전 기간 변경

30일이 아닌 다른 기간으로 변경하려면 `scripts/cleanup-orphaned-images.js` 수정:

```javascript
const SAFETY_PERIOD_DAYS = 30; // 원하는 일수로 변경
```

---

## 🆘 도움이 필요하신가요?

문제가 발생하면:

1. GitHub Actions 로그 확인
2. 로컬에서 Dry run 모드로 실행해서 디버깅
3. GitHub Issues에 질문 올리기

---

## ✅ 설정 체크리스트

- [ ] GitHub Secrets 4개 모두 추가
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `FIREBASE_SERVICE_ACCOUNT`
- [ ] 로컬에서 Dry run 테스트 (`npm run cleanup`)
- [ ] GitHub Actions에서 수동 실행 테스트
- [ ] 다음 일요일 자동 실행 대기

설정 완료! 🎉
