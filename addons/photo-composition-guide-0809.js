(function historyPiecesPhotoCompositionGuide(global) {
  "use strict";

  const GUIDES = Object.freeze({
    1: Object.freeze({
      placeKo: "목포역",
      placeZh: "木浦站",
      image: "addons/timetrace/assets/MST/current.jpg",
      altKo: "목포역 촬영 구도 예시",
      altZh: "木浦站拍摄构图示例",
      criteriaKo: ["건물 전체가 화면 안에 보이게", "정면에 가깝게", "역명 간판과 건물이 함께 보이게"],
      criteriaZh: ["让整座建筑完整进入画面", "尽量从正面拍摄", "让站名标识与建筑同时入镜"]
    }),
    2: Object.freeze({
      placeKo: "목포 대중음악의 전당",
      placeZh: "木浦大众音乐殿堂",
      image: "addons/timetrace/assets/HNB/current.jpg",
      altKo: "목포 대중음악의 전당 촬영 구도 예시",
      altZh: "木浦大众音乐殿堂拍摄构图示例",
      criteriaKo: ["건물 전체가 화면 안에 보이게", "정면에 가깝게", "입구와 외벽의 특징이 함께 보이게"],
      criteriaZh: ["让整座建筑完整进入画面", "尽量从正面拍摄", "让入口与外墙特征同时入镜"]
    }),
    3: Object.freeze({
      placeKo: "목포근대역사관 2관",
      placeZh: "木浦近代历史馆2馆",
      image: "addons/timetrace/assets/MMH2/current.jpg",
      altKo: "목포근대역사관 2관 촬영 구도 예시",
      altZh: "木浦近代历史馆2馆拍摄构图示例",
      criteriaKo: ["건물 전체가 화면 안에 보이게", "정면에 가깝게", "외벽과 창문 구조가 함께 보이게"],
      criteriaZh: ["让整座建筑完整进入画面", "尽量从正面拍摄", "让外墙与窗户结构同时入镜"]
    })
  });

  function isChinese() {
    return global.appState?.language === "zh-CN";
  }

  function pageMarkup(pieceNumber, guide) {
    return `
      <section id="piece-${pieceNumber}-photo-guide-page" class="page hp-photo-guide-page" data-owner="최유석 · 촬영 구도 안내" data-guide-piece="${pieceNumber}">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout hp-photo-guide-layout">
          <p class="ornament-label" data-guide-label></p>
          <h1 class="setup-title" data-guide-title></h1>

          <figure class="hp-photo-guide-example">
            <img src="${guide.image}" data-guide-image alt="">
            <figcaption data-guide-caption></figcaption>
          </figure>

          <div class="hp-photo-guide-criteria">
            <strong data-guide-criteria-title></strong>
            <ul data-guide-criteria-list></ul>
          </div>

          <div class="hp-photo-guide-reason">
            <strong data-guide-reason-title></strong>
            <p data-guide-reason-copy></p>
          </div>

          <button type="button" class="big-button" data-next="piece-${pieceNumber}-upload-page" data-guide-open-camera></button>
        </div>
      </section>`;
  }

  function appendGuidePages() {
    Object.entries(GUIDES).forEach(([piece, guide]) => {
      const pieceNumber = Number(piece);
      if (document.getElementById(`piece-${pieceNumber}-photo-guide-page`)) return;
      const uploadPage = document.getElementById(`piece-${pieceNumber}-upload-page`);
      if (!uploadPage) return;
      uploadPage.insertAdjacentHTML("beforebegin", pageMarkup(pieceNumber, guide));
    });
  }

  function connectMissionRoutes() {
    Object.keys(GUIDES).forEach((piece) => {
      const button = document.querySelector(`#piece-${piece}-mission-page .big-button`);
      if (button) button.dataset.next = `piece-${piece}-photo-guide-page`;
    });
  }

  function renderGuide(pieceNumber) {
    const guide = GUIDES[pieceNumber];
    const page = document.getElementById(`piece-${pieceNumber}-photo-guide-page`);
    if (!guide || !page) return;

    const chinese = isChinese();
    const place = chinese ? guide.placeZh : guide.placeKo;
    const criteria = chinese ? guide.criteriaZh : guide.criteriaKo;
    const image = page.querySelector("[data-guide-image]");

    page.querySelector("[data-guide-label]").textContent = chinese
      ? `故事碎片 ${pieceNumber} · ${place}`
      : `이야기 조각 ${pieceNumber} · ${place}`;
    page.querySelector("[data-guide-title]").textContent = chinese
      ? "请按这个构图拍摄。"
      : "이 구도대로 촬영해 주세요.";
    page.querySelector("[data-guide-caption]").textContent = chinese
      ? "拍摄构图示例"
      : "촬영 구도 예시";
    page.querySelector("[data-guide-criteria-title]").textContent = chinese
      ? "拍摄标准"
      : "촬영 기준";
    page.querySelector("[data-guide-criteria-list]").innerHTML = criteria
      .map((item) => `<li>${item}</li>`)
      .join("");
    page.querySelector("[data-guide-reason-title]").textContent = chinese
      ? "为什么需要这样拍？"
      : "왜 필요한가";
    page.querySelector("[data-guide-reason-copy]").textContent = chinese
      ? "这些标准有助于AI更准确地确认地点。"
      : "이 기준은 AI가 장소를 더 정확히 확인하기 위한 기준입니다.";
    page.querySelector("[data-guide-open-camera]").innerHTML = chinese
      ? "打开相机 <span>→</span>"
      : "카메라 열기 <span>→</span>";

    if (image) image.alt = chinese ? guide.altZh : guide.altKo;
  }

  function renderAll() {
    connectMissionRoutes();
    Object.keys(GUIDES).forEach((piece) => renderGuide(Number(piece)));
  }

  function install() {
    appendGuidePages();
    renderAll();

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-language], [data-country]")) queueMicrotask(renderAll);
    });

    global.addEventListener("historypieces:pagechange", (event) => {
      const match = String(event.detail?.pageId || "").match(/^piece-([123])-photo-guide-page$/);
      if (match) renderGuide(Number(match[1]));
    });

    global.HistoryPiecesPhotoGuide = Object.freeze({ guides: GUIDES, renderAll });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})(window);
