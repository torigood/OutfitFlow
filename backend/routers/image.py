import os
import time
import hashlib
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

router = APIRouter()


class DeleteImageRequest(BaseModel):
    public_id: str


class CloudinaryUploadResponse(BaseModel):
    public_id: str
    secure_url: str


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


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """클라이언트에서 이미지를 업로드합니다 (Cloudinary unsigned)"""
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    upload_preset = os.environ.get("CLOUDINARY_UPLOAD_PRESET")

    if not all([cloud_name, upload_preset]):
        raise HTTPException(status_code=500, detail="Cloudinary 설정이 누락되었습니다.")

    # 파일이 유효한지 확인
    if not file.filename:
        raise HTTPException(status_code=400, detail="파일명이 없습니다.")

    try:
        # 파일 읽기
        file_content = await file.read()
        if not file_content:
            raise HTTPException(status_code=400, detail="파일이 비어있습니다.")

        # Cloudinary에 업로드
        url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
        
        files = {"file": (file.filename, file_content, file.content_type)}
        data = {
            "upload_preset": upload_preset,
            "folder": "wardrobe",  # wardrobe 폴더에 저장
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, files=files, data=data)
            
            if not response.is_success:
                error_data = response.json()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Cloudinary 업로드 실패: {error_data.get('error', {}).get('message', '알 수 없는 오류')}",
                )
            
            response_data = response.json()
            
            return {
                "url": response_data.get("secure_url"),
                "publicId": response_data.get("public_id"),
            }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"이미지 업로드 실패: {str(e)}",
        )
