import random
from datetime import datetime, timedelta
from langchain.tools import tool

@tool
def check_budget_availability(campaign_type: str) -> str:
    """Check available marketing budget for a campaign type."""
    budgets = {
        "social_media": {"available": 5000, "currency": "USD", "period": "monthly"},
        "email": {"available": 2000, "currency": "USD", "period": "monthly"},
        "paid_ads": {"available": 10000, "currency": "USD", "period": "monthly"},
        "content": {"available": 3000, "currency": "USD", "period": "monthly"},
        "influencer": {"available": 8000, "currency": "USD", "period": "monthly"},
    }
    key = campaign_type.lower().replace(" ", "_")
    budget = budgets.get(key, {"available": 2500, "currency": "USD", "period": "monthly"})
    return f"Budget for {campaign_type}: ${budget['available']} {budget['currency']} ({budget['period']})"

@tool
def get_channel_availability(channel: str) -> str:
    """Check if a marketing channel is available and its reach metrics."""
    channels = {
        "instagram": {"status": "active", "followers": "125K", "avg_reach": "45K", "engagement": "4.2%"},
        "twitter": {"status": "active", "followers": "89K", "avg_reach": "32K", "engagement": "2.8%"},
        "linkedin": {"status": "active", "followers": "42K", "avg_reach": "18K", "engagement": "5.1%"},
        "email": {"status": "active", "subscribers": "78K", "open_rate": "24%", "ctr": "3.6%"},
        "google_ads": {"status": "active", "avg_cpc": "$1.20", "quality_score": "8/10"},
        "facebook": {"status": "active", "followers": "210K", "avg_reach": "85K", "engagement": "3.5%"},
        "youtube": {"status": "active", "subscribers": "35K", "avg_views": "12K", "watch_time": "4.2min"},
    }
    key = channel.lower().replace(" ", "_")
    data = channels.get(key, {"status": "available", "note": "Channel ready to use"})
    return f"Channel '{channel}': {data}"

@tool
def schedule_campaign_task(task_name: str, duration_days: int) -> str:
    """Schedule a marketing task and return its timeline."""
    start = datetime.now() + timedelta(days=random.randint(1, 3))
    end = start + timedelta(days=duration_days)
    return (
        f"Task '{task_name}' scheduled:\n"
        f"  Start: {start.strftime('%Y-%m-%d')}\n"
        f"  End: {end.strftime('%Y-%m-%d')}\n"
        f"  Duration: {duration_days} days\n"
        f"  Status: Confirmed"
    )

@tool
def analyze_competitor_ads(competitor_name: str) -> str:
    """Analyze competitor advertising strategy and recent campaigns."""
    strategies = [
        f"{competitor_name} is running aggressive social media campaigns with 15-20 posts/week.",
        f"{competitor_name} focuses heavily on video content (60% of their ad spend).",
        f"{competitor_name} uses influencer marketing with micro-influencers (10K-100K followers).",
        f"{competitor_name} primary channels: Instagram (40%), Google Ads (35%), Email (25%).",
        f"{competitor_name} recent campaign theme: 'Authenticity and community-driven content'.",
        f"{competitor_name} estimated monthly ad spend: $25,000-$40,000.",
    ]
    return "\n".join(random.sample(strategies, min(4, len(strategies))))

@tool
def get_audience_insights(target_audience: str) -> str:
    """Get demographic and behavioral insights for a target audience."""
    return (
        f"Audience insights for '{target_audience}':\n"
        f"  Primary age group: 22-35 years\n"
        f"  Top platforms: Instagram (78%), YouTube (65%), TikTok (52%)\n"
        f"  Best posting times: 7-9 AM, 12-2 PM, 7-10 PM (local time)\n"
        f"  Content preferences: Video (45%), Stories (30%), Static posts (25%)\n"
        f"  Average purchase decision time: 3-7 days\n"
        f"  Key motivators: Social proof, FOMO, peer recommendations"
    )

@tool
def estimate_campaign_roi(campaign_type: str, budget: float) -> str:
    """Estimate expected ROI for a campaign type with given budget."""
    roi_rates = {
        "email": 4200,
        "social_media": 250,
        "paid_ads": 200,
        "content": 300,
        "influencer": 520,
    }
    key = campaign_type.lower().replace(" ", "_")
    rate = roi_rates.get(key, 250)
    expected_return = budget * (rate / 100)
    return (
        f"ROI estimate for {campaign_type} (${budget:.0f} budget):\n"
        f"  Expected ROI: {rate}%\n"
        f"  Projected return: ${expected_return:.0f}\n"
        f"  Break-even timeline: {max(1, 30 - int(rate/100))} days"
    )

ALL_TOOLS = [
    check_budget_availability,
    get_channel_availability,
    schedule_campaign_task,
    analyze_competitor_ads,
    get_audience_insights,
    estimate_campaign_roi,
]
