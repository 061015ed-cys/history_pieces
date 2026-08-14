/* =========================================================
  History Pieces - 이전 화면 / 장소 종료 / 갤러리 선택
  - 실제 방문 이력을 기준으로 이전 화면으로 돌아간다.
  - 자동 분석 로딩 화면은 이전 이력에서 제외한다.
  - 촬영 입력은 유지하고 갤러리 선택 경로만 별도로 제공한다.
========================================================= */

(function installExperienceControls(global) {
  "use strict";

  const BACK_EXCLUDED = new Set(["start-page", "language-page", "service-ended-page"]);
  const TRANSIENT_PAGES = new Set(["place-loading-page", "wire-place-loading-page"]);
  const MISSION_PAGES = [1, 2, 3].map((piece) => `piece-${piece}-mission-page`);
  const GALLERY_INPUTS = Object.freeze([
    { id: "first-photo-input", kind: "photo" },
    { id: "piece-1-photo-input", kind: "photo" },
    { id: "piece-2-photo-input", kind: "photo" },
    { id: "piece-3-photo-input", kind: "photo" },
    { id: "record-1-input", kind: "video" },
    { id: "record-2-input", kind: "video" },
    { id: "record-3-input", kind: "video" }
  ]);

  const navigationStack = [];
  let currentPageId = document.querySelector(".page.active")?.id || "language-page";
  let navigatingBack = false;

  function isChinese() {
    return global.appState?.language === "zh-CN";
  }

  function labels() {
    return isChinese() ? {
      back: "返回",
      backAria: "返回上一页",
      galleryPhoto: "从相册选择照片",
      galleryVideo: "从相册选择视频",
      endPlace: "在此结束本地点",
      finalEnd: "结束",
      missionConfirmTitle: "要在此结束本地点吗？",
      finalConfirmTitle: "要结束服务吗？",
      confirmDescription: "结束后将不再继续当前体验。",
      cancel: "取消",
      confirm: "结束",
      endedLabel: "旅程结束",
      endedTitle: "服务已结束",
      endedDescription: "感谢您的参与。现在可以关闭此浏览器页面。"
    } : {
      back: "이전",
      backAria: "이전 페이지로 돌아가기",
      galleryPhoto: "갤러리에서 사진 선택",
      galleryVideo: "갤러리에서 영상 선택",
      endPlace: "이번 장소에서 끝내기",
      finalEnd: "종료하기",
      missionConfirmTitle: "이번 장소에서 끝낼까요?",
      finalConfirmTitle: "서비스를 종료할까요?",
      confirmDescription: "종료하면 현재 체험을 더 이상 진행하지 않습니다.",
      cancel: "계속하기",
      confirm: "종료하기",
      endedLabel: "여정 종료",
      endedTitle: "서비스가 종료되었습니다",
      endedDescription: "함께해 주셔서 감사합니다. 이제 브라우저 창을 닫아주세요."
    };
  }

  function ensureBackButtons() {
    document.querySelectorAll(".page").forEach((page) => {
      if (!page.id || BACK_EXCLUDED.has(page.id)) return;
      page.classList.add("hp-has-back");
      let button = page.querySelector(".hp-back-button");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "hp-back-button";
        button.dataset.hpBack = "true";
        page.appendChild(button);
      }
    });
  }

  function ensureMissionExitButtons() {
    MISSION_PAGES.forEach((pageId) => {
      const page = document.getElementById(pageId);
      const layout = page?.querySelector(".screen-layout");
      if (!layout || layout.querySelector(".hp-exit-place-button")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sub-button hp-exit-place-button";
      button.dataset.hpEndExperience = "mission";
      layout.appendChild(button);
    });
  }

  function ensureGalleryButtons() {
    GALLERY_INPUTS.forEach(({ id, kind }) => {
      const input = document.getElementById(id);
      const frame = input?.closest(".camera-frame");
      if (!input || !frame || document.querySelector(`[data-hp-gallery-target="${id}"]`)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sub-button hp-gallery-button";
      button.dataset.hpGalleryTarget = id;
      button.dataset.hpGalleryKind = kind;
      button.setAttribute("aria-controls", id);
      frame.insertAdjacentElement("afterend", button);
    });
  }

  function ensureFinalExitButton() {
    const button = document.querySelector('#reservation-page [data-action="reset-demo"], #reservation-page [data-action="end-experience"]');
    if (!button) return;
    button.dataset.action = "end-experience";
    button.classList.add("hp-final-exit-button");
  }

  function ensureEndedPage() {
    if (document.getElementById("service-ended-page")) return;
    const shell = document.querySelector(".app-shell");
    if (!shell) return;
    shell.insertAdjacentHTML("beforeend", `
      <section id="service-ended-page" class="page hp-service-ended-page" data-owner="공통 종료 화면">
        <div class="page-bg bg-unlock"></div>
        <div class="screen-layout center-layout">
          <p class="ornament-label" data-hp-ended-label></p>
          <div class="hp-service-ended-card">
            <span aria-hidden="true">✓</span>
            <h1 data-hp-ended-title></h1>
            <p data-hp-ended-description></p>
          </div>
        </div>
      </section>`);
  }

  function refreshLabels() {
    const copy = labels();
    document.querySelectorAll(".hp-back-button").forEach((button) => {
      button.innerHTML = `<span aria-hidden="true">‹</span>${copy.back}`;
      button.setAttribute("aria-label", copy.backAria);
    });
    document.querySelectorAll(".hp-gallery-button").forEach((button) => {
      button.textContent = button.dataset.hpGalleryKind === "video"
        ? copy.galleryVideo
        : copy.galleryPhoto;
    });
    document.querySelectorAll(".hp-exit-place-button").forEach((button) => {
      button.textContent = copy.endPlace;
    });
    const finalButton = document.querySelector('#reservation-page [data-action="end-experience"]');
    if (finalButton) finalButton.textContent = copy.finalEnd;
    const endedLabel = document.querySelector("[data-hp-ended-label]");
    const endedTitle = document.querySelector("[data-hp-ended-title]");
    const endedDescription = document.querySelector("[data-hp-ended-description]");
    if (endedLabel) endedLabel.textContent = copy.endedLabel;
    if (endedTitle) endedTitle.textContent = copy.endedTitle;
    if (endedDescription) endedDescription.textContent = copy.endedDescription;
  }

  function refreshControls() {
    ensureEndedPage();
    ensureBackButtons();
    ensureMissionExitButtons();
    ensureGalleryButtons();
    ensureFinalExitButton();
    refreshLabels();
  }

  function showPage(pageId) {
    const missionMatch = String(pageId).match(/^piece-([123])-mission-page$/);
    if (missionMatch && global.HistoryPiecesIntegratedUi?.showMissionDirect) {
      global.HistoryPiecesIntegratedUi.showMissionDirect(Number(missionMatch[1]));
      return;
    }
    if (typeof global.showPage === "function") global.showPage(pageId);
  }

  function goBack() {
    let target = null;
    while (navigationStack.length && !target) {
      const candidate = navigationStack.pop();
      if (candidate !== currentPageId && document.getElementById(candidate)) target = candidate;
    }
    if (!target) return;
    navigatingBack = true;
    showPage(target);
  }

  function openGallery(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const originalCapture = input.getAttribute("capture");
    input.removeAttribute("capture");

    let restored = false;
    const restoreCapture = () => {
      if (restored) return;
      restored = true;
      if (originalCapture != null) input.setAttribute("capture", originalCapture);
    };
    global.addEventListener("focus", () => global.setTimeout(restoreCapture, 0), { once: true });
    global.setTimeout(restoreCapture, 1500);
    input.click();
  }

  function closeEndDialog() {
    document.querySelector(".hp-end-dialog")?.remove();
  }

  function finishExperience() {
    closeEndDialog();
    navigationStack.length = 0;
    navigatingBack = false;
    document.querySelectorAll("video").forEach((video) => {
      if (typeof video.pause === "function") video.pause();
    });
    showPage("service-ended-page");
  }

  function openEndDialog(source) {
    closeEndDialog();
    const copy = labels();
    const dialog = document.createElement("div");
    dialog.className = "hp-end-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "hp-end-dialog-title");
    dialog.innerHTML = `
      <div class="hp-end-dialog__panel">
        <h2 id="hp-end-dialog-title">${source === "mission" ? copy.missionConfirmTitle : copy.finalConfirmTitle}</h2>
        <p>${copy.confirmDescription}</p>
        <div class="hp-end-dialog__actions">
          <button type="button" class="sub-button" data-hp-end-cancel>${copy.cancel}</button>
          <button type="button" class="hp-end-dialog__confirm" data-hp-end-confirm>${copy.confirm}</button>
        </div>
      </div>`;
    document.querySelector(".app-shell")?.appendChild(dialog);
    dialog.querySelector("[data-hp-end-confirm]")?.focus();
  }

  function handleControlClick(event) {
    const back = event.target.closest("[data-hp-back]");
    if (back) {
      event.preventDefault();
      event.stopImmediatePropagation();
      goBack();
      return;
    }

    const gallery = event.target.closest("[data-hp-gallery-target]");
    if (gallery) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openGallery(gallery.dataset.hpGalleryTarget);
      return;
    }

    const missionEnd = event.target.closest("[data-hp-end-experience]");
    const finalEnd = event.target.closest('[data-action="end-experience"]');
    if (missionEnd || finalEnd) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openEndDialog(missionEnd ? "mission" : "final");
      return;
    }

    if (event.target.closest("[data-hp-end-cancel]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeEndDialog();
      return;
    }

    if (event.target.closest("[data-hp-end-confirm]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      finishExperience();
    }
  }

  function handlePageChange(event) {
    const nextPageId = String(event.detail?.pageId || "");
    const previousPageId = String(event.detail?.previousPageId || currentPageId || "");

    if (navigatingBack) {
      navigatingBack = false;
    } else if (
      previousPageId
      && previousPageId !== nextPageId
      && !TRANSIENT_PAGES.has(previousPageId)
      && previousPageId !== "service-ended-page"
      && navigationStack[navigationStack.length - 1] !== previousPageId
    ) {
      navigationStack.push(previousPageId);
    }

    currentPageId = nextPageId;
    refreshControls();
  }

  function install() {
    refreshControls();
    currentPageId = document.querySelector(".page.active")?.id || currentPageId;
    document.addEventListener("click", handleControlClick, true);
    global.addEventListener("historypieces:pagechange", handlePageChange);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.querySelector(".hp-end-dialog")) closeEndDialog();
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-language]")) global.setTimeout(refreshLabels, 0);
    });

    global.HistoryPiecesExperienceControls = Object.freeze({
      goBack,
      openGallery,
      openEndDialog,
      finishExperience,
      navigationStack
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})(window);
