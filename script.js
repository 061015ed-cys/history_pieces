/* =========================================================
  History Pieces 본선 1차 통합본 JS
  발표용 화면 없음.
  화면 ID / 담당자 구역 / appState 통일.
========================================================= */

/* =========================================================
  [이경민] 공통 상태 관리
========================================================= */
const appState = {
  language: "ko",
  culture: "korea", // "korea" | "china"
  nickname: "여행자",

  currentPlace: "mokpo_station",

  photos: {
    first: null,
    piece1: null,
    piece2: null,
    piece3: null
  },

  records: {
    1: null,
    2: null,
    3: null
  },

  aiResults: {
    1: null,
    2: null,
    3: null
  },

  timeTraceResults: {
    1: null,
    2: null,
    3: null
  },

  currentPiece: 1,
  currentPlaceIndex: 1,
  chatEnabled: false,
  chatOpen: false,
  challengeResults: { 2: null, 3: null },
  emotionResponses: { 1: null, 2: null, 3: null },
  finalQuizOrder: [],
  selectedNextPlace: null,
  retryCounts: { 1: 0, 2: 0, 3: 0 },
  yuseokStories: { pieces: {}, place: null },

  collectedPieces: [],
  storyTags: ["관문", "원도심", "근대문화", "도보 이동"],

  reservedPlace: null,
  reservationUrl: null,
  recommendations: [],
  recommendation: null,
  journeyFilm: { blob: null, url: null, mimeType: null, isSynthesizing: false }
};

window.appState = appState;
const previewObjectUrls = new Map();
const SAMPLE_PHOTO_MARKERS = Object.freeze({
  first: "sample-photo://first",
  1: "sample-photo://piece-1",
  2: "sample-photo://piece-2",
  3: "sample-photo://piece-3"
});

function isSamplePhotoMarker(source) {
  return typeof source === "string" && source.startsWith("sample-photo://");
}

window.isHistoryPiecesSamplePhoto = isSamplePhotoMarker;

function uiText(key, params = {}) {
  if (window.HistoryPiecesI18n) {
    return window.HistoryPiecesI18n.t(key, appState.language, params);
  }
  return key;
}

window.historyPiecesText = uiText;

function resolvePreviewUrl(source) {
  if (isSamplePhotoMarker(source)) return "";
  if (typeof source === "string") return source;
  if (!(source instanceof Blob)) return "";
  if (!previewObjectUrls.has(source)) previewObjectUrls.set(source, URL.createObjectURL(source));
  return previewObjectUrls.get(source);
}

function releasePreviewUrl(source) {
  if (!(source instanceof Blob) || !previewObjectUrls.has(source)) return;
  URL.revokeObjectURL(previewObjectUrls.get(source));
  previewObjectUrls.delete(source);
}

/* =========================================================
  [이경민] 공통 화면 전환
========================================================= */
function showPage(pageId) {
  const target = document.getElementById(pageId);

  if (!target) {
    alert(uiText("screenMissing", { id: pageId }));
    return;
  }

  const previousPageId = window.__historyPiecesActivePage || null;

  document.querySelectorAll("video").forEach((video) => {
    if (typeof video.pause === "function") video.pause();
  });
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  target.classList.add("active");
  target.scrollTop = 0;
  window.scrollTo(0, 0);
  window.__historyPiecesActivePage = pageId;

  window.dispatchEvent(new CustomEvent("historypieces:pagechange", {
    detail: { pageId, previousPageId }
  }));

  if (pageId === "journey-film-page") {
    journeyPrepareClips();
    renderJourneyFilm();
  }

  if (pageId === "next-place-page") {
    renderNextPlaceRecommendation();
  }
}

let toastTimerId = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  if (toastTimerId) clearTimeout(toastTimerId);
  toastTimerId = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2000);
}

/* =========================================================
  [이경민 + 구도훈] 버튼 이벤트 라우팅
========================================================= */
document.addEventListener("click", (event) => {
  const nextTarget = event.target.closest("[data-next]");
  if (nextTarget) {
    if (nextTarget.dataset.resetFirstPhoto === "true") resetFirstPhoto();
    showPage(nextTarget.dataset.next);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const action = actionTarget.dataset.action;

  if (action === "confirm-country") {
    confirmCountry();
    return;
  }

  if (action === "save-nickname") {
    saveNickname();
    return;
  }

  if (action === "load-sample-first-photo") {
    loadSampleFirstPhoto();
    return;
  }

  if (action === "analyze-first-photo") {
    analyzeFirstPhoto();
    return;
  }

  if (action === "load-sample-piece-photo") {
    const pieceNumber = Number(actionTarget.dataset.piece);
    loadSamplePiecePhoto(pieceNumber);
    return;
  }

  if (action === "run-piece-ai") {
    const pieceNumber = Number(actionTarget.dataset.piece);
    runLocked(actionTarget, () => runPieceAiAndShowResult(pieceNumber));
    return;
  }

  // [구도훈 1차 추가] AI 판별 실패 시 재촬영 핸들링
  if (action === "retry-piece-photo") {
    const pieceNumber = Number(actionTarget.dataset.piece);
    appState.retryCounts[pieceNumber] += 1;
    resetPiecePhotoForRetry(pieceNumber);
    showPage(`piece-${pieceNumber}-upload-page`);
    return;
  }

  if (action === "force-piece-success") {
    forcePieceSuccess(Number(actionTarget.dataset.piece));
    return;
  }

  if (action === "unlock-piece-comic") {
    const pieceNumber = Number(actionTarget.dataset.piece);
    openPieceOverlay(pieceNumber);
    return;
  }

  if (action === "overlay-mode") {
    setOverlayMode(actionTarget.dataset.overlayMode);
    return;
  }

  if (action === "play-overlay") {
    playOverlayTransition();
    return;
  }

  if (action === "continue-piece-comic") {
    runLocked(actionTarget, () => unlockPieceComic(appState.currentPiece));
    return;
  }

  if (action === "load-sample-record") {
    const recordNumber = Number(actionTarget.dataset.record);
    loadSampleRecord(recordNumber);
    return;
  }

  if (action === "save-record") {
    const recordNumber = Number(actionTarget.dataset.record);
    saveRecordAndGoNext(recordNumber);
    return;
  }

  if (action === "unlock-place-story") {
    runLocked(actionTarget, () => unlockPlaceStoryComic());
    return;
  }

  if (action === "reserve-next-place") {
    reserveNextPlace();
    return;
  }

  if (action === "open-recommendation-detail") {
    openNextPlaceDetail(actionTarget.dataset.recommendationId);
    return;
  }

  if (action === "synthesize-journey-film") {
    runLocked(actionTarget, () => handleJourneySynthesis());
    return;
  }

  if (action === "download-journey-film") {
    handleJourneyDownload();
    return;
  }

  if (action === "share-instagram") {
    handleJourneyInstagramShare();
    return;
  }

  if (action === "open-next-place-map") {
    openRecommendationUrl("map");
    return;
  }

  if (action === "open-next-place-detail") {
    openRecommendationUrl("detail");
    return;
  }

  if (action === "reset-demo") {
    resetDemo();
  }
});

/* =========================================================
  [최유석] 언어 선택
========================================================= */
document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("disabled")) return;
    appState.language = button.dataset.language;
    document.documentElement.lang = appState.language;
    setSelectedRow(button, "[data-language]");
    applyCultureCopy();
  });
});

/* =========================================================
  [최유석 + 이지영] 국가/문화권 선택
========================================================= */
document.querySelectorAll("[data-country]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("disabled")) {
      showToast(uiText("unsupportedCulture", { name: button.textContent.trim() }));
      return;
    }
    appState.culture = button.dataset.country;

    // ❌ 기존 오류 코드: document.body.dataset.culture = appState.culture;
    // ➔ 롤백/치환이 정상적으로 작동하도록 HTML 표준 속성을 직접 바꿔줍니다.
    document.body.setAttribute("data-culture", appState.culture);

    applyCultureCopy();
    setSelectedRow(button, "[data-country]");
  });
});

function confirmCountry() {
  applyCultureCopy();
  showPage("nickname-page");
}

function setSelectedRow(selectedButton, selector) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.remove("selected");
    button.setAttribute("aria-pressed", "false");
    const mark = button.querySelector("i");
    if (mark) mark.textContent = "";
  });

  selectedButton.classList.add("selected");
  selectedButton.setAttribute("aria-pressed", "true");
  const selectedMark = selectedButton.querySelector("i");
  if (selectedMark) selectedMark.textContent = "✓";
}

