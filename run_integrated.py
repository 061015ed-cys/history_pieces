from __future__ import annotations

import json
import mimetypes
import os
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

from model_runtime import health as model_health
from model_runtime import predict as model_predict


ROOT = Path(__file__).resolve().parent
LLM_ROOT = ROOT / "llm" / "history_pieces_LLM-main"
LLM_SOURCE = LLM_ROOT / "src"
CHATBOT_WEB_ROOT = LLM_SOURCE / "history_chatbot" / "web" / "static"
CHATBOT_ASSET_ROOT = LLM_SOURCE / "history_chatbot" / "chat" / "static" / "assets"

PIECE_CHAT_CONTEXT = {
    1: {"current_place_id": "MST", "current_piece_id": "history-piece-1"},
    2: {"current_place_id": "HNB", "current_piece_id": "history-piece-2"},
    3: {"current_place_id": "MMH2", "current_piece_id": "history-piece-3"},
}

_CHAT_SERVICE: Any | None = None
_CHAT_JOURNEYS: Any | None = None
_CHAT_RUNTIME_ERROR = ""
_CHAT_RUNTIME_LOCK = threading.Lock()
_CHAT_SESSION_PIECES: dict[str, int] = {}


def initialize_chat_runtime() -> Any | None:
    """Load the supplied History Pieces LLM/RAG runtime once."""
    global _CHAT_SERVICE, _CHAT_JOURNEYS, _CHAT_RUNTIME_ERROR
    if (_CHAT_SERVICE is not None and _CHAT_JOURNEYS is not None) or _CHAT_RUNTIME_ERROR:
        return _CHAT_SERVICE
    with _CHAT_RUNTIME_LOCK:
        if (_CHAT_SERVICE is not None and _CHAT_JOURNEYS is not None) or _CHAT_RUNTIME_ERROR:
            return _CHAT_SERVICE
        try:
            if not LLM_SOURCE.is_dir():
                raise FileNotFoundError("LLM_SOURCE_MISSING")
            source_path = str(LLM_SOURCE)
            if source_path not in sys.path:
                sys.path.insert(0, source_path)

            from history_chatbot.chat.orchestrator import ConversationalRagOrchestrator
            from history_chatbot.chat.demo_journey import InMemoryDemoJourneyProvider
            from history_chatbot.chat.service import ChatApplicationService
            from history_chatbot.chat.session import SessionStore
            from history_chatbot.models.factory import build_llm_from_environment
            from history_chatbot.retrieval.service import HybridRetrievalService, RetrievalConfig
            from history_chatbot.runtime import RuntimeMode

            mode = RuntimeMode.DEVELOPMENT
            config = RetrievalConfig(
                runtime_mode=mode.value,
                local_storage_path=LLM_ROOT / "data" / "development_real" / "retrieval_index",
                index_ready_path=LLM_ROOT / "data" / "development_real" / "index_ready",
                development_chunks_path=LLM_ROOT / "data" / "development_real" / "index_ready" / "chunks.jsonl",
                minimum_score=0.20,
                minimum_dense_score=0.72,
                final_top_k=5,
                max_chunks_per_document=2,
            )
            retrieval = HybridRetrievalService(config)
            if retrieval.validate_index():
                retrieval.build_index()
            sessions = SessionStore(mode, path=None)
            orchestrator = ConversationalRagOrchestrator(
                retrieval,
                build_llm_from_environment(mode, environ=os.environ),
                sessions,
                mode=mode,
                max_chunks_per_document=config.max_chunks_per_document,
            )
            _CHAT_SERVICE = ChatApplicationService(orchestrator)
            _CHAT_JOURNEYS = InMemoryDemoJourneyProvider()
        except Exception as error:  # pragma: no cover - environment dependent
            _CHAT_RUNTIME_ERROR = f"{type(error).__name__}: {error}"
    return _CHAT_SERVICE


