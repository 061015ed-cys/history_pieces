from __future__ import annotations

import ast
import json
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
errors: list[str] = []


required_files = [
    "index.html",
    "style.css",
    "script.js",
    "run_integrated.py",
    "model_runtime.py",
    "addons/integrated-ui-0725.css",
    "addons/integrated-ui-0725.js",
    "addons/dohun-model-bridge-0725.js",
    "addons/fixed-webtoon-runtime-0807.js",
    "addons/wireframe-flow-0807.js",
    "addons/timetrace-host-0807.js",
    "addons/timetrace-host-0807.css",
    "addons/timetrace/dist/timetrace.js",
    "addons/timetrace/dist/adapters.js",
    "addons/timetrace/dist/timetrace.css",
    "addons/timetrace/config/places-integrated.json",
    "addons/webtoon-reference/piece-1/HP_C01_FIRST_ASSIGNMENT.png",
    "addons/webtoon-reference/piece-1/HP_C02_MOKPO_STATION_CROWD_OBSERVATION_FINAL.png",
    "addons/webtoon-reference/piece-1/HP_C03_MST_WAIT_FINAL.png",
    "addons/webtoon-reference/piece-1/HP_C04_MST_SHOOT.png",
    "addons/webtoon-reference/piece-2-style.jpg",
    "addons/webtoon-reference/piece-3-style.jpg",
    "assets/images/guide_strict.png",
    "assets/images/giroksae-mission.png",
    "assets/images/giroksae-reward.png",
    "assets/images/giroksae-record.png",
    "assets/videos/sample-record-1.mp4",
    "assets/videos/sample-record-2.mp4",
    "assets/videos/sample-record-3.mp4",
    "RUN_ONE_CLICK.bat",
    "START_NO_INSTALL.bat",
    "tools/static_server.ps1",
]

for relative in required_files:
    if not (ROOT / relative).is_file():
        errors.append(f"MISSING: {relative}")

for forbidden in [
    ".env",
    "addons/webtoon-runtime-0725.js",
    "modules/yuseok-ai-0716.js",
    "modules/yuseok-story-renderer-0716.js",
    "assets/images/first-place-sample.svg",
    "assets/images/ai-samples/sample_station.svg",
    "assets/images/ai-samples/sample_music_hall.svg",
    "assets/images/ai-samples/sample_history_museum.svg",
]:
    if (ROOT / forbidden).exists():
        errors.append(f"GENERATIVE_RUNTIME_REMAINS: {forbidden}")

for relative in ["run_integrated.py", "model_runtime.py", "verify_integrated.py"]:
    try:
        ast.parse((ROOT / relative).read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"PYTHON_SYNTAX: {relative}: {exc}")

for relative in [
    "assets/data/fallback-cn.json",
    "assets/data/fallback-ko.json",
    "assets/data/source-facts.json",
    "addons/data/approved-webtoon-script.json",
    "addons/data/fallback-ko-user-approved.json",
    "addons/data/source-facts-user-approved.json",
    "addons/model-contract.json",
    "addons/timetrace/config/places-integrated.json",
]:
    try:
        json.loads((ROOT / relative).read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"JSON_ERROR: {relative}: {exc}")

