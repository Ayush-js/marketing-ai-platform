import os
import requests
import base64
import time

HF_API_TOKEN = os.environ.get("HF_API_TOKEN", "")
HF_API_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell/v1/images/generations"
HEADERS = {
    "Authorization": f"Bearer {HF_API_TOKEN}",
    "Content-Type": "application/json"
}

def _generate_image_bytes(prompt: str, width: int = 1024, height: int = 576, retries: int = 3):
    payload = {
        "prompt": prompt,
        "num_inference_steps": 4,
        "width": width,
        "height": height,
    }
    for attempt in range(retries):
        try:
            response = requests.post(HF_API_URL, headers=HEADERS, json=payload, timeout=60)
            if response.status_code == 200:
                data = response.json()
                import base64 as b64mod
                img_b64 = data["data"][0]["b64_json"]
                return b64mod.b64decode(img_b64)
            elif response.status_code == 503:
                wait = response.json().get("estimated_time", 20)
                print(f"[ImageGen] Model loading, waiting {wait}s...")
                time.sleep(min(wait, 30))
                continue
            elif response.status_code == 429:
                print("[ImageGen] Rate limited, waiting 15s...")
                time.sleep(15)
                continue
            else:
                print(f"[ImageGen] Error {response.status_code}: {response.text[:200]}")
                return None
        except requests.exceptions.Timeout:
            print(f"[ImageGen] Timeout on attempt {attempt + 1}")
            continue
        except Exception as e:
            print(f"[ImageGen] Exception: {e}")
            return None
    return None

def _bytes_to_data_url(image_bytes: bytes) -> str:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64}"

def _pollinations_fallback(prompt: str, width: int, height: int) -> str:
    import urllib.parse
    encoded = urllib.parse.quote(prompt)
    return f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}&nologo=true"

def get_marketing_image(prompt: str, style: str = "professional marketing photography") -> dict:
    full_prompt = (
        f"{style}, {prompt}, vibrant colors, high quality, "
        "sharp focus, commercial photography, advertising visual, 4k"
    )
    image_bytes = _generate_image_bytes(full_prompt, width=1024, height=576)
    if image_bytes:
        return {"url": _bytes_to_data_url(image_bytes), "prompt": full_prompt, "width": 1024, "height": 576, "source": "huggingface-flux"}
    else:
        return {"url": _pollinations_fallback(full_prompt, 1024, 576), "prompt": full_prompt, "width": 1024, "height": 576, "source": "pollinations-fallback"}

def get_banner_image(topic: str) -> dict:
    prompt = (
        f"Wide marketing banner for {topic}, professional advertising design, "
        "bold composition, clean modern aesthetic, high resolution, 4k"
    )
    image_bytes = _generate_image_bytes(prompt, width=1280, height=400)
    if image_bytes:
        return {"url": _bytes_to_data_url(image_bytes), "prompt": prompt, "width": 1280, "height": 400, "source": "huggingface-flux"}
    else:
        return {"url": _pollinations_fallback(prompt, 1280, 400), "prompt": prompt, "width": 1280, "height": 400, "source": "pollinations-fallback"}