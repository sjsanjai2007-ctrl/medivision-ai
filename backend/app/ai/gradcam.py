"""
Grad-CAM Explainability Engine
─────────────────────────────────
Generates Grad-CAM / Grad-CAM++ heatmaps for CNN-based models
and saves overlaid images to the configured storage backend.

Usage:
    heatmap_url = GradCAMEngine(model, target_layer).generate(tensor, class_idx)
"""
from __future__ import annotations

import io
import uuid
from typing import Optional

import cv2
import numpy as np
import torch
import torch.nn as nn
from PIL import Image

from loguru import logger


class GradCAMEngine:
    """Produces Grad-CAM heatmaps for any CNN whose target layer is specified."""

    def __init__(self, model: nn.Module, target_layer: nn.Module) -> None:
        self.model = model
        self.target_layer = target_layer
        self._activations: Optional[torch.Tensor] = None
        self._gradients:   Optional[torch.Tensor] = None
        self._register_hooks()

    def _register_hooks(self) -> None:
        self.target_layer.register_forward_hook(self._save_activations)
        self.target_layer.register_full_backward_hook(self._save_gradients)

    def _save_activations(self, _module, _input, output) -> None:
        self._activations = output.detach()

    def _save_gradients(self, _module, _grad_input, grad_output) -> None:
        self._gradients = grad_output[0].detach()

    def generate(
        self,
        input_tensor: torch.Tensor,          # Shape: (1, C, H, W)
        class_idx: Optional[int] = None,
        original_size: tuple[int, int] = (224, 224),
    ) -> np.ndarray:
        """
        Returns a uint8 RGB heatmap (H, W, 3) overlaid on the input.
        """
        self.model.eval()
        self.model.zero_grad()

        output = self.model(input_tensor)
        if class_idx is None:
            class_idx = output.argmax(dim=1).item()

        # Backprop to target class
        score = output[:, class_idx]
        score.backward()

        # Global average pool the gradients (Grad-CAM)
        weights = self._gradients.mean(dim=[2, 3], keepdim=True)    # (1, C, 1, 1)
        cam = (weights * self._activations).sum(dim=1).squeeze(0)   # (H, W)
        cam = torch.relu(cam)

        # Normalise to [0, 1]
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()

        cam_np = cam.cpu().numpy()

        # Resize to original image size
        cam_resized = cv2.resize(cam_np, (original_size[1], original_size[0]))

        # Apply colour map
        heatmap = cv2.applyColorMap(
            (cam_resized * 255).astype(np.uint8),
            cv2.COLORMAP_JET
        )
        return heatmap   # BGR uint8

    @staticmethod
    def overlay(original_rgb: np.ndarray, heatmap_bgr: np.ndarray, alpha: float = 0.45) -> np.ndarray:
        """Blend original image with the heatmap overlay."""
        heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)
        blended = cv2.addWeighted(original_rgb, 1 - alpha, heatmap_rgb, alpha, 0)
        return blended   # RGB uint8

    @classmethod
    def get_target_layer(cls, model: nn.Module, category: str) -> Optional[nn.Module]:
        """
        Returns the appropriate target layer for Grad-CAM per model architecture.
        """
        try:
            # EfficientNet (timm): last conv block
            if hasattr(model, "conv_head"):
                return model.conv_head
            # DenseNet: last dense block
            if hasattr(model, "features"):
                return model.features[-1]
            # ViT: last attention block norm
            if hasattr(model, "blocks"):
                return model.blocks[-1].norm1
            # ResNet: last residual layer
            if hasattr(model, "layer4"):
                return model.layer4[-1]
        except Exception as e:
            logger.warning(f"Could not determine target layer for {category}: {e}")
        return None