/* =========================================================
  [최유석 + 이지영] 닉네임 저장
========================================================= */
document.querySelectorAll("[data-nickname-chip]").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById("nickname-input");
    if (input) {
      input.value = appState.language === "zh-CN"
        ? button.textContent.replace(/\s*✦\s*$/, "").trim()
        : button.dataset.nicknameChip;
    }
  });
});

const MAX_NICKNAME_LENGTH = 20;

function saveNickname() {
  const input = document.getElementById("nickname-input");
  const entered = input ? input.value.trim() : "";
  const defaultNickname = appState.language === "zh-CN" ? "旅行者" : "여행자";
  const nickname = Array.from(entered || defaultNickname)
    .slice(0, MAX_NICKNAME_LENGTH)
    .join("");
  if (input) input.value = nickname;
  appState.nickname = nickname;
  showPage("giroksae-intro-page");
}

/* =========================================================
  [구도훈] 첫 사진 기록 업로드
========================================================= */
const firstPhotoInput = document.getElementById("first-photo-input");

if (firstPhotoInput) {
  firstPhotoInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(uiText("imageOnly"));
      firstPhotoInput.value = "";
      return;
    }

    releasePreviewUrl(appState.photos.first);
    appState.photos.first = file;
    setImagePreview("first-photo-preview", "first-photo-empty", file);
    setActionButtonDisabled("analyze-first-photo", false);
  });
}

function loadSampleFirstPhoto() {
  releasePreviewUrl(appState.photos.first);
  appState.photos.first = SAMPLE_PHOTO_MARKERS.first;
  setSamplePhotoPreview("first-photo-preview", "first-photo-empty");
  setActionButtonDisabled("analyze-first-photo", false);
  showToast(uiText("firstSampleLoaded"));
}

function resetFirstPhoto() {
  releasePreviewUrl(appState.photos.first);
  appState.photos.first = null;
  if (firstPhotoInput) firstPhotoInput.value = "";

  const preview = document.getElementById("first-photo-preview");
  const empty = document.getElementById("first-photo-empty");
  if (preview) {
    preview.removeAttribute("src");
    preview.classList.add("hidden");
  }
  if (empty) {
    restoreSamplePhotoCopy(empty);
    empty.classList.remove("hidden");
  }
  setActionButtonDisabled("analyze-first-photo", true);
}

function analyzeFirstPhoto() {
  if (!appState.photos.first) {
    alert(uiText("firstPhotoRequired"));
    return;
  }
  showPage("place-loading-page");
  setTimeout(() => {
    showPage("place-confirm-page");
  }, 1400);
}

/* =========================================================
  [이지영] 기록새 첫 등장 대사
========================================================= */
const giroksaeIntroLines = [
  "목포역이라… 목포의 이야기가 시작되기 좋은 곳에 기록을 남겼네?",
  "난 이 지역에 숨겨진 서사를 수집하는 기록새야.",
  "네 기록이라면, 오래된 이야기를 다시 깨워볼 만하겠어.",
  "좋아. 첫 번째 이야기 조각을 찾으러 가보자."
];
let giroksaeIntroIndex = 0;
const giroksaeIntroPage = document.getElementById("giroksae-intro-page");

if (giroksaeIntroPage) {
  const advanceGiroksaeIntro = () => {
    const text = document.getElementById("giroksae-intro-text");
    giroksaeIntroIndex += 1;

    if (giroksaeIntroIndex >= giroksaeIntroLines.length) {
      giroksaeIntroIndex = 0;
      if (text) text.textContent = giroksaeIntroLines[0];
      showPage("mokpo-guide-page");
      return;
    }
    if (text) text.textContent = giroksaeIntroLines[giroksaeIntroIndex];
  };

  giroksaeIntroPage.addEventListener("click", advanceGiroksaeIntro);
  giroksaeIntroPage.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    advanceGiroksaeIntro();
  });
}

/* =========================================================
  [구도훈] 조각 1/2/3 미션 사진 업로드
========================================================= */
document.querySelectorAll(".piece-photo-input").forEach((input) => {
  input.addEventListener("change", (event) => {
    const pieceNumber = Number(input.dataset.piece);
    const file = event.target.files && event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(uiText("imageOnly"));
      input.value = "";
      return;
    }

    releasePreviewUrl(appState.photos[`piece${pieceNumber}`]);
    appState.photos[`piece${pieceNumber}`] = file;
    setImagePreview(
      `piece-${pieceNumber}-photo-preview`,
      `piece-${pieceNumber}-photo-empty`,
      file
    );
    setPieceAiButtonDisabled(pieceNumber, false);
  });
});

function loadSamplePiecePhoto(pieceNumber) {
  releasePreviewUrl(appState.photos[`piece${pieceNumber}`]);
  appState.photos[`piece${pieceNumber}`] = SAMPLE_PHOTO_MARKERS[pieceNumber];
  setSamplePhotoPreview(
    `piece-${pieceNumber}-photo-preview`,
    `piece-${pieceNumber}-photo-empty`
  );
  setPieceAiButtonDisabled(pieceNumber, false);
  showToast(uiText("pieceSampleLoaded", { piece: pieceNumber }));
}

function resetPiecePhotoForRetry(pieceNumber) {
  const stateKey = `piece${pieceNumber}`;
  releasePreviewUrl(appState.photos[stateKey]);
  appState.photos[stateKey] = null;
  appState.aiResults[pieceNumber] = null;

  const input = document.getElementById(`piece-${pieceNumber}-photo-input`);
  const preview = document.getElementById(`piece-${pieceNumber}-photo-preview`);
  const empty = document.getElementById(`piece-${pieceNumber}-photo-empty`);
  if (input) input.value = "";
  if (preview) {
    preview.removeAttribute("src");
    preview.classList.add("hidden");
  }
  if (empty) {
    restoreSamplePhotoCopy(empty);
    empty.classList.remove("hidden");
  }
  setPieceAiButtonDisabled(pieceNumber, true);
}

function setPieceAiButtonDisabled(pieceNumber, disabled) {
  const button = document.querySelector(
    `[data-action="run-piece-ai"][data-piece="${pieceNumber}"]`
  );
  if (button) button.disabled = disabled;
}

/* =========================================================
  [구도훈] 조각 1/2/3 AI 판별 (dohun-ai.js 모듈 호출)
========================================================= */
function normalizeAiResult(rawResult, pieceNumber) {
  if (!rawResult || typeof rawResult.label !== "string" || !rawResult.label.trim()) {
    throw new Error(uiText("aiInvalidLabel", { piece: pieceNumber }));
  }
  const confidence = Number(rawResult.confidence);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new Error(uiText("aiInvalidConfidence", { piece: pieceNumber }));
  }
  if (typeof rawResult.success !== "boolean") {
    throw new Error(uiText("aiInvalidSuccess", { piece: pieceNumber }));
  }
  return {
    ...rawResult,
    label: rawResult.label.trim(),
    confidence,
    reason: typeof rawResult.reason === "string" ? rawResult.reason : "",
    error: rawResult.error == null ? null : String(rawResult.error)
  };
}

async function runPieceAiAndShowResult(pieceNumber) {
  const photo = appState.photos[`piece${pieceNumber}`];

  if (!photo) {
    alert(uiText("photoRequired"));
    return;
  }

  showToast(uiText("aiAnalyzing", { piece: pieceNumber }));
  appState.currentPiece = pieceNumber;

  const isSample = typeof photo === "string";

  try {
    // [가이드라인 규격 적용] window.DohunAI 모듈 호출
    if (!window.DohunAI || typeof window.DohunAI.runClueClassifier !== "function") {
      throw new Error(uiText("aiModuleMissing"));
    }
    const rawResult = await window.DohunAI.runClueClassifier(photo, pieceNumber, isSample);
    const result = normalizeAiResult(rawResult, pieceNumber);

    appState.aiResults[pieceNumber] = result;
    renderPieceAiResult(pieceNumber, result);
    showPage(`piece-${pieceNumber}-ai-result-page`);
  } catch (error) {
    console.error("AI 판별 중 오류 발생:", error);
    showToast(appState.language === "zh-CN" ? "地点识别失败，请重新拍摄。" : "장소 판별에 실패했습니다. 다시 촬영해주세요.");
    const failedResult = {
      label: "detection_error",
      confidence: 0,
      success: false,
      reason: appState.language === "zh-CN" ? "地点识别模块发生错误。" : "장소 판별 모듈에서 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : String(error)
    };
    appState.aiResults[pieceNumber] = failedResult;
    renderPieceAiResult(pieceNumber, failedResult);
    showPage(`piece-${pieceNumber}-ai-result-page`);
  }
}

