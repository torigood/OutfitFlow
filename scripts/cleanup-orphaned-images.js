/**
 * Cloudinary 고아 이미지 정리 스크립트
 *
 * Firestore에 없지만 Cloudinary에만 남아있는 이미지를 자동으로 삭제합니다.
 * - 30일 이상 된 이미지만 삭제 (안전 기간)
 * - GitHub Actions에서 매주 일요일 자동 실행
 * - 수동 실행: npm run cleanup
 */

const admin = require('firebase-admin');
const cloudinary = require('cloudinary').v2;

// 환경 변수 확인
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'FIREBASE_SERVICE_ACCOUNT'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 환경 변수 ${envVar}가 설정되지 않았습니다.`);
    process.exit(1);
  }
}

// Firebase Admin 초기화
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin 초기화 완료');
} catch (error) {
  console.error('❌ Firebase Admin 초기화 실패:', error.message);
  process.exit(1);
}

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Cloudinary 설정 완료');

// 안전 기간 (밀리초)
const SAFETY_PERIOD_DAYS = 30;
const SAFETY_PERIOD_MS = SAFETY_PERIOD_DAYS * 24 * 60 * 60 * 1000;

// Dry run 모드 (환경 변수로 설정)
const DRY_RUN = process.env.DRY_RUN === 'true';

/**
 * 메인 정리 함수
 */
async function cleanupOrphanedImages() {
  console.log('\n🧹 Cloudinary 고아 이미지 정리 시작...');
  console.log(`📅 안전 기간: ${SAFETY_PERIOD_DAYS}일`);
  console.log(`🔧 모드: ${DRY_RUN ? 'DRY RUN (테스트)' : '실제 삭제'}\n`);

  try {
    // 1. Firestore에서 모든 옷의 cloudinaryPublicId 가져오기
    console.log('📂 Firestore에서 데이터 가져오는 중...');
    const db = admin.firestore();
    const wardrobeSnapshot = await db.collection('wardrobe').get();

    const firestorePublicIds = new Set();
    const firestoreUrls = new Set();

    wardrobeSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.cloudinaryPublicId) {
        firestorePublicIds.add(data.cloudinaryPublicId);
      }
      if (data.imageUrl) {
        firestoreUrls.add(data.imageUrl);
      }
    });

    console.log(`✅ Firestore에서 ${firestorePublicIds.size}개의 이미지 참조 발견\n`);

    // 2. Cloudinary에서 wardrobe 폴더의 모든 이미지 가져오기
    console.log('☁️  Cloudinary에서 이미지 목록 가져오는 중...');
    const cloudinaryImages = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'wardrobe/',
      max_results: 500, // 최대 500개
    });

    console.log(`✅ Cloudinary에서 ${cloudinaryImages.resources.length}개의 이미지 발견\n`);

    // 3. 고아 이미지 찾기 (Cloudinary에만 있고 Firestore에 없는 것)
    console.log('🔍 고아 이미지 분석 중...');
    const orphanedImages = [];
    const now = Date.now();

    for (const resource of cloudinaryImages.resources) {
      const publicId = resource.public_id;
      const secureUrl = resource.secure_url;
      const createdAt = new Date(resource.created_at).getTime();
      const ageInDays = Math.floor((now - createdAt) / (24 * 60 * 60 * 1000));

      // Firestore에 있는지 확인 (public_id 또는 URL로)
      const existsInFirestore =
        firestorePublicIds.has(publicId) || firestoreUrls.has(secureUrl);

      if (!existsInFirestore) {
        // 안전 기간 확인 (30일 이상 된 것만)
        if (now - createdAt > SAFETY_PERIOD_MS) {
          orphanedImages.push({
            publicId,
            url: secureUrl,
            ageInDays,
          });
          console.log(`  🗑️  ${publicId} (${ageInDays}일 전 생성)`);
        } else {
          console.log(`  ⏳ ${publicId} (${ageInDays}일 전 생성, 너무 최근이라 보호)`);
        }
      }
    }

    console.log(`\n📊 분석 결과:`);
    console.log(`  - Firestore 이미지: ${firestorePublicIds.size}개`);
    console.log(`  - Cloudinary 이미지: ${cloudinaryImages.resources.length}개`);
    console.log(`  - 고아 이미지 (${SAFETY_PERIOD_DAYS}일 이상): ${orphanedImages.length}개\n`);

    // 4. 고아 이미지 삭제
    if (orphanedImages.length > 0) {
      if (DRY_RUN) {
        console.log('🧪 DRY RUN 모드: 실제 삭제하지 않습니다.');
        console.log('삭제될 이미지 목록:');
        orphanedImages.forEach((img) => {
          console.log(`  - ${img.publicId}`);
        });
      } else {
        console.log('🗑️  고아 이미지 삭제 중...');

        // 배치 삭제 (한 번에 삭제)
        const publicIdsToDelete = orphanedImages.map((img) => img.publicId);
        const deleteResult = await cloudinary.api.delete_resources(publicIdsToDelete);

        console.log('✅ 삭제 완료!');
        console.log(`  - 성공: ${Object.keys(deleteResult.deleted).length}개`);
        if (deleteResult.deleted) {
          Object.entries(deleteResult.deleted).forEach(([key, value]) => {
            if (value === 'deleted') {
              console.log(`    ✓ ${key}`);
            }
          });
        }
      }
    } else {
      console.log('✨ 삭제할 고아 이미지가 없습니다. 모든 이미지가 정상적으로 사용 중입니다!');
    }

    console.log('\n🎉 정리 작업 완료!\n');
    return {
      success: true,
      firestoreImageCount: firestorePublicIds.size,
      cloudinaryImageCount: cloudinaryImages.resources.length,
      orphanedImageCount: orphanedImages.length,
      deleted: !DRY_RUN,
    };
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    // Firebase 연결 종료
    await admin.app().delete();
  }
}

// 실행
cleanupOrphanedImages()
  .then((result) => {
    console.log('결과:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('실행 실패:', error);
    process.exit(1);
  });
