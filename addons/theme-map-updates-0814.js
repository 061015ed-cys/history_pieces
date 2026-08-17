(function installThemeMapUpdates0814(global) {
  "use strict";

  const THEMES = Object.freeze({
    food: Object.freeze({
      labelKo: "음식",
      labelZh: "美食",
      titleKo: "음식의 첫 기록을\n이렇게 시작할 수 있어요.",
      titleZh: "可以这样开始\n木浦的第一条美食记录。",
      missionKo: "항구 시장의 생활 기록",
      missionZh: "港口市场的生活记录",
      placeKo: "목포 종합수산시장",
      placeZh: "木浦综合水产市场",
      lat: 34.7877699,
      lng: 126.3898749,
      reasonKo: "목포의 항구 생활과 식문화를 한 장소에서 관찰할 수 있어 음식 테마의 첫 조각으로 추천해요.",
      reasonZh: "这里可以同时观察木浦的港口生活与饮食文化，因此推荐为美食主题的第一块碎片。"
    }),
    space: Object.freeze({
      labelKo: "도시의 변화",
      labelZh: "城市变化",
      titleKo: "공간의 첫 기록을\n이렇게 시작할 수 있어요.",
      titleZh: "可以这样开始\n观察空间变化的第一条记录。",
      missionKo: "근대 건축의 새 쓰임",
      missionZh: "近代建筑的新用途",
      placeKo: "목포근대역사관 1관",
      placeZh: "木浦近代历史馆1馆",
      lat: 34.78769578,
      lng: 126.3817942,
      reasonKo: "근대 건축물이 오늘의 역사공간으로 이어지는 변화를 살펴볼 수 있어 도시공간 테마의 첫 조각으로 추천해요.",
      reasonZh: "这里能观察近代建筑如何延续为今天的历史空间，因此推荐为城市变化主题的第一块碎片。"
    }),
    art: Object.freeze({
      labelKo: "예술",
      labelZh: "艺术",
      titleKo: "예술의 첫 기록을\n이렇게 시작할 수 있어요.",
      titleZh: "可以这样开始\n木浦的第一条艺术记录。",
      missionKo: "노적봉에서 만나는 오늘의 예술",
      missionZh: "在露积峰遇见今天的艺术",
      placeKo: "노적봉 예술공원 미술관",
      placeZh: "露积峰艺术公园美术馆",
      lat: 34.78811336,
      lng: 126.3809359,
      reasonKo: "원도심의 장소성과 현재 전시를 함께 살펴볼 수 있어 예술 테마의 첫 조각으로 추천해요.",
      reasonZh: "这里可以同时感受老城区的场所特征与当代展览，因此推荐为艺术主题的第一块碎片。"
    })
  });

  const NEXT_PLACES = Object.freeze({
    1: Object.freeze({
      placeKo: "목포 대중음악의 전당",
      placeZh: "木浦大众音乐殿堂",
      lat: 34.7888313,
      lng: 126.3862014
    }),
    2: Object.freeze({
      placeKo: "목포근대역사관 2관",
      placeZh: "木浦近代历史馆2馆",
      lat: 34.78596374,
      lng: 126.3814912
    })
  });

  const NEXT_ROUTE_PREVIEWS = Object.freeze({
    1: Object.freeze({
      startKo: "목포역",
      startZh: "木浦站",
      distanceMeters: 346,
      durationMinutes: 5,
      coordinates: Object.freeze([
        [126.386368, 34.790834],
        [126.386108, 34.790886],
        [126.386076, 34.790875],
        [126.386037, 34.790845],
        [126.385979, 34.790659],
        [126.385978, 34.790640],
        [126.385677, 34.790602],
        [126.385631, 34.790471],
        [126.385540, 34.790206],
        [126.385510, 34.790167],
        [126.385314, 34.789714],
        [126.386189, 34.789060],
        [126.386446, 34.788855],
        [126.386312, 34.788742],
        [126.3862014, 34.7888313]
      ])
    }),
    2: Object.freeze({
      startKo: "목포 대중음악의 전당",
      startZh: "木浦大众音乐殿堂",
      distanceMeters: 673,
      durationMinutes: 9,
      coordinates: Object.freeze([
        [126.386312, 34.788742],
        [126.386131, 34.788590],
        [126.386594, 34.788238],
        [126.385824, 34.787525],
        [126.385139, 34.786958],
        [126.384659, 34.786493],
        [126.384367, 34.786258],
        [126.383998, 34.786239],
        [126.383195, 34.786211],
        [126.382220, 34.786129],
        [126.381341, 34.786087],
        [126.381351, 34.785957],
        [126.3814912, 34.78596374]
      ])
    })
  });

  const THEME_ROUTE_FALLBACKS = Object.freeze({
    art: Object.freeze({
      startKo: "목포역",
      startZh: "木浦站",
      distanceMeters: 679,
      durationMinutes: 9,
      coordinates: Object.freeze([
        [126.386368, 34.790834],
        [126.386108, 34.790886],
        [126.386076, 34.790875],
        [126.386037, 34.790845],
        [126.385979, 34.790659],
        [126.385978, 34.790640],
        [126.385677, 34.790602],
        [126.385631, 34.790471],
        [126.385540, 34.790206],
        [126.385510, 34.790167],
        [126.384486, 34.790053],
        [126.383816, 34.789953],
        [126.383527, 34.789912],
        [126.382842, 34.789835],
        [126.381675, 34.789716],
        [126.381369, 34.789699],
        [126.381261, 34.789346],
        [126.381189, 34.789116],
        [126.381149, 34.788995],
        [126.381107, 34.788888],
        [126.381050, 34.788830],
        [126.381029, 34.788671],
        [126.381004, 34.788534],
        [126.380959, 34.788493],
        [126.380784, 34.788429],
        [126.380749, 34.788414],
        [126.3809359, 34.78811336]
      ])
    }),
    food: Object.freeze({
      startKo: "목포역",
      startZh: "木浦站",
      distanceMeters: 540,
      durationMinutes: 7,
      coordinates: Object.freeze([
        [126.386368, 34.790834],
        [126.386406, 34.790802],
        [126.386407, 34.790770],
        [126.386293, 34.790421],
        [126.386504, 34.790311],
        [126.386554, 34.790300],
        [126.387347, 34.790110],
        [126.387457, 34.790002],
        [126.388107, 34.789826],
        [126.388343, 34.789754],
        [126.388089, 34.789525],
        [126.388206, 34.789437],
        [126.388803, 34.788988],
        [126.389521, 34.788447],
        [126.389715, 34.788300],
        [126.390124, 34.787995],
        [126.3898749, 34.7877699]
      ])
    }),
    space: Object.freeze({
      startKo: "목포역",
      startZh: "木浦站",
      distanceMeters: 777,
      durationMinutes: 10,
      coordinates: Object.freeze([
        [126.386368, 34.790834],
        [126.386108, 34.790886],
        [126.386076, 34.790875],
        [126.386037, 34.790845],
        [126.385979, 34.790659],
        [126.385978, 34.790640],
        [126.385677, 34.790602],
        [126.385631, 34.790471],
        [126.385540, 34.790206],
        [126.385510, 34.790167],
        [126.384486, 34.790053],
        [126.383816, 34.789953],
        [126.383527, 34.789912],
        [126.382842, 34.789835],
        [126.381675, 34.789716],
        [126.381369, 34.789699],
        [126.381261, 34.789346],
        [126.381189, 34.789116],
        [126.381149, 34.788995],
        [126.381107, 34.788888],
        [126.381050, 34.788830],
        [126.381029, 34.788671],
        [126.381004, 34.788534],
        [126.381187, 34.788487],
        [126.381304, 34.788425],
        [126.381453, 34.788340],
        [126.381579, 34.788193],
        [126.381636, 34.788062],
        [126.381689, 34.787863],
        [126.381722, 34.787687],
        [126.3817942, 34.78769578]
      ])
    })
  });

  const FOOT_ROUTE_ENDPOINT = "https://routing.openstreetmap.de/routed-foot/route/v1/driving";

  let selectedTheme = "art";
  let selectedJourney = "space";
  let currentOriginPromise = null;
  let routeRenderSequence = 0;

  function state() {
    return global.appState || {};
  }

  function isChinese() {
    return state().language === "zh-CN";
  }

  function text(item, key) {
    return item[`${key}${isChinese() ? "Zh" : "Ko"}`];
  }

  function show(pageId) {
    if (typeof global.showPage === "function") global.showPage(pageId);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function setTitle(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerHTML = escapeHtml(value).replaceAll("\n", "<br>");
  }

  function naverSearchUrl(item) {
    return `https://map.naver.com/p/search/${encodeURIComponent(text(item, "place"))}`;
  }

  function naverScheme(item) {
    return `nmap://route/walk?dlat=${item.lat}&dlng=${item.lng}&dname=${encodeURIComponent(text(item, "place"))}&appname=historypieces`;
  }

  function openNaverDirections(item) {
    const fallback = naverSearchUrl(item);
    const userAgent = navigator.userAgent || "";
    if (/Android/i.test(userAgent)) {
      const intent = `intent://route/walk?dlat=${item.lat}&dlng=${item.lng}&dname=${encodeURIComponent(text(item, "place"))}&appname=historypieces#Intent;scheme=nmap;package=com.nhn.android.nmap;S.browser_fallback_url=${encodeURIComponent(fallback)};end`;
      global.location.href = intent;
      return;
    }
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      const startedAt = Date.now();
      global.location.href = naverScheme(item);
      global.setTimeout(() => {
        if (Date.now() - startedAt < 1800 && document.visibilityState === "visible") global.location.href = fallback;
      }, 1100);
      return;
    }
    global.open(fallback, "_blank", "noopener,noreferrer");
  }

  function osmEmbedUrl(item) {
    const left = (item.lng - 0.0048).toFixed(7);
    const bottom = (item.lat - 0.0032).toFixed(7);
    const right = (item.lng + 0.0048).toFixed(7);
    const top = (item.lat + 0.0032).toFixed(7);
    return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${item.lat}%2C${item.lng}`;
  }

  function routeBounds(coordinates, aspectRatio = 1.8) {
    const lngs = coordinates.map((point) => point[0]);
    const lats = coordinates.map((point) => point[1]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const lngPad = Math.max((maxLng - minLng) * 0.22, 0.00055);
    const latPad = Math.max((maxLat - minLat) * 0.22, 0.00055);
    let left = minLng - lngPad;
    let bottom = minLat - latPad;
    let right = maxLng + lngPad;
    let top = maxLat + latPad;
    const safeRatio = Math.min(3, Math.max(1, Number(aspectRatio) || 1.8));
    const xSpan = (right - left) * Math.PI / 180;
    const topY = mercatorY(top);
    const bottomY = mercatorY(bottom);
    const ySpan = topY - bottomY;
    if (xSpan / ySpan < safeRatio) {
      const center = (left + right) / 2;
      const halfDegrees = (ySpan * safeRatio * 180 / Math.PI) / 2;
      left = center - halfDegrees;
      right = center + halfDegrees;
    } else {
      const centerY = (topY + bottomY) / 2;
      const halfY = (xSpan / safeRatio) / 2;
      top = latitudeFromMercator(centerY + halfY);
      bottom = latitudeFromMercator(centerY - halfY);
    }
    return Object.freeze({ left, bottom, right, top });
  }

  function osmRouteEmbedUrl(item, bounds) {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.left.toFixed(7)}%2C${bounds.bottom.toFixed(7)}%2C${bounds.right.toFixed(7)}%2C${bounds.top.toFixed(7)}&layer=mapnik&marker=${item.lat}%2C${item.lng}`;
  }

  function mercatorY(latitude) {
    const bounded = Math.min(85, Math.max(-85, latitude));
    const radians = bounded * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + radians / 2));
  }

  function latitudeFromMercator(value) {
    return (2 * Math.atan(Math.exp(value)) - Math.PI / 2) * 180 / Math.PI;
  }

  function routeSvgMarkup(route, bounds) {
    const width = 1000;
    const height = 650;
    const topY = mercatorY(bounds.top);
    const bottomY = mercatorY(bounds.bottom);
    const points = route.coordinates.map(([lng, lat]) => {
      const x = ((lng - bounds.left) / (bounds.right - bounds.left)) * width;
      const y = ((topY - mercatorY(lat)) / (topY - bottomY)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    const [startX, startY] = points[0].split(",");
    const [endX, endY] = points[points.length - 1].split(",");
    const joined = points.join(" ");
    return `<svg class="hp-route-overlay" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <polyline class="hp-route-line hp-route-line--outline" points="${joined}"></polyline>
      <polyline class="hp-route-line" points="${joined}"></polyline>
      <circle class="hp-route-node hp-route-node--start" cx="${startX}" cy="${startY}" r="13"></circle>
      <circle class="hp-route-node hp-route-node--end" cx="${endX}" cy="${endY}" r="15"></circle>
    </svg>`;
  }

  function mapMarkup(item, routeKey) {
    const place = text(item, "place");
    const chinese = isChinese();
    const label = chinese ? "点击地图打开NAVER路线" : "지도 누르면 네이버지도 길찾기";
    const title = chinese ? `${place}地图` : `${place} 지도`;
    return `
      <iframe src="${osmEmbedUrl(item)}" title="${escapeHtml(title)}" loading="lazy" referrerpolicy="no-referrer" tabindex="-1"></iframe>
      <button type="button" class="hp-live-map-tap" data-theme-map-route="${escapeHtml(routeKey)}" aria-label="${escapeHtml(place)} ${escapeHtml(label)}"></button>`;
  }

  function routeMapMarkup(item, routeKey, route, aspectRatio) {
    const place = text(item, "place");
    const start = route[isChinese() ? "startZh" : "startKo"];
    const chinese = isChinese();
    const label = chinese ? "点击地图打开NAVER路线" : "지도 누르면 네이버지도 길찾기";
    const summary = chinese
      ? `步行约 ${route.durationMinutes}分钟 · ${route.distanceMeters}米`
      : `도보 약 ${route.durationMinutes}분 · ${route.distanceMeters}m`;
    const mapTitle = chinese ? `${start}至${place}的路线地图` : `${start}에서 ${place}까지 경로 지도`;
    const ariaLabel = chinese
      ? `${start}至${place}，${summary}。${label}`
      : `${start}에서 ${place}까지 ${summary}. ${label}`;
    const bounds = routeBounds(route.coordinates, aspectRatio);
    return `
      <iframe src="${osmRouteEmbedUrl(item, bounds)}" title="${escapeHtml(mapTitle)}" loading="lazy" referrerpolicy="no-referrer" tabindex="-1"></iframe>
      ${routeSvgMarkup(route, bounds)}
      <button type="button" class="hp-live-map-tap hp-live-map-tap--route" data-theme-map-route="${escapeHtml(routeKey)}" aria-label="${escapeHtml(ariaLabel)}"></button>`;
  }

  function renderRouteMapHost(host, item, routeKey, route) {
    const aspectRatio = host.clientWidth > 0 && host.clientHeight > 0
      ? host.clientWidth / host.clientHeight
      : 1.8;
    host.innerHTML = routeMapMarkup(item, routeKey, route, aspectRatio);
  }

  function currentOrigin() {
    if (currentOriginPromise) return currentOriginPromise;
    currentOriginPromise = new Promise((resolve) => {
      if (!navigator.geolocation?.getCurrentPosition) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Number(position.coords?.latitude);
          const lng = Number(position.coords?.longitude);
          resolve(Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null);
        },
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
      );
    });
    return currentOriginPromise;
  }

  async function fetchWalkingRoute(origin, item) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeoutId = global.setTimeout(() => controller?.abort(), 7000);
    try {
      const coordinates = `${origin.lng},${origin.lat};${item.lng},${item.lat}`;
      const response = await fetch(`${FOOT_ROUTE_ENDPOINT}/${coordinates}?overview=full&geometries=geojson&steps=false`, {
        signal: controller?.signal
      });
      if (!response.ok) throw new Error(`route http ${response.status}`);
      const payload = await response.json();
      const result = payload?.code === "Ok" ? payload.routes?.[0] : null;
      const points = result?.geometry?.coordinates;
      if (!Array.isArray(points) || points.length < 2) throw new Error("route geometry unavailable");
      const validPoints = points
        .map((point) => [Number(point?.[0]), Number(point?.[1])])
        .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));
      if (validPoints.length < 2) throw new Error("route coordinates invalid");
      validPoints.unshift([origin.lng, origin.lat]);
      validPoints.push([item.lng, item.lat]);
      return Object.freeze({
        startKo: "현재 위치",
        startZh: "当前位置",
        distanceMeters: Math.max(1, Math.round(Number(result.distance) || 0)),
        durationMinutes: Math.max(1, Math.round((Number(result.duration) || 0) / 60)),
        coordinates: Object.freeze(validPoints)
      });
    } finally {
      global.clearTimeout(timeoutId);
    }
  }

  function upgradeThemeRoute(host, item, routeKey) {
    const token = String(++routeRenderSequence);
    host.dataset.hpRouteRender = token;
    currentOrigin()
      .then((origin) => origin ? fetchWalkingRoute(origin, item) : null)
      .then((route) => {
        if (!route || !host.isConnected || host.dataset.hpRouteRender !== token) return;
        renderRouteMapHost(host, item, routeKey, route);
      })
      .catch(() => {
        /* 현재 위치 경로를 불러오지 못하면 이미 표시한 목포역 기준 경로를 유지합니다. */
      });
  }

  function ensureMapHost(oldId, newId) {
    let host = document.getElementById(newId);
    if (host) return host;
    const old = document.getElementById(oldId);
    if (!old) return null;
    host = document.createElement("div");
    host.id = newId;
    host.className = "hp-live-map";
    old.replaceWith(host);
    host.closest(".pdf-first-place-card")?.classList.add("hp-map-place-card");
    return host;
  }

  function renderMap(hostId, item, routeKey) {
    const host = document.getElementById(hostId);
    if (!host) return;
    if (routeKey.startsWith("theme:")) {
      const themeKey = routeKey.split(":")[1];
      const fallbackRoute = THEME_ROUTE_FALLBACKS[themeKey];
      if (fallbackRoute) {
        renderRouteMapHost(host, item, routeKey, fallbackRoute);
        upgradeThemeRoute(host, item, routeKey);
        return;
      }
    }
    host.innerHTML = mapMarkup(item, routeKey);
  }

  function renderOneMission(containerId, item) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<article><b>${isChinese() ? "碎片任务 1" : "조각 미션 1"}</b><span>${escapeHtml(text(item, "mission"))}</span></article>`;
  }

  function renderThemeResult(key = selectedTheme) {
    selectedTheme = THEMES[key] ? key : "art";
    const item = THEMES[selectedTheme];
    setText("pdf-theme-result-label", `${text(item, "label")} · ${isChinese() ? "碎片任务 1" : "조각 미션 1"}`);
    setTitle("pdf-theme-result-title", text(item, "title"));
    renderOneMission("pdf-theme-piece-list", item);
    renderMap("pdf-theme-map", item, `theme:${selectedTheme}`);
    setText("pdf-theme-place", text(item, "place"));
    setText("pdf-theme-distance", isChinese() ? "点击地图打开NAVER路线" : "지도를 눌러 네이버지도 길찾기");
    const detail = document.getElementById("pdf-theme-detail-button");
    if (detail) detail.innerHTML = `${isChinese() ? "查看碎片任务1" : "조각 미션 1 확인하기"} <span>→</span>`;
  }

  function preferenceTitle(key) {
    const titles = {
      space: ["공간의 변화를 보는 길", "观察空间变化的路线"],
      food: ["목포의 식문화를 만나는 길", "体验木浦饮食文化的路线"],
      art: ["예술로 이어지는 길", "通往艺术的路线"]
    };
    return titles[key][isChinese() ? 1 : 0];
  }

  function renderPreference() {
    const list = document.getElementById("pdf-preference-list");
    const order = ["space", "food", "art"];
    if (list) {
      list.innerHTML = order.map((key, index) => {
        const item = THEMES[key];
        return `<button type="button" data-pdf-action="select-preference" data-theme="${key}" aria-pressed="${key === selectedJourney}">
          <strong>${isChinese() ? "候选" : "후보"} ${String.fromCharCode(65 + index)} · ${preferenceTitle(key)}</strong>
          <span>${isChinese() ? "碎片任务1" : "조각 미션 1"} <i>●</i></span>
          <small>${escapeHtml(text(item, "place"))}</small>
        </button>`;
      }).join("");
    }
    const item = THEMES[selectedJourney];
    setText("pdf-preference-reason", `${isChinese() ? "推荐依据" : "추천 기준"} · ${text(item, "reason")}`);
    const detail = document.getElementById("pdf-preference-detail-button");
    if (detail) detail.innerHTML = `${isChinese() ? "查看推荐理由" : "추천 이유 보기"} <span>→</span>`;
  }

  function renderRecommendationReason() {
    const item = THEMES[selectedJourney] || THEMES.space;
    setText("hp-recommend-reason-label", `${text(item, "label")} · ${isChinese() ? "推荐理由" : "추천 이유"}`);
    setTitle("hp-recommend-reason-title", isChinese() ? `为什么推荐\n${text(item, "place")}？` : `왜 ${text(item, "place")}을\n추천했을까요?`);
    setText("hp-recommend-reason-copy", text(item, "reason"));
    setText("hp-recommend-mission", `${isChinese() ? "碎片任务 1" : "조각 미션 1"} · ${text(item, "mission")}`);
    setText("hp-recommend-place", text(item, "place"));
    renderMap("hp-recommend-map", item, `theme:${selectedJourney}`);
    const mapGuide = document.querySelector("#hp-recommend-map + div small");
    const back = document.querySelector("#hp-recommend-reason-page [data-next=\"pdf-preference-page\"]");
    if (mapGuide) mapGuide.textContent = isChinese() ? "点击地图打开NAVER路线" : "지도 클릭하면 네이버지도 길찾기로 이동";
    if (back) back.textContent = isChinese() ? "返回推荐列表" : "추천 목록으로 돌아가기";
    const button = document.querySelector('[data-theme-map-action="reason-continue"]');
    if (button) button.innerHTML = `${isChinese() ? "查看碎片任务1" : "조각 미션 1 확인하기"} <span>→</span>`;
  }

  function renderJourneyDetail(key = selectedJourney) {
    selectedJourney = THEMES[key] ? key : "space";
    const item = THEMES[selectedJourney];
    setText("pdf-journey-detail-label", preferenceTitle(selectedJourney));
    setTitle("pdf-journey-detail-title", isChinese() ? "从碎片任务1\n轻松开始吧？" : "조각 미션 1부터\n가볍게 시작해볼까요?");
    renderOneMission("pdf-journey-detail-pieces", item);
    renderMap("pdf-journey-detail-map", item, `theme:${selectedJourney}`);
    setText("pdf-journey-detail-place", text(item, "place"));
    setText("pdf-journey-detail-distance", isChinese() ? "点击地图打开NAVER路线" : "지도를 눌러 네이버지도 길찾기");
    setText("pdf-route-end", text(item, "place"));
    const mapButton = document.getElementById("pdf-open-map-button");
    if (mapButton) mapButton.dataset.mapUrl = naverSearchUrl(item);
  }

  function continueFromJourneyDetail(item) {
    const place = text(item, "place");
    const title = document.getElementById("reserved-place-title");
    const description = document.querySelector("#reservation-page .unlock-card p");
    const note = document.querySelector("#reservation-page .giroksae-note p");
    if (title) title.textContent = isChinese() ? `${place}路线已准备` : `${place} 여정 준비 완료`;
    if (description) {
      description.textContent = isChinese()
        ? "已连接路线信息。到达地点后，可以从第一块记录继续下一段旅程。"
        : "길찾기 정보를 연결했습니다. 장소에 도착한 뒤 조각 미션 1부터 다음 여정을 이어갈 수 있습니다.";
    }
    if (note) note.textContent = isChinese() ? "很好。下一段记录，就从那里继续吧。" : "좋아. 다음 기록은 그곳에서 이어가자.";
    show("reservation-page");
  }

  function renderNextPlaceMap() {
    const pieceNumber = Math.min(3, Math.max(1, Number(state().currentPiece) || 1));
    const preview = document.getElementById("hp-next-place-preview");
    if (!preview) return;
    const item = NEXT_PLACES[pieceNumber];
    const oldMap = preview.querySelector(".hp-map-preview");
    const oldLink = preview.querySelector("[data-hp-map-link]");
    if (!item) {
      preview.classList.add("hidden");
      return;
    }
    preview.classList.remove("hidden");
    let host = preview.querySelector(".hp-live-map");
    if (!host && oldMap) {
      const route = oldMap.querySelector("[data-hp-route]");
      const routeText = route?.textContent || "";
      host = document.createElement("div");
      host.className = "hp-live-map hp-live-map--next";
      oldMap.replaceWith(host);
      const routeLine = document.createElement("p");
      routeLine.className = "hp-next-route-text";
      routeLine.dataset.hpRoute = "";
      routeLine.textContent = routeText;
      host.insertAdjacentElement("afterend", routeLine);
    }
    if (host) {
      const route = NEXT_ROUTE_PREVIEWS[pieceNumber];
      if (route) renderRouteMapHost(host, item, `next:${pieceNumber}`, route);
      else host.innerHTML = mapMarkup(item, `next:${pieceNumber}`);
      preview.prepend(host);

      const routeLine = preview.querySelector("[data-hp-route]");
      if (routeLine && route) {
        const start = route[isChinese() ? "startZh" : "startKo"];
        routeLine.textContent = isChinese()
          ? `${start} → ${text(item, "place")} · 步行约 ${route.durationMinutes}分钟 · ${route.distanceMeters}米`
          : `${start} → ${text(item, "place")} · 도보 약 ${route.durationMinutes}분 · ${route.distanceMeters}m`;
      }

      let guide = preview.querySelector(".hp-next-map-guide");
      if (!guide) {
        guide = document.createElement("p");
        guide.className = "hp-next-map-guide";
        routeLine?.insertAdjacentElement("afterend", guide);
      }
      guide.textContent = isChinese()
        ? "点击地图后将连接到NAVER地图路线。"
        : "지도를 누르면 네이버지도 길찾기로 연결됩니다.";
    }
    if (oldLink) oldLink.classList.add("hidden");
  }

  function appendReasonPage() {
    const shell = document.querySelector(".app-shell");
    if (!shell || document.getElementById("hp-recommend-reason-page")) return;
    shell.insertAdjacentHTML("beforeend", `
      <section id="hp-recommend-reason-page" class="page pdf-ux-page" data-owner="요청 반영 · 추천 이유와 지도">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout pdf-theme-layout">
          <p id="hp-recommend-reason-label" class="ornament-label"></p>
          <h1 id="hp-recommend-reason-title" class="mini-title"></h1>
          <article class="pdf-first-place-card hp-map-place-card">
            <div id="hp-recommend-map" class="hp-live-map"></div>
            <div><strong id="hp-recommend-place"></strong><small>${isChinese() ? "点击地图打开NAVER路线" : "지도 클릭하면 네이버지도 길찾기로 이동"}</small></div>
          </article>
          <article class="content-card hp-recommend-reason-card">
            <p class="tag">RECOMMENDATION</p>
            <p id="hp-recommend-reason-copy" class="description"></p>
            <strong id="hp-recommend-mission"></strong>
          </article>
          <button type="button" class="big-button" data-theme-map-action="reason-continue"></button>
          <button type="button" class="text-button" data-next="pdf-preference-page">${isChinese() ? "返回推荐列表" : "추천 목록으로 돌아가기"}</button>
        </div>
      </section>`);
  }

  function prepareExistingPages() {
    const themeMap = ensureMapHost("pdf-theme-photo", "pdf-theme-map");
    const journeyMap = ensureMapHost("pdf-journey-detail-photo", "pdf-journey-detail-map");
    const themeCard = themeMap?.closest(".pdf-first-place-card");
    const journeyCard = journeyMap?.closest(".pdf-first-place-card");
    const themeContents = document.getElementById("pdf-theme-piece-list");
    const journeyContents = document.getElementById("pdf-journey-detail-pieces");
    if (themeCard && themeContents) themeContents.insertAdjacentElement("beforebegin", themeCard);
    if (journeyCard && journeyContents) journeyContents.insertAdjacentElement("beforebegin", journeyCard);
    appendReasonPage();
    const completionTitle = document.getElementById("pdf-complete-title");
    const nextPreview = document.getElementById("hp-next-place-preview");
    if (completionTitle && nextPreview) completionTitle.insertAdjacentElement("afterend", nextPreview);
  }

  function routeItem(key) {
    if (key.startsWith("theme:")) return THEMES[key.split(":")[1]];
    if (key.startsWith("next:")) return NEXT_PLACES[Number(key.split(":")[1])];
    return null;
  }

  function handleClickCapture(event) {
    const routeButton = event.target.closest("[data-theme-map-route]");
    if (routeButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const item = routeItem(routeButton.dataset.themeMapRoute);
      if (item) openNaverDirections(item);
      return;
    }

    const localAction = event.target.closest("[data-theme-map-action]")?.dataset.themeMapAction;
    if (localAction === "reason-continue") {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderJourneyDetail(selectedJourney);
      show("pdf-journey-detail-page");
      return;
    }

    const trigger = event.target.closest("[data-pdf-action]");
    const action = trigger?.dataset.pdfAction;
    if (!["choose-theme", "open-personal-recommendation", "select-preference", "open-preference-detail", "open-theme-detail", "open-journey-map"].includes(action)) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if (action === "choose-theme") {
      selectedTheme = trigger.dataset.theme || "art";
      renderThemeResult(selectedTheme);
      show("pdf-theme-result-page");
    } else if (action === "open-personal-recommendation") {
      selectedJourney = "space";
      renderPreference();
      show("pdf-preference-page");
    } else if (action === "select-preference") {
      selectedJourney = trigger.dataset.theme || "space";
      renderPreference();
    } else if (action === "open-preference-detail") {
      renderRecommendationReason();
      show("hp-recommend-reason-page");
    } else if (action === "open-theme-detail") {
      selectedJourney = selectedTheme;
      renderJourneyDetail(selectedTheme);
      show("pdf-journey-detail-page");
    } else if (action === "open-journey-map") {
      const item = THEMES[selectedJourney] || THEMES.space;
      openNaverDirections(item);
      continueFromJourneyDetail(item);
    }
  }

  function handlePageChange(event) {
    const pageId = String(event.detail?.pageId || "");
    if (pageId === "pdf-theme-result-page") renderThemeResult(selectedTheme);
    if (pageId === "pdf-preference-page") renderPreference();
    if (pageId === "hp-recommend-reason-page") renderRecommendationReason();
    if (pageId === "pdf-journey-detail-page") renderJourneyDetail(selectedJourney);
    if (pageId === "pdf-place-complete-page") global.queueMicrotask(renderNextPlaceMap);
  }

  function install() {
    prepareExistingPages();
    global.addEventListener("click", handleClickCapture, true);
    global.addEventListener("historypieces:pagechange", handlePageChange);
    global.HistoryPiecesThemeMapUpdates0814 = Object.freeze({
      themes: THEMES,
      themeRouteFallbacks: THEME_ROUTE_FALLBACKS,
      nextRoutePreviews: NEXT_ROUTE_PREVIEWS,
      renderThemeResult,
      renderPreference,
      renderRecommendationReason,
      renderJourneyDetail,
      renderNextPlaceMap
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})(window);
