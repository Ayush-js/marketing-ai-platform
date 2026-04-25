from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from app.genai.content_gen import generate_text_content, generate_image_prompt, CONTENT_TYPES
from app.genai.image_gen import get_marketing_image, get_banner_image
from app.vectordb.chroma_client import add_content

router = APIRouter()

class ContentRequest(BaseModel):
    topic: str
    content_type: str = "ad_copy"
    tone: str = "energetic"
    include_image: bool = True
    image_style: str = "modern marketing photography"

class ContentResponse(BaseModel):
    id: str
    topic: str
    content_type: str
    text_content: str
    image_url: Optional[str] = None
    banner_url: Optional[str] = None
    image_prompt: Optional[str] = None

@router.post("/generate", response_model=ContentResponse)
async def generate_content(req: ContentRequest):
    try:
        content_id = str(uuid.uuid4())[:8]
        text = generate_text_content(req.topic, req.content_type, req.tone)

        image_url = None
        banner_url = None
        img_prompt = None

        if req.include_image:
            img_prompt = generate_image_prompt(req.topic, req.content_type, req.image_style)
            img_data = get_marketing_image(img_prompt)
            banner_data = get_banner_image(req.topic)
            image_url = img_data["url"]
            banner_url = banner_data["url"]

        # Store generated content in vector DB for future brand context
        add_content(
            content_id=f"gen_{content_id}",
            content=text[:500],
            metadata={"type": req.content_type, "topic": req.topic, "tone": req.tone}
        )

        return ContentResponse(
            id=content_id,
            topic=req.topic,
            content_type=req.content_type,
            text_content=text,
            image_url=image_url,
            banner_url=banner_url,
            image_prompt=img_prompt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content-types")
def get_content_types():
    return {"content_types": list(CONTENT_TYPES.keys())}

@router.get("/tones")
def get_tones():
    return {
        "tones": [
            "energetic", "professional", "playful", "luxury",
            "urgent", "inspirational", "friendly", "authoritative"
        ]
    }
