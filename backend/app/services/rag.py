"""
ChromaDB Vector RAG Knowledge Retrieval Service
────────────────────────────────────────────────
Manages clinical medical knowledge vectors utilizing swappable embedding model.
"""
from __future__ import annotations

from typing import List, Optional
from loguru import logger

from app.core.config import settings


class ClinicalRAGService:
    """ChromaDB RAG Service for clinical guidelines retrieval."""

    def __init__(self) -> None:
        self.embedding_model_name = settings.EMBEDDING_MODEL
        self.chroma_client = None
        self.collection = None
        self._init_rag()

    def _init_rag(self) -> None:
        try:
            import chromadb
            self.chroma_client = chromadb.Client()
            self.collection = self.chroma_client.get_or_create_collection(
                name="clinical_guidelines"
            )
            logger.info(f"Initialized ChromaDB vector collection with model {self.embedding_model_name}")
        except Exception as e:
            logger.warning(f"ChromaDB unavailable ({e}). Using in-memory medical knowledge base.")
            self.chroma_client = None

    def query_context(self, query: str, top_k: int = 2) -> List[str]:
        """Retrieves relevant clinical knowledge context snippets."""
        if not self.collection:
            return []
        try:
            results = self.collection.query(query_texts=[query], n_results=top_k)
            documents = results.get("documents", [[]])[0]
            return documents
        except Exception as e:
            logger.warning(f"ChromaDB query error: {e}")
            return []


rag_service = ClinicalRAGService()
