FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# Write warmup script to a file to avoid Dockerfile parse issues
RUN echo 'import sys' > /warmup.py && \
    echo 'sys.path.insert(0, "/install/lib/python3.11/site-packages")' >> /warmup.py && \
    echo 'import chromadb' >> /warmup.py && \
    echo 'client = chromadb.Client()' >> /warmup.py && \
    echo 'col = client.get_or_create_collection("warmup")' >> /warmup.py && \
    echo 'col.add(ids=["1"], documents=["warmup"])' >> /warmup.py && \
    echo 'col.query(query_texts=["warmup"], n_results=1)' >> /warmup.py && \
    echo 'print("Model downloaded successfully")' >> /warmup.py

# Pre-download the ChromaDB ONNX embedding model at build time
RUN mkdir -p /root/.cache/chroma && \
    PYTHONPATH=/install/lib/python3.11/site-packages \
    HF_HOME=/root/.cache \
    CHROMA_CACHE_DIR=/root/.cache/chroma \
    python /warmup.py

FROM python:3.11-slim AS runtime

WORKDIR /app

COPY --from=builder /install /usr/local

# Copy the pre-downloaded model from builder into the runtime image
COPY --from=builder /root/.cache /app/.cache

COPY app/ ./app/

RUN mkdir -p /app/chroma_data /app/.cache/chroma && \
    useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app

ENV HOME=/app
ENV HF_HOME=/app/.cache
ENV CHROMA_CACHE_DIR=/app/.cache/chroma

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]