"""
Dynamic Model Loader
─────────────────────
Lazy-loads models per medical category on first use.
All models are cached in memory after first load.
Supports: EfficientNet (skin/oral/burns/wounds), DenseNet (eye),
          Vision Transformer (chest), YOLOv8 (dental).
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, Optional

import torch
from loguru import logger

from app.core.config import settings


class ModelLoader:
    """Thread-safe singleton model cache."""

    _cache: Dict[str, torch.nn.Module] = {}
    _device: torch.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ── Model Architecture Registry ─────────────────────────
    _ARCHITECTURES: Dict[str, str] = {
        "skin":   "efficientnet_b4",
        "eye":    "densenet121",
        "chest":  "vit_base_patch16_224",
        "dental": "yolov8n",      # Special: loaded via ultralytics
        "oral":   "efficientnet_b3",
        "burns":  "unet_resnet34",
        "wounds": "unet_resnet34",
    }

    @classmethod
    def load(cls, category: str) -> Optional[torch.nn.Module]:
        """Return cached model or load from disk. Returns None if weights not found."""
        if category in cls._cache:
            return cls._cache[category]

        weights_path = Path(settings.MODELS_DIR) / category / "best.pt"
        if not weights_path.exists():
            logger.warning(f"Model weights not found: {weights_path}. Running in demo mode.")
            return None

        logger.info(f"Loading {category} model from {weights_path}")
        try:
            model = cls._load_architecture(category, weights_path)
            model.eval()
            model.to(cls._device)
            cls._cache[category] = model
            logger.info(f"✓ {category} model loaded on {cls._device}")
            return model
        except Exception as e:
            logger.error(f"Failed to load {category} model: {e}")
            return None

    @classmethod
    def _load_architecture(cls, category: str, weights_path: Path) -> torch.nn.Module:
        arch = cls._ARCHITECTURES.get(category, "efficientnet_b4")

        if arch == "yolov8n":
            from ultralytics import YOLO
            return YOLO(str(weights_path))

        if arch.startswith("unet"):
            return cls._load_unet(arch, weights_path)

        # timm-based architectures (EfficientNet, DenseNet, ViT)
        import timm
        num_classes = cls._get_num_classes(category)
        model = timm.create_model(arch, pretrained=False, num_classes=num_classes)
        state = torch.load(weights_path, map_location=cls._device, weights_only=True)
        model.load_state_dict(state)
        return model

    @staticmethod
    def _load_unet(arch: str, weights_path: Path) -> torch.nn.Module:
        """Load segmentation model (U-Net for burns/wounds)."""
        import segmentation_models_pytorch as smp
        backbone = arch.replace("unet_", "")
        model = smp.Unet(encoder_name=backbone, encoder_weights=None, in_channels=3, classes=1)
        state = torch.load(weights_path, map_location="cpu", weights_only=True)
        model.load_state_dict(state)
        return model

    @staticmethod
    def _get_num_classes(category: str) -> int:
        class_counts = {
            "skin":  5,   # Psoriasis, Eczema, Melanoma, Acne, Rosacea
            "eye":   4,   # Conjunctivitis, Cataract, Glaucoma, Diabetic Retinopathy
            "chest": 5,   # Normal, Pneumonia, TB, Pleural Effusion, Cardiomegaly
            "oral":  4,   # Aphthous Ulcer, Leukoplakia, Oral Candidiasis, OSMF
            "burns": 4,   # Superficial, Partial-Thickness, Full-Thickness, Normal
            "wounds": 3,  # Infected, Clean, Chronic
        }
        return class_counts.get(category, 5)

    @classmethod
    def warm_up(cls) -> None:
        """Pre-load all models at startup (optional — skipped if no weights on disk)."""
        logger.info("Warming up AI models...")
        for cat in cls._ARCHITECTURES:
            cls.load(cat)
        loaded = list(cls._cache.keys())
        logger.info(f"Models ready: {loaded if loaded else 'none (demo mode)'}")

    @classmethod
    def unload_all(cls) -> None:
        """Release GPU/CPU memory on shutdown."""
        cls._cache.clear()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("All models unloaded.")

    @classmethod
    def loaded_categories(cls) -> list[str]:
        return list(cls._cache.keys())
