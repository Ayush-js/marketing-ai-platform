import urllib.parse
import os

def _pollinations_url(prompt: str, width: int, height: int) -> str:
    encoded = urllib.parse.quote(prompt)
    return f"https://image.pollinations.ai/prompt/{encoded}?width={width}&height={height}&nologo=true&seed={hash(prompt) % 10000}"

def get_marketing_image(prompt: str, style: str = "professional marketing photography") -> dict:
    full_prompt = (
        f"{style}, {prompt}, vibrant colors, high quality, "
        "sharp focus, commercial photography, advertising visual, 4k"
    )
    return {
        "url": _pollinations_url(full_prompt, 1024, 576),
        "prompt": full_prompt,
        "width": 1024,
        "height": 576,
        "source": "pollinations"
    }

def get_banner_image(topic: str) -> dict:
    prompt = (
        f"Wide marketing banner for {topic}, professional advertising design, "
        "bold composition, clean modern aesthetic, high resolution, 4k"
    )
    return {
        "url": _pollinations_url(prompt, 1280, 400),
        "prompt": prompt,
        "width": 1280,
        "height": 400,
        "source": "pollinations"
    }