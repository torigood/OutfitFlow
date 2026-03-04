import os
import base64
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"


class AnalyzeRequest(BaseModel):
    image_urls: list[str]
    prompt: str


async def download_image_bytes(url: str, client: httpx.AsyncClient) -> bytes:
    """이미지를 URL에서 다운로드"""
    response = await client.get(url, follow_redirects=True, timeout=30.0)
    response.raise_for_status()
    return response.content


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """OpenRouter API를 통해 이미지 분석 (다중 모델 지원)"""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY가 설정되지 않았습니다.")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 이미지를 base64로 변환
            image_content_parts = []
            if request.image_urls:
                for url in request.image_urls:
                    try:
                        image_bytes = await download_image_bytes(url, client)
                        base64_image = base64.b64encode(image_bytes).decode("utf-8")
                        # 이미지 포맷 자동 감지 (기본값 jpeg)
                        image_content_parts.append({
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": base64_image,
                            },
                        })
                    except Exception as e:
                        raise HTTPException(
                            status_code=400,
                            detail=f"이미지 다운로드 실패 ({url}): {str(e)}",
                        )

            # 메시지 구성
            content = image_content_parts + [{"type": "text", "text": request.prompt}]

            # OpenRouter API 요청
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://outfitflow.app",  # 선택사항: 요청 추적용
            }

            # 환경변수에서 모델 읽기, 기본값: 무료 모델
            model_name = os.environ.get("OPENROUTER_MODEL", "llama-2-vision")
            
            payload = {
                "model": model_name,
                "messages": [
                    {
                        "role": "user",
                        "content": content,
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 4096,
                "top_p": 0.9,
            }

            response = await client.post(
                OPENROUTER_API_URL,
                json=payload,
                headers=headers,
            )

            # 에러 처리
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="API 키가 올바르지 않습니다.")
            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail="API 사용량을 초과했습니다.")
            elif response.status_code == 422:
                raise HTTPException(status_code=422, detail="AI가 요청을 거부했습니다.")
            elif not response.is_success:
                error_detail = await response.json() if response.headers.get("content-type") == "application/json" else {}
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenRouter API 오류: {error_detail.get('error', {}).get('message', response.text)}",
                )

            # 응답 파싱
            data = response.json()
            if not data.get("choices") or not data["choices"][0].get("message"):
                raise ValueError("AI가 빈 응답을 반환했습니다.")

            text = data["choices"][0]["message"]["content"]
            return {"result": text}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI 분석 실패: {str(e)}",
        )
