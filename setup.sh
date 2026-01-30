#!/bin/bash

# OutfitFlow 설치 스크립트
# 사용법: ./setup.sh 또는 bash setup.sh

set -e

echo "🚀 OutfitFlow 설치를 시작합니다..."
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Node.js 확인
echo "📦 Node.js 확인 중..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
    echo "https://nodejs.org 에서 설치해주세요."
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# 2. npm 의존성 설치
echo ""
echo "📦 npm 패키지 설치 중..."
npm install

# 2.1 Watchman 확인 (macOS만)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v watchman &> /dev/null; then
        echo ""
        echo -e "${YELLOW}⚠️  Watchman이 설치되어 있지 않습니다.${NC}"
        echo "   React Native 성능을 위해 설치를 권장합니다: brew install watchman"
        sleep 2
    fi
fi

# 3. .env 파일 확인 및 생성
echo ""
echo "🔐 환경 변수 파일 확인 중..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  .env 파일이 생성되었습니다. API 키를 설정해주세요!${NC}"
    else
        echo -e "${RED}❌ .env.example 파일이 없습니다.${NC}"
    fi
else
    echo -e "${GREEN}✅ .env 파일이 이미 존재합니다.${NC}"
fi

# 4. Vercel CLI 확인
echo ""
echo "🔧 Vercel CLI 확인 중..."
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI 설치 중..."
    set +e # 설치 실패 시 스크립트 중단 방지
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  권한 문제로 Vercel CLI 자동 설치에 실패했습니다.${NC}"
        echo "   수동으로 설치해주세요: sudo npm install -g vercel"
    fi
    set -e
fi
echo -e "${GREEN}✅ Vercel CLI 설치됨${NC}"

# 5. iOS 의존성 (macOS만)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "🍎 iOS 의존성 확인 중..."
    if [ -d "ios" ]; then
        cd ios
        if command -v pod &> /dev/null; then
            pod install
            echo -e "${GREEN}✅ CocoaPods 설치 완료${NC}"
        else
            echo -e "${YELLOW}⚠️  CocoaPods가 설치되어 있지 않습니다.${NC}"
            echo "   iOS 빌드를 위해 필요합니다: sudo gem install cocoapods"
        fi
        cd ..
    fi
fi

# 완료
echo ""
echo "=========================================="
echo -e "${GREEN}✅ 설치 완료!${NC}"
echo "=========================================="
echo ""
echo "📝 다음 단계:"
echo ""
echo "1. .env 파일에 API 키 설정"
echo "   - Firebase, Cloudinary, Gemini, OpenWeather, Naver"
echo ""
echo "2. Vercel에 API 서버 배포 (쇼핑 기능)"
echo "   vercel"
echo "   vercel env add NAVER_CLIENT_ID"
echo "   vercel env add NAVER_CLIENT_SECRET"
echo "   vercel --prod"
echo ""
echo "3. 앱 실행"
echo "   npx expo start"
echo ""
