(function installFinalUiConsistency0815(global) {
  "use strict";

  if (global.__historyPiecesFinalUi0815Installed) return;
  global.__historyPiecesFinalUi0815Installed = true;

  const ORDINAL_KO = ["", "첫 번째 조각", "두 번째 조각", "세 번째 조각"];
  const MODERN_KO = ["", "목포역", "목포 대중음악의 전당", "목포근대역사관 2관"];
  const HISTORIC_KO = ["", "목포역", "구 호남은행 목포지점", "구 동양척식주식회사 목포지점"];
  const MODERN_ZH = ["", "木浦站", "木浦大众音乐殿堂", "木浦近代历史馆2馆"];
  const HISTORIC_ZH = ["", "木浦站", "旧湖南银行木浦支店", "旧东洋拓殖株式会社木浦支店"];
  const AFTER_TIMETRACE = new Set([
    "wire-piece-acquired-page", "wire-record-intro-page", "wire-video-confirm-page",
    "wire-reflection-page", "wire-reflection-result-page", "wire-transition-page",
    "wire-surprise-quiz-page", "wire-surprise-result-page", "pdf-place-complete-page",
    "hp-replay-page"
  ]);

  function pieceFromPage(pageId) {
    const direct = String(pageId).match(/^(?:piece-|record-)([123])(?:-|$)/);
    if (direct) return Number(direct[1]);
    return Math.min(3, Math.max(1, Number(global.appState?.currentPiece) || 1));
  }

  function isMissionScreen(pageId) {
    return /^(?:unlock|place-story-comic|quiz|quiz-result)-page$/.test(pageId);
  }

  function isPieceScreen(pageId) {
    return /^(?:piece-[123]-(?:mission|photo-guide|upload|ai-result|comic)-page|record-[123]-page|wire-(?:photo-confirm|place-loading|piece-acquired|record-intro|video-confirm|reflection|reflection-result|transition|surprise-quiz|surprise-result)-page|pdf-place-complete-page|hp-replay-page)$/.test(pageId);
  }

  function headerLabel(piece, historic) {
    const chinese = global.appState?.language === "zh-CN";
    if (chinese) return `第${piece}个故事碎片 · ${(historic ? HISTORIC_ZH : MODERN_ZH)[piece]}`;
    return `${ORDINAL_KO[piece]} · ${(historic ? HISTORIC_KO : MODERN_KO)[piece]}`;
  }

  function normalizeHeader(pageId) {
    const page = document.getElementById(pageId);
    if (!page) return;
    if (!pageId || !isPieceScreen(pageId) || pageId.includes("timetrace") || pageId === "piece-overlay-page" || isMissionScreen(pageId)) {
      page.classList.remove("hp-unified-piece-header");
      return;
    }
    const label = page.querySelector(".screen-layout > .ornament-label, .screen-layout > [data-guide-label]");
    const title = page.querySelector(".screen-layout > .mini-title, .screen-layout > .setup-title");
    if (!label || !title) return;
    const piece = pieceFromPage(pageId);
    const historic = AFTER_TIMETRACE.has(pageId) || /^piece-[123]-comic-page$/.test(pageId) || /^record-[123]-page$/.test(pageId);
    label.textContent = headerLabel(piece, historic);
    page.classList.add("hp-unified-piece-header");
  }

  function normalizeCompletionCopy(pageId) {
    if (pageId !== "pdf-place-complete-page") return;
    const piece = Math.min(3, Math.max(1, Number(global.appState?.currentPiece) || 1));
    const note = document.querySelector("#pdf-place-complete-page .giroksae-note p");
    if (note && piece < 3 && global.appState?.language !== "zh-CN") {
      note.textContent = note.textContent.replace("다음 단서는", "다음 조각은");
    }
  }

  function resetPiecePhoto(piece) {
    const state = global.appState || {};
    const key = `piece${piece}`;
    const previous = state.photos?.[key];
    if (typeof global.releasePreviewUrl === "function") global.releasePreviewUrl(previous);
    if (state.photos) state.photos[key] = null;
    if (state.aiResults) state.aiResults[piece] = null;
    state.usingSamplePhoto = false;
    state.samplePhotoPiece = null;
    const input = document.getElementById(`piece-${piece}-photo-input`);
    if (input) input.value = "";
    document.querySelectorAll(`#piece-${piece}-upload-page .camera-preview, #wire-photo-confirm-preview`).forEach((image) => {
      image.removeAttribute("src");
      image.classList.add("hidden");
    });
    document.getElementById("wire-photo-confirm-sample")?.classList.add("hidden");
  }

  function renderActive(pageId) {
    if (pageId === "country-page") {
      const label = document.querySelector("#country-page .ornament-label");
      if (label) label.textContent = global.appState?.language === "zh-CN" ? "旅行者设置" : "여행자 설정";
    }
    normalizeHeader(pageId);
    normalizeCompletionCopy(pageId);
  }

  function onPageChange(event) {
    renderActive(String(event.detail?.pageId || ""));
  }

  function onClick(event) {
    const camera = event.target.closest("[data-guide-open-camera]");
    if (camera) {
      resetPiecePhoto(Number(camera.closest("[data-guide-piece]")?.dataset.guidePiece || 1));
      return;
    }
    const retry = event.target.closest("[id^='piece-'][id$='-retry-btn']");
    if (!retry) return;
    const match = retry.id.match(/^piece-([123])-retry-btn$/);
    if (!match) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const piece = Number(match[1]);
    resetPiecePhoto(piece);
    global.showPage?.(`piece-${piece}-upload-page`);
  }

  function install() {
    global.addEventListener("historypieces:pagechange", onPageChange);
    document.addEventListener("click", onClick, true);
    renderActive(document.querySelector(".page.active")?.id || "");
    global.HistoryPiecesFinalUi0815 = Object.freeze({ renderActive, resetPiecePhoto });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})(window);
