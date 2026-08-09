(function historyPiecesIntegratedUi(global) {
  "use strict";

  const COPY = {
    ko: {
      label: "이야기 조각 진행",
      count: (piece) => `${piece}/3`,
      current: "현재 조각",
      button: {
        1: "첫 번째 조각 찾기",
        2: "두 번째 조각 찾기",
        3: "세 번째 조각 찾기"
      },
      pieces: {
        1: { title: "목포의 첫 관문", clue: "목포역 간판" },
        2: { title: "원도심으로 향하는 길", clue: "역 앞 광장과 방향" },
        3: { title: "사람들이 오가던 역전", clue: "이동과 생활의 흔적" }
      }
    },
    "zh-CN": {
      label: "故事碎片进度",
      count: (piece) => `${piece}/3`,
      current: "当前碎片",
      button: {
        1: "寻找第一块碎片",
        2: "寻找第二块碎片",
        3: "寻找第三块碎片"
      },
      pieces: {
        1: { title: "木浦的第一道门户", clue: "木浦站招牌" },
        2: { title: "通往旧城区的路", clue: "站前广场与方向" },
        3: { title: "人来人往的站前", clue: "移动与生活的痕迹" }
      }
    }
  };

  let bypassMissionGuideOnce = false;

  function language() {
    return global.appState && global.appState.language === "zh-CN" ? "zh-CN" : "ko";
  }

  function currentPiece() {
    const state = global.appState || {};
    const collected = Array.isArray(state.collectedPieces) ? state.collectedPieces : [];
    if (collected.includes(2) || collected.includes(3)) return 3;
    if (collected.includes(1)) return 2;
    return 1;
  }

  function missionPage(piece) {
    return `piece-${piece}-mission-page`;
  }

  function pieceFromMissionPage(pageId) {
    const match = String(pageId || "").match(/^piece-([123])-mission-page$/);
    return match ? Number(match[1]) : null;
  }


  function ensureRecommendationRouteMap() {
    const map = document.querySelector("#next-place-detail-page .mini-map");
    if (!map) return;
    map.classList.add("hp-route-map");

    let start = map.querySelector(".map-node.start");
    let destination = map.querySelector("#next-place-map-destination");
    let arrow = map.querySelector(".hp-route-arrow");

    if (!start) {
      start = document.createElement("div");
      start.className = "map-node start";
      start.textContent = language() === "zh-CN" ? "木浦站" : "목포역";
    }
    if (!destination) {
      destination = document.createElement("div");
      destination.id = "next-place-map-destination";
      destination.className = "map-node end";
    }
    if (!arrow) {
      arrow = document.createElement("span");
      arrow.className = "hp-route-arrow";
      arrow.textContent = "→";
      arrow.setAttribute("aria-hidden", "true");
    }

    const hasLegacyPath = Boolean(map.querySelector(".map-path"));
    const correctOrder = map.children.length === 3
      && map.children[0] === start
      && map.children[1] === arrow
      && map.children[2] === destination;

    if (hasLegacyPath || !correctOrder) {
      map.querySelectorAll(".map-path").forEach((node) => node.remove());
      map.replaceChildren(start, arrow, destination);
    }
  }

  function replaceQuestionWithFeather() {
    const icon = document.querySelector("#place-confirm-page .giroksae-note.before-appear span");
    if (!icon) return;
    icon.textContent = "🖼️";
    icon.setAttribute("aria-label", language() === "zh-CN" ? "记录鸟" : "기록새");
  }


  function replaceGuideImagesWithFeather(root = document) {
    root.querySelectorAll('img[alt="기록새"], img[alt="记录鸟"]').forEach((image) => {
      if (image.dataset.hpFeatherReplaced === "true") return;
      const placeholder = document.createElement("div");
      const isLarge = image.classList.contains("giroksae-large");
      const isPanel = image.hasAttribute("data-panel-image");
      placeholder.className = `hp-giroksae-placeholder${isLarge ? " hp-giroksae-placeholder-large" : ""}${isPanel ? " hp-giroksae-placeholder-panel" : ""}`;
      placeholder.setAttribute("role", "img");
      placeholder.setAttribute("aria-label", language() === "zh-CN" ? "记录鸟" : "기록새");
      placeholder.innerHTML = `<span class="hp-giroksae-placeholder-icon">🖼️</span><span class="hp-giroksae-placeholder-label">${language() === "zh-CN" ? "记录鸟" : "기록새"}</span>`;
      image.dataset.hpFeatherReplaced = "true";
      image.replaceWith(placeholder);
    });
  }


  function setTextIfPresent(selector, value) {
    if (!value) return;
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function syncGiroksaeDialogues() {
    const copy = global.HistoryPiecesCopy && typeof global.HistoryPiecesCopy.get === "function"
      ? global.HistoryPiecesCopy.get()
      : null;
    if (!copy) return;

    const isZh = language() === "zh-CN";
    const introLines = copy.giroksae_dialogue && Array.isArray(copy.giroksae_dialogue.intro_lines)
      ? copy.giroksae_dialogue.intro_lines
      : [];

    setTextIfPresent("#giroksae-intro-text", introLines[0] || "");
    setTextIfPresent("#place-confirm-page .before-appear p", copy.system_ui && copy.system_ui.analysis_result_dialogue);
    setTextIfPresent("#mokpo-guide-page .giroksae-note p", isZh ? "好。我们按顺序去找藏在木浦站里的三个碎片吧。" : "좋아. 목포역에 숨은 세 조각을 차례로 찾아보자.");
    setTextIfPresent("#unlock-giroksae-line", copy.giroksae_dialogue && copy.giroksae_dialogue.unlock_page);
    setTextIfPresent("#place-story-line", copy.giroksae_dialogue && copy.giroksae_dialogue.place_story);
    setTextIfPresent("#journey-film-page .giroksae-note p", isZh ? "好。下一段记录，就在那里继续吧。" : "좋아. 다음 기록은 그곳에서 이어가자.");

    const currentPiece = global.appState && Number(global.appState.currentPiece);
    if ([1, 2, 3].includes(currentPiece)) {
      const overlayLine = copy.giroksae_dialogue && copy.giroksae_dialogue[`piece_${currentPiece}_overlay`];
      setTextIfPresent("#piece-overlay-giroksae-line", overlayLine || "");
    }
  }

  function wrapCultureCopy() {
    if (typeof global.applyCultureCopy !== "function" || global.applyCultureCopy.__hpGiroksaeWrapped) return;
    const original = global.applyCultureCopy;
    const wrapped = function applyCultureCopyWithGiroksaeSync() {
      const result = original.apply(this, arguments);
      syncGiroksaeDialogues();
      setTimeout(syncGiroksaeDialogues, 0);
      return result;
    };
    wrapped.__hpGiroksaeWrapped = true;
    global.applyCultureCopy = wrapped;
  }

  function installSettingsScrollSupport(root = document) {
    const pages = root.matches && root.matches("#language-page, #country-page")
      ? [root]
      : [...root.querySelectorAll("#language-page, #country-page")];

    pages.forEach((page) => {
      const card = page.querySelector(".setting-card.list-card");
      if (!card || card.dataset.hpScrollBound === "true") return;
      card.dataset.hpScrollBound = "true";
      card.setAttribute("tabindex", "0");

      card.addEventListener("wheel", (event) => {
        const maxScroll = card.scrollHeight - card.clientHeight;
        if (maxScroll <= 0) return;
        const next = Math.max(0, Math.min(maxScroll, card.scrollTop + event.deltaY));
        if (next !== card.scrollTop) {
          card.scrollTop = next;
          event.preventDefault();
        }
      }, { passive: false, capture: true });

      card.addEventListener("keydown", (event) => {
        const pageStep = Math.max(80, card.clientHeight * 0.72);
        const keySteps = {
          ArrowDown: 54,
          ArrowUp: -54,
          PageDown: pageStep,
          PageUp: -pageStep,
          Home: -Infinity,
          End: Infinity
        };
        if (!(event.key in keySteps)) return;
        const maxScroll = Math.max(0, card.scrollHeight - card.clientHeight);
        const step = keySteps[event.key];
        card.scrollTop = step === Infinity ? maxScroll
          : step === -Infinity ? 0
          : Math.max(0, Math.min(maxScroll, card.scrollTop + step));
        event.preventDefault();
      });
    });
  }

  let layoutAuditTimer = null;

  function adjustPageLayout(page) {
    if (!page || !page.classList.contains("active")) return;
    const layout = page.querySelector(".screen-layout");
    if (!layout) return;

    if (page.id === "language-page" || page.id === "country-page") {
      layout.classList.remove("hp-overflow-layout");
      installSettingsScrollSupport(page);
      return;
    }

    layout.classList.remove("hp-overflow-layout");
    const pageRect = page.getBoundingClientRect();
    const layoutRect = layout.getBoundingClientRect();
    const style = getComputedStyle(page);
    const availableHeight = page.clientHeight
      - (parseFloat(style.paddingTop) || 0)
      - (parseFloat(style.paddingBottom) || 0);
    const contentHeight = Math.max(layout.scrollHeight, layoutRect.height);
    const topIsClipped = layoutRect.top < pageRect.top - 1;
    const contentIsLong = contentHeight > availableHeight + 1;

    if (topIsClipped || contentIsLong) {
      layout.classList.add("hp-overflow-layout");
    }
  }

  function scheduleLayoutAudit() {
    clearTimeout(layoutAuditTimer);
    const run = () => {
      replaceGuideImagesWithFeather();
      syncGiroksaeDialogues();
      ensureRecommendationRouteMap();
      const activePage = document.querySelector(".page.active");
      adjustPageLayout(activePage);
    };
    requestAnimationFrame(run);
    layoutAuditTimer = setTimeout(run, 80);
    setTimeout(run, 320);
  }

  function installStablePageScroll() {
    if (document.documentElement.dataset.hpStableScrollBound === "true") return;
    document.documentElement.dataset.hpStableScrollBound = "true";

    const activeScrollablePage = (target) => {
      const page = document.querySelector(".page.active");
      if (!page || page.id === "language-page" || page.id === "country-page") return null;
      if (target && target.closest && target.closest(".setting-card.list-card")) return null;
      return page;
    };

    document.addEventListener("wheel", (event) => {
      const page = activeScrollablePage(event.target);
      if (!page) return;
      const maxScroll = Math.max(0, page.scrollHeight - page.clientHeight);
      if (maxScroll <= 0) return;
      const next = Math.max(0, Math.min(maxScroll, page.scrollTop + event.deltaY));
      if (next === page.scrollTop) return;
      page.scrollTop = next;
      event.preventDefault();
    }, { passive: false, capture: true });

    let touchPage = null;
    let touchY = 0;

    document.addEventListener("touchstart", (event) => {
      if (!event.touches || event.touches.length !== 1) {
        touchPage = null;
        return;
      }
      touchPage = activeScrollablePage(event.target);
      touchY = event.touches[0].clientY;
    }, { passive: true, capture: true });

    document.addEventListener("touchmove", (event) => {
      if (!touchPage || !event.touches || event.touches.length !== 1) return;
      const maxScroll = Math.max(0, touchPage.scrollHeight - touchPage.clientHeight);
      if (maxScroll <= 0) return;
      const currentY = event.touches[0].clientY;
      const delta = touchY - currentY;
      touchY = currentY;
      const next = Math.max(0, Math.min(maxScroll, touchPage.scrollTop + delta));
      if (next === touchPage.scrollTop) return;
      touchPage.scrollTop = next;
      event.preventDefault();
    }, { passive: false, capture: true });

    document.addEventListener("touchend", () => {
      touchPage = null;
    }, { passive: true, capture: true });

    document.addEventListener("touchcancel", () => {
      touchPage = null;
    }, { passive: true, capture: true });
  }

  function installActivePageObserver() {
    const pageClassObserver = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.type === "attributes")) scheduleLayoutAudit();
    });
    document.querySelectorAll(".page").forEach((page) => {
      pageClassObserver.observe(page, { attributes: true, attributeFilter: ["class"] });
    });

    global.addEventListener("resize", scheduleLayoutAudit);
  }

  function bindGuideButton(button) {
    if (!button || button.dataset.hpGuideBound === "true") return;
    button.dataset.hpGuideBound = "true";
    button.addEventListener("click", () => {
      const target = button.dataset.hpMissionTarget;
      if (!target || typeof global.showPage !== "function") return;
      bypassMissionGuideOnce = true;
      global.showPage(target);
    });
  }

  function renderGuideProgress(requestedPiece) {
    const page = document.getElementById("mokpo-guide-page");
    if (!page) return;
    const layout = page.querySelector(".screen-layout");
    const title = page.querySelector(".mini-title");
    if (!layout || !title) return;

    const c = COPY[language()];
    const piece = [1, 2, 3].includes(Number(requestedPiece)) ? Number(requestedPiece) : currentPiece();
    const mission = c.pieces[piece];

    let shell = page.querySelector(".hp-guide-progress");
    if (!shell) {
      shell = document.createElement("section");
      shell.className = "hp-guide-progress";
      title.insertAdjacentElement("afterend", shell);
    }

    shell.innerHTML = `
      <div class="hp-guide-progress-top">
        <strong>${c.label}</strong>
        <span>${c.count(piece)}</span>
      </div>
      <div class="hp-guide-progress-segments" aria-label="${c.label}" role="progressbar" aria-valuemin="1" aria-valuemax="3" aria-valuenow="${piece}">
        ${[1, 2, 3].map((index) => `<i class="${index <= piece ? "active" : ""}"></i>`).join("")}
      </div>
      <div class="hp-guide-current">
        <small>${c.current} ${String(piece).padStart(2, "0")}</small>
        <strong>${mission.title}</strong>
        <span>${mission.clue}</span>
      </div>`;

    const button = page.querySelector(".big-button");
    if (button) {
      button.removeAttribute("data-next");
      button.dataset.hpMissionTarget = missionPage(piece);
      button.innerHTML = `${c.button[piece]} <span>→</span>`;
      bindGuideButton(button);
    }
  }

  function wrapPageNavigation() {
    if (typeof global.showPage !== "function" || global.showPage.__integratedUiWrapped) return;
    const original = global.showPage;

    const wrapped = function showIntegratedPage(pageId) {
      const missionPiece = pieceFromMissionPage(pageId);

      if (missionPiece && !bypassMissionGuideOnce) {
        original("mokpo-guide-page");
        renderGuideProgress(missionPiece);
        return;
      }

      if (bypassMissionGuideOnce) bypassMissionGuideOnce = false;
      original(pageId);

      if (pageId === "mokpo-guide-page") {
        renderGuideProgress(currentPiece());
      }
      scheduleLayoutAudit();
    };

    wrapped.__integratedUiWrapped = true;
    global.showPage = wrapped;
  }

  function wrapAnalyzeFirstPhoto() {
    if (typeof global.analyzeFirstPhoto !== "function" || global.analyzeFirstPhoto.__hpWrapped === true) return;
    const original = global.analyzeFirstPhoto;
    const wrapped = function analyzeFirstPhotoStable() {
      const state = global.appState || {};
      if (!state.photos || !state.photos.first) {
        return original.apply(this, arguments);
      }

      if (typeof global.showPage === "function") {
        global.showPage("place-loading-page");
      }

      clearTimeout(wrapped.__hpPendingTimer);
      wrapped.__hpPendingTimer = global.setTimeout(() => {
        const loadingPage = document.getElementById("place-loading-page");
        if (loadingPage && loadingPage.classList.contains("active") && typeof global.showPage === "function") {
          global.showPage("place-confirm-page");
        }
      }, 1450);
    };
    wrapped.__hpWrapped = true;
    global.analyzeFirstPhoto = wrapped;
  }

  function init() {
    replaceQuestionWithFeather();
    replaceGuideImagesWithFeather();
    wrapCultureCopy();
    syncGiroksaeDialogues();
    installSettingsScrollSupport();
    ensureRecommendationRouteMap();
    wrapPageNavigation();
    wrapAnalyzeFirstPhoto();
    installStablePageScroll();
    installActivePageObserver();
    const active = document.querySelector(".page.active");
    if (active && active.id === "mokpo-guide-page") renderGuideProgress(currentPiece());
    scheduleLayoutAudit();
  }

  global.HistoryPiecesIntegratedUi = Object.freeze({
    showMissionDirect(pieceNumber) {
      const piece = Number(pieceNumber);
      if (![1, 2, 3].includes(piece) || typeof global.showPage !== "function") return;
      bypassMissionGuideOnce = true;
      global.showPage(missionPage(piece));
    },
    renderGuideProgress
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})(window);
