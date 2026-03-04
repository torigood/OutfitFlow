import os
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

WEATHER_TRANSLATIONS = {
    "Clear": "맑음",
    "Clouds": "흐림",
    "Rain": "비",
    "Drizzle": "이슬비",
    "Thunderstorm": "뇌우",
    "Snow": "눈",
    "Mist": "안개",
    "Smoke": "연무",
    "Haze": "실안개",
    "Dust": "황사",
    "Fog": "안개",
    "Sand": "모래바람",
    "Ash": "화산재",
    "Squall": "돌풍",
    "Tornado": "토네이도",
}


@router.get("")
async def get_weather(
    lat: float = Query(..., description="위도"),
    lon: float = Query(..., description="경도"),
):
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENWEATHER_API_KEY가 설정되지 않았습니다.")

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lon}&appid={api_key}&units=metric&lang=kr"
    )

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            if not response.is_success:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"날씨 API 오류: {response.status_code}",
                )
            data = response.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="날씨 API 타임아웃")
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"날씨 API 연결 실패: {str(e)}")

    condition = data["weather"][0]["main"]
    return {
        "temperature": round(data["main"]["temp"]),
        "feelsLike": round(data["main"]["feels_like"]),
        "humidity": data["main"]["humidity"],
        "condition": WEATHER_TRANSLATIONS.get(condition, condition),
        "windSpeed": round(data["wind"]["speed"] * 10) / 10,
        "description": data["weather"][0]["description"],
    }
