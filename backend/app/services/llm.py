"""
Local Ollama LLM Service & Health Decision Engine
─────────────────────────────────────────────────
Interacts with local Ollama service (Gemma 3 / Llama 3.2).
Includes health check and graceful fallback to rule-based medical response templates.
"""
from __future__ import annotations

from typing import List, Optional
import httpx
from loguru import logger

from app.core.config import settings

CLINICAL_SYSTEM_PROMPT = (
    "You are MediVision AI Assistant, an empathetic, highly accurate clinical decision support chatbot. "
    "Provide clear, evidence-based, structured medical guidance. "
    "Do NOT diagnose definitively. Always encourage consulting a doctor for personal care. "
    "Keep responses concise and structured with bullet points where appropriate."
)

MANDATORY_DISCLAIMER = (
    "\n\n---\n*Disclaimer: MediVision AI provides clinical decision support for informational "
    "purposes only. Results do not constitute a formal medical diagnosis. Consult a physician for personal care.*"
)


class OllamaService:
    """Interface to local Ollama LLM with dynamic model detection and automatic fallback."""

    def __init__(self) -> None:
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/")
        self.primary_model = settings.OLLAMA_PRIMARY_MODEL
        self.alt_model = settings.OLLAMA_ALT_MODEL

    async def is_healthy(self) -> bool:
        """Checks if local Ollama server is running."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                resp = await client.get(f"{self.base_url}/api/version")
                return resp.status_code == 200
        except Exception:
            return False

    async def get_available_models(self) -> List[str]:
        """Queries Ollama for installed model tags."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{self.base_url}/api/tags")
                if resp.status_code == 200:
                    models_data = resp.json().get("models", [])
                    return [m["name"] for m in models_data if "name" in m]
        except Exception as e:
            logger.warning(f"Failed to fetch Ollama installed tags: {e}")
        return []

    async def generate_response(self, user_query: str, history: Optional[List[dict]] = None) -> Optional[str]:
        """
        Attempts to generate a response via Ollama local models.
        Dynamically detects installed models if primary/alt tags are missing.
        Returns None if Ollama service is unavailable or fails.
        """
        if not await self.is_healthy():
            logger.info("Ollama service not detected. Switching to Rule-Based Medical Response Engine.")
            return None

        installed_models = await self.get_available_models()
        logger.info(f"Ollama connected. Installed models on host: {installed_models}")

        # Candidate models to try in priority order
        candidates = [self.primary_model, self.alt_model] + installed_models
        # Remove duplicates while preserving order
        unique_candidates = []
        for c in candidates:
            if c and c not in unique_candidates:
                unique_candidates.append(c)

        if not unique_candidates:
            logger.warning("Ollama is running but no model tags are installed. Try running: ollama run gemma3:4b")
            return None

        prompt_text = f"{CLINICAL_SYSTEM_PROMPT}\n\nUser Question: {user_query}\n\nAssistant:"

        for model_name in unique_candidates:
            try:
                payload = {
                    "model": model_name,
                    "prompt": prompt_text,
                    "stream": False,
                    "options": {"temperature": 0.3, "max_tokens": 512},
                }
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                    if resp.status_code == 200:
                        res_data = resp.json()
                        reply = res_data.get("response", "").strip()
                        if reply:
                            logger.info(f"Successfully generated response using Ollama model: {model_name}")
                            return reply + MANDATORY_DISCLAIMER
                    else:
                        logger.warning(f"Ollama /api/generate for '{model_name}' returned status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.warning(f"Ollama generation failed for model {model_name}: {e}")

        return None


ollama_service = OllamaService()
