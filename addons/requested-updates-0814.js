(function installRequestedUpdates0814(global) {
  "use strict";

  const PIECES = Object.freeze({
    1: Object.freeze({
      placeKo: "목포역",
      placeZh: "木浦站",
      nextKo: "목포 대중음악의 전당",
      nextZh: "木浦大众音乐殿堂",
      routeKo: "목포역 → 목포 대중음악의 전당",
      routeZh: "木浦站 → 木浦大众音乐殿堂",
      mapUrl: "https://map.naver.com/p/search/%EB%AA%A9%ED%8F%AC%20%EB%8C%80%EC%A4%91%EC%9D%8C%EC%95%85%EC%9D%98%20%EC%A0%84%EB%8B%B9"
    }),
    2: Object.freeze({
      placeKo: "목포 대중음악의 전당",
      placeZh: "木浦大众音乐殿堂",
      nextKo: "목포근대역사관 2관",
      nextZh: "木浦近代历史馆2馆",
      routeKo: "목포 대중음악의 전당 → 목포근대역사관 2관",
      routeZh: "木浦大众音乐殿堂 → 木浦近代历史馆2馆",
      mapUrl: "https://map.naver.com/p/search/%EB%AA%A9%ED%8F%AC%EA%B7%BC%EB%8C%80%EC%97%AD%EC%82%AC%EA%B4%80%202%EA%B4%80"
    }),
    3: Object.freeze({
      placeKo: "목포근대역사관 2관",
      placeZh: "木浦近代历史馆2馆",
      nextKo: "세 조각 장소 미션",
      nextZh: "三个碎片地点任务",
      routeKo: "지도 이동 없음 · 현재 여정에서 계속",
      routeZh: "无需移动 · 在当前旅程中继续",
      mapUrl: ""
    })
  });

  const FALLBACK_GUIDES = Object.freeze({
    1: Object.freeze({
      criteriaKo: ["건물 전체가 화면 안에 보이게", "정면에 가깝게", "역명 간판과 건물이 함께 보이게"],
      criteriaZh: ["让整座建筑完整进入画面", "尽量从正面拍摄", "让站名标识与建筑同时入镜"]
    }),
    2: Object.freeze({
      criteriaKo: ["건물 전체가 화면 안에 보이게", "정면에 가깝게", "입구와 외벽의 특징이 함께 보이게"],
      criteriaZh: ["让整座建筑完整进入画面", "尽量从正面拍摄", "让入口与外墙特征同时入镜"]
    }),
    3: Object.freeze({
      criteriaKo: ["건물 전체가 화면 안에 보이게", "정면에 가깝게", "외벽과 창문 구조가 함께 보이게"],
      criteriaZh: ["让整座建筑完整进入画面", "尽量从正面拍摄", "让外墙与窗户结构同时入镜"]
    })
  });

  const blobUrls = new WeakMap();
  let summaryPiece = 1;

  function state() {
    return global.appState || {};
  }

  function isChinese() {
    return state().language === "zh-CN";
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

  function mediaUrl(source) {
    if (typeof source === "string") return source;
    if (!(source instanceof Blob)) return "";
    if (!blobUrls.has(source)) blobUrls.set(source, URL.createObjectURL(source));
    return blobUrls.get(source);
  }

  function guideFor(pieceNumber) {
    return global.HistoryPiecesPhotoGuide?.guides?.[pieceNumber] || FALLBACK_GUIDES[pieceNumber];
  }

  function webtoonFor(pieceNumber) {
    return global.HistoryPiecesFixedWebtoon?.assets?.[pieceNumber] || null;
  }

  function webtoonImages(pieceNumber) {
    const item = webtoonFor(pieceNumber);
    if (Array.isArray(item?.panels)) return item.panels;
    if (item?.image) return [{ image: item.image, alt: item.alt }];
    return [];
  }

  function appendInterfaces() {
    const completePage = document.getElementById("pdf-place-complete-page");
    const rewardGrid = completePage?.querySelector(".pdf-reward-grid");
    const completeButton = completePage?.querySelector('[data-pdf-action="complete-next"]');

    if (rewardGrid && !rewardGrid.dataset.hpRecapReady) {
      rewardGrid.dataset.hpRecapReady = "true";
      rewardGrid.innerHTML = `
        <article class="hp-recap-card">
          <img id="pdf-complete-archive" alt="완료한 조각의 웹툰 미리보기">
          <strong id="pdf-reward-history"></strong>
          <button type="button" class="sub-button" data-hp-summary-action="open-comic"></button>
        </article>
        <article class="hp-recap-card">
          <video id="pdf-complete-video" muted playsinline controls preload="metadata"></video>
          <strong id="pdf-reward-video"></strong>
          <button type="button" class="sub-button" data-hp-summary-action="open-video"></button>
        </article>`;
    }

    if (completeButton && !document.getElementById("hp-next-place-preview")) {
      completeButton.insertAdjacentHTML("beforebegin", `
        <article id="hp-next-place-preview" class="hp-next-place-preview">
          <p class="tag" data-hp-next-label></p>
          <h2 data-hp-next-place></h2>
          <div class="hp-map-preview" aria-label="다음 장소 지도 위치">
            <span class="hp-map-pin" aria-hidden="true">⌖</span>
            <p data-hp-route></p>
          </div>
          <a class="sub-button hp-map-link" data-hp-map-link target="_blank" rel="noopener noreferrer"></a>
        </article>`);
    }

    const shell = document.querySelector(".app-shell");
    if (!shell || document.getElementById("hp-replay-page")) return;
    shell.insertAdjacentHTML("beforeend", `
      <section id="hp-replay-page" class="page hp-replay-page" data-owner="요청 반영 · 기록 다시 보기">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p class="ornament-label" data-hp-replay-label></p>
          <h1 class="mini-title" data-hp-replay-title></h1>
          <div class="hp-replay-media" data-hp-replay-media></div>
          <button type="button" class="big-button" data-hp-summary-action="return-summary"></button>
        </div>
      </section>

      <section id="hp-all-pieces-complete-page" class="page hp-all-pieces-complete-page" data-owner="요청 반영 · 세 조각 완료">
        <div class="page-bg bg-unlock"></div>
        <div class="screen-layout standard-layout">
          <p class="ornament-label" data-hp-all-label></p>
          <h1 class="mini-title" data-hp-all-title></h1>
          <div class="hp-all-piece-dots" aria-label="조각 세 개 완료"><span>1</span><span>2</span><span>3</span></div>
          <article class="content-card hp-all-complete-card">
            <p class="tag" data-hp-all-record-label></p>
            <h2 data-hp-all-record-title></h2>
            <p data-hp-all-record-copy class="description"></p>
          </article>
          <article class="content-card hp-all-complete-card">
            <p class="tag" data-hp-all-reward-label></p>
            <h2 data-hp-all-reward-title></h2>
            <p data-hp-all-reward-copy class="description"></p>
          </article>
          <div class="giroksae-note">
            <img src="assets/images/giroksae-reward.png" alt="세 조각 완료를 안내하는 기록새">
            <p data-hp-all-note></p>
          </div>
          <button type="button" class="big-button" data-hp-summary-action="open-place-mission"></button>
        </div>
      </section>`);
  }

  function renderDetectionFailure(pieceNumber) {
    const result = state().aiResults?.[pieceNumber];
    const photo = state().photos?.[`piece${pieceNumber}`];
    const page = document.getElementById(`piece-${pieceNumber}-ai-result-page`);
    const card = page?.querySelector(".ai-result-card");
    const existing = card?.querySelector(".hp-detection-feedback");
    const isSample = typeof photo === "string" && photo.startsWith("sample-photo://");

    if (!card || !result || result.success === true || isSample) {
      existing?.remove();
      if (card && result?.success === true) {
        card.dataset.resultState = "success";
        const icon = card.querySelector(".wire-place-result-icon");
        if (icon) icon.textContent = "✓";
      }
      return;
    }

    const chinese = isChinese();
    const guide = guideFor(pieceNumber) || FALLBACK_GUIDES[pieceNumber];
    const criteria = chinese ? guide.criteriaZh : guide.criteriaKo;
    const previewUrl = mediaUrl(photo);
    const reason = result.reason || (chinese ? "未能充分确认地点特征。" : "장소의 특징을 충분히 확인하지 못했습니다.");
    const icon = card.querySelector(".wire-place-result-icon");
    const title = card.querySelector("h2");
    const description = card.querySelector(".description");

    card.dataset.resultState = "failure";
    if (icon) icon.textContent = "!";
    if (title) title.textContent = chinese ? "请稍微调整拍摄构图。" : "사진 구도를 조금 조정해주세요.";
    if (description) description.textContent = chinese ? "请确认下列内容后重新拍摄。" : "아래 피드백을 확인한 뒤 다시 촬영해주세요.";

    const markup = `
      <div class="hp-detection-feedback" role="status" aria-live="polite">
        ${previewUrl ? `<img class="hp-detection-photo" src="${escapeHtml(previewUrl)}" alt="${chinese ? "识别失败的拍摄照片" : "장소 인식에 실패한 촬영 사진"}">` : ""}
        <div class="hp-detection-observation">
          <strong>${chinese ? "AI识别反馈" : "AI 인식 피드백"}</strong>
          <p>${escapeHtml(reason)}</p>
        </div>
        <div class="hp-detection-next">
          <strong>${chinese ? "下次拍摄请这样调整" : "다음 촬영은 이렇게 조정해주세요"}</strong>
          <ul>${criteria.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <button type="button" class="sub-button" data-hp-summary-action="open-photo-guide" data-piece="${pieceNumber}">${chinese ? "再次查看构图示例" : "사진 구도 예시 다시 보기"}</button>
      </div>`;

    if (existing) existing.outerHTML = markup;
    else card.insertAdjacentHTML("beforeend", markup);

    const retry = document.getElementById(`piece-${pieceNumber}-retry-btn`);
    if (retry) retry.textContent = chinese ? "重新拍摄" : "다시 촬영하기";
  }

  function ensureSelectionCounter() {
    const list = document.getElementById("wire-surprise-options");
    if (!list) return;
    if (list.dataset.multi !== "true") {
      document.getElementById("hp-two-choice-counter")?.remove();
      list.classList.remove("hp-choice-limit-reached");
      list.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
      });
      return;
    }
    let counter = document.getElementById("hp-two-choice-counter");
    if (!counter) {
      counter = document.createElement("p");
      counter.id = "hp-two-choice-counter";
      counter.className = "hp-two-choice-counter";
      counter.setAttribute("role", "status");
      counter.setAttribute("aria-live", "polite");
      list.insertAdjacentElement("afterend", counter);
    }
    updateSelectionLimit();
  }

  function updateSelectionLimit() {
    const list = document.getElementById("wire-surprise-options");
    const counter = document.getElementById("hp-two-choice-counter");
    if (!list || list.dataset.multi !== "true" || !counter) return;
    const buttons = [...list.querySelectorAll("button")];
    const selected = buttons.filter((button) => button.classList.contains("selected"));
    const atLimit = selected.length >= 2;

    buttons.forEach((button) => {
      button.disabled = atLimit && !button.classList.contains("selected");
    });
    list.classList.toggle("hp-choice-limit-reached", atLimit);
    counter.textContent = isChinese()
      ? `已选 ${selected.length}/2 · 最多选择两项`
      : `${selected.length}/2개 선택 · 최대 2개 선택 가능`;
  }

  function renderSummary() {
    const pieceNumber = Math.min(3, Math.max(1, Number(state().currentPiece) || summaryPiece || 1));
    const item = PIECES[pieceNumber];
    const chinese = isChinese();
    const images = webtoonImages(pieceNumber);
    summaryPiece = pieceNumber;

    const label = document.getElementById("pdf-complete-label");
    const title = document.getElementById("pdf-complete-title");
    const progress = document.getElementById("pdf-progress-fill");
    const progressText = document.getElementById("pdf-progress-text");
    const webtoonImage = document.getElementById("pdf-complete-archive");
    const video = document.getElementById("pdf-complete-video");
    const webtoonLabel = document.getElementById("pdf-reward-history");
    const videoLabel = document.getElementById("pdf-reward-video");
    const nextPreview = document.getElementById("hp-next-place-preview");
    const nextButton = document.querySelector('#pdf-place-complete-page [data-pdf-action="complete-next"]');

    if (label) label.textContent = chinese ? `碎片任务完成 · ${pieceNumber}/3` : `조각 미션 완료 · ${pieceNumber}/3`;
    if (title) title.innerHTML = chinese ? `第${pieceNumber}条记录<br>已完成。` : `${["첫", "두 번째", "세 번째"][pieceNumber - 1]} 기록이<br>완료되었어요.`;
    if (progress) progress.style.width = `${pieceNumber / 3 * 100}%`;
    if (progressText) progressText.textContent = chinese ? `已完成 ${pieceNumber}/3 个碎片任务` : `전체 3개 조각 미션 중 ${pieceNumber}개 완료`;
    if (webtoonImage && images[0]) {
      webtoonImage.src = images[0].image;
      webtoonImage.alt = images[0].alt || (chinese ? "漫画预览" : "웹툰 미리보기");
    }
    if (video) {
      video.src = mediaUrl(state().records?.[pieceNumber] || `assets/videos/sample-record-${pieceNumber}.mp4`);
      video.load();
    }
    if (webtoonLabel) webtoonLabel.textContent = chinese ? "已获得的漫画" : "획득한 웹툰";
    if (videoLabel) videoLabel.textContent = chinese ? "保存的5秒视频" : "남긴 5초 영상";

    const comicButton = document.querySelector('[data-hp-summary-action="open-comic"]');
    const videoButton = document.querySelector('[data-hp-summary-action="open-video"]');
    if (comicButton) comicButton.textContent = chinese ? "再次查看漫画" : "웹툰 다시 보기";
    if (videoButton) videoButton.textContent = chinese ? "再次播放视频" : "영상 다시 보기";

    if (nextPreview) {
      nextPreview.querySelector("[data-hp-next-label]").textContent = chinese ? "下一地点预告" : "다음 장소 예고";
      nextPreview.querySelector("[data-hp-next-place]").textContent = chinese ? item.nextZh : item.nextKo;
      nextPreview.querySelector("[data-hp-route]").textContent = chinese ? item.routeZh : item.routeKo;
      const mapLink = nextPreview.querySelector("[data-hp-map-link]");
      if (item.mapUrl) {
        mapLink.href = item.mapUrl;
        mapLink.textContent = chinese ? "在地图中查看位置" : "지도에서 위치 보기";
        mapLink.classList.remove("hidden");
      } else {
        mapLink.removeAttribute("href");
        mapLink.classList.add("hidden");
      }
    }

    document.getElementById("pdf-final-rewards")?.classList.add("hidden");
    if (nextButton) {
      nextButton.innerHTML = pieceNumber < 3
        ? `${chinese ? "前往下一条记录" : `다음 조각 ${pieceNumber + 1}로 이동`} <span>→</span>`
        : `${chinese ? "确认三个碎片完成" : "세 조각 완료 확인"} <span>→</span>`;
    }
  }

  function renderReplay(kind) {
    const pieceNumber = summaryPiece;
    const chinese = isChinese();
    const item = PIECES[pieceNumber];
    const label = document.querySelector("[data-hp-replay-label]");
    const title = document.querySelector("[data-hp-replay-title]");
    const host = document.querySelector("[data-hp-replay-media]");
    const returnButton = document.querySelector('[data-hp-summary-action="return-summary"]');

    if (label) label.textContent = chinese ? `碎片 ${pieceNumber} · 再次查看` : `조각 ${pieceNumber} · 다시 보기`;
    if (returnButton) returnButton.innerHTML = `${chinese ? "返回整理页面" : "정리 화면으로 돌아가기"} <span>→</span>`;
    if (!host) return;

    if (kind === "comic") {
      const images = webtoonImages(pieceNumber);
      if (title) title.innerHTML = chinese ? `${item.placeZh}<br>漫画` : `${item.placeKo}<br>웹툰`;
      host.className = "hp-replay-media hp-replay-comic";
      host.innerHTML = images.map((image) => `<img src="${escapeHtml(image.image)}" alt="${escapeHtml(image.alt || "웹툰 이미지")}">`).join("");
    } else {
      const source = mediaUrl(state().records?.[pieceNumber] || `assets/videos/sample-record-${pieceNumber}.mp4`);
      if (title) title.innerHTML = chinese ? `${item.placeZh}<br>5秒视频` : `${item.placeKo}<br>5초 영상`;
      host.className = "hp-replay-media hp-replay-video";
      host.innerHTML = `<video src="${escapeHtml(source)}" controls playsinline autoplay></video>`;
    }
    show("hp-replay-page");
  }

  function renderAllComplete() {
    const chinese = isChinese();
    const copy = chinese ? {
      label: "碎片任务 · 3/3完成",
      title: "三个碎片<br>全部完成了。",
      recordLabel: "获得的记录",
      recordTitle: "碎片1 · 2 · 3",
      recordCopy: "已保存三个地点的漫画与5秒视频。",
      rewardLabel: "即将解锁",
      rewardTitle: "地点故事任务",
      rewardCopy: "接下来把三个碎片连接起来，确认完整的地点故事。",
      note: "很好。现在去看看三个碎片连接成怎样的故事吧。",
      button: "开始地点任务"
    } : {
      label: "조각 미션 · 3/3 완료",
      title: "세 조각을 모두<br>완료했어요.",
      recordLabel: "획득한 기록",
      recordTitle: "조각 1 · 2 · 3",
      recordCopy: "세 장소의 웹툰과 5초 영상 기록을 모두 저장했습니다.",
      rewardLabel: "다음 단계",
      rewardTitle: "장소 이야기 미션",
      rewardCopy: "이제 세 조각을 연결해 완성된 장소 이야기를 확인합니다.",
      note: "좋아. 세 조각이 어떤 하나의 이야기로 이어지는지 확인하러 가자.",
      button: "장소 미션 시작하기"
    };

    document.querySelector("[data-hp-all-label]").textContent = copy.label;
    document.querySelector("[data-hp-all-title]").innerHTML = copy.title;
    document.querySelector("[data-hp-all-record-label]").textContent = copy.recordLabel;
    document.querySelector("[data-hp-all-record-title]").textContent = copy.recordTitle;
    document.querySelector("[data-hp-all-record-copy]").textContent = copy.recordCopy;
    document.querySelector("[data-hp-all-reward-label]").textContent = copy.rewardLabel;
    document.querySelector("[data-hp-all-reward-title]").textContent = copy.rewardTitle;
    document.querySelector("[data-hp-all-reward-copy]").textContent = copy.rewardCopy;
    document.querySelector("[data-hp-all-note]").textContent = copy.note;
    document.querySelector('[data-hp-summary-action="open-place-mission"]').innerHTML = `${copy.button} <span>→</span>`;
  }

  function handleClickCapture(event) {
    const option = event.target.closest('#wire-surprise-options[data-multi="true"] button');
    if (option) {
      global.setTimeout(updateSelectionLimit, 0);
      return;
    }

    const thirdComplete = event.target.closest('#pdf-place-complete-page [data-pdf-action="complete-next"]');
    if (thirdComplete && summaryPiece === 3) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderAllComplete();
      show("hp-all-pieces-complete-page");
      return;
    }

    const actionButton = event.target.closest("[data-hp-summary-action]");
    if (!actionButton) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const action = actionButton.dataset.hpSummaryAction;
    if (action === "open-comic") renderReplay("comic");
    else if (action === "open-video") renderReplay("video");
    else if (action === "return-summary") show("pdf-place-complete-page");
    else if (action === "open-place-mission") show("unlock-page");
    else if (action === "open-photo-guide") show(`piece-${Number(actionButton.dataset.piece)}-photo-guide-page`);
  }

  function handlePageChange(event) {
    const pageId = String(event.detail?.pageId || "");
    const resultMatch = pageId.match(/^piece-([123])-ai-result-page$/);
    if (resultMatch) global.queueMicrotask(() => renderDetectionFailure(Number(resultMatch[1])));
    if (pageId === "wire-surprise-quiz-page") global.queueMicrotask(ensureSelectionCounter);
    if (pageId === "pdf-place-complete-page") global.queueMicrotask(renderSummary);
    if (pageId === "hp-all-pieces-complete-page") global.queueMicrotask(renderAllComplete);
  }

  function install() {
    appendInterfaces();
    global.addEventListener("click", handleClickCapture, true);
    global.addEventListener("historypieces:pagechange", handlePageChange);
    global.HistoryPiecesRequestedUpdates0814 = Object.freeze({
      renderDetectionFailure,
      updateSelectionLimit,
      renderSummary,
      renderReplay,
      renderAllComplete
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})(window);