function renderPieceAiResult(pieceNumber, result) {
  const labelEl = document.getElementById(`piece-${pieceNumber}-ai-label`);
  const confEl = document.getElementById(`piece-${pieceNumber}-ai-confidence`);
  const succEl = document.getElementById(`piece-${pieceNumber}-ai-success`);
  const titleEl = document.getElementById(`piece-${pieceNumber}-ai-title`);
  const nextBtn = document.getElementById(`piece-${pieceNumber}-next-btn`);
  const retryBtn = document.getElementById(`piece-${pieceNumber}-retry-btn`);
  const fallbackBtn = document.getElementById(`piece-${pieceNumber}-fallback-btn`);
  const reasonEl = document.getElementById(`piece-${pieceNumber}-ai-reason`);
  const resultCard = labelEl ? labelEl.closest(".ai-result-card") : null;

  if (!labelEl) return;

  const labelKeys = {
    mokpo_station: "목포역",
    not_mokpo_station: "목포역 아님",
    mokpo_music_hall: "목포 대중음악의 전당",
    not_mokpo_music_hall: "목포 대중음악의 전당 아님",
    mokpo_modern_history_2: "목포근대역사관 2관",
    not_mokpo_modern_history_2: "목포근대역사관 2관 아님",
    unrelated: "classUnrelated"
  };
  labelEl.textContent = labelKeys[result.label] ? uiText(labelKeys[result.label]) : result.label;
  const confPercent = Math.round(result.confidence * 100);
  confEl.textContent = `${confPercent}%`;

  // [수정] 국가가 아닌 '언어' 기준으로 실패 안내 문구가 나오도록 분기 처리
  result.reason = result.reason || (result.success
    ? uiText("aiPassReason")
    : (appState.language === "zh-CN" ? COPY_DATA["zh-CN"].system_ui.missions[pieceNumber].fallback_retry : COPY_DATA.ko.system_ui.missions[pieceNumber].fallback_retry));

  if (reasonEl) reasonEl.textContent = result.reason;

  if (result.success) {
    if (resultCard) resultCard.dataset.resultState = "success";
    titleEl.innerHTML = uiText("aiSuccessTitle", { piece: pieceNumber });
    succEl.textContent = uiText("aiSuccessStatus", { piece: pieceNumber });
    if (nextBtn) nextBtn.classList.remove("hidden");
    if (retryBtn) retryBtn.classList.add("hidden");
    if (fallbackBtn) fallbackBtn.classList.add("hidden");
  } else {
    if (resultCard) resultCard.dataset.resultState = "failure";
    titleEl.innerHTML = uiText("aiFailTitle");
    succEl.textContent = uiText("aiFailStatus");
    if (nextBtn) nextBtn.classList.add("hidden");
    if (retryBtn) retryBtn.classList.remove("hidden");
    if (fallbackBtn) fallbackBtn.classList.toggle("hidden", appState.retryCounts[pieceNumber] < 2);
    showToast(uiText("aiRetryHint"));
  }
}

/* =========================================================
  [예선 자산 재사용 + 이경민 통합] 조각별 과거·현재 오버레이
  - 출처가 확인된 실제 옛 기록 자산만 외부 설정으로 연결한다.
  - 실제 자산이 없으면 웹툰 이미지를 대신 넣지 않고 안내 상태를 표시한다.
========================================================= */
const OVERLAY_ARCHIVE_IMAGES = Object.freeze(Object.assign({
  1: null,
  2: null,
  3: null
}, window.HISTORY_PIECES_OVERLAY_IMAGES || {}));

