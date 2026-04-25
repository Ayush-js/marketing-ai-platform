import os
from groq import Groq
from app.vectordb.chroma_client import query_brand_context

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

CONTENT_TYPES = {
    "ad_copy": {
        "system": "You are an expert marketing copywriter. Write compelling, punchy ad copy. Be bold, direct, and persuasive. Output ONLY the ad copy — no explanations, no preamble.",
        "template": "Write a compelling ad copy for: {topic}\n\nBrand context:\n{context}\n\nRequirements:\n- 2-4 short punchy paragraphs\n- Strong headline\n- Clear call to action\n- Tone: {tone}"
    },
    "tagline": {
        "system": "You are a creative director specializing in brand taglines. Create memorable, concise taglines. Output ONLY taglines — no explanations.",
        "template": "Generate 5 creative taglines for: {topic}\n\nBrand context:\n{context}\n\nTone: {tone}\n\nFormat: numbered list, one tagline per line, max 8 words each."
    },
    "blog_post": {
        "system": "You are a content marketing expert. Write engaging blog posts that educate and convert. Output ONLY the blog post content.",
        "template": "Write a marketing blog post about: {topic}\n\nBrand context:\n{context}\n\nRequirements:\n- Engaging headline\n- 3-4 sections with subheadings\n- 400-500 words\n- Tone: {tone}\n- End with a strong CTA"
    },
    "social_post": {
        "system": "You are a social media marketing specialist. Write engaging posts optimized for social platforms. Output ONLY the posts.",
        "template": "Create social media posts for: {topic}\n\nBrand context:\n{context}\n\nGenerate:\n1. Instagram post (with hashtags)\n2. Twitter/X post (under 280 chars)\n3. LinkedIn post (professional tone)\n\nOverall tone: {tone}"
    },
    "email_campaign": {
        "system": "You are an email marketing expert. Write high-converting email campaigns. Output ONLY the email content.",
        "template": "Write a marketing email campaign for: {topic}\n\nBrand context:\n{context}\n\nInclude:\n- Subject line (compelling, under 50 chars)\n- Preview text\n- Email body (3-4 paragraphs)\n- CTA button text\n\nTone: {tone}"
    }
}

def generate_text_content(topic: str, content_type: str, tone: str = "energetic") -> str:
    config = CONTENT_TYPES.get(content_type, CONTENT_TYPES["ad_copy"])
    brand_context = query_brand_context(f"{topic} {content_type}")
    prompt = config["template"].format(
        topic=topic,
        context=brand_context or "No specific brand context available.",
        tone=tone
    )
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": config["system"]},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        max_tokens=1024
    )
    return response.choices[0].message.content

def generate_image_prompt(topic: str, content_type: str, style: str = "modern marketing") -> str:
    prompt = f"""Create a detailed image generation prompt for a marketing visual.
Topic: {topic}
Content type: {content_type}
Style: {style}

Output ONLY the image prompt — a single descriptive paragraph suitable for an AI image generator.
Include: visual style, colors, mood, composition. Make it vivid and specific."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=200
    )
    return response.choices[0].message.content.strip()
