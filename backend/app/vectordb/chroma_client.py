import chromadb
from chromadb.config import Settings

_client = None
_collection = None

def get_collection():
    global _client, _collection
    if _client is None:
        _client = chromadb.Client(Settings(anonymized_telemetry=False))
        _collection = _client.get_or_create_collection(
            name="brand_voice",
            metadata={"description": "Brand voice and past marketing content"}
        )
        _seed_brand_voice()
    return _collection

def _seed_brand_voice():
    col = _collection
    if col.count() > 0:
        return
    samples = [
        {
            "id": "bv1",
            "doc": "Our brand voice is bold, energetic, and youth-focused. We speak directly to customers using short punchy sentences.",
            "meta": {"type": "brand_voice", "tone": "energetic"}
        },
        {
            "id": "bv2",
            "doc": "We use active voice, strong verbs, and avoid corporate jargon. Every message should inspire action.",
            "meta": {"type": "brand_voice", "tone": "action-oriented"}
        },
        {
            "id": "bv3",
            "doc": "Sample ad copy: 'Don't wait. Dominate. Our product gives you the edge you've been missing.'",
            "meta": {"type": "ad_copy", "product": "general"}
        },
        {
            "id": "bv4",
            "doc": "Sample tagline: 'Built for winners. Designed for you.' — short, memorable, powerful.",
            "meta": {"type": "tagline", "style": "punchy"}
        },
        {
            "id": "bv5",
            "doc": "Target audience: 18-35 year olds who value performance, authenticity, and social proof.",
            "meta": {"type": "audience", "age_group": "18-35"}
        },
    ]
    col.add(
        ids=[s["id"] for s in samples],
        documents=[s["doc"] for s in samples],
        metadatas=[s["meta"] for s in samples]
    )

def query_brand_context(query_text: str, n_results: int = 3) -> str:
    col = get_collection()
    results = col.query(query_texts=[query_text], n_results=min(n_results, col.count()))
    docs = results.get("documents", [[]])[0]
    return "\n".join(docs) if docs else ""

def add_content(content_id: str, content: str, metadata: dict):
    col = get_collection()
    col.add(ids=[content_id], documents=[content], metadatas=[metadata])
