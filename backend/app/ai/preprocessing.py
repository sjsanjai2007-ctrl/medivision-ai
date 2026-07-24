"""
Unified AI Preprocessing Pipeline
──────────────────────────────────
Handles: resize, normalize, quality check, contrast enhancement, noise reduction.
All preprocessing is category-aware via the PreprocessingConfig.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple

import cv2
import numpy as np
from PIL import Image, ImageEnhance


@dataclass
class PreprocessingConfig:
    target_size: Tuple[int, int] = (224, 224)
    mean: Tuple[float, float, float] = (0.485, 0.456, 0.406)   # ImageNet
    std: Tuple[float, float, float] = (0.229, 0.224, 0.225)
    enhance_contrast: bool = False
    denoise: bool = False
    clahe: bool = False


# Category-specific configurations
CATEGORY_CONFIGS: dict[str, PreprocessingConfig] = {
    "skin":   PreprocessingConfig(enhance_contrast=True, clahe=True),
    "eye":    PreprocessingConfig(denoise=True, clahe=True),
    "chest":  PreprocessingConfig(target_size=(512, 512), clahe=True),
    "dental": PreprocessingConfig(target_size=(640, 640)),   # YOLO
    "oral":   PreprocessingConfig(enhance_contrast=True),
    "burns":  PreprocessingConfig(enhance_contrast=True, denoise=True),
    "wounds": PreprocessingConfig(denoise=True),
}


class ImagePreprocessor:
    """Applies the correct preprocessing pipeline for a given medical category."""

    def __init__(self, category: str) -> None:
        self.config = CATEGORY_CONFIGS.get(category, PreprocessingConfig())

    def preprocess(self, image: Image.Image) -> np.ndarray:
        """
        Returns a normalised float32 numpy array of shape (C, H, W).
        """
        img = image.convert("RGB")

        # Optional: contrast enhancement
        if self.config.enhance_contrast:
            img = ImageEnhance.Contrast(img).enhance(1.4)
            img = ImageEnhance.Sharpness(img).enhance(1.2)

        # Convert to numpy for OpenCV operations
        arr = np.array(img, dtype=np.uint8)

        # Optional: CLAHE (adaptive histogram equalisation per channel)
        if self.config.clahe:
            arr = self._apply_clahe(arr)

        # Optional: bilateral denoising
        if self.config.denoise:
            arr = cv2.bilateralFilter(arr, d=9, sigmaColor=75, sigmaSpace=75)

        # Resize
        arr = cv2.resize(arr, self.config.target_size, interpolation=cv2.INTER_LINEAR)

        # Normalise to [0, 1] and apply ImageNet mean/std
        arr = arr.astype(np.float32) / 255.0
        mean = np.array(self.config.mean, dtype=np.float32)
        std  = np.array(self.config.std,  dtype=np.float32)
        arr  = (arr - mean) / std

        # HWC → CHW
        return arr.transpose(2, 0, 1)

    @staticmethod
    def _apply_clahe(arr: np.ndarray) -> np.ndarray:
        """Apply CLAHE to each channel independently."""
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        channels = cv2.split(arr)
        enhanced = [clahe.apply(ch) for ch in channels]
        return cv2.merge(enhanced)

    # ── Image Quality Checks ────────────────────────────────
    @staticmethod
    def check_quality(image: Image.Image) -> dict:
        """
        Returns quality metrics used by the QualityChecker UI component.
        All metrics are 0–100 scores.
        """
        arr = np.array(image.convert("RGB"), dtype=np.uint8)
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)

        # Blur: Laplacian variance (higher = sharper)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        blur_score = min(100, laplacian_var / 5)

        # Brightness: mean pixel intensity
        brightness = float(gray.mean())
        brightness_score = 100 - abs(brightness - 128)

        # Resolution: based on pixel count
        w, h = image.size
        px = w * h
        resolution_score = min(100, px / 5000)

        # Contrast: std deviation of pixel values
        contrast = float(gray.std())
        contrast_score = min(100, contrast / 0.8)

        return {
            "blur":       round(blur_score, 1),
            "brightness": round(brightness_score, 1),
            "resolution": round(resolution_score, 1),
            "contrast":   round(contrast_score, 1),
            "overall":    round((blur_score + brightness_score + resolution_score + contrast_score) / 4, 1),
        }
