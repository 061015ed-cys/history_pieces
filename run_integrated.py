from __future__ import annotations

import json
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from model_runtime import health as model_health
from model_runtime import predict as model_predict


ROOT = Path(__file__).resolve().parent

def inject_index() -> bytes:
    """Serve the self-contained final integration page."""
    return (ROOT / "index.html").read_bytes()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status: int, payload: dict[str, Any]) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        clean_path = self.path.split("?", 1)[0]
        if clean_path == "/api/health":
            self.send_json(
                200,
                {
                    "ok": True,
                    "wireframeFlow": "2026-08-07",
                    "pieceWebtoons": "fixed-local-assets",
                    "piece1WebtoonFrames": 4,
                    "generativeApi": False,
                    "samplePhotoMode": "icon-text-placeholder",
                    "archivePhotoMode": "source-verified-assets-only",
                    "placeStoryPhotoComposition": "not-implemented-by-request",
                    "timeTrace": {
                        "enabled": True,
                        "places": ["MST", "HNB", "MMH2"],
                        "afterPlaceConfirmation": True,
                    },
                    "modelRuntime": model_health(),
                },
            )
            return
        if clean_path in {"/", "/index.html"}:
            data = inject_index()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().do_GET()

    def do_POST(self) -> None:
        clean_path = self.path.split("?", 1)[0]
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 25 * 1024 * 1024:
                raise ValueError("REQUEST_TOO_LARGE")
            body = json.loads(self.rfile.read(length).decode("utf-8"))
            if clean_path == "/api/piece-detect":
                piece = int(body.get("piece", 0))
                self.send_json(200, model_predict(piece, str(body.get("imageBase64") or "")))
                return
            self.send_json(404, {"error": "NOT_FOUND"})
        except Exception as error:
            self.send_json(500, {"error": "MODEL_RUNTIME_FAILED", "details": str(error)})


if __name__ == "__main__":
    # Use a dedicated port so an older History Pieces server cannot be shown.
    port = 5517
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}/?build=place-names-fixed-webtoon-v3"
    print(f"History Pieces final integration: {url}")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
