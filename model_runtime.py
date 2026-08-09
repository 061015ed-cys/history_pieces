from __future__ import annotations

import base64
import io
import json
from pathlib import Path
from threading import Lock
from typing import Any

ROOT = Path(__file__).resolve().parent
CONTRACT_PATH = ROOT / "addons" / "model-contract.json"

_MODEL_CACHE: dict[int, Any] = {}
_MODEL_LOCK = Lock()
_CONTRACT: dict[str, Any] | None = None


def load_contract() -> dict[str, Any]:
    global _CONTRACT
    if _CONTRACT is None:
        _CONTRACT = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    return _CONTRACT


def _imports() -> tuple[Any, Any, Any, Any, Any]:
    try:
        import torch
        from torch import nn
        from torchvision import models, transforms
        from PIL import Image, ImageOps
    except Exception as exc:  # pragma: no cover - environment dependent
        raise RuntimeError(
            "MODEL_DEPENDENCY_MISSING: torch, torchvision, Pillow 설치가 필요합니다. "
            "install_integrated.bat을 먼저 실행해 주세요."
        ) from exc
    return torch, nn, models, transforms, (Image, ImageOps)


def _build_model(piece: int) -> tuple[Any, Any]:
    contract = load_contract()
    item = contract.get("pieces", {}).get(str(piece))
    if not isinstance(item, dict):
        raise ValueError(f"INVALID_PIECE: {piece}")

    torch, nn, models, _transforms, _pil = _imports()
    model = models.resnet50(weights=None)
    model.fc = nn.Sequential(nn.Dropout(0.5), nn.Linear(model.fc.in_features, 2))

    model_path = ROOT / str(item["model"])
    if not model_path.is_file():
        raise FileNotFoundError(f"MODEL_FILE_MISSING: {model_path.name}")

    state_dict = torch.load(model_path, map_location="cpu", weights_only=True)
    model.load_state_dict(state_dict, strict=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
    return model, device


def get_model(piece: int) -> tuple[Any, Any]:
    if piece in _MODEL_CACHE:
        return _MODEL_CACHE[piece]
    with _MODEL_LOCK:
        if piece not in _MODEL_CACHE:
            _MODEL_CACHE[piece] = _build_model(piece)
    return _MODEL_CACHE[piece]


def decode_data_url(data_url: str) -> bytes:
    if not isinstance(data_url, str) or not data_url.strip():
        raise ValueError("IMAGE_REQUIRED")
    if "," not in data_url:
        raise ValueError("INVALID_IMAGE_DATA_URL")
    header, encoded = data_url.split(",", 1)
    if ";base64" not in header:
        raise ValueError("IMAGE_MUST_BE_BASE64")
    try:
        data = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise ValueError("INVALID_IMAGE_BASE64") from exc
    if len(data) > 20 * 1024 * 1024:
        raise ValueError("IMAGE_TOO_LARGE")
    return data


def create_preprocess() -> Any:
    contract = load_contract()["input"]
    _torch, _nn, _models, transforms, _pil = _imports()
    return transforms.Compose(
        [
            transforms.Resize(int(contract["resize"])),
            transforms.CenterCrop(int(contract["centerCrop"])),
            transforms.ToTensor(),
            transforms.Normalize(contract["normalizeMean"], contract["normalizeStd"]),
        ]
    )


_PREPROCESS: Any | None = None


def predict(piece: int, data_url: str) -> dict[str, Any]:
    global _PREPROCESS
    contract = load_contract()
    item = contract.get("pieces", {}).get(str(piece))
    if not isinstance(item, dict):
        raise ValueError(f"INVALID_PIECE: {piece}")

    torch, _nn, _models, _transforms, pil = _imports()
    Image, ImageOps = pil
    raw = decode_data_url(data_url)
    try:
        image = Image.open(io.BytesIO(raw))
        image = ImageOps.exif_transpose(image).convert("RGB")
    except Exception as exc:
        raise ValueError("INVALID_IMAGE_FILE") from exc

    if _PREPROCESS is None:
        _PREPROCESS = create_preprocess()

    model, device = get_model(piece)
    tensor = _PREPROCESS(image).unsqueeze(0).to(device)
    with torch.inference_mode():
        logits = model(tensor)[0]
        probabilities = torch.softmax(logits, dim=0).detach().cpu().tolist()

    positive_index = int(contract["positiveClassIndex"])
    confidence = float(probabilities[positive_index])
    threshold = float(item["threshold"])
    success = confidence >= threshold

    return {
        "piece": piece,
        "label": item["targetLabel"] if success else item["failLabel"],
        "confidence": round(confidence, 6),
        "success": success,
        "verified": bool(success),
        "reason": (
            f"실제 {Path(item['model']).name} 모델 판별값이 기준 신뢰도 {threshold:.0%} 이상입니다."
            if success
            else f"실제 {Path(item['model']).name} 모델 판별값이 기준 신뢰도 {threshold:.0%} 미만입니다."
        ),
        "error": None,
        "meta": {
            "source": "pth_model",
            "architecture": contract["architecture"],
            "positiveClassIndex": positive_index,
            "threshold": threshold,
            "probabilities": [round(float(value), 6) for value in probabilities],
            "device": str(device),
        },
    }


def health() -> dict[str, Any]:
    contract = load_contract()
    model_files = {
        piece: (ROOT / info["model"]).is_file()
        for piece, info in contract.get("pieces", {}).items()
    }
    dependency_ok = True
    dependency_error = ""
    try:
        _imports()
    except Exception as exc:  # pragma: no cover
        dependency_ok = False
        dependency_error = str(exc)
    return {
        "dependencyOk": dependency_ok,
        "dependencyError": dependency_error,
        "modelFiles": model_files,
        "loadedPieces": sorted(_MODEL_CACHE.keys()),
        "contract": {
            "architecture": contract.get("architecture"),
            "classifier": contract.get("classifier"),
            "positiveClassIndex": contract.get("positiveClassIndex"),
        },
    }