def chat_health() -> dict[str, Any]:
    service = initialize_chat_runtime()
    if service is None:
        return {"enabled": False, "error": _CHAT_RUNTIME_ERROR}
    try:
        readiness = service.readiness()
    except Exception as error:  # pragma: no cover - defensive health boundary
        return {"enabled": False, "error": f"{type(error).__name__}: {error}"}
    return {
        "enabled": True,
        "separatePieceSessions": True,
        "pieces": [1, 2, 3],
        "status": readiness.get("status"),
        "backend": readiness.get("llm_status"),
    }

def inject_index() -> bytes:
    """Serve the self-contained final integration page."""
    return (ROOT / "index.html").read_bytes()


def requested_chat_piece(referer: str | None) -> int:
    """Resolve the piece selected by the main experience's chatbot button."""
    try:
        value = int(parse_qs(urlparse(referer or "").query).get("piece", ["1"])[0])
    except (TypeError, ValueError):
        value = 1
    return value if value in PIECE_CHAT_CONTEXT else 1


def reference_chat_session(body: dict[str, Any], referer: str | None) -> dict[str, Any]:
    service = initialize_chat_runtime()
    if service is None or _CHAT_JOURNEYS is None:
        raise RuntimeError(f"CHAT_RUNTIME_UNAVAILABLE: {_CHAT_RUNTIME_ERROR}")
    locale = "zh-CN" if str(body.get("locale", "ko")).lower() == "zh-cn" else "ko"
    session = service.orchestrator.sessions.create(locale)
    state = _CHAT_JOURNEYS.create(session.session_id, locale)
    for _ in range(requested_chat_piece(referer) - 1):
        state = _CHAT_JOURNEYS.apply_action(session.session_id, "GO_NEXT_PIECE", {})
    return state.to_dict()


def reference_chat_message(body: dict[str, Any], chat_mode: str) -> dict[str, Any]:
    service = initialize_chat_runtime()
    if service is None or _CHAT_JOURNEYS is None:
        raise RuntimeError(f"CHAT_RUNTIME_UNAVAILABLE: {_CHAT_RUNTIME_ERROR}")
    session_id = str(body.get("session_id") or "")
    message = str(body.get("user_message") or body.get("message") or "").strip()
    if not session_id:
        raise ValueError("session_id가 필요합니다.")
    if not message:
        raise ValueError("user_message가 필요합니다.")
    state = _CHAT_JOURNEYS.get(session_id)
    response = service.chat(
        {
            "user_query": message,
            "session_id": session_id,
            "locale": state.locale,
            "conversation_mode": chat_mode,
            "screen_type": chat_mode,
            "current_place_id": state.current_place_id,
            "current_piece_id": state.current_piece_id,
            "visited_piece_ids": tuple(state.completed_piece_ids),
            "current_journey_step": state.current_journey_step,
            "available_capabilities": state.available_capabilities,
            "return_target": body.get("return_target"),
        }
    )
    state.temporary_context_state = list(
        dict.fromkeys(state.temporary_context_state + list(response.get("context_state", ())))
    )
    response["situation_id"] = response["primary_situation_id"]
    response["piece_ui_state" if chat_mode == "piece_chat" else "free_ui_state"] = response["ui_state"]
    return response


def reference_chat_transition(body: dict[str, Any]) -> dict[str, Any]:
    if initialize_chat_runtime() is None or _CHAT_JOURNEYS is None:
        raise RuntimeError(f"CHAT_RUNTIME_UNAVAILABLE: {_CHAT_RUNTIME_ERROR}")
    session_id = str(body.get("session_id") or "")
    state = _CHAT_JOURNEYS.get(session_id)
    from_mode = str(body.get("from_mode") or state.chat_mode)
    to_mode = str(body.get("to_mode") or "")
    if from_mode == "piece_chat" and to_mode == "free_chat":
        action = "OPEN_FREE_CHAT"
    elif from_mode == "free_chat" and to_mode in {"piece_chat", "game"}:
        action = "RETURN_TO_GAME"
    else:
        raise ValueError("지원하지 않는 mode transition입니다.")
    updated = _CHAT_JOURNEYS.apply_action(session_id, action, body)
    return {
        "request_state": "success",
        "action_code": action,
        "game_state_mutation": False,
        "transition": body.get("mode_transition"),
        "session": updated.to_dict(),
    }