function isWebtoonOnlyAsset(source) {
  const value = String(source || "").replaceAll("\\", "/").toLowerCase();
  return value.includes("/webtoon-reference/")
    || /piece-[123]-style\.jpg(?:$|[?#])/.test(value);
}

function openPieceOverlay(pieceNumber) {
  const result = appState.aiResults[pieceNumber];
  const currentPhoto = appState.photos[`piece${pieceNumber}`];
  if (!result || result.success !== true || !currentPhoto) {
    showToast(uiText("overlayLocked"));
    return;
  }

  appState.currentPiece = pieceNumber;
  const copy = getCopyData();
  const comicCopy = copy.system_ui.piece_comics[pieceNumber];
  setTextBySelector("#piece-overlay-title", uiText("overlayTitle", { piece: pieceNumber }));
  setTextBySelector("#piece-overlay-subtitle", comicCopy ? comicCopy.title : uiText("overlaySubtitle", { piece: pieceNumber }));

  const currentImage = document.getElementById("piece-overlay-current");
  const currentSample = document.getElementById("piece-overlay-current-sample");
  const archiveImage = document.getElementById("piece-overlay-archive");
  if (currentImage) {
    if (isSamplePhotoMarker(currentPhoto)) {
      currentImage.removeAttribute("src");
      currentImage.classList.add("hidden");
    } else {
      currentImage.src = resolvePreviewUrl(currentPhoto);
      currentImage.classList.remove("hidden");
    }
  }
  if (currentSample) {
    currentSample.classList.toggle("hidden", !isSamplePhotoMarker(currentPhoto));
    const label = currentSample.querySelector("strong");
    if (label) label.textContent = appState.language === "zh-CN" ? "示例照片" : "샘플 사진";
  }

  // [수정 완료] 중복 선언 구문을 제거하고 단일 변수로 정리했습니다.
  const isChineseLanguage = appState.language === "zh-CN";
  const overlayLine = isChineseLanguage
    ? COPY_DATA["zh-CN"].giroksae_dialogue[`piece_${pieceNumber}_overlay`]
    : COPY_DATA.ko.giroksae_dialogue[`piece_${pieceNumber}_overlay`];

  const note = document.getElementById("piece-overlay-giroksae-note");
  const line = document.getElementById("piece-overlay-giroksae-line");
  if (note) note.classList.toggle("hidden", !overlayLine);
  if (line) line.textContent = overlayLine || "";

  setOverlayArchiveAvailability(false, false);
  setOverlayMode("current");
  const requestedArchiveSource = OVERLAY_ARCHIVE_IMAGES[pieceNumber];
  const archiveSource = isWebtoonOnlyAsset(requestedArchiveSource) ? null : requestedArchiveSource;
  if (archiveImage) {
    archiveImage.onload = null;
    archiveImage.onerror = null;
    archiveImage.removeAttribute("src");
    archiveImage.classList.add("hidden");
  }

  if (archiveImage && archiveSource) {
    archiveImage.onload = () => {
      archiveImage.classList.remove("hidden");
      setOverlayArchiveAvailability(true, false);
      setOverlayOpacity(58);
      setOverlayMode("blend");
    };
    archiveImage.onerror = () => {
      archiveImage.removeAttribute("src");
      archiveImage.classList.add("hidden");
      setOverlayArchiveAvailability(false, true);
    };
    archiveImage.src = archiveSource;
  } else {
    setOverlayArchiveAvailability(false, true);
  }

  showPage("piece-overlay-page");
}

function setOverlayArchiveAvailability(isAvailable, showFallback) {
  const frame = document.getElementById("piece-overlay-frame");
  const fallback = document.getElementById("piece-overlay-fallback");
  const slider = document.getElementById("piece-overlay-slider");
  if (frame) frame.dataset.archiveAvailable = String(isAvailable);
  if (fallback) fallback.classList.toggle("hidden", !showFallback);
  if (slider) slider.disabled = !isAvailable;

  document.querySelectorAll('[data-action="overlay-mode"]').forEach((button) => {
    button.disabled = !isAvailable && button.dataset.overlayMode !== "current";
  });
  const playButton = document.querySelector('[data-action="play-overlay"]');
  if (playButton) playButton.disabled = !isAvailable;
}

function setOverlayOpacity(value) {
  const amount = Math.max(0, Math.min(100, Number(value) || 0));
  const frame = document.getElementById("piece-overlay-frame");
  const slider = document.getElementById("piece-overlay-slider");
  const valueText = document.getElementById("piece-overlay-value");
  if (frame) frame.style.setProperty("--archive-opacity", String(amount / 100));
  if (slider) slider.value = String(amount);
  if (valueText) valueText.textContent = `${amount}%`;
}

function setOverlayMode(mode) {
  const frame = document.getElementById("piece-overlay-frame");
  if (!frame) return;
  const hasArchive = frame.dataset.archiveAvailable === "true";
  const safeMode = hasArchive && ["archive", "blend"].includes(mode) ? mode : "current";
  frame.dataset.mode = safeMode;
  frame.classList.remove("overlay-playing");

  document.querySelectorAll('[data-action="overlay-mode"]').forEach((button) => {
    button.classList.toggle("selected", button.dataset.overlayMode === safeMode);
  });
}

function playOverlayTransition() {
  const frame = document.getElementById("piece-overlay-frame");
  if (!frame || frame.dataset.archiveAvailable !== "true") {
    showToast(uiText("overlayArchiveMissing"));
    return;
  }
  setOverlayMode("blend");
  frame.classList.remove("overlay-playing");
  void frame.offsetWidth;
  frame.classList.add("overlay-playing");
}

const overlaySlider = document.getElementById("piece-overlay-slider");
if (overlaySlider) {
  overlaySlider.addEventListener("input", (event) => {
    setOverlayOpacity(event.target.value);
    setOverlayMode("blend");
  });
}

/* =========================================================
  [최유석 + 이지영] 조각 이야기 웹툰 데이터
========================================================= */
const pieceBaseData = {
  1: {
    title: "목포역의 첫인상",
    caption: "목포역의 현재 모습과 사람들의 움직임을 기록합니다.",
    line: "목포에서 처음 마주한 장면을 기록한 조각이야.",
    chinaLine: "중국의 철도역이 도시의 첫인상을 만드는 공간이듯, 목포역도 목포를 처음 마주하는 자리야.",
    zh: "中文摘要：木浦站是进入木浦旧城区的第一道入口。"
  },
  2: {
    title: "목포 대중음악의 전당과 호남은행",
    caption: "현재의 음악 공간에서 과거 호남은행 목포지점의 흔적을 찾습니다.",
    line: "공간의 쓰임은 바뀌어도 그 안에 쌓인 시간은 남아 있어.",
    chinaLine: "동아시아 개항도시의 금융 건축과 비교하며 공간의 변화를 살펴보자.",
    zh: "中文摘要：在如今的木浦大众音乐殿堂中寻找湖南银行木浦支店的历史痕迹。"
  },
  3: {
    title: "목포근대역사관 2관과 동양척식주식회사",
    caption: "현재의 박물관 건물에서 동양척식주식회사 목포지점의 기록을 확인합니다.",
    line: "건물은 말이 없지만 그곳을 지나간 사람들의 이야기는 기록에 남아 있어.",
    chinaLine: "동아시아 근대사의 연결 속에서 이 건물에 남은 흔적을 함께 살펴보자.",
    zh: "中文摘要：在木浦近代历史馆2馆中确认东方拓殖株式会社木浦支店的历史记录。"
  }
};

async function generatePieceComicData(pieceNumber) {
  const base = pieceBaseData[pieceNumber];
  const isChineseLanguage = appState.language === "zh-CN";
  const approved = getCopyData().system_ui.piece_comics[pieceNumber];

  return {
    title: approved.title,
    caption: approved.caption,
    // [수정] 국가(culture)가 china여도 언어가 한국어면 한국어 대사가 나오도록 변경
    giroksaeLine: isChineseLanguage
      ? base.zh.replace(/^中文摘要：/, "")
      : `${appState.nickname}, ${base.line}`,
    zhSummary: isChineseLanguage ? base.zh : "",
    showZh: isChineseLanguage
  };
}

async function unlockPieceComic(pieceNumber) {
  if (window.YuseokStory && typeof window.YuseokStory.unlockPieceComic === "function") {
    return window.YuseokStory.unlockPieceComic(pieceNumber);
  }
  if (!appState.collectedPieces.includes(pieceNumber)) {
    appState.collectedPieces.push(pieceNumber);
  }
  const data = await generatePieceComicData(pieceNumber);
  renderPieceComic(pieceNumber, data);
  showPage(`piece-${pieceNumber}-comic-page`);
}

function renderPieceComic(pieceNumber, data) {
  document.getElementById(`piece-${pieceNumber}-title`).textContent = data.title;
  document.getElementById(`piece-${pieceNumber}-caption`).textContent = data.caption;
  document.getElementById(`piece-${pieceNumber}-giroksae-line`).textContent = data.giroksaeLine;

  const zhBox = document.getElementById(`piece-${pieceNumber}-zh-summary`);
  if (zhBox) {
    zhBox.textContent = data.zhSummary;
    zhBox.classList.toggle("hidden", !data.showZh);
  }

  const photo = appState.photos[`piece${pieceNumber}`];
  if (photo) {
    setImageOnly(`piece-${pieceNumber}-comic-photo`, photo);
  }
}

/* =========================================================
  [최유석 + 구도훈] 5초 기록 1/2/3 저장 (dohun-ai.js 모듈 호출)
========================================================= */
document.querySelectorAll(".record-input").forEach((input) => {
  input.addEventListener("change", async (event) => {
    const recordNumber = Number(input.dataset.record);
    const file = event.target.files && event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      input.value = "";
      showToast(uiText("videoOnly"));
      return;
    }

    // [가이드라인 규격 적용] window.DohunAI 모듈 호출
    if (file.type.startsWith("video/") && window.DohunAI) {
      const isValidDuration = await window.DohunAI.validateVideoDuration(file, 7.0);
      if (!isValidDuration) {
        showToast(uiText("videoTrimmed", { piece: recordNumber }));
      }
    }

    releasePreviewUrl(appState.records[recordNumber]);
    appState.records[recordNumber] = file;
    renderRecordPreview(recordNumber, file);
  });
});

function loadSampleRecord(recordNumber) {
  const samplePath = `assets/videos/sample-record-${recordNumber}.mp4`;
  releasePreviewUrl(appState.records[recordNumber]);
  appState.records[recordNumber] = samplePath;
  renderRecordPreview(recordNumber, samplePath);
  showToast(uiText("recordSampleLoaded", { piece: recordNumber }));
}

function renderRecordPreview(recordNumber, source) {
  const preview = document.getElementById(`record-${recordNumber}-preview`);
  const empty = document.getElementById(`record-${recordNumber}-empty`);

  if (!preview) return;

  preview.src = resolvePreviewUrl(source);
  preview.classList.remove("hidden");
  preview.controls = true;

  if (empty) empty.classList.add("hidden");
}

function saveRecordAndGoNext(recordNumber) {
  if (!appState.records[recordNumber]) {
    loadSampleRecord(recordNumber);
    showToast(uiText("recordFallback"));
  }

  if (recordNumber === 1) {
    showPage("piece-2-mission-page");
    return;
  }
  if (recordNumber === 2) {
    showPage("piece-3-mission-page");
    return;
  }
  if (recordNumber === 3) {
    showPage("unlock-page");
  }
}

/* =========================================================
  [최유석 + 이지영] 장소 이야기 웹툰
========================================================= */
function unlockPlaceStoryComic() {
  if (window.YuseokStory && typeof window.YuseokStory.unlockPlaceStory === "function") {
    return window.YuseokStory.unlockPlaceStory();
  }
  const data = generatePlaceStoryData();
  renderPlaceStory(data);
  showPage("place-story-comic-page");
}


function generatePlaceStoryData() {
  const isChineseLanguage = appState.language === "zh-CN";
  const pieceCopy = getCopyData().system_ui.piece_comics;

  return {
    title: isChineseLanguage
      ? "木浦站的三个故事碎片串联在了一起"
      : "목포역의 세 조각이 하나의 이야기로 이어졌습니다",
    panels: [
      pieceCopy[1].title,
      pieceCopy[2].title,
      pieceCopy[3].title,
      isChineseLanguage
        ? `${appState.nickname}的木浦站故事已经完成。`
        : `${appState.nickname}의 시선으로 목포역 이야기가 완성되었습니다`
    ],
    // [수정] 국가가 china여도 언어가 한국어면 한국어 기록새 대사가 나오도록 변경
    line: isChineseLanguage
      ? getCopyData().giroksae_dialogue.place_story
      : `${appState.nickname}, 세 조각을 모두 모았네. 이제 목포역이 단순한 역이 아니라 도시의 기억으로 보일 거야.`,
    zh: "中文摘要：三个线索连接起来，形成了木浦站作为城市入口、旧城区起点 and 生活空间的故事。",
    showZh: isChineseLanguage
  };
}

function renderPlaceStory(data) {
  document.getElementById("place-story-title").textContent = data.title;
  document.getElementById("place-story-line").textContent = data.line;

  data.panels.forEach((text, index) => {
    const panel = document.getElementById(`place-panel-${index + 1}`);
    if (panel) panel.textContent = text;
  });

  const zhBox = document.getElementById("place-story-zh-summary");
  zhBox.textContent = data.zh;
  zhBox.classList.toggle("hidden", !data.showZh);
}

/* =========================================================
  [이지영 + 최유석] 장소 퀴즈
========================================================= */
document.querySelectorAll("[data-quiz-option]").forEach((button) => {
  button.addEventListener("click", () => {
    const feedback = document.getElementById("quiz-feedback");

    if (button.dataset.quizOption === "correct") {
      if (feedback) {
        feedback.textContent = getCopyData().system_ui.quiz.feedback_correct;
        feedback.classList.remove("hidden");
      }
      setTimeout(() => {
        showPage("quiz-result-page");
      }, 500);
      return;
    }

    if (feedback) {
      feedback.textContent = getCopyData().system_ui.quiz.feedback_wrong;
      feedback.classList.remove("hidden");
    }
  });
});

/* =========================================================
  [최유석] 여정필름
========================================================= */
function renderJourneyFilm() {
  if (window.JourneyFilm && typeof window.JourneyFilm.playClipsSequentially === "function") {
    return window.JourneyFilm.playClipsSequentially("journey-film-container");
  }
  if (window.YuseokStory && typeof window.YuseokStory.renderJourneyFilm === "function") {
    return window.YuseokStory.renderJourneyFilm();
  }
  document.getElementById("journey-film-title").textContent =
    `${appState.nickname} · ${getCopyData().system_ui.journey_complete.title}`;

  for (let i = 1; i <= 3; i++) {
    const clip = document.getElementById(`film-clip-${i}`);
    if (!clip) continue;
    clip.innerHTML = "";
    const record = appState.records[i];

    if (!record) {
      clip.textContent = appState.language === "zh-CN" ? `记录 ${i}` : `기록 ${i}`;
      continue;
    }

    const video = document.createElement("video");
    video.src = resolvePreviewUrl(record);
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    clip.appendChild(video);
  }
}

/* =========================================================
  [최유석 + 이지영] 다음 장소 추천 및 예약
========================================================= */
function getNextPlaceRecommendations() {
  const isChineseLanguage = appState.language === "zh-CN";
  return [
    {
      id: "mokpo-history-1",
      name: isChineseLanguage ? "木浦近代历史馆1馆" : "목포근대역사관 1관",
      distance: "772m",
      walkingTime: isChineseLanguage ? "步行12分钟" : "도보 12분",
      tags: isChineseLanguage ? ["近代文化", "旧城区", "开港"] : ["근대문화", "원도심", "개항"],
      reason: isChineseLanguage
        ? "从木浦站前往老城区，可以继续了解木浦近代城市形成与交流的历史。"
        : "목포역에서 원도심으로 이동하며 목포의 근대 도시 이야기를 이어서 살펴볼 수 있는 장소입니다.",
      zhSummary: isChineseLanguage ? "从木浦站前往老城区，可以继续了解木浦近代城市形成与交流的历史。" : "",
      verified: true,
      urls: {
        detail: "https://biz.mokpo.go.kr/tour/attraction/cultural_assets/list?idx=7449&mode=view",
        map: "https://map.naver.com/p/directions/3ySQy2,2yTB3U,%EB%AA%A9%ED%8F%AC%EC%97%AD%20(%EA%B3%A0%EC%86%8D%EC%B2%A0%EB%8F%84),11630534,PLACE_POI/3ySESp,2yTrxo,%EB%AA%A9%ED%8F%AC%EA%B7%BC%EB%8C%80%EC%97%AD%EC%82%AC%EA%B4%80%201%EA%B4%80,1281942881,PLACE_POI/-/walk/0?c=15.00,0,0,0,dh",
        reservation: null
      }
    },
    {
      id: "mokpo-open-port-1897",
      name: isChineseLanguage ? "1897开港文化街" : "1897 개항문화거리",
      distance: "",
      walkingTime: "",
      tags: isChineseLanguage ? ["开港遗迹", "街区探索", "摄影记录"] : ["개항 흔적", "거리 탐색", "사진 기록"],
      reason: isChineseLanguage
        ? "从木浦站前往旧城区的途中，可以感受开港后逐渐形成的街区风貌。"
        : "목포역에서 원도심으로 이동하며, 개항 이후 형성된 거리의 분위기를 체험할 수 있는 장소입니다.",
      zhSummary: isChineseLanguage ? "从木浦站前往旧城区的途中，可以感受开港后逐渐形成的街区风貌。" : "",
      verified: false,
      urls: { detail: null, map: null, reservation: null }
    },
    {
      id: "mokpojin-history-park",
      name: isChineseLanguage ? "木浦镇历史公园" : "목포진 역사공원",
      distance: "",
      walkingTime: "",
      tags: isChineseLanguage ? ["港口防御", "历史遗迹", "后续故事"] : ["항구 방어", "역사 흔적", "다음 서사"],
      reason: isChineseLanguage
        ? "可以继续探访木浦作为港口城市发展过程中更早期的历史痕迹。"
        : "목포가 항구 도시로 기능해온 더 오래된 시간의 흔적을 이어서 확인할 수 있는 장소입니다.",
      zhSummary: isChineseLanguage ? "可以继续探访木浦作为港口城市发展过程中更早期的历史痕迹。" : "",
      verified: false,
      urls: { detail: null, map: null, reservation: null }
    }
  ];
}

function renderNextPlaceRecommendation() {
  if (window.YuseokRecommendation && typeof window.YuseokRecommendation.renderNextPlaceRecommendation === "function") {
    return window.YuseokRecommendation.renderNextPlaceRecommendation();
  }
  const places = getNextPlaceRecommendations();
  appState.recommendations = places;
  const list = document.getElementById("next-place-candidate-list");
  if (!list) return places;
  list.innerHTML = "";
  places.forEach((data) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recommendation-option";
    button.dataset.action = "open-recommendation-detail";
    button.dataset.recommendationId = data.id;
    const title = document.createElement("strong");
    title.textContent = data.name;
    const meta = document.createElement("span");
    meta.textContent = data.tags.join(" · ");
    const reason = document.createElement("small");
    reason.textContent = data.reason;
    button.append(title, meta, reason);
    list.appendChild(button);
  });
  return places;
}

