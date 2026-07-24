# MediVision AI — Backend

FastAPI backend for AI-assisted clinical screening.

## Quick Start

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API Docs**: http://localhost:8000/api/docs

## Architecture

```
backend/
├── main.py                  # FastAPI entry point
├── requirements.txt         # All Python dependencies
├── .env.example             # Environment template
├── app/
│   ├── core/
│   │   ├── config.py        # Pydantic settings
│   │   └── logging.py       # Loguru structured logging
│   ├── ai/
│   │   ├── predict.py       # Unified prediction service
│   │   ├── model_loader.py  # Dynamic model loader
│   │   ├── preprocessing.py # Category-aware preprocessing
│   │   ├── gradcam.py       # Grad-CAM heatmap engine
│   │   └── models/
│   │       ├── skin/        # EfficientNet-B4 (best.pt)
│   │       ├── eye/         # DenseNet-121 (best.pt)
│   │       ├── chest/       # ViT-B/16 (best.pt)
│   │       ├── dental/      # YOLOv8n (best.pt)
│   │       ├── oral/        # EfficientNet-B3 (best.pt)
│   │       ├── burns/       # U-Net ResNet34 (best.pt)
│   │       └── wounds/      # U-Net ResNet34 (best.pt)
│   ├── api/routes/
│   │   ├── health.py        # GET /health
│   │   ├── auth.py          # POST /auth/login, /auth/register
│   │   ├── predict.py       # POST /predict/{category}
│   │   ├── reports.py       # GET/DELETE /reports
│   │   └── hospitals.py     # GET /hospitals
│   ├── schemas/
│   │   └── schemas.py       # All Pydantic models
│   └── services/
│       └── recommendation.py # Hospital → specialist mapping
└── tests/
    └── test_api.py          # pytest test suite
```

## Demo Mode

When `DEMO_MODE=true` (default), all prediction endpoints return curated mock data for all 7 medical categories without requiring trained model weights.

## Adding Real Model Weights

1. Train / download a model for a category
2. Place the weights file at `backend/app/ai/models/<category>/best.pt`
3. Set `DEMO_MODE=false` in `.env`
4. Restart the server — the model loads automatically

## Running Tests

```bash
pytest backend/tests/ -v
```
