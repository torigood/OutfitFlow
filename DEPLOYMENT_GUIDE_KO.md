# OutfitFlow 배포 가이드

## 📋 배포 순서

### Phase 1: 로컬 테스트 (지금 바로)
```bash
# 로컬 IP 확인
ifconfig | grep "inet " | grep -v 127.0.0.1

# 터미널 1: 백엔드 실행
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 터미널 2: 프론트엔드 실행 (앱 코드에서 localhost를 로컬 IP로 변경)
npm start
```

### Phase 2: Railway 백엔드 배포 (1-2시간)

#### ① Railway 프로젝트 생성
1. [Railway.app](https://railway.app) 접속
2. GitHub 계정으로 로그인
3. "New Project" → "Deploy from GitHub"
4. OutfitFlow 저장소 선택
5. "Backend Repo" 또는 폴더 선택

#### ② 환경 변수 설정
Railway 프로젝트 대시보드에서:
```
CLOUDINARY_CLOUD_NAME=dyf22p7zb
CLOUDINARY_UPLOAD_PRESET=outfitflow_unsigned
OPENROUTER_API_KEY=sk-or-v1-e365e93b6e4f537a7...
OPENROUTER_MODEL=llama-2-vision
OPENWEATHER_API_KEY=424deb75b31a4479bb9ebbd...
```

#### ③ 배포 대기
- Build logs 확인 (3-5분)
- Public URL 생성됨: `https://outfitflow-api-production.railway.app`

#### ④ 프론트엔드 설정 업데이트
`.env` 파일에서:
```
RAILWAY_BACKEND_URL=https://outfitflow-api-production.railway.app
```

### Phase 3: 베타 테스트 (하루)

#### EAS Build로 iOS/Android 빌드:
```bash
# 1. eas.json 설정 (이미 존재하면 건너뛰기)
eas build:configure

# 2. 빌드 실행
eas build --platform all

# 3. TestFlight 또는 Google Play 내부 테스트에 업로드
```

### Phase 4: 정식 출시 (1주일)

#### App Store 제출:
```bash
eas submit -p ios --latest
```

#### Google Play 제출:
```bash
eas submit -p android --latest
```

---

## 🔧 현재 설정 상태

- ✅ `Procfile` 생성됨
- ✅ `runtime.txt` 생성됨 (Python 3.11.9)
- ✅ `RAILWAY_BACKEND_URL` 환경 변수 추가됨
- ✅ `env.d.ts` 업데이트됨

---

## 📝 체크리스트

- [ ] 로컬 테스트 완료
- [ ] Railway 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 백엔드 배포 확인 (`/health` 엔드포인트)
- [ ] 프론트엔드 Railway URL로 업데이트
- [ ] iOS 빌드 및 TestFlight 배포
- [ ] Android 빌드 및 Google Play 내부 테스트
- [ ] App Store 제출
- [ ] Google Play 제출

---

## 🚀 빠른 시작 (로컬 테스트)

```bash
# 로컬 IP를 얻고 .env에 입력
export LOCAL_IP=$(ipconfig getifaddr en0)
echo "Local IP: $LOCAL_IP"

# .env에 업데이트
RAILWAY_BACKEND_URL=http://$LOCAL_IP:8000
```

---

## ❓ 문제 해결

### 백엔드 연결 실패
```
Error: Network request failed
```
**해결:**
1. 입력한 URL이 정확한지 확인
2. 로컬 IP가 맞는지 확인 (`ifconfig | grep inet`)
3. 같은 WiFi에 연결되어 있는지 확인
4. 방화벽 설정 확인

### Cloudinary 이미지 업로드 실패
**해결:**
1. `CLOUDINARY_CLOUD_NAME` 정확한지 확인
2. `CLOUDINARY_UPLOAD_PRESET` 이름이 맞는지 확인
3. Cloudinary 대시보드에서 preset 생성 확인

### CORS 오류
**해결:** backend/main.py에서 CORS 설정 확인
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시 앱 도메인으로 제한
    allow_methods=["*"],
    allow_headers=["*"],
)
```
