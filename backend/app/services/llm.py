"""
Unified LLM Service (Google Gemini API / OpenAI / Local Ollama)
──────────────────────────────────────────────────────────────────
Provides live cloud LLM integration (text & Gemini Vision multimodal scan analysis)
with automatic fallback to local Ollama and clinical decision rule-based templates.
"""
from __future__ import annotations

import base64
import json
import os
import re
from pathlib import Path
from typing import List, Optional
import httpx
from loguru import logger

from app.core.config import settings

CLINICAL_SYSTEM_PROMPT = (
    "STRICT MEDICAL DOMAIN & INDIA REGIONAL CONTEXT GUARDRAILS:\n"
    "You are MediVision AI Assistant, a specialized healthcare and clinical decision support assistant designed exclusively for users in INDIA.\n\n"
    "1. BRIEF & CONCISE RESPONSES (MANDATORY):\n"
    "   - Keep all responses BRIEF, SHORT, DIRECT, and TO THE POINT.\n"
    "   - Use short bullet points (max 3-4 bullets) or 1-2 concise paragraphs.\n"
    "   - Do NOT write long essays, wordy introductions, or unnecessary filler text.\n\n"
    "2. INDIAN HEALTHCARE CONTEXT (MANDATORY):\n"
    "   - ALWAYS tailor advice for the Indian medical system.\n"
    "   - For ANY emergency or urgent symptoms (e.g. chest pain, severe breathlessness, stroke, major burn/bleeding), instruct the user to IMMEDIATELY call 108 or 112 (India's Emergency Ambulance Services) or visit the nearest hospital emergency room.\n"
    "   - NEVER mention 911 or non-Indian emergency services.\n"
    "   - Recommend consulting a local General Physician (MBBS), Specialist, or visiting a nearby hospital/clinic in India.\n\n"
    "3. STRICT MEDICAL SCOPE:\n"
    "   - You MUST ONLY answer questions related to medicine, health, medical conditions, symptoms, pharmacology, nutrition, fitness, anatomy, clinical diagnostics, and healthcare.\n"
    "   - If the user asks ANY non-medical question (math, coding, history, general trivia, physics, etc.), decline firmly with: "
    "'I am MediVision AI, a clinical assistant specialized exclusively in medical and health inquiries. I cannot assist with non-medical questions. Please ask a health, symptom, or medical-related question.'\n\n"
    "4. NO DUPLICATE DISCLAIMER:\n"
    "   - Do NOT write or append any disclaimer text at the end of your response (a disclaimer is automatically attached by the platform).\n"
    "   - Do NOT diagnose definitively. Encourage consulting a doctor for personal care."
)

MANDATORY_DISCLAIMER = (
    "\n\n---\n*Disclaimer: MediVision AI provides clinical decision support for informational "
    "purposes only. Results do not constitute a formal medical diagnosis. Consult a physician for personal care.*"
)