function renderNextPlaceDetail(data) {
  if (!data) return;
  document.getElementById("next-place-name").textContent = data.name;
  document.getElementById("next-place-distance").textContent = data.distance;
  document.getElementById("next-place-time").textContent = data.walkingTime;
  document.getElementById("next-place-map-destination").textContent = data.name;
  document.getElementById("next-place-reason").textContent = data.reason;
  document.getElementById("next-place-route-info").classList.toggle("hidden", !data.distance && !data.walkingTime);
  const tagBox = document.getElementById("next-place-tags");
  tagBox.innerHTML = "";
  data.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag;
    tagBox.appendChild(span);
  });
  const zhBox = document.getElementById("next-place-zh-summary");
  zhBox.textContent = data.zhSummary;
  zhBox.classList.toggle("hidden", !data.zhSummary);
  document.getElementById("next-place-map-btn").classList.toggle("hidden", !data.urls.map);
  document.getElementById("next-place-detail-btn").classList.toggle("hidden", !data.urls.detail);
}

async function openNextPlaceDetail(recommendationId) {
  if (window.YuseokRecommendation && typeof window.YuseokRecommendation.openRecommendationDetail === "function") {
    return window.YuseokRecommendation.openRecommendationDetail(recommendationId);
  }
  const places = appState.recommendations.length ? appState.recommendations : getNextPlaceRecommendations();
  const selected = places.find((place) => place.id === String(recommendationId));
  if (!selected) {
    showToast(uiText("candidateLoadError"));
    return null;
  }
  appState.recommendation = selected;
  renderNextPlaceDetail(selected);
  showPage("next-place-detail-page");
  return selected;
}

function reserveNextPlace() {
  if (window.YuseokRecommendation && typeof window.YuseokRecommendation.reserveNextPlace === "function") {
    return window.YuseokRecommendation.reserveNextPlace();
  }
  const data = appState.recommendation;
  if (!data) {
    showToast(uiText("recommendationSelect"));
    showPage("next-place-page");
    return false;
  }
  appState.reservedPlace = data.name;
  appState.reservationUrl = data.urls.reservation;
  document.getElementById("reserved-place-title").textContent =
    uiText("reservationTitle", { name: data.name });
  showPage("reservation-page");
  return true;
}

/* =========================================================
  [공통 유틸]
========================================================= */
function setImagePreview(previewId, emptyId, source) {
  if (isSamplePhotoMarker(source)) {
    setSamplePhotoPreview(previewId, emptyId);
    return;
  }
  setImageOnly(previewId, source);
  const empty = document.getElementById(emptyId);
  if (empty) {
    restoreSamplePhotoCopy(empty);
    empty.classList.add("hidden");
  }
}

function setImageOnly(previewId, source) {
  const preview = document.getElementById(previewId);
  if (!preview) return;
  if (isSamplePhotoMarker(source)) {
    preview.removeAttribute("src");
    preview.classList.add("hidden");
    return;
  }
  preview.src = resolvePreviewUrl(source);
  preview.classList.remove("hidden");
}

