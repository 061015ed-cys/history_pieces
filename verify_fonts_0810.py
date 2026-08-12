from __future__ import annotations

import hashlib
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
FONT_CSS = ROOT / "addons/history-pieces-fonts-0810.css"
INDEX = ROOT / "index.html"

EXPECTED_HASHES = {
    "assets/fonts/AritaBuriKR-Bold.ttf": "65e5e92a0fdc2990e04e4ce32f8903d9424081f51359cf3961eb188e8147b669",
    "assets/fonts/AritaBuriKR-SemiBold.ttf": "bfcb191be36bc407c7059bcf146d24bf116240afcf4b212fec4aae4cdb1831d6",
    "assets/fonts/MuseumClassicM.TTF": "bc4c85dcd9470401636e476c332509d5792f6b523f34e8ff040c69061fe2aa95",
    "addons/timetrace/dist/timetrace.css": "6b37f23e2c040099b6d729e0b13b59e260d72d77a244bdbf522148f1e49d40da",
    "addons/timetrace-host-0807.css": "f961b1136c628110608a424bdc546fea7e3b3f3e18d867fbdd2a827d42b68efb",
}

errors: list[str] = []


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


for relative, expected in EXPECTED_HASHES.items():
    path = ROOT / relative
    if not path.is_file():
        errors.append(f"MISSING: {relative}")
    elif sha256(path) != expected:
        errors.append(f"HASH_MISMATCH: {relative}")

font_dir = ROOT / "assets/fonts"
for forbidden in ["MuseumClassicB.TTF", "MuseumClassicL.TTF"]:
    if (font_dir / forbidden).exists():
        errors.append(f"FORBIDDEN_FONT_FILE: {forbidden}")

css = FONT_CSS.read_text(encoding="utf-8") if FONT_CSS.is_file() else ""
html = INDEX.read_text(encoding="utf-8") if INDEX.is_file() else ""

for required in [
    "MuseumClassicM.TTF",
    "AritaBuriKR-SemiBold.ttf",
    "AritaBuriKR-Bold.ttf",
    ".page:not(#timetrace-page)",
    "HistoryPieces Museum Classic",
    "HistoryPieces Arita Buri",
]:
    if required not in css:
        errors.append(f"FONT_CSS_MARKER_MISSING: {required}")

for forbidden in ["MuseumClassicB", "MuseumClassicL"]:
    if forbidden in css or forbidden in html:
        errors.append(f"FORBIDDEN_FONT_REFERENCE: {forbidden}")

if re.search(r"(^|\})\s*body\s*\{", css):
    errors.append("GLOBAL_BODY_FONT_RULE_FOUND")

font_link = "addons/history-pieces-fonts-0810.css"
if html.count(font_link) != 1:
    errors.append("FONT_STYLESHEET_LINK_COUNT_INVALID")

if errors:
    print("History Pieces font verification: FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("History Pieces font verification: PASSED")
print("- MuseumClassicM: titles, questions, and choice text")
print("- Arita Buri KR SemiBold/Bold: body, Giroksae copy, buttons, labels, and emphasis")
print("- MuseumClassicB/L: absent from assets and CSS")
print("- TimeTrace font CSS/host CSS: original hashes preserved")
