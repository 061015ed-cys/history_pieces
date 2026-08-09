(function historyPiecesPdfUx(global) {
  "use strict";

  const PIECES = Object.freeze({
    1: Object.freeze({
      current: "목포역",
      historic: "목포역",
      year: "1913년 5월 15일",
      fact: "호남선 목포–학교 구간 개통과 함께 목포역이 영업을 시작했습니다.",
      factZh: "1913年5月15日，木浦站随湖南线木浦至学校区间开通而开始营业。",
      source: "한국민족문화대백과사전 – 목포역",
      sourceUrl: "https://encykorea.aks.ac.kr/Article/E0068032",
      currentImage: "addons/timetrace/assets/MST/current.jpg",
      archiveImage: "addons/timetrace/assets/MST/historical-source.jpg",
      next: "목포 대중음악의 전당",
      nextZh: "木浦大众音乐殿堂"
    }),
    2: Object.freeze({
      current: "목포 대중음악의 전당",
      historic: "호남은행 목포지점",
      year: "1929년",
      fact: "호남은행 목포지점 건물이 건립되었고, 현재는 음악 문화를 소개하는 공간으로 쓰이고 있습니다.",
      factZh: "湖南银行木浦支店建筑建于1929年，如今作为介绍音乐文化的空间使用。",
      source: "국가유산청 – 구 호남은행 목포지점",
      sourceUrl: "https://www.heritage.go.kr/",
      currentImage: "addons/timetrace/assets/HNB/current.jpg",
      archiveImage: "addons/timetrace/assets/HNB/historical-source.jpg",
      next: "목포근대역사관 2관",
      nextZh: "木浦近代历史馆2馆"
    }),
    3: Object.freeze({
      current: "목포근대역사관 2관",
      historic: "동양척식주식회사 목포지점",
      year: "1921년",
      fact: "동양척식주식회사 목포지점 건물은 식민지 토지 경영과 수탈 구조를 보여주는 역사적 공간입니다.",
      factZh: "东方拓殖株式会社木浦支店建筑反映了殖民地土地经营与掠夺结构。",
      source: "국가유산청 – 구 동양척식주식회사 목포지점",
      sourceUrl: "https://www.heritage.go.kr/",
      currentImage: "addons/timetrace/assets/MMH2/current.jpg",
      archiveImage: "addons/timetrace/assets/MMH2/historical-source.jpg",
      next: "세 장소의 전체 이야기",
      nextZh: "三个地点的完整故事"
    })
  });

  const STORY_IMAGES = Object.freeze([
    ["addons/webtoon-reference/piece-1/HP_C01_FIRST_ASSIGNMENT.png", "목포역 이야기 1컷"],
    ["addons/webtoon-reference/piece-1/HP_C02_MOKPO_STATION_CROWD_OBSERVATION_FINAL.png", "목포역 이야기 2컷"],
    ["addons/webtoon-reference/piece-1/HP_C03_MST_WAIT_FINAL.png", "목포역 이야기 3컷"],
    ["addons/webtoon-reference/piece-1/HP_C04_MST_SHOOT.png", "목포역 이야기 4컷"],
    ["addons/webtoon-reference/piece-2-style.jpg", "호남은행 목포지점 이야기"],
    ["addons/webtoon-reference/piece-3-style.jpg", "동양척식주식회사 목포지점 이야기"]
  ]);

  const THEME_JOURNEYS = Object.freeze({
    food: Object.freeze({
      label: "음식",
      labelZh: "美食",
      summary: "오늘의 항구도시 생활문화",
      summaryZh: "今天的港口城市生活文化",
      title: "음식의 기록을\n이렇게 이어볼 수 있어요.",
      titleZh: "可以这样继续\n木浦的美食记录。",
      pieces: ["항구의 아침 식탁", "시장에서 만나는 목포의 맛", "오늘의 식문화"],
      piecesZh: ["港口的早餐", "在市场遇见木浦风味", "今天的饮食文化"],
      place: "목포 종합수산시장",
      placeZh: "木浦综合水产市场",
      distance: "도보 10분",
      distanceZh: "步行10分钟",
      image: "",
      map: "https://map.naver.com/p/search/%EB%AA%A9%ED%8F%AC%20%EC%A2%85%ED%95%A9%EC%88%98%EC%82%B0%EC%8B%9C%EC%9E%A5"
    }),
    space: Object.freeze({
      label: "도시공간",
      labelZh: "城市空间",
      summary: "거리와 공간의 변화",
      summaryZh: "街道与空间的变化",
      title: "공간의 변화를 보는 기록을\n이렇게 이어볼 수 있어요.",
      titleZh: "可以这样继续\n观察空间变化的记录。",
      pieces: ["오래된 건물의 새 쓰임", "근대 도시의 흔적", "오늘의 역사공간"],
      piecesZh: ["老建筑的新用途", "近代城市的痕迹", "今天的历史空间"],
      place: "목포근대역사관 1관",
      placeZh: "木浦近代历史馆1馆",
      distance: "772m · 도보 12분",
      distanceZh: "772米 · 步行12分钟",
      image: "",
      map: "https://map.naver.com/p/directions/3ySQy2,2yTB3U,%EB%AA%A9%ED%8F%AC%EC%97%AD%20(%EA%B3%A0%EC%86%8D%EC%B2%A0%EB%8F%84),11630534,PLACE_POI/3ySESp,2yTrxo,%EB%AA%A9%ED%8F%AC%EA%B7%BC%EB%8C%80%EC%97%AD%EC%82%AC%EA%B4%80%201%EA%B4%80,1281942881,PLACE_POI/-/walk/0?c=15.00,0,0,0,dh"
    }),
    art: Object.freeze({
      label: "예술",
      labelZh: "艺术",
      summary: "문학 · 음악 · 공연 · 현재 예술공간",
      summaryZh: "文学 · 音乐 · 演出 · 当代艺术空间",
      title: "예술의 기록을\n이렇게 이어볼 수 있어요.",
      titleZh: "可以这样继续\n木浦的艺术记录。",
      pieces: ["공간이 무대가 된 장면", "도시의 음악이 남은 곳", "오늘의 예술공간"],
      piecesZh: ["空间成为舞台的场景", "留下城市音乐的地方", "今天的艺术空间"],
      place: "목포 대중음악의 전당",
      placeZh: "木浦大众音乐殿堂",
      distance: "도보 9분",
      distanceZh: "步行9分钟",
      image: "addons/timetrace/assets/HNB/current.jpg",
      map: "https://map.naver.com/p/search/%EB%AA%A9%ED%8F%AC%20%EB%8C%80%EC%A4%91%EC%9D%8C%EC%95%85%EC%9D%98%20%EC%A0%84%EB%8B%B9"
    })
  });

  let activePiece = 1;
  let missionResult = null;
  let selectedTheme = "art";
  let selectedJourney = "space";
  const objectUrls = new Map();

  function state() {
    return global.appState || {};
  }

  function isChinese() {
    return state().language === "zh-CN";
  }

  function show(pageId) {
    if (typeof global.showPage === "function") global.showPage(pageId);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function sourceUrl(source, key) {
    if (typeof source === "string") return source;
    if (!(source instanceof Blob)) return "";
    if (!objectUrls.has(key)) objectUrls.set(key, URL.createObjectURL(source));
    return objectUrls.get(key);
  }

  function appendPages() {
    const shell = document.querySelector(".app-shell");
    if (!shell || document.getElementById("pdf-history-evidence-page")) return;
    shell.insertAdjacentHTML("beforeend", `
      <section id="pdf-history-evidence-page" class="page pdf-ux-page" data-owner="최유석 · PDF UX 보완">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p id="pdf-history-label" class="ornament-label">TimeTrace · 역사 근거</p>
          <h1 id="pdf-history-title" class="mini-title"></h1>
          <div class="pdf-time-compare">
            <figure><img id="pdf-history-archive" alt="과거 기록"><figcaption id="pdf-history-archive-caption"></figcaption></figure>
            <figure><img id="pdf-history-current" alt="현재 기록"><figcaption id="pdf-history-current-caption"></figcaption></figure>
          </div>
          <article class="content-card pdf-evidence-card">
            <p class="tag">VERIFIED FACT</p>
            <h2 id="pdf-history-year"></h2>
            <p id="pdf-history-fact" class="description"></p>
            <a id="pdf-history-source" target="_blank" rel="noopener noreferrer"></a>
          </article>
          <article class="pdf-ai-card">
            <strong id="pdf-ai-title">AI·데이터 처리 근거</strong>
            <p id="pdf-ai-desc">장소 인식 결과와 검증된 과거 사진을 연결해 과거·현재 비교 화면을 구성했습니다. 출처가 없는 생성 이미지는 역사 근거로 사용하지 않습니다.</p>
          </article>
          <button type="button" class="big-button" data-pdf-action="history-next">다음 <span>→</span></button>
        </div>
      </section>

      <section id="pdf-mission-result-page" class="page pdf-ux-page" data-owner="최유석 · PDF UX 보완">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p id="pdf-mission-label" class="ornament-label">미션 결과</p>
          <h1 id="pdf-mission-status" class="mini-title"></h1>
          <article class="content-card pdf-result-card">
            <p class="tag">선택한 기록</p>
            <div id="pdf-mission-selected" class="pdf-answer-list"></div>
            <hr>
            <p class="tag">검증된 정답</p>
            <div id="pdf-mission-answer" class="pdf-answer-list"></div>
          </article>
          <article id="pdf-mission-explanation" class="pdf-explanation"></article>
          <button type="button" id="pdf-mission-button" class="big-button" data-pdf-action="mission-next"></button>
        </div>
      </section>

      <section id="pdf-place-complete-page" class="page pdf-ux-page" data-owner="최유석 · PDF UX 보완">
        <div class="page-bg bg-unlock"></div>
        <div class="screen-layout standard-layout">
          <p id="pdf-complete-label" class="ornament-label"></p>
          <h1 id="pdf-complete-title" class="mini-title"></h1>
          <div class="pdf-progress" aria-label="장소 진행률"><span id="pdf-progress-fill"></span></div>
          <p id="pdf-progress-text" class="small-guide"></p>
          <div class="pdf-reward-grid">
            <article><img id="pdf-complete-archive" alt="과거 기록 보상"><strong id="pdf-reward-history"></strong></article>
            <article><video id="pdf-complete-video" muted playsinline controls></video><strong id="pdf-reward-video"></strong></article>
          </div>
          <div id="pdf-final-rewards" class="pdf-final-rewards hidden">
            <span>📖 전체 이야기 웹툰</span><span>🎞 15초 여정필름</span>
          </div>
          <div class="giroksae-note"><img src="assets/images/giroksae-reward.png" alt="완료를 안내하는 기록새"><p id="pdf-next-clue"></p></div>
          <button type="button" class="big-button" data-pdf-action="complete-next">다음 <span>→</span></button>
        </div>
      </section>

      <section id="pdf-theme-select-page" class="page pdf-ux-page" data-owner="최유석 · PDF UX 보완">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout pdf-theme-layout">
          <p id="pdf-theme-select-label" class="ornament-label">다음 기록 고르기</p>
          <h1 id="pdf-theme-select-title" class="mini-title">다음에는 어떤 목포를<br>이어 보고 싶나요?</h1>
          <div class="pdf-theme-list" role="group" aria-label="다음 목포 여행 테마">
            <button type="button" data-pdf-action="choose-theme" data-theme="food"><strong>음식</strong><small>오늘의 항구도시 생활문화</small><i>→</i></button>
            <button type="button" data-pdf-action="choose-theme" data-theme="space"><strong>도시공간</strong><small>거리와 공간의 변화</small><i>→</i></button>
            <button type="button" data-pdf-action="choose-theme" data-theme="art"><strong>예술</strong><small>문학 · 음악 · 공연 · 현재 예술공간</small><i>→</i></button>
          </div>
          <button type="button" id="pdf-personal-recommend-button" class="big-button" data-pdf-action="open-personal-recommendation">내 취향대로 추천받기 <span>→</span></button>
        </div>
      </section>

      <section id="pdf-theme-result-page" class="page pdf-ux-page" data-owner="최유석 · PDF UX 보완">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout pdf-theme-layout">
          <p id="pdf-theme-result-label" class="ornament-label"></p>
          <h1 id="pdf-theme-result-title" class="mini-title"></h1>
          <div id="pdf-theme-piece-list" class="pdf-piece-preview-list"></div>
          <article class="pdf-first-place-card">
            <div id="pdf-theme-photo" class="pdf-first-place-photo"></div>
            <div><strong id="pdf-theme-place"></strong><small id="pdf-theme-distance"></small></div>
          </article>
          <button type="button" id="pdf-theme-detail-button" class="big-button" data-pdf-action="open-theme-detail">첫 조각 확인하기 <span>→</span></button>
          <button type="button" id="pdf-theme-change-button" class="text-button" data-next="pdf-theme-select-page">다른 테마 고르기</button>
        </div>
      </section>

      <section id="pdf-preference-page" class="page pdf-ux-page" data-owner="최유석 · PDF UX 보완">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout pdf-theme-layout">
          <p id="pdf-preference-label" class="ornament-label">기록새 · 취향 추천</p>
          <h1 id="pdf-preference-title" class="mini-title">당신에게는 이런<br>다음 여정이 어울려요.</h1>
          <div id="pdf-preference-list" class="pdf-preference-list" role="group" aria-label="취향 기반 추천 여정"></div>
          <p id="pdf-preference-reason" class="pdf-preference-reason"></p>
          <button type="button" id="pdf-preference-detail-button" class="big-button" data-pdf-action="open-preference-detail">추천 여정 자세히 보기 <span>→</span></button>
          <button type="button" id="pdf-preference-back-button" class="text-button" data-next="pdf-theme-select-page">직접 테마 고르기</button>
        </div>
      </section>

      <section id="pdf-journey-detail-page" class="page pdf-ux-page" data-owner="최유석 · PDF UX 보완">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout pdf-theme-layout">
          <p id="pdf-journey-detail-label" class="ornament-label"></p>
          <h1 id="pdf-journey-detail-title" class="mini-title">첫 조각부터<br>가볍게 시작해볼까요?</h1>
          <div id="pdf-journey-detail-pieces" class="pdf-piece-preview-list"></div>
          <article class="pdf-first-place-card pdf-first-place-card--detail">
            <div id="pdf-journey-detail-photo" class="pdf-first-place-photo"></div>
            <div><strong id="pdf-journey-detail-place"></strong><small id="pdf-journey-detail-distance"></small></div>
          </article>
          <div class="pdf-route-line"><span id="pdf-route-start">현재 위치</span><i>→</i><strong id="pdf-route-end"></strong></div>
          <button type="button" id="pdf-open-map-button" class="big-button" data-pdf-action="open-journey-map">길찾기 열기 <span>→</span></button>
          <button type="button" id="pdf-journey-detail-back" class="text-button" data-next="pdf-theme-select-page">다른 여정 고르기</button>
        </div>
      </section>`);
  }

  function showHistoryEvidence(pieceNumber) {
    activePiece = Number(pieceNumber);
    state().currentPiece = activePiece;
    const item = PIECES[activePiece];
    const chinese = isChinese();
    setText("pdf-history-label", chinese ? "TimeTrace · 历史依据" : `TimeTrace · ${activePiece}/3 역사 근거`);
    setText("pdf-history-title", chinese ? `${item.current}\n过去与现在的记录` : `${item.current}\n과거와 현재의 기록`);
    const title = document.getElementById("pdf-history-title");
    if (title) title.innerHTML = title.textContent.replace("\n", "<br>");
    document.getElementById("pdf-history-archive").src = item.archiveImage;
    document.getElementById("pdf-history-current").src = item.currentImage;
    setText("pdf-history-archive-caption", chinese ? `过去 · ${item.historic}` : `과거 · ${item.historic}`);
    setText("pdf-history-current-caption", chinese ? `现在 · ${item.current}` : `현재 · ${item.current}`);
    setText("pdf-history-year", item.year);
    setText("pdf-history-fact", chinese ? item.factZh : item.fact);
    const source = document.getElementById("pdf-history-source");
    source.textContent = `${chinese ? "资料来源" : "자료 출처"}: ${item.source}`;
    source.href = item.sourceUrl;
    setText("pdf-ai-title", chinese ? "AI与数据处理依据" : "AI·데이터 처리 근거");
    setText("pdf-ai-desc", chinese
      ? "将地点识别结果与经核实的历史照片连接，构成过去与现在的对比画面。无来源的生成图像不作为历史依据。"
      : "장소 인식 결과와 검증된 과거 사진을 연결해 과거·현재 비교 화면을 구성했습니다. 출처가 없는 생성 이미지는 역사 근거로 사용하지 않습니다.");
    const button = document.querySelector('#pdf-history-evidence-page [data-pdf-action="history-next"]');
    if (button) button.innerHTML = `${chinese ? "下一步" : "다음"} <span>→</span>`;
    show("pdf-history-evidence-page");
  }

  function answerMarkup(keys, options) {
    if (!keys.length) return `<p class="pdf-empty-answer">${isChinese() ? "未选择" : "선택하지 않음"}</p>`;
    return keys.map((key) => `<p><b>${key}</b><span>${options[key] || ""}</span></p>`).join("");
  }

  function showMissionResult(pieceNumber, selected, correct, definition) {
    activePiece = Number(pieceNumber);
    missionResult = { pieceNumber: activePiece, selected, correct, definition };
    const chinese = isChinese();
    setText("pdf-mission-label", chinese ? `故事碎片 ${activePiece} · 任务结果` : `이야기 조각 ${activePiece} · 미션 결과`);
    setText("pdf-mission-status", correct ? (chinese ? "回答正确" : "정답입니다") : (chinese ? "回答不正确" : "오답입니다"));
    document.getElementById("pdf-mission-result-page").dataset.correct = String(correct);
    document.getElementById("pdf-mission-selected").innerHTML = answerMarkup(selected, definition.options);
    document.getElementById("pdf-mission-answer").innerHTML = answerMarkup(definition.answer, definition.options);
    document.getElementById("pdf-mission-explanation").innerHTML = `<strong>${chinese ? "事实与依据" : "사실과 근거"}</strong><p>${definition.explanation}</p>`;
    const button = document.getElementById("pdf-mission-button");
    button.dataset.correct = String(correct);
    button.innerHTML = correct
      ? `${chinese ? "获取故事碎片" : "이야기 조각 받기"} <span>→</span>`
      : `${chinese ? "重新答题" : "다시 풀기"} <span>→</span>`;
    show("pdf-mission-result-page");
  }

  function showPlaceComplete(pieceNumber) {
    activePiece = Number(pieceNumber);
    const item = PIECES[activePiece];
    const chinese = isChinese();
    setText("pdf-complete-label", chinese ? `地点完成 · ${activePiece}/3` : `장소 완료 · ${activePiece}/3`);
    setText("pdf-complete-title", chinese ? `${item.current}\n记录完成` : `${item.current}\n기록 완료`);
    const title = document.getElementById("pdf-complete-title");
    if (title) title.innerHTML = title.textContent.replace("\n", "<br>");
    document.getElementById("pdf-progress-fill").style.width = `${activePiece / 3 * 100}%`;
    setText("pdf-progress-text", chinese ? `已完成 ${activePiece}/3 个地点` : `전체 3개 장소 중 ${activePiece}개 완료`);
    document.getElementById("pdf-complete-archive").src = item.archiveImage;
    setText("pdf-reward-history", chinese ? "过去与现在的记录" : "과거·현재 기록 보상");
    setText("pdf-reward-video", chinese ? "今天的5秒记录" : "오늘의 5초 영상 보상");
    const video = document.getElementById("pdf-complete-video");
    video.src = sourceUrl(state().records?.[activePiece] || `assets/videos/sample-record-${activePiece}.mp4`, `complete-${activePiece}`);
    video.load();
    document.getElementById("pdf-final-rewards").classList.toggle("hidden", activePiece !== 3);
    setText("pdf-next-clue", activePiece === 3
      ? (chinese ? "三个地点都完成了。现在确认完整故事与旅程影片吧。" : "세 장소를 모두 완료했어. 이제 전체 이야기와 여정필름을 확인하자.")
      : (chinese ? `下一条线索在${item.nextZh}。` : `다음 단서는 ${item.next}에 있어.`));
    show("pdf-place-complete-page");
  }

  function renderFullStory() {
    const grid = document.querySelector("#place-story-comic-page .place-comic-grid");
    if (!grid) return;
    if (grid.dataset.pdfRendered !== "true") {
      grid.dataset.pdfRendered = "true";
      grid.innerHTML = STORY_IMAGES.map(([src, alt], index) => `
        <figure class="pdf-story-panel"><img src="${src}" alt="${alt}" loading="eager"><figcaption>${String(index + 1).padStart(2, "0")}</figcaption></figure>`).join("");
    }
    const next = document.querySelector('#place-story-comic-page [data-next="quiz-page"], #place-story-comic-page .big-button');
    if (next) {
      next.dataset.next = "journey-film-page";
      next.innerHTML = `${isChinese() ? "查看旅程影片" : "여정필름 확인"} <span>→</span>`;
    }
  }

  function renderRecommendationDetail() {
    const card = document.querySelector("#next-place-detail-page .recommendation-detail-card");
    if (!card) return;
    let block = card.querySelector(".pdf-recommend-context");
    if (!block) {
      block = document.createElement("div");
      block.className = "pdf-recommend-context";
      block.innerHTML = `
        <div class="pdf-official-photo-placeholder"><span>PHOTO</span><p>${isChinese() ? "官方照片待连接" : "공식 사진 연결 대기"}</p></div>
        <strong>${isChinese() ? "这次旅程的三个碎片" : "이번 여정의 세 조각"}</strong>
        <div class="pdf-journey-pieces">
          ${[1, 2, 3].map((piece) => `<figure><img src="${PIECES[piece].currentImage}" alt="${PIECES[piece].current}"><figcaption>${piece}. ${isChinese() ? PIECES[piece].historic : PIECES[piece].historic}</figcaption></figure>`).join("")}
        </div>`;
      card.appendChild(block);
    }
  }

  function localized(item, key, fallback = "") {
    const value = isChinese() ? item[`${key}Zh`] : item[key];
    return value || fallback;
  }

  function setMultilineTitle(id, value) {
    const title = document.getElementById(id);
    if (!title) return;
    title.textContent = value;
    title.innerHTML = title.textContent.replaceAll("\n", "<br>");
  }

  function renderPieceList(containerId, item) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const pieces = isChinese() ? item.piecesZh : item.pieces;
    container.innerHTML = pieces.map((piece, index) => `
      <article><b>${isChinese() ? "碎片" : "조각"} ${index + 1}</b><span>${piece}</span></article>`).join("");
  }

  function renderFirstPlace(photoId, item) {
    const photo = document.getElementById(photoId);
    if (!photo) return;
    const place = localized(item, "place");
    photo.innerHTML = item.image
      ? `<img src="${item.image}" alt="${place}">`
      : `<span>PHOTO</span><small>${isChinese() ? "官方照片待连接" : "공식 사진 연결 대기"}</small>`;
  }

  function renderThemeSelect() {
    const chinese = isChinese();
    setText("pdf-theme-select-label", chinese ? "选择下一条记录" : "다음 기록 고르기");
    setMultilineTitle("pdf-theme-select-title", chinese ? "接下来想继续探索\n怎样的木浦？" : "다음에는 어떤 목포를\n이어 보고 싶나요?");
    document.querySelectorAll('#pdf-theme-select-page [data-pdf-action="choose-theme"]').forEach((button) => {
      const item = THEME_JOURNEYS[button.dataset.theme];
      const strong = button.querySelector("strong");
      const small = button.querySelector("small");
      if (strong) strong.textContent = localized(item, "label");
      if (small) small.textContent = localized(item, "summary");
    });
    const personal = document.getElementById("pdf-personal-recommend-button");
    if (personal) personal.innerHTML = `${chinese ? "按我的喜好推荐" : "내 취향대로 추천받기"} <span>→</span>`;
  }

  function renderThemeResult(themeKey = selectedTheme) {
    selectedTheme = THEME_JOURNEYS[themeKey] ? themeKey : "art";
    const item = THEME_JOURNEYS[selectedTheme];
    const chinese = isChinese();
    setText("pdf-theme-result-label", `${localized(item, "label")} · ${chinese ? "下一条记录" : "다음 기록"}`);
    setMultilineTitle("pdf-theme-result-title", localized(item, "title"));
    renderPieceList("pdf-theme-piece-list", item);
    renderFirstPlace("pdf-theme-photo", item);
    setText("pdf-theme-place", localized(item, "place"));
    setText("pdf-theme-distance", localized(item, "distance"));
    const detail = document.getElementById("pdf-theme-detail-button");
    const change = document.getElementById("pdf-theme-change-button");
    if (detail) detail.innerHTML = `${chinese ? "查看第一块碎片" : "첫 조각 확인하기"} <span>→</span>`;
    if (change) change.textContent = chinese ? "选择其他主题" : "다른 테마 고르기";
  }

  function preferenceTitle(key) {
    const titles = {
      space: ["공간의 변화를 보는 길", "观察空间变化的路线"],
      food: ["오늘의 생활을 만나는 길", "遇见今天生活的路线"],
      art: ["예술로 이어지는 길", "通往艺术的路线"]
    };
    return titles[key][isChinese() ? 1 : 0];
  }

  function renderPreferenceRecommendation() {
    const chinese = isChinese();
    setText("pdf-preference-label", chinese ? "记录鸟 · 喜好推荐" : "기록새 · 취향 추천");
    setMultilineTitle("pdf-preference-title", chinese ? "这些下一段旅程\n很适合你。" : "당신에게는 이런\n다음 여정이 어울려요.");
    const order = ["space", "food", "art"];
    const list = document.getElementById("pdf-preference-list");
    if (list) {
      list.innerHTML = order.map((key, index) => {
        const item = THEME_JOURNEYS[key];
        const selected = key === selectedJourney;
        return `<button type="button" data-pdf-action="select-preference" data-theme="${key}" aria-pressed="${selected}">
          <strong>${chinese ? "候选" : "후보"} ${String.fromCharCode(65 + index)} · ${preferenceTitle(key)}</strong>
          <span>${chinese ? "三个小碎片" : "작은 조각 3개"} <i>● ● ●</i></span>
          <small>${chinese ? "第一块碎片" : "첫 조각"}: ${localized(item, "place")} · ${localized(item, "distance")}</small>
        </button>`;
      }).join("");
    }
    const reasonByTheme = {
      space: chinese ? "你多次选择了空间与街道的变化，因此优先推荐了这条路线。" : "공간과 거리의 변화를 자주 선택해 이 여정을 먼저 추천했어요.",
      food: chinese ? "你对今天的港口生活表现出兴趣，因此优先推荐了这条路线。" : "오늘의 항구 생활문화에 관심을 보여 이 여정을 먼저 추천했어요.",
      art: chinese ? "你对音乐和艺术空间表现出兴趣，因此优先推荐了这条路线。" : "음악과 예술공간에 관심을 보여 이 여정을 먼저 추천했어요."
    };
    setText("pdf-preference-reason", `${chinese ? "推荐理由" : "추천 이유"} · ${reasonByTheme[selectedJourney]}`);
    const detail = document.getElementById("pdf-preference-detail-button");
    const back = document.getElementById("pdf-preference-back-button");
    if (detail) detail.innerHTML = `${chinese ? "查看推荐路线" : "추천 여정 자세히 보기"} <span>→</span>`;
    if (back) back.textContent = chinese ? "直接选择主题" : "직접 테마 고르기";
  }

  function renderJourneyDetail(themeKey) {
    const key = THEME_JOURNEYS[themeKey] ? themeKey : "space";
    const item = THEME_JOURNEYS[key];
    const chinese = isChinese();
    selectedJourney = key;
    setText("pdf-journey-detail-label", preferenceTitle(key));
    setMultilineTitle("pdf-journey-detail-title", chinese ? "从第一块碎片\n轻松开始吧？" : "첫 조각부터\n가볍게 시작해볼까요?");
    renderPieceList("pdf-journey-detail-pieces", item);
    renderFirstPlace("pdf-journey-detail-photo", item);
    setText("pdf-journey-detail-place", localized(item, "place"));
    setText("pdf-journey-detail-distance", localized(item, "distance"));
    setText("pdf-route-start", chinese ? "当前位置" : "현재 위치");
    setText("pdf-route-end", localized(item, "place"));
    const map = document.getElementById("pdf-open-map-button");
    const back = document.getElementById("pdf-journey-detail-back");
    if (map) {
      map.dataset.mapUrl = item.map;
      map.innerHTML = `${chinese ? "打开路线" : "길찾기 열기"} <span>→</span>`;
    }
    if (back) back.textContent = chinese ? "选择其他路线" : "다른 여정 고르기";
  }

  function continueFromJourneyDetail() {
    const item = THEME_JOURNEYS[selectedJourney] || THEME_JOURNEYS.space;
    const chinese = isChinese();
    const place = localized(item, "place");
    const title = document.getElementById("reserved-place-title");
    const description = document.querySelector("#reservation-page .unlock-card p");
    const note = document.querySelector("#reservation-page .giroksae-note p");
    if (title) title.textContent = chinese ? `${place}路线已准备` : `${place} 여정 준비 완료`;
    if (description) {
      description.textContent = chinese
        ? "已连接路线信息。到达地点后，可以从第一块记录继续下一段旅程。"
        : "길찾기 정보를 연결했습니다. 장소에 도착한 뒤 첫 조각부터 다음 여정을 이어갈 수 있습니다.";
    }
    if (note) note.textContent = chinese ? "很好。下一段记录，就从那里继续吧。" : "좋아. 다음 기록은 그곳에서 이어가자.";
    show("reservation-page");
  }

  function handleClick(event) {
    const action = event.target.closest("[data-pdf-action]")?.dataset.pdfAction;
    if (!action) return;
    if (action === "history-next") {
      const flow = global.HistoryPiecesWireframe;
      if (activePiece === 2 || activePiece === 3) flow?.showSurpriseQuiz?.(activePiece);
      else flow?.showAcquired?.(activePiece);
    } else if (action === "mission-next") {
      const flow = global.HistoryPiecesWireframe;
      if (missionResult?.correct) flow?.showAcquired?.(missionResult.pieceNumber);
      else flow?.showSurpriseQuiz?.(missionResult?.pieceNumber || activePiece);
    } else if (action === "complete-next") {
      if (activePiece < 3) {
        if (global.HistoryPiecesIntegratedUi?.showMissionDirect) global.HistoryPiecesIntegratedUi.showMissionDirect(activePiece + 1);
        else show(`piece-${activePiece + 1}-mission-page`);
      } else {
        show("unlock-page");
      }
    } else if (action === "choose-theme") {
      selectedTheme = event.target.closest("[data-theme]")?.dataset.theme || "art";
      renderThemeResult(selectedTheme);
      show("pdf-theme-result-page");
    } else if (action === "open-personal-recommendation") {
      selectedJourney = "space";
      renderPreferenceRecommendation();
      show("pdf-preference-page");
    } else if (action === "select-preference") {
      selectedJourney = event.target.closest("[data-theme]")?.dataset.theme || "space";
      renderPreferenceRecommendation();
    } else if (action === "open-preference-detail") {
      renderJourneyDetail(selectedJourney);
      show("pdf-journey-detail-page");
    } else if (action === "open-theme-detail") {
      renderJourneyDetail(selectedTheme);
      show("pdf-journey-detail-page");
    } else if (action === "open-journey-map") {
      const url = document.getElementById("pdf-open-map-button")?.dataset.mapUrl;
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      continueFromJourneyDetail();
    }
  }

  function install() {
    appendPages();
    const journeyNext = document.querySelector('#journey-film-page [data-next="next-place-page"]');
    if (journeyNext) {
      journeyNext.dataset.next = "pdf-theme-select-page";
      journeyNext.innerHTML = `다음 기록 고르기 <span>→</span>`;
    }
    renderThemeSelect();
    document.addEventListener("click", handleClick);
    global.addEventListener("historypieces:pagechange", (event) => {
      if (event.detail?.pageId === "place-story-comic-page") renderFullStory();
      if (event.detail?.pageId === "next-place-detail-page") queueMicrotask(renderRecommendationDetail);
      if (event.detail?.pageId === "pdf-theme-select-page") renderThemeSelect();
      if (event.detail?.pageId === "pdf-theme-result-page") renderThemeResult(selectedTheme);
      if (event.detail?.pageId === "pdf-preference-page") renderPreferenceRecommendation();
      if (event.detail?.pageId === "pdf-journey-detail-page") renderJourneyDetail(selectedJourney);
    });
    global.HistoryPiecesPdfUx = Object.freeze({
      pieces: PIECES,
      showHistoryEvidence,
      showMissionResult,
      showPlaceComplete,
      renderFullStory,
      renderRecommendationDetail,
      renderThemeSelect,
      renderThemeResult,
      renderPreferenceRecommendation,
      renderJourneyDetail
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})(window);