function setSamplePhotoPreview(previewId, emptyId) {
  const preview = document.getElementById(previewId);
  const empty = document.getElementById(emptyId);
  if (preview) {
    preview.removeAttribute("src");
    preview.classList.add("hidden");
  }
  if (!empty) return;

  const strong = empty.querySelector("strong");
  const small = empty.querySelector("small");
  if (!empty.dataset.sampleActive) {
    if (strong) strong.dataset.originalText = strong.textContent || "";
    if (small) small.dataset.originalText = small.textContent || "";
  }
  empty.dataset.sampleActive = "true";
  empty.classList.add("sample-photo-selected");
  empty.classList.remove("hidden");
  if (strong) strong.textContent = "🖼️";
  if (small) small.textContent = appState.language === "zh-CN" ? "示例照片" : "샘플 사진";
}

function restoreSamplePhotoCopy(empty) {
  if (!empty || empty.dataset.sampleActive !== "true") return;
  const strong = empty.querySelector("strong");
  const small = empty.querySelector("small");
  if (strong && Object.prototype.hasOwnProperty.call(strong.dataset, "originalText")) {
    strong.textContent = strong.dataset.originalText;
    delete strong.dataset.originalText;
  }
  if (small && Object.prototype.hasOwnProperty.call(small.dataset, "originalText")) {
    small.textContent = small.dataset.originalText;
    delete small.dataset.originalText;
  }
  delete empty.dataset.sampleActive;
  empty.classList.remove("sample-photo-selected");
}

function setActionButtonDisabled(actionName, disabled) {
  const button = document.querySelector(`[data-action="${actionName}"]`);
  if (button) button.disabled = disabled;
}

/* =========================================================
  [이지영 + 이경민] 확정 문구 데이터 및 화면 적용
========================================================= */
const COPY_DATA = {
  ko: {
    system_ui: {
      china_mode_intro: {
        title: "중국 여행자의 시선으로 장소를 해석합니다",
        desc: "기록새가 철도역, 항구도시, 개항거리의 맥락을 바탕으로 목포역의 이야기를 중국 여행자에게 익숙한 관점으로 풀어줍니다."
      },
      start_page_dialogue: "첫 기록 남기면, 이 여정은 조금 다른 방향으로 흘러갈지도 모릅니다.",
      photo_upload_dialogue: "사진 속에 남아 있는 장소의 단서를 살펴볼게요. 간판, 건물 형태, 거리 분위기 같은 정보가 도움이 됩니다.",
      analysis_result_dialogue: "현재 장면과 가장 가까운 장소 후보를 찾았습니다. 이곳이 목포역 일대가 맞는지 확인해주세요.",
      piece_comics: {
        1: { title: "목포의 첫 관문", caption: "목포역 간판은 목포 여행의 시작을 알리는 첫 단서입니다." },
        2: { title: "원도심으로 향하는 길", caption: "역 앞의 길은 목포의 원도심과 근대문화공간으로 이어집니다." },
        3: { title: "사람들이 오가던 역전", caption: "목포역 앞에는 이동과 만남, 생활의 흔적이 쌓여 있습니다." }
      },
      missions: {
        1: { title: "첫 번째 조각 찾기", guide: "목포역 간판을 찾아 사진으로 기록해 주세요. 역의 이름이 적힌 간판이 가장 확실한 단서가 됩니다.", fallback_retry: "단서가 명확하게 보이지 않습니다. 글자가 잘 보이도록 밝은 곳에서 간판을 정면으로 다시 촬영해 주세요." },
        2: { title: "두 번째 조각 찾기", guide: "역전 광장에서 옛 원도심 거리가 시작되는 방향을 비추어 사진으로 남겨주세요.", fallback_retry: "거리의 윤곽이나 방향이 흐릿합니다. 원도심의 입구가 잘 보이도록 정면을 향해 다시 촬영해 주세요." },
        3: { title: "세 번째 조각 찾기", guide: "역전 광장 주변에서 사람들의 흔적과 일상이 묻어나는 이동 공간을 촬영해 주세요.", fallback_retry: "피사체가 불분명합니다. 역전의 생활 공간이 뚜렷하게 담기도록 구도를 조정한 뒤 다시 촬영해 주세요." }
      },
      record_instructions: { title: "5초의 현재 기록하기", guide: "오늘 당신이 바라보는 목포역의 순간을 5초 동안 비디오로 담아보세요. 이 짧은 기록이 여정필름의 소중한 클립이 됩니다." },
      quiz: { question: "목포역 간판과 옛 사진을 겹쳐 본 뒤, 5초 기록을 남기는 이유는 무엇일까요?", options: ["과거 기록과 현재 방문 경험을 연결해 장소 이야기를 갱신하기 위해", "단순히 기차를 타고 내리는 교통시설이기 때문에", "주변 장소와 연결되지 않는 독립된 건물이기 때문에", "사진 기록만 남기는 관광 인증 지점이기 때문에"], feedback_correct: "정답입니다. 과거 기록 위에 현재의 방문 경험을 더해 장소 이야기를 갱신하는 흐름을 이해한 것입니다.", feedback_wrong: "다시 생각해보세요. 오버레이와 5초 기록은 사진을 꾸미기 위한 기능이 아니라, 과거 장소 기록에 현재의 방문 경험을 더하는 과정입니다." },
      journey_complete: { title: "당신만의 여정필름 완성", desc: "목포역의 이야기 조각들과 당신이 기록한 오늘의 5초 순간들이 만나 한 편의 아름다운 여정필름으로 재탄생했습니다.", download_btn: "여정필름 다운로드", share_btn: "인스타그램에 공유하기", share_guide: "완성된 필름을 저장하고, 인스타그램에 공유하여 오늘의 여정을 친구들과 나누어 보세요!" }
    },
    giroksae_dialogue: {
      intro_lines: ["목포역이라… 목포의 이야기가 시작되기 좋은 곳에 기록을 남겼네?", "난 이 지역에 숨겨진 서사를 수집하는 위대한 기록새야.", "마침 오래된 이야기들을 새롭게 깨워줄 파트너를 찾던 중인데, 당신의 기록이라면 갱신해볼 만하겠어.", "영광이지? 내 지식을 빌려줄 테니, 어서 첫 번째 이야기 조각을 찾으러 가보자!"],
      piece_1_overlay: "네가 찾은 간판은 단순한 글자가 아니야. 지금의 장소를 오래된 기록과 맞춰보게 만드는 열쇠지.",
      piece_1_reward: "이제 이걸 네 여정 필름의 첫 번째 조각으로 가져가자!",
      piece_1_complete: "좋아! 이제 이 장소를 너의 시선으로 5초만 기록해줘. 오늘의 목포역도 언젠가는 누군가에게 옛 기록이 될 테니까.",
      piece_2_brief: "목포역의 첫 기억은 잘 찾았어. 이제 역에서 이어지는 원도심 거리로 시선을 옮겨보자.",
      unlock_page: "좋아. 이제 조각들이 이어진 목포역의 전체 이야기를 볼 차례야.",
      place_story: "세 조각을 모두 모았네. 이제 목포역이 단순한 역이 아니라 도시의 기억으로 보일 거야."
    }
  },
  "zh-CN": {
    system_ui: {
      china_mode_intro: { title: "从东亚交流的视角，读懂木浦的城市记忆。", desc: "木浦站于1913年随湖南线木浦至学校区间开通而开始营业。沿着车站前的道路走向旧城区，可以继续了解铁路、港口与城市生活之间的人流和物资流动。" },
      start_page_dialogue: "留下第一份记录后，这段旅程也许会朝着稍微不同的方向展开。",
      photo_upload_dialogue: "接下来将查看照片中留下的地点线索。招牌、建筑外形和街道氛围等信息都会有所帮助。",
      analysis_result_dialogue: "已找到与当前画面最接近的候选地点。请确认这里是否为木浦站一带。",
      piece_comics: {
        1: { title: "木浦的第一道门户", caption: "木浦站的站名标识，是宣告木浦旅程开始的第一条线索。作为湖南线的终点站，木浦站也连接着湖南内陆、港口与旧城区。" },
        2: { title: "通往旧城区的路", caption: "从车站前延伸的道路通往木浦旧城区与开港街区。铁路带来的人流和物资，也由此进入城市。" },
        3: { title: "人来人往的站前", caption: "车站前汇聚着旅客、商人和市民的脚步，留下了城市交通、相遇与日常生活的记忆。" }
      },
      missions: {
        1: { title: "寻找第一个故事碎片", guide: "请找到木浦站的站名标识并拍照记录。写有车站名称的标识，是确认当前地点最明确的线索。", fallback_retry: "线索显示得不够清楚。请在光线充足的地方正面拍摄，让站名文字清晰可见。" },
        2: { title: "寻找第二个故事碎片", guide: "请在站前广场，将镜头朝向通往旧城区和开港街区的道路，并拍照记录。", fallback_retry: "街道轮廓或方向不够清楚。请让通往旧城区的入口清晰地出现在画面正面，再重新拍摄。" },
        3: { title: "寻找第三个故事碎片", guide: "请在站前广场周边，拍摄一处能看出人们往来与日常生活痕迹的空间。", fallback_retry: "拍摄主体不够明确。请调整构图，让站前的生活空间清楚地呈现在画面中，再重新拍摄。" }
      },
      record_instructions: { title: "记录当下的5秒", guide: "请用5秒视频记录今天您眼中的木浦站。这段短短的影像，将成为您专属旅程影片中的珍贵片段。" },
      quiz: { question: "将木浦站的旧照片与眼前景象叠加后，再留下5秒影像，是为了什么？", options: ["连接过去的地点记录与当下的到访体验，让木浦的城市故事继续被更新", "因为这里只是供乘客上下列车的交通设施", "因为这是一栋与周边场所没有联系的独立建筑", "因为这里只是留下照片记录的旅游打卡点"], feedback_correct: "回答正确。您已经理解了：在过去的记录之上加入今天的到访体验，可以让这个地点的故事继续延伸和更新。", feedback_wrong: "请再想一想。旧照叠加和5秒影像并不是为了单纯装饰照片，而是为了在过去的地点记录中加入今天的到访体验。" },
      journey_complete: { title: "您的专属旅程影片已完成", desc: "木浦站的故事碎片与您亲手记录的5秒瞬间相遇，汇成了一部属于您的旅程影片。", download_btn: "下载旅程影片", share_btn: "分享到Instagram", share_guide: "保存完成的旅程影片，并分享到Instagram，与朋友们分享今天在木浦留下的足迹吧！" }
    },
    giroksae_dialogue: {
      intro_lines: ["原来是木浦站啊……你在一个很适合开启木浦故事的地方留下了记录呢。", "我可是专门收集这一带隐藏故事的了不起的‘记录鸟’。", "我正好在找一个能重新唤醒古老故事的伙伴。你的记录嘛，倒是值得我来更新一番。", "很荣幸吧？我会把我的知识借给你。走，我们去找第一个故事碎片！"],
      piece_1_overlay: "你找到的站名标识可不只是一串文字。它是把眼前的地点与旧日记录对照起来的钥匙。",
      piece_1_reward: "现在，就把它作为你旅程影片的第一个碎片带走吧！",
      piece_1_complete: "很好！现在用你的视角记录这个地方5秒。今天的木浦站，总有一天也会成为某个人眼中的旧日记录。",
      piece_2_brief: "木浦站的第一段记忆找得不错。现在，把视线移向从车站延伸出去的旧城区和开港街区吧。",
      unlock_page: "很好。现在该看看这些碎片串联起来的木浦站完整故事了。",
      place_story: "三个碎片都集齐了。现在，你眼中的木浦站应该不再只是一座普通的车站，而是连接铁路、港口与旧城区的一段城市记忆。沿着这里继续前进，还能看到近代港口城市中人流与物资往来留下的痕迹。"
    }
  }
};

