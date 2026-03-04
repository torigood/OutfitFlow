import os
import time
import hashlib
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class DeleteImageRequest(BaseModel):
    public_id: str


@router.delete("")
async def delete_image(request: DeleteImageRequest):
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    api_key = os.environ.get("CLOUDINARY_API_KEY")
    api_secret = os.environ.get("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        raise HTTPException(status_code=500, detail="Cloudinary 설정이 누락되었습니다.")

    # Signed 요청 생성
    timestamp = int(time.time())
    to_sign = f"public_id={request.public_id}&timestamp={timestamp}{api_secret}"
    signature = hashlib.sha1(to_sign.encode()).hexdigest()

    url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/destroy"
    payload = {
        "public_id": request.public_id,
        "timestamp": timestamp,
        "api_key": api_key,
        "signature": signature,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            response = await client.post(url, data=payload)
            data = response.json()
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Cloudinary 연결 실패: {str(e)}")

    if data.get("result") != "ok":
        raise HTTPException(
            status_code=400,
            detail=f"이미지 삭제 실패: {data.get('result', '알 수 없는 오류')}",
        )

    return {"result": "ok", "public_id": request.public_id}