class GeminiCloudService:
    """Interface to Live Google Gemini API via REST endpoints."""

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key
        self.candidate_models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.6-flash"]

    async def generate_response(self, user_query: str, history: Optional[List[dict]] = None) -> Optional[str]:
        """Generates text response using Google Gemini API."""
        if not self.api_key:
            return None

        contents = []
        if history:
            for item in history:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": item.get("content", "")}]
                })
        
        contents.append({
            "role": "user",
            "parts": [{"text": user_query}]
        })

        payload = {
            "systemInstruction": {
                "parts": [{"text": CLINICAL_SYSTEM_PROMPT}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 1000,
            }
        }

        for model_name in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                reply_text = parts[0].get("text", "").strip()
                                if reply_text:
                                    logger.info(f"✓ Generated live response via Google Gemini API ({model_name})")
                                    cleaned_reply = re.sub(r"\n*---?\n*\*?Disclaimer:.*$", "", reply_text, flags=re.DOTALL | re.IGNORECASE).strip()
                                    
                                    # Ensure sentence ends cleanly without truncation
                                    if cleaned_reply and not cleaned_reply[-1] in ".!?":
                                        last_punct = max(cleaned_reply.rfind("."), cleaned_reply.rfind("!"), cleaned_reply.rfind("?"))
                                        if last_punct > 30:
                                            cleaned_reply = cleaned_reply[:last_punct + 1].strip()

                                    return cleaned_reply + MANDATORY_DISCLAIMER
                    else:
                        logger.warning(f"Gemini API ({model_name}) call failed with status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Error calling Gemini API ({model_name}): {e}")

        return None

    async def analyze_image_scan(self, image_bytes: bytes, category: str) -> Optional[dict]:
        """Directly analyzes a medical scan image using Gemini Vision AI."""
        if not self.api_key:
            return None

        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        prompt = (
            f"You are an expert clinical AI decision support system specializing in medical image evaluation. "
            f"Analyze this medical image scan under the medical category '{category}'.\n\n"
            f"Respond ONLY with a valid JSON object matching this exact structure:\n"
            f"{{\n"
            f'  "condition": "Likely condition name (e.g. Normal Chest X-Ray, Plaque Psoriasis, Mild Conjunctivitis)",\n'
            f'  "severity": "mild",\n'
            f'  "confidence": 0.94,\n'
            f'  "description": "Detailed 2-3 sentence visual assessment of markings, tissue pattern, or anomalies in the scan.",\n'
            f'  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]\n'
            f"}}\n"
            f"Make sure severity is strictly one of: 'mild', 'moderate', 'severe', or 'critical'."
        )

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": base64_image
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 600,
                "responseMimeType": "application/json"
            }
        }

        for model_name in self.candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            try:
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                raw_text = parts[0].get("text", "").strip()
                                cleaned_text = re.sub(r"^```(json)?|```$", "", raw_text, flags=re.MULTILINE).strip()
                                parsed = json.loads(cleaned_text)
                                logger.info(f"✓ Gemini Vision AI successfully analyzed '{category}' scan ({model_name}): {parsed.get('condition')}")
                                return parsed
                    else:
                        logger.warning(f"Gemini Vision API ({model_name}) failed with status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Gemini Vision image analysis failed ({model_name}): {e}")

        return None


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
        """Attempts to generate a response via Ollama local models."""
        if not await self.is_healthy():
            return None

        installed_models = await self.get_available_models()
        candidates = [self.primary_model, self.alt_model] + installed_models
        unique_candidates = []
        for c in candidates:
            if c and c not in unique_candidates:
                unique_candidates.append(c)

        if not unique_candidates:
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
            except Exception as e:
                logger.warning(f"Ollama generation failed for model {model_name}: {e}")

        return None


class UnifiedLLMService:
    """Unified service router managing Cloud Gemini API (text & Vision) and Local Ollama."""

    def __init__(self) -> None:
        self.ollama = OllamaService()

    def _get_api_key(self) -> str:
        """Resilient API key resolver (settings -> env var -> direct .env file read)."""
        key = getattr(settings, "GEMINI_API_KEY", "") or os.environ.get("GEMINI_API_KEY", "")
        if not key:
            env_file = Path(__file__).resolve().parent.parent.parent / ".env"
            if env_file.exists():
                try:
                    for line in env_file.read_text(encoding="utf-8").splitlines():
                        if line.startswith("GEMINI_API_KEY="):
                            key = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if key:
                                break
                except Exception:
                    pass
        return key

    async def generate_response(self, user_query: str, history: Optional[List[dict]] = None) -> Optional[str]:
        api_key = self._get_api_key()
        # 1. Try Google Gemini API if key is present
        if api_key:
            gemini = GeminiCloudService(api_key=api_key)
            reply = await gemini.generate_response(user_query, history)
            if reply:
                return reply

        # 2. Try Local Ollama if available
        reply = await self.ollama.generate_response(user_query, history)
        if reply:
            return reply

        # 3. Return None for Rule-Based Medical Engine fallback
        return None

    async def analyze_image_scan(self, image_bytes: bytes, category: str) -> Optional[dict]:
        """Routes medical image scan directly to Gemini Vision AI."""
        api_key = self._get_api_key()
        if api_key:
            gemini = GeminiCloudService(api_key=api_key)
            return await gemini.analyze_image_scan(image_bytes, category)
        return None


llm_service = UnifiedLLMService()
ollama_service = llm_service.ollama  # Backward compatibility