function getCopyData() {
  return COPY_DATA[appState.language] || COPY_DATA.ko;
}

window.HistoryPiecesCopy = Object.freeze({ get: getCopyData });

function getRetryCopy(pieceNumber) {
  return getCopyData().system_ui.missions[pieceNumber].fallback_retry;
}

function setTextBySelector(selector, value) {
  const element = document.querySelector(selector);
  if (element && value) element.textContent = value;
}

function applyCultureCopy() {
  if (window.HistoryPiecesI18n) window.HistoryPiecesI18n.apply(appState.language);

  // 1. 대사와 UI 문구를 들고 올 때, 무조건 국가(culture)가 아니라 '선택된 언어'를 기준으로 가져옵니다.
  const copy = getCopyData();

  // 2. 기록새 첫 등장 대사 배열 교체 분기
  if (appState.language === "zh-CN") {
    giroksaeIntroLines.splice(0, giroksaeIntroLines.length, ...copy.giroksae_dialogue.intro_lines);
  } else {
    // 한국어 선택 시 국가가 중국이어도 명확하게 한국어 대사로 고정
    giroksaeIntroLines.splice(0, giroksaeIntroLines.length, ...COPY_DATA.ko.giroksae_dialogue.intro_lines);
  }

  giroksaeIntroIndex = 0;

  // 3. 화면에 텍스트 반영 (copy 변수가 이미 언어 기준으로 들고 오기 때문에 꼬이지 않습니다)
  setTextBySelector("#giroksae-intro-text", giroksaeIntroLines[0]);
  setTextBySelector("#first-record-page .guide-note p", copy.system_ui.start_page_dialogue);
  setTextBySelector("#first-record-camera-page .guide-note p", copy.system_ui.photo_upload_dialogue);
  setTextBySelector("#place-confirm-page .before-appear p", copy.system_ui.analysis_result_dialogue);
  setTextBySelector("#mokpo-guide-page .giroksae-note p", appState.language === "zh-CN"
    ? "好。我们按顺序去找藏在木浦站里的三个碎片吧。"
    : "좋아. 목포역에 숨은 세 조각을 차례로 찾아보자.");
  setTextBySelector("#unlock-giroksae-line", copy.giroksae_dialogue.unlock_page);
  setTextBySelector("#place-story-line", copy.giroksae_dialogue.place_story);
  setTextBySelector("#journey-film-page .giroksae-note p", appState.language === "zh-CN"
    ? "好。下一段记录，就在那里继续吧。"
    : "좋아. 다음 기록은 그곳에서 이어가자.");

  // 4. 각 조각 미션 페이지 문구 반영
  for (let i = 1; i <= 3; i += 1) {
    const mission = copy.system_ui.missions[i];
    const comic = copy.system_ui.piece_comics[i];
    setTextBySelector(`#piece-${i}-mission-page .mini-title`, mission.title);
    setTextBySelector(`#piece-${i}-mission-page .description`, mission.guide);
    setTextBySelector(`#piece-${i}-title`, comic.title);
    setTextBySelector(`#piece-${i}-caption`, comic.caption);
    setTextBySelector(`#record-${i}-page .setup-title`, copy.system_ui.record_instructions.title);
    setTextBySelector(`#record-${i}-page .camera-empty small`, copy.system_ui.record_instructions.guide);
  }

  // 5. 퀴즈 문구 반영
  const quiz = copy.system_ui.quiz;
  setTextBySelector("#quiz-page .content-card h2", quiz.question);
  document.querySelectorAll("[data-quiz-option]").forEach((button, index) => {
    if (quiz.options && quiz.options[index]) button.textContent = quiz.options[index];
  });

  // 6. 여정필름 문구 반영
  const journey = copy.system_ui.journey_complete;
  setTextBySelector("#journey-film-title", journey.title);
  setTextBySelector("#journey-film-description", journey.desc);
  setTextBySelector("#journey-download-btn", journey.download_btn);

  // 7. 중국인 관광객 모드 소개 페이지 (한국어로 볼 때도 중국 역사의 시선 설명이 한국어로 나옴)
  if (appState.culture === "china" && copy.system_ui.china_mode_intro) {
    setTextBySelector("#china-mode-intro-page .setup-title", copy.system_ui.china_mode_intro.title);
    setTextBySelector("#china-mode-intro-page .mode-card > p", copy.system_ui.china_mode_intro.desc);
  }
}

/* =========================================================
  [이지영 + 이경민] 여정필름 합성·다운로드·Fallback
========================================================= */
function journeyPrepareClips() {
  const saveClip = window.JourneyFilm && typeof window.JourneyFilm.saveClipVideo === "function"
    ? window.JourneyFilm.saveClipVideo
    : window.journeySaveClipVideo;
  if (typeof saveClip === "function") {
    for (let i = 1; i <= 3; i += 1) saveClip(i, appState.records[i]);
  }
}

function journeyShowSequentialFallback(message) {
  const strip = document.getElementById("journey-film-container");
  const result = document.getElementById("journey-film-result");
  if (strip) strip.classList.remove("hidden");
  if (result) {
    result.innerHTML = "";
    result.classList.add("hidden");
  }
  if (window.JourneyFilm && typeof window.JourneyFilm.playClipsSequentially === "function") {
    window.JourneyFilm.playClipsSequentially("journey-film-container");
  } else {
    renderJourneyFilm();
  }
  setTextBySelector("#journey-film-description", message || uiText("journeyFallback"));
  showToast(uiText("journeyFallbackSwitched"));
}