def reference_journey_action(body: dict[str, Any]) -> dict[str, Any]:
    if initialize_chat_runtime() is None or _CHAT_JOURNEYS is None:
        raise RuntimeError(f"CHAT_RUNTIME_UNAVAILABLE: {_CHAT_RUNTIME_ERROR}")
    session_id = str(body.get("session_id") or "")
    action_code = str(body.get("action_code") or "")
    if not action_code:
        raise ValueError("action_code가 필요합니다.")
    before = _CHAT_JOURNEYS.get(session_id).to_dict()
    state = _CHAT_JOURNEYS.apply_action(session_id, action_code, body)
    changed = (
        before["current_piece_id"] != state.current_piece_id
        or before["completed_piece_ids"] != tuple(state.completed_piece_ids)
    )
    return {
        "request_state": "success",
        "action_code": action_code,
        "game_state_mutation": changed,
        "session": state.to_dict(),
    }


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

    def send_file(self, path: Path) -> None:
        data = path.read_bytes()
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        if content_type.startswith("text/") or content_type in {"application/javascript", "application/json"}:
            content_type += "; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        clean_path = self.path.split("?", 1)[0]
        if clean_path == "/health":
            self.send_json(200, {"status": "ok", "service": "history-pieces", "chat_modes": ["piece_chat", "free_chat"]})
            return
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
                    "chatRuntime": chat_health(),
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
        if clean_path in {"/chatbot", "/chatbot/"}:
            self.send_file(CHATBOT_WEB_ROOT / "index.html")
            return
        if clean_path in {"/static/styles.css", "/static/app.js"}:
            self.send_file(CHATBOT_WEB_ROOT / Path(clean_path).name)
            return
        if clean_path.startswith("/assets/backgrounds/") or clean_path.startswith("/assets/giroksae/"):
            relative = Path(clean_path.removeprefix("/assets/"))
            candidate = (CHATBOT_ASSET_ROOT / relative).resolve()
            if CHATBOT_ASSET_ROOT.resolve() not in candidate.parents or not candidate.is_file():
                self.send_json(404, {"error_code": "not_found", "message": "정적 파일을 찾을 수 없습니다."})
                return
            self.send_file(candidate)
            return
        if clean_path.startswith("/api/session/"):
            try:
                if initialize_chat_runtime() is None or _CHAT_JOURNEYS is None:
                    raise RuntimeError(f"CHAT_RUNTIME_UNAVAILABLE: {_CHAT_RUNTIME_ERROR}")
                session_id = unquote(clean_path.removeprefix("/api/session/"))
                state = _CHAT_JOURNEYS.get(session_id)
                expected_piece_id = f"demo-piece-{requested_chat_piece(self.headers.get('Referer'))}"
                if state.current_piece_id != expected_piece_id:
                    self.send_json(404, {"error_code": "session_piece_mismatch", "message": "선택한 조각의 새 대화 세션이 필요합니다."})
                    return
                self.send_json(200, state.to_dict())
            except Exception as error:
                status = int(getattr(error, "status_code", 500))
                self.send_json(status, {"error_code": getattr(error, "error_code", "chat_runtime_failed"), "message": str(error)})
            return
        super().do_GET()

    def do_POST(self) -> None:
        clean_path = self.path.split("?", 1)[0]
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 25 * 1024 * 1024:
                raise ValueError("REQUEST_TOO_LARGE")
            body = json.loads(self.rfile.read(length).decode("utf-8"))
            if not isinstance(body, dict):
                raise ValueError("JSON_OBJECT_REQUIRED")
            if clean_path == "/api/piece-detect":
                piece = int(body.get("piece", 0))
                self.send_json(200, model_predict(piece, str(body.get("imageBase64") or "")))
                return
            if clean_path == "/api/session":
                self.send_json(200, reference_chat_session(body, self.headers.get("Referer")))
                return
            if clean_path == "/api/chat/piece":
                self.send_json(200, reference_chat_message(body, "piece_chat"))
                return
            if clean_path == "/api/chat/free":
                self.send_json(200, reference_chat_message(body, "free_chat"))
                return
            if clean_path == "/api/chat/transition":
                self.send_json(200, reference_chat_transition(body))
                return
            if clean_path == "/api/journey/action":
                self.send_json(200, reference_journey_action(body))
                return
            if clean_path == "/api/chat/session":
                service = initialize_chat_runtime()
                if service is None:
                    self.send_json(503, {"error": "CHAT_RUNTIME_UNAVAILABLE", "details": _CHAT_RUNTIME_ERROR})
                    return
                piece = int(body.get("piece", 0))
                if piece not in PIECE_CHAT_CONTEXT:
                    raise ValueError("INVALID_CHAT_PIECE")
                locale = "zh-CN" if str(body.get("locale", "ko")).lower() == "zh-cn" else "ko"
                session = service.orchestrator.sessions.create(locale)
                _CHAT_SESSION_PIECES[session.session_id] = piece
                self.send_json(
                    200,
                    {
                        "session_id": session.session_id,
                        "piece": piece,
                        **PIECE_CHAT_CONTEXT[piece],
                    },
                )
                return
            if clean_path == "/api/chat/message":
                service = initialize_chat_runtime()
                if service is None:
                    self.send_json(503, {"error": "CHAT_RUNTIME_UNAVAILABLE", "details": _CHAT_RUNTIME_ERROR})
                    return
                session_id = str(body.get("session_id") or "")
                piece = int(body.get("piece", 0))
                if piece not in PIECE_CHAT_CONTEXT:
                    raise ValueError("INVALID_CHAT_PIECE")
                if _CHAT_SESSION_PIECES.get(session_id) != piece:
                    self.send_json(409, {"error": "CHAT_SESSION_PIECE_MISMATCH", "piece": piece})
                    return
                message = str(body.get("message") or "").strip()
                if not message:
                    raise ValueError("CHAT_MESSAGE_REQUIRED")
                chat_mode = "free_chat" if str(body.get("chat_mode", "piece_chat")) == "free_chat" else "piece_chat"
                locale = "zh-CN" if str(body.get("locale", "ko")).lower() == "zh-cn" else "ko"
                context = PIECE_CHAT_CONTEXT[piece]
                payload = {
                    "user_query": message,
                    "session_id": session_id,
                    "locale": locale,
                    "top_k": 3,
                    "conversation_mode": chat_mode,
                    "screen_type": chat_mode,
                    "current_place_id": context["current_place_id"],
                    "current_piece_id": context["current_piece_id"],
                    "visited_piece_ids": tuple(
                        PIECE_CHAT_CONTEXT[number]["current_piece_id"]
                        for number in range(1, piece)
                    ),
                    "current_journey_step": f"piece_{piece}_reflection",
                    "return_target": "wire-reflection-page",
                    "available_capabilities": (),
                }
                result = service.chat(payload)
                result["piece"] = piece
                self.send_json(200, result)
                return
            self.send_json(404, {"error": "NOT_FOUND"})
        except ValueError as error:
            self.send_json(400, {"error": "INVALID_REQUEST", "error_code": "invalid_request", "message": str(error), "details": str(error)})
        except Exception as error:
            status = int(getattr(error, "status_code", 500))
            self.send_json(
                status,
                {
                    "error": "INTEGRATED_RUNTIME_FAILED",
                    "error_code": getattr(error, "error_code", "integrated_runtime_failed"),
                    "message": getattr(error, "message", str(error)),
                    "details": str(error),
                },
            )


if __name__ == "__main__":
    # Use a dedicated port so an older History Pieces server cannot be shown.
    port = 5517
    initialize_chat_runtime()
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}/?build=piece-chat-llm-v1"
    print(f"History Pieces final integration: {url}")
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
