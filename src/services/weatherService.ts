import { OPENWEATHER_API_KEY } from "@env";
import { WeatherInfo } from "../types/ai";

const OPENWEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";

/**
 * OpenWeatherMap API 응답 타입
 */
interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string; // Rain, Clear, Clouds, etc.
    description: string; // light rain, clear sky, etc.
  }>;
  wind: {
    speed: number;
  };
}

/**
 * 날씨 상태를 한국어로 변환
 */
const translateWeatherCondition = (condition: string): string => {
  const translations: Record<string, string> = {
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

  return translations[condition] || condition;
};

/**
 * 위치 기반 현재 날씨 가져오기
 * @param latitude 위도
 * @param longitude 경도
 * @returns 날씨 정보
 */
export const getCurrentWeather = async (
  latitude: number,
  longitude: number
): Promise<WeatherInfo> => {
  try {
    const url = `${OPENWEATHER_API_BASE}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`날씨 API 오류: ${response.status}`);
    }

    const data: OpenWeatherResponse = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      condition: translateWeatherCondition(data.weather[0].main),
      windSpeed: Math.round(data.wind.speed * 10) / 10, // 소수점 1자리
      description: data.weather[0].description,
    };
  } catch (error) {
    console.error("날씨 조회 오류:", error);
    throw new Error(
      `날씨 정보를 가져올 수 없습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * 도시 이름으로 날씨 가져오기
 * @param cityName 도시 이름 (예: Seoul, Busan)
 * @returns 날씨 정보
 */
export const getCurrentWeatherByCity = async (
  cityName: string
): Promise<WeatherInfo> => {
  try {
    const url = `${OPENWEATHER_API_BASE}/weather?q=${cityName}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`날씨 API 오류: ${response.status}`);
    }

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
    console.error("날씨 조회 오류:", error);
    throw new Error(
      `날씨 정보를 가져올 수 없습니다: ${
        error instanceof Error ? error.message : "알 수 없는 오류"
      }`
    );
  }
};

/**
 * 기본 위치(서울)의 날씨 가져오기
 * @returns 날씨 정보
 */
export const getDefaultWeather = async (): Promise<WeatherInfo> => {
  // 서울 좌표: 37.5665, 126.9780
  return await getCurrentWeather(37.5665, 126.978);
};
