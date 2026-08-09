/* =========================================================
  History Pieces - 최유석 다음 장소 추천 모듈
  담당자: 최유석
  작성일: 2026-07-16

  통합 원칙
  - verified: true 데이터만 거리·외부 지도·공식 링크에 사용한다.
  - 검증 데이터가 3개보다 적으면 예선 코드에 있던 후보명·태그·설명만 보완한다.
  - 예선 후보에 없던 거리, 주소, 외부 URL은 임의로 만들지 않는다.
========================================================= */

(function yuseokRecommendationModule(global) {
  "use strict";

  const text = (key, params) => global.HistoryPiecesI18n
    ? global.HistoryPiecesI18n.tCurrent(key, params)
    : key;

  const DATA_PATH = "assets/data/source-facts.json";
  const PRELIMINARY_CANDIDATES = [
    {
      id: "mokpo-history-1",
      name: "목포근대역사관 1관",
      tags: ["근대건축", "원도심 역사", "도보 이동"],
      reason: {
        ko: "목포역에서 시작한 여정을 근대도시 목포의 역사 공간으로 자연스럽게 이어갈 수 있는 장소입니다.",
        cn: ""
      },
      verified: false,
      source: "preliminary"
    },
    {
      id: "mokpo-open-port-1897",
      name: "1897 개항문화거리",
      tags: ["개항 흔적", "거리 탐색", "사진 기록"],
      reason: {
        ko: "목포역에서 원도심으로 이동하며, 개항 이후 형성된 거리의 분위기를 체험할 수 있는 장소입니다.",
        cn: ""
      },
      verified: false,
      source: "preliminary"
    },
    {
      id: "mokpojin-history-park",
      name: "목포진 역사공원",
      tags: ["항구 방어", "역사 흔적", "다음 서사"],
      reason: {
        ko: "목포가 항구 도시로 기능해온 더 오래된 시간의 흔적을 이어서 확인할 수 있는 장소입니다.",
        cn: ""
      },
      verified: false,
      source: "preliminary"
    }
  ];

  const CHINESE_PLACE_COPY = Object.freeze({
    "mokpo-history-1": {
      name: "木浦近代历史馆1馆",
      tags: ["近代建筑", "旧城区历史", "步行移动"],
      reason: "可以把从木浦站开始的旅程自然延续到展现近代城市木浦历史的真实空间。",
      walkingTime: "步行12分钟"
    },
    "mokpo-open-port-1897": {
      name: "1897开港文化街",
      tags: ["开港遗迹", "街区探索", "摄影记录"],
      reason: "从木浦站前往旧城区的途中，可以感受开港后逐渐形成的街区风貌。",
      walkingTime: ""
    },
    "mokpojin-history-park": {
      name: "木浦镇历史公园",
      tags: ["港口防御", "历史遗迹", "后续故事"],
      reason: "可以继续探访木浦作为港口城市发展过程中更早期的历史痕迹。",
      walkingTime: ""
    }
  });

  let cachedFacts = null;
  let lastRecommendations = [];
  let selectedRecommendation = null;

  function getState() {
    if (global.YuseokAI) return global.YuseokAI.getCommonState();
    try {
      if (typeof appState !== "undefined") return appState;
    } catch (error) {
      // 다른 실행 환경에서는 window.appState를 사용한다.
    }
    return global.appState || null;
  }

  async function loadSourceFacts() {
    if (cachedFacts) return cachedFacts;

    try {
      const response = await fetch(DATA_PATH, { cache: "no-store" });
      if (!response.ok) throw new Error(`source-facts HTTP ${response.status}`);
      cachedFacts = await response.json();
    } catch (error) {
      console.warn("[최유석] 검증된 추천 데이터 파일을 불러오지 못했습니다.", error);
      cachedFacts = { recommendations: [] };
    }

    return cachedFacts;
  }

  function getLocalizedReason(item, language) {
    if (!item.reason || typeof item.reason !== "object") return String(item.reason || "");
    const ko = typeof item.reason.ko === "string" ? item.reason.ko : "";
    const cn = typeof item.reason.cn === "string" ? item.reason.cn : "";
    return language === "zh-CN" && cn.trim() ? cn : ko;
  }

  function normalizeRecommendation(item, language) {
    const cnReason = item.reason && typeof item.reason.cn === "string" ? item.reason.cn : "";
    const urls = item.urls && typeof item.urls === "object" ? item.urls : {};
    const id = String(item.id);
    const chinese = language === "zh-CN" ? CHINESE_PLACE_COPY[id] : null;
    const localizedReason = language === "zh-CN" && cnReason.trim()
      ? cnReason
      : (chinese?.reason || getLocalizedReason(item, language));

    return {
      id,
      name: chinese?.name || String(item.name),
      distance: item.distance ? String(item.distance) : "",
      walkingTime: chinese ? chinese.walkingTime : (item.walkingTime ? String(item.walkingTime) : ""),
      tags: chinese?.tags || (Array.isArray(item.tags) ? item.tags.map(String) : []),
      reason: localizedReason,
      zhSummary: language === "zh-CN" ? localizedReason : "",
      urls: {
        detail: typeof urls.detail === "string" && urls.detail ? urls.detail : null,
        map: typeof urls.map === "string" && urls.map ? urls.map : null,
        reservation: typeof urls.reservation === "string" && urls.reservation ? urls.reservation : null
      },
      verified: item.verified === true,
      source: item.verified === true ? "verified" : "preliminary"
    };
  }

  function isValidVerifiedRecommendation(item) {
    return Boolean(
      item &&
      item.verified === true &&
      typeof item.id === "string" && item.id.trim() &&
      typeof item.name === "string" && item.name.trim() &&
      typeof item.distance === "string" && item.distance.trim() &&
      typeof item.walkingTime === "string" && item.walkingTime.trim() &&
      Array.isArray(item.tags) &&
      item.reason && typeof item.reason.ko === "string" && typeof item.reason.cn === "string" &&
      item.urls && typeof item.urls.detail === "string" && typeof item.urls.map === "string"
    );
  }

  /**
   * 검증 추천을 우선하고, 부족한 수만 예선 후보로 채운다.
   * @param {Object=} userState
   * @returns {Promise<Array<Object>>}
   */
  async function yuseokRecommendPlaces(userState) {
    const state = userState || getState() || {};
    const facts = await loadSourceFacts();
    const language = state.language === "zh-CN" ? "zh-CN" : "ko";
    const verifiedPlaces = (Array.isArray(facts.recommendations) ? facts.recommendations : [])
      .filter(isValidVerifiedRecommendation)
      .map((item) => normalizeRecommendation(item, language));
    const places = [...verifiedPlaces];

    PRELIMINARY_CANDIDATES.forEach((item) => {
      if (places.length >= 3 || places.some((place) => place.id === item.id)) return;
      places.push(normalizeRecommendation(item, language));
    });

    return places.slice(0, 3);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function renderTags(tags) {
    const tagBox = document.getElementById("next-place-tags");
    if (!tagBox) return;

    tagBox.innerHTML = "";
    tags.forEach((tag) => {
      const span = document.createElement("span");
      span.textContent = tag;
      tagBox.appendChild(span);
    });
  }

  function createRecommendationOption(data) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recommendation-option";
    button.dataset.action = "open-recommendation-detail";
    button.dataset.recommendationId = data.id;
    button.setAttribute("aria-pressed", String(Boolean(selectedRecommendation && selectedRecommendation.id === data.id)));
    button.classList.toggle("selected", Boolean(selectedRecommendation && selectedRecommendation.id === data.id));

    const title = document.createElement("strong");
    title.textContent = data.name;
    const meta = document.createElement("span");
    meta.textContent = data.tags.join(" · ");
    const reason = document.createElement("small");
    reason.textContent = data.reason;
    button.append(title, meta, reason);
    return button;
  }

  function yuseokRenderRecommendationList(places) {
    const list = document.getElementById("next-place-candidate-list");
    const status = document.getElementById("next-place-list-status");
    if (!list) return false;

    list.innerHTML = "";
    places.forEach((place) => list.appendChild(createRecommendationOption(place)));

    if (status) {
      status.textContent = selectedRecommendation
        ? text("candidateSelected", { name: selectedRecommendation.name })
        : text("recommendationReady");
    }
    return places.length > 0;
  }

  function yuseokRenderRecommendationDetail(data) {
    if (!data) return false;

    setText("next-place-name", data.name);
    setText("next-place-distance", data.distance);
    setText("next-place-time", data.walkingTime);
    setText("next-place-map-destination", data.name);
    setText("next-place-reason", data.reason);
    renderTags(data.tags);

    const routeInfo = document.getElementById("next-place-route-info");
    if (routeInfo) routeInfo.classList.toggle("hidden", !data.distance && !data.walkingTime);

    const zhBox = document.getElementById("next-place-zh-summary");
    if (zhBox) {
      zhBox.textContent = data.zhSummary;
      zhBox.classList.toggle("hidden", !data.zhSummary);
    }

    const mapButton = document.getElementById("next-place-map-btn");
    const detailButton = document.getElementById("next-place-detail-btn");
    if (mapButton) mapButton.classList.toggle("hidden", !data.urls.map);
    if (detailButton) detailButton.classList.toggle("hidden", !data.urls.detail);
    return true;
  }

  async function yuseokRenderNextPlaceRecommendation() {
    const places = await yuseokRecommendPlaces();
    lastRecommendations = places;

    if (selectedRecommendation && !places.some((place) => place.id === selectedRecommendation.id)) {
      selectedRecommendation = null;
    }

    const state = getState();
    if (state) {
      state.recommendations = places;
      state.recommendation = selectedRecommendation;
    }
    yuseokRenderRecommendationList(places);
    return places;
  }

  async function yuseokOpenRecommendationDetail(recommendationId) {
    if (lastRecommendations.length === 0) {
      lastRecommendations = await yuseokRecommendPlaces();
    }

    const selected = lastRecommendations.find((place) => place.id === String(recommendationId));
    if (!selected) {
      if (typeof global.showToast === "function") global.showToast(text("candidateLoadError"));
      return null;
    }

    selectedRecommendation = selected;
    const state = getState();
    if (state) state.recommendation = selected;
    yuseokRenderRecommendationDetail(selected);
    yuseokRenderRecommendationList(lastRecommendations);

    if (typeof global.showPage === "function") global.showPage("next-place-detail-page");
    return selected;
  }

  function yuseokReserveNextPlace() {
    if (!selectedRecommendation) {
      if (typeof global.showToast === "function") global.showToast(text("recommendationSelect"));
      if (typeof global.showPage === "function") global.showPage("next-place-page");
      return false;
    }

    const state = getState();
    if (state) {
      state.reservedPlace = selectedRecommendation.name;
      state.reservationUrl = selectedRecommendation.urls.reservation;
      state.recommendation = selectedRecommendation;
    }

    setText("reserved-place-title", text("reservationTitle", { name: selectedRecommendation.name }));
    if (typeof global.showPage === "function") global.showPage("reservation-page");
    return true;
  }

  function resetRecommendationState() {
    lastRecommendations = [];
    selectedRecommendation = null;
  }

  global.YuseokRecommendation = Object.freeze({
    recommendPlaces: yuseokRecommendPlaces,
    renderRecommendationList: yuseokRenderRecommendationList,
    renderRecommendation: yuseokRenderRecommendationDetail,
    renderNextPlaceRecommendation: yuseokRenderNextPlaceRecommendation,
    openRecommendationDetail: yuseokOpenRecommendationDetail,
    reserveNextPlace: yuseokReserveNextPlace,
    getSelectedRecommendation: () => selectedRecommendation,
    reset: resetRecommendationState
  });

  global.yuseokRecommendPlaces = yuseokRecommendPlaces;
})(window);