for relative in [
    "script.js",
    "modules/i18n.js",
    "modules/dohun-ai.js",
    "modules/journey-film-0715.js",
    "modules/yuseok-recommendation-0716.js",
    "addons/integrated-ui-0725.js",
    "addons/dohun-model-bridge-0725.js",
    "addons/fixed-webtoon-runtime-0807.js",
    "addons/wireframe-flow-0807.js",
    "addons/timetrace-host-0807.js",
    "addons/timetrace/dist/timetrace.js",
    "addons/timetrace/dist/adapters.js",
]:
    result = subprocess.run(
        ["node", "--check", str(ROOT / relative)],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        errors.append(f"JAVASCRIPT_SYNTAX: {relative}: {result.stderr.strip()}")

html = (ROOT / "index.html").read_text(encoding="utf-8")
ids = re.findall(r'\bid=["\']([^"\']+)', html)
duplicates = sorted({value for value in ids if ids.count(value) > 1})
if duplicates:
    errors.append("DUPLICATE_HTML_ID: " + ", ".join(duplicates))

active_runtime = "\n".join(
    (ROOT / relative).read_text(encoding="utf-8")
    for relative in [
        "index.html",
        "script.js",
        "run_integrated.py",
        "addons/fixed-webtoon-runtime-0807.js",
        "addons/wireframe-flow-0807.js",
    ]
)
for marker in ["GEMINI_API_KEY", "generativelanguage.googleapis.com", 'fetch("/api/story"', "post_gemini("]:
    if marker in active_runtime:
        errors.append(f"GENERATIVE_API_MARKER: {marker}")

wireframe_source = (ROOT / "addons/wireframe-flow-0807.js").read_text(encoding="utf-8")
for marker in [
    "wire-photo-confirm-page",
    "wire-place-loading-page",
    "wire-piece-acquired-page",
    "wire-record-intro-page",
    "wire-video-confirm-page",
    "wire-reflection-page",
    "wire-transition-page",
    "wire-surprise-quiz-page",
    "BCA",
]:
    if marker not in wireframe_source:
        errors.append(f"WIREFRAME_MARKER_MISSING: {marker}")

timetrace_host = (ROOT / "addons/timetrace-host-0807.js").read_text(encoding="utf-8")
for marker in [
    '1: "MST"',
    '2: "HNB"',
    '3: "MMH2"',
    "places-integrated.json",
    "showSurpriseQuiz",
    "showAcquired",
]:
    if marker not in timetrace_host:
        errors.append(f"TIMETRACE_HOST_MARKER_MISSING: {marker}")
if "HistoryPiecesTimeTrace.open" not in wireframe_source:
    errors.append("TIMETRACE_NOT_CONNECTED_AFTER_PLACE_CONFIRMATION")
for marker in [
    'id="timetrace-page"',
    'id="timetrace-root"',
    "addons/timetrace/dist/timetrace.css",
    "addons/timetrace-host-0807.js",
]:
    if marker not in html:
        errors.append(f"TIMETRACE_HTML_MISSING: {marker}")

mascot_expectations = {
    "giroksae-mission.png": ("index.html", "addons/wireframe-flow-0807.js"),
    "giroksae-reward.png": ("index.html", "addons/wireframe-flow-0807.js"),
    "giroksae-record.png": ("index.html", "addons/wireframe-flow-0807.js"),
}
for asset_name, sources in mascot_expectations.items():
    for source_name in sources:
        source = html if source_name == "index.html" else wireframe_source
        if asset_name not in source:
            errors.append(f"GIROKSAE_MAPPING_MISSING: {asset_name}:{source_name}")
if "assets/images/guide_strict.png" in html or "assets/images/guide_strict.png" in wireframe_source:
    errors.append("OLD_GIROKSAE_PLACEHOLDER_STILL_CONNECTED")

launcher = (ROOT / "RUN_ONE_CLICK.bat").read_text(encoding="utf-8")
no_install_launcher = (ROOT / "START_NO_INSTALL.bat").read_text(encoding="utf-8")
static_server = (ROOT / "tools/static_server.ps1").read_text(encoding="utf-8")
for marker in ["START_NO_INSTALL.bat", "run_integrated.py"]:
    if marker not in launcher:
        errors.append(f"ONE_CLICK_LAUNCHER_MARKER_MISSING: {marker}")
for marker in ["static_server.ps1", "5517"]:
    if marker not in no_install_launcher:
        errors.append(f"NO_INSTALL_LAUNCHER_MARKER_MISSING: {marker}")
for marker in ["TcpListener", "application/javascript", "application/json", "video/mp4", "Content-Range"]:
    if marker not in static_server:
        errors.append(f"STATIC_SERVER_MARKER_MISSING: {marker}")

try:
    timetrace_manifest = json.loads((ROOT / "addons/timetrace/config/places-integrated.json").read_text(encoding="utf-8"))
    expected_places = {
        "MST": (1, "목포역", "목포역"),
        "HNB": (2, "목포 대중음악의 전당", "호남은행 목포지점"),
        "MMH2": (3, "목포근대역사관 2관", "동양척식주식회사 목포지점"),
    }
    for place_id, (piece, current_name, historical_name) in expected_places.items():
        place = timetrace_manifest["places"][place_id]
        contract = place["contract"]
        if contract.get("pieceNumber") != piece:
            errors.append(f"TIMETRACE_PIECE_MISMATCH: {place_id}")
        if contract.get("currentDisplayName") != current_name:
            errors.append(f"TIMETRACE_CURRENT_NAME_MISMATCH: {place_id}")
        if contract.get("historicalDisplayName") != historical_name:
            errors.append(f"TIMETRACE_HISTORICAL_NAME_MISMATCH: {place_id}")
        for field in ["currentImage", "historicalSourceImage", "alignedHistoricalRgba", "aiRestoredScene"]:
            asset_path = str(contract.get(field, "")).removeprefix("./")
            asset = ROOT / asset_path
            if not asset.is_file() or asset.stat().st_size < 1_000:
                errors.append(f"TIMETRACE_ASSET_INVALID: {place_id}:{field}")
    for video in timetrace_manifest.get("videos", []):
        video_path = str(video.get("path", "")).removeprefix("./")
        video_asset = ROOT / video_path
        if not video_asset.is_file() or video_asset.stat().st_size < 1_000_000:
            errors.append(f"TIMETRACE_VIDEO_INVALID: {video.get('id')}")
except Exception as exc:
    errors.append(f"TIMETRACE_MANIFEST_ERROR: {exc}")

fixed_runtime = (ROOT / "addons/fixed-webtoon-runtime-0807.js").read_text(encoding="utf-8")
for marker in [
    "HP_C01_FIRST_ASSIGNMENT.png",
    "HP_C02_MOKPO_STATION_CROWD_OBSERVATION_FINAL.png",
    "HP_C03_MST_WAIT_FINAL.png",
    "HP_C04_MST_SHOOT.png",
    "piece-2-style.jpg",
    "piece-3-style.jpg",
]:
    if marker not in fixed_runtime:
        errors.append(f"FIXED_WEBTOON_MISSING: {marker}")
if "piece-1-style.jpg" in fixed_runtime:
    errors.append("OLD_PIECE_1_WEBTOON_STILL_CONNECTED")

sample_sources = "\n".join(
    (ROOT / relative).read_text(encoding="utf-8")
    for relative in ["script.js", "modules/dohun-ai.js", "addons/wireframe-flow-0807.js"]
)
if "addons/webtoon-reference/" in sample_sources:
    errors.append("WEBTOON_ASSET_LEAKED_INTO_PHOTO_FLOW")
for marker in [
    "sample-photo://first",
    "sample-photo://piece-1",
    "sample-photo://piece-2",
    "sample-photo://piece-3",
]:
    if marker not in sample_sources:
        errors.append(f"SAMPLE_PLACEHOLDER_NOT_CONNECTED: {marker}")

for marker in [
    "assets/images/first-place-sample.svg",
    "assets/images/ai-samples/sample_station.svg",
    "assets/images/ai-samples/sample_music_hall.svg",
    "assets/images/ai-samples/sample_history_museum.svg",
    "assets/images/archive-landscape.jpg",
]:
    if marker in sample_sources or marker in wireframe_source:
        errors.append(f"GENERATED_SAMPLE_OR_WEBTOON_ARCHIVE_CONNECTED: {marker}")

if "sample-photo-placeholder" not in html or "wire-photo-confirm-sample" not in wireframe_source:
    errors.append("SAMPLE_PLACEHOLDER_UI_MISSING")

model_paths = [
    ROOT / "addons/models/first_piece_detection.pth",
    ROOT / "addons/models/second_piece_detection.pth",
    ROOT / "addons/models/third_piece_detection.pth",
]
for model_path in model_paths:
    if not model_path.is_file() or model_path.stat().st_size < 1_000_000:
        errors.append(f"MODEL_FILE_INVALID: {model_path.name}")

print("History Pieces wireframe integration verification")
if errors:
    print("FAILED")
    for error in errors:
        print("-", error)
    sys.exit(1)

print("PASSED")
print(f"- HTML IDs: {len(ids)}, duplicates: 0")
print("- Python / JavaScript / JSON syntax checks passed")
print("- Generative API runtime and key file removed")
print("- Piece 1 four-panel webtoon and Piece 2 / 3 fixed webtoon assets connected")
print("- Sample photo uses icon/text placeholders without generated image assets")
print("- Fixed webtoon assets isolated from sample, current-photo, and archive-photo routes")
print("- Wireframe photo, video, quiz, reflection, and transition screens connected")
print("- TimeTrace MST / HNB / MMH2 routes, approved assets, and post-completion branches connected")
print("- Three context-specific Giroksae images connected without the old placeholder runtime")
print("- One-click launcher includes a Windows no-install server with ES module, JSON, and video range support")
print("- Three PTH model files present")
