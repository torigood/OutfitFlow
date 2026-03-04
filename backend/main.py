from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import ai, weather, image

load_dotenv()

app = FastAPI(title="OutfitFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 배포 시 앱 도메인으로 제한
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])
app.include_router(image.router, prefix="/api/image", tags=["Image"])


@app.get("/health")
def health():
    return {"status": "ok"}
