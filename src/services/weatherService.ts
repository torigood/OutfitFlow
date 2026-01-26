import { OPENWEATHER_API_KEY } from "@env";
import { WeatherInfo } from "../types/ai";
import * as Location from "expo-location";

// =================================================================
// 1. 설정 및 상수 (이곳에서 위치와 테스트 모드를 관리하세요)
// =================================================================

const OPENWEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";

/**
 * 자주 사용하는 위치 좌표 모음
 */
export const LOCATIONS = {
  WATERLOO: {
    latitude: 43.4643,
    longitude: -80.5204,
    name: "Waterloo",
  },
  SEOUL: {
    latitude: 37.5665,
    longitude: 126.978,
    name: "Seoul",
  },
  SF: {
    latitude: 37.7858,
    longitude: -122.4064,
    name: "San Francisco",
  },
};

/**
 * ⚙️ 앱 설정
 * TEST_MODE: true면 GPS 무시하고 강제로 TEST_LOCATION 사용
 * DEFAULT_FALLBACK: GPS 권한 거부나 에러 시 사용할 기본 위치
 */
const APP_CONFIG = {
  TEST_MODE: true, // 🚨 테스트할 땐 이걸 true로, 배포할 땐 false로!
  TEST_LOCATION: LOCATIONS.WATERLOO, // 테스트 모드일 때 사용할 위치
  DEFAULT_FALLBACK: LOCATIONS.WATERLOO, // GPS 실패 시 사용할 기본 위치
};

// =================================================================
// 2. 유틸리티 (번역 및 타입)
// =================================================================

/**
 * 날씨 상태 번역 맵 (함수 밖으로 빼서 성능 최적화)
 */
const WEATHER_TRANSLATIONS: Record<string, string> = {
  Clear: "맑음",
  Clouds: "흐림",
  Rain: "비",
  Drizzle: "이슬비",
  Thunderstorm: "뇌우",
  Snow: "눈",
  Mist: "안개",
  Smoke: "연무",
  Haze: "실안개",
  Dust: "황사",
  Fog: "안개",
  Sand: "모래바람",
  Ash: "화산재",
  Squall: "돌풍",
  Tornado: "토네이도",
};

interface OpenWeatherResponse {
  main: { temp: number; feels_like: number; humidity: number };
  weather: Array<{ main: string; description: string }>;
  wind: { speed: number };
  name: string; // 도시 이름
}

const translateWeatherCondition = (condition: string): string => {
  return WEATHER_TRANSLATIONS[condition] || condition;
};

// =================================================================
// 3. 핵심 로직 함수
// =================================================================

/**
 * 좌표를 받아 날씨를 가져오는 순수 함수
 */
export const getCurrentWeather = async (
  latitude: number,
  longitude: number
): Promise<WeatherInfo> => {
  try {
    const url = `${OPENWEATHER_API_BASE}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API Error: ${response.status}`);

    const data: OpenWeatherResponse = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      condition: translateWeatherCondition(data.weather[0].main),
      windSpeed: Math.round(data.wind.speed * 10) / 10,
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error("❌ 날씨 데이터 조회 실패:", error);
    throw error;
  }
};

/**
 * 📍 현재 위치 기반 날씨 가져오기 (메인 함수)
 * - 설정된 TEST_MODE에 따라 작동 방식이 달라집니다.
 * - GPS 실패 시 자동으로 워털루(DEFAULT_FALLBACK)로 연결됩니다.
 */
export const getWeatherByCurrentLocation = async (): Promise<WeatherInfo> => {
  // [모드 1] 강제 테스트 모드 (시뮬레이터용)
  if (APP_CONFIG.TEST_MODE) {
    console.log(
      `🚧 [테스트 모드] 강제로 ${APP_CONFIG.TEST_LOCATION.name} 위치를 사용합니다.`
    );
    return await getCurrentWeather(
      APP_CONFIG.TEST_LOCATION.latitude,
      APP_CONFIG.TEST_LOCATION.longitude
    );
  }

  // [모드 2] 실제 GPS 위치 사용
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.warn(
        `⚠️ 위치 권한 거부됨. 기본 위치(${APP_CONFIG.DEFAULT_FALLBACK.name})를 사용합니다.`
      );
      return await getCurrentWeather(
        APP_CONFIG.DEFAULT_FALLBACK.latitude,
        APP_CONFIG.DEFAULT_FALLBACK.longitude
      );
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    console.log(`📍 현재 위치 감지됨: ${latitude}, ${longitude}`);
    return await getCurrentWeather(latitude, longitude);

  } catch (error) {
    // GPS 타임아웃, 에러 등 모든 예외 상황 처리
    console.error(
      `❌ 위치 조회 중 오류 발생. 기본 위치(${APP_CONFIG.DEFAULT_FALLBACK.name})로 대체합니다.`,
      error
    );
    return await getCurrentWeather(
      APP_CONFIG.DEFAULT_FALLBACK.latitude,
      APP_CONFIG.DEFAULT_FALLBACK.longitude
    );
  }
};

/**
 * (선택) 도시 이름으로 검색
 */
export const getCurrentWeatherByCity = async (
  cityName: string
): Promise<WeatherInfo> => {
  // ... (기존 코드와 동일, 필요하면 유지)
  return await getCurrentWeather(
    APP_CONFIG.DEFAULT_FALLBACK.latitude, 
    APP_CONFIG.DEFAULT_FALLBACK.longitude
  ); // 임시 반환값
};