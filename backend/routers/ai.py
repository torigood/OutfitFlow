import os
import time
import base64
import asyncio
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
FALLBACK_MODEL = "openrouter/auto"


class AnalyzeRequest(BaseModel):
    image_urls: list[str]
    prompt: str


async def download_image_bytes(url: str, client: httpx.AsyncClient) -> bytes:
    """이미지를 URL에서 다운로드"""
    response = await client.get(url, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    return response.content


def extract_openrouter_error(response: httpx.Response) -> str:
    content_type = (response.headers.get("content-type") or "").lower()
    if "application/json" in content_type:
        try:
            error_detail = response.json()
            return error_detail.get("error", {}).get("message", response.text)
        except ValueError:
            return response.text
    return response.text


def is_model_error(status_code: int, error_message: str) -> bool:
    lowered = (error_message or "").lower()
    if status_code not in (400, 404):
        return False
    keywords = [
        "model",
        "not found",
        "no endpoints found",
        "invalid",
        "unsupported",
        "does not exist",
    ]
    return any(keyword in lowered for keyword in keywords)


async def build_image_content_parts(
    image_urls: list[str], client: httpx.AsyncClient
) -> list[dict]:
    if not image_urls:
        return []

    results = await asyncio.gather(
        *(download_image_bytes(url, client) for url in image_urls),
        return_exceptions=True,
    )

    image_content_parts: list[dict] = []
    for url, result in zip(image_urls, results):
        if isinstance(result, Exception):
            raise HTTPException(
                status_code=400,
                detail=f"이미지 다운로드 실패 ({url}): {str(result)}",
            )

        base64_image = base64.b64encode(result).decode("utf-8")
        image_content_parts.append(
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": base64_image,
                },
            }
        )

    return image_content_parts


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """OpenRouter API를 통해 이미지 분석 (다중 모델 지원)"""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY가 설정되지 않았습니다.")

    try:
        endpoint_start = time.perf_counter()
        timeout_seconds = float(os.environ.get("OPENROUTER_TIMEOUT", "45"))

        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            # 이미지를 base64로 변환 (병렬 다운로드)
            image_content_parts = await build_image_content_parts(request.image_urls, client)

            # 메시지 구성
            content = image_content_parts + [{"type": "text", "text": request.prompt}]

            # OpenRouter API 요청
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://outfitflow.app",  # 선택사항: 요청 추적용
            }

            # 환경변수 모델 우선 사용, 실패 시 fallback 모델 1회 재시도
            configured_model = os.environ.get("OPENROUTER_MODEL", FALLBACK_MODEL)
            model_candidates = [configured_model]
            if configured_model != FALLBACK_MODEL:
                model_candidates.append(FALLBACK_MODEL)

            response = None
            last_error_message = ""

            for model_name in model_candidates:
                payload = {
                    "model": model_name,
                    "messages": [
                        {
                            "role": "user",
                            "content": content,
                        }
                    ],
                    "temperature": float(os.environ.get("OPENROUTER_TEMPERATURE", "0.3")),
                    "max_tokens": int(os.environ.get("OPENROUTER_MAX_TOKENS", "900")),
                    "top_p": float(os.environ.get("OPENROUTER_TOP_P", "0.9")),
                }

                response = await client.post(
                    OPENROUTER_API_URL,
                    json=payload,
                    headers=headers,
                )

                if response.is_success:
                    break

                last_error_message = extract_openrouter_error(response)
                if not is_model_error(response.status_code, last_error_message):
                    break

            if response is None:
                raise HTTPException(status_code=500, detail="OpenRouter 응답을 받지 못했습니다.")

            # 에러 처리
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="API 키가 올바르지 않습니다.")
            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail="API 사용량을 초과했습니다.")
            elif response.status_code == 422:
                raise HTTPException(status_code=422, detail="AI가 요청을 거부했습니다.")
            elif not response.is_success:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenRouter API 오류: {last_error_message or extract_openrouter_error(response)}",
                )

            # 응답 파싱
            data = response.json()
            if not data.get("choices") or not data["choices"][0].get("message"):
                raise ValueError("AI가 빈 응답을 반환했습니다.")

            text = data["choices"][0]["message"]["content"]
            elapsed_ms = int((time.perf_counter() - endpoint_start) * 1000)
            print(
                f"[AI] analyze done | images={len(request.image_urls)} | prompt_len={len(request.prompt)} | elapsed_ms={elapsed_ms}"
            )
            return {"result": text}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI 분석 실패: {str(e)}",
        )