async function handleJourneySynthesis() {
  const journeyModule = window.JourneyFilm;
  if (!journeyModule || typeof journeyModule.synthesizeFinalFilm !== "function") {
    journeyShowSequentialFallback(uiText("journeyModuleMissing"));
    return;
  }

  const progress = document.getElementById("journey-progress");
  const downloadButton = document.getElementById("journey-download-btn");
  appState.journeyFilm.blob = null;
  appState.journeyFilm.url = null;
  appState.journeyFilm.mimeType = null;
  appState.journeyFilm.isSynthesizing = true;
  if (progress) progress.classList.remove("hidden");
  if (downloadButton) downloadButton.disabled = true;

  try {
    journeyPrepareClips();
    const outcome = await journeyModule.synthesizeFinalFilm("journey-film-result");
    if (!outcome || outcome.success !== true || !outcome.blob || !outcome.combinedVideoUrl) {
      journeyShowSequentialFallback(uiText("journeySynthesisFailed"));
      return;
    }

    appState.journeyFilm.blob = outcome.blob;
    appState.journeyFilm.url = outcome.combinedVideoUrl;
    appState.journeyFilm.mimeType = outcome.mimeType;

    const strip = document.getElementById("journey-film-container");
    const result = document.getElementById("journey-film-result");
    if (strip) strip.classList.add("hidden");
    if (result) result.classList.remove("hidden");
    setTextBySelector("#journey-film-description", getCopyData().system_ui.journey_complete.desc);
    if (downloadButton) downloadButton.disabled = false;
    showToast(uiText("journeyReady"));
  } catch (error) {
    console.error("[여정필름] 합성 실패", error);
    journeyShowSequentialFallback(uiText("journeySynthesisFailed"));
  } finally {
    appState.journeyFilm.isSynthesizing = false;
    if (progress) progress.classList.add("hidden");
  }
}

function handleJourneyDownload() {
  if (!window.JourneyFilm || typeof window.JourneyFilm.downloadFilm !== "function") {
    showToast(uiText("journeyDownloadModuleMissing"));
    return;
  }
  const defaultNickname = appState.language === "zh-CN" ? "旅行者" : "여행자";
  const safeNickname = String(appState.nickname || defaultNickname).replace(/[\\/:*?"<>|]/g, "_");
  if (!window.JourneyFilm.downloadFilm(`history-pieces-${safeNickname}`)) {
    showToast(uiText("journeyDownloadRequired"));
  }
}

function handleJourneyInstagramShare() {
  if (!window.JourneyFilm || typeof window.JourneyFilm.connectInstagramShare !== "function") {
    showToast(uiText("journeyShareModuleMissing"));
    return;
  }
  if (!window.JourneyFilm.connectInstagramShare()) {
    showToast(uiText("journeyShareRequired"));
    return;
  }
  showToast(uiText("journeyShareGuide"));
}

/* =========================================================
  [최유석 + 이경민] 검증 추천 URL 및 초기화
========================================================= */
function openRecommendationUrl(kind) {
  const recommendationUrl = appState.recommendation && appState.recommendation.urls
    ? appState.recommendation.urls[kind]
    : null;
  if (!recommendationUrl) {
    showToast(uiText("sourceUnavailable"));
    return;
  }
  window.open(recommendationUrl, "_blank", "noopener,noreferrer");
}

function resetDemo() {
  if (window.JourneyFilm && typeof window.JourneyFilm.reset === "function") {
    window.JourneyFilm.reset();
  } else if (appState.journeyFilm.url) {
    URL.revokeObjectURL(appState.journeyFilm.url);
  }
  previewObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  previewObjectUrls.clear();
  if (window.YuseokStory && typeof window.YuseokStory.cleanupObjectUrls === "function") {
    window.YuseokStory.cleanupObjectUrls();
  }
  appState.language = "ko";
  appState.culture = "korea";
  appState.nickname = "여행자";
  appState.photos = { first: null, piece1: null, piece2: null, piece3: null };
  appState.timeTraceResults = { 1: null, 2: null, 3: null };
  if (window.HistoryPiecesTimeTrace && typeof window.HistoryPiecesTimeTrace.dispose === "function") {
    window.HistoryPiecesTimeTrace.dispose();
  }
  appState.records = { 1: null, 2: null, 3: null };
  appState.aiResults = { 1: null, 2: null, 3: null };
  appState.collectedPieces = [];
  appState.currentPiece = 1;
  appState.currentPlaceIndex = 1;
  appState.chatEnabled = false;
  appState.chatOpen = false;
  appState.challengeResults = { 2: null, 3: null };
  appState.emotionResponses = { 1: null, 2: null, 3: null };
  appState.finalQuizOrder = [];
  appState.selectedNextPlace = null;
  appState.retryCounts = { 1: 0, 2: 0, 3: 0 };
  appState.yuseokStories = { pieces: {}, place: null };
  appState.reservedPlace = null;
  appState.reservationUrl = null;
  appState.recommendations = [];
  appState.recommendation = null;
  appState.journeyFilm = { blob: null, url: null, mimeType: null, isSynthesizing: false };
  document.body.setAttribute("data-culture", "korea");
  document.documentElement.lang = "ko";
  document.querySelectorAll('input[type="file"]').forEach((input) => { input.value = ""; });
  document.querySelectorAll(".camera-preview").forEach((media) => {
    media.removeAttribute("src");
    media.classList.add("hidden");
  });
  document.querySelectorAll(".camera-empty").forEach((element) => {
    restoreSamplePhotoCopy(element);
    element.classList.remove("hidden");
  });
  document.querySelectorAll(".sample-photo-placeholder").forEach((element) => element.classList.add("hidden"));
  document.querySelectorAll('[data-action="run-piece-ai"], [data-action="analyze-first-photo"]').forEach((button) => { button.disabled = true; });
  document.querySelectorAll(".quiz-feedback").forEach((element) => element.classList.add("hidden"));
  const nicknameInput = document.getElementById("nickname-input");
  if (nicknameInput) nicknameInput.value = "";
  const downloadButton = document.getElementById("journey-download-btn");
  if (downloadButton) downloadButton.disabled = true;
  const journeyResult = document.getElementById("journey-film-result");
  const journeyStrip = document.getElementById("journey-film-container");
  if (journeyResult) {
    journeyResult.innerHTML = "";
    journeyResult.classList.add("hidden");
  }
  if (journeyStrip) journeyStrip.classList.remove("hidden");
  if (window.YuseokRecommendation && typeof window.YuseokRecommendation.reset === "function") {
    window.YuseokRecommendation.reset();
  }
  const generationStatus = document.getElementById("story-generation-status");
  if (generationStatus) generationStatus.classList.add("hidden");
  const languageButton = document.querySelector('[data-language="ko"]');
  const countryButton = document.querySelector('[data-country="korea"]');
  if (languageButton) setSelectedRow(languageButton, "[data-language]");
  if (countryButton) setSelectedRow(countryButton, "[data-country]");
  for (let i = 1; i <= 3; i += 1) {
    const nextButton = document.getElementById(`piece-${i}-next-btn`);
    const retryButton = document.getElementById(`piece-${i}-retry-btn`);
    const fallbackButton = document.getElementById(`piece-${i}-fallback-btn`);
    if (nextButton) nextButton.classList.remove("hidden");
    if (retryButton) retryButton.classList.add("hidden");
    if (fallbackButton) fallbackButton.classList.add("hidden");
  }
  applyCultureCopy();
  showPage("language-page");
  showToast(uiText("resetComplete"));
}

applyCultureCopy();

function forcePieceSuccess(pieceNumber) {
  const definition = window.DohunAI && window.DohunAI.DEFINITIONS
    ? window.DohunAI.DEFINITIONS[pieceNumber]
    : null;
  const result = {
    label: definition ? definition.target : `piece_${pieceNumber}_sample`,
    confidence: 0.95,
    success: true,
    reason: uiText("forceSampleReason"),
    error: null
  };
  appState.aiResults[pieceNumber] = result;
  renderPieceAiResult(pieceNumber, result);
  showToast(uiText("forceSampleApplied"));
}

window.showPage = showPage;
window.showToast = showToast;

async function runLocked(button, task) {
  if (!button || button.dataset.busy === "true") return;
  button.dataset.busy = "true";
  button.disabled = true;
  try {
    await task();
  } finally {
    button.dataset.busy = "false";
    button.disabled = false;
  }
}
