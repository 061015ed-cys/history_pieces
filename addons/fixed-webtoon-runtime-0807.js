(function historyPiecesFixedWebtoonRuntime(global) {
  "use strict";

  const FIXED_WEBTOONS = Object.freeze({
    1: {
      panels: Object.freeze([
        {
          image: "addons/webtoon-reference/piece-1/HP_C01_FIRST_ASSIGNMENT.png",
          alt: "조각 1 웹툰 1컷 - 사진관에서 첫 임무를 받는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-1/HP_C02_MOKPO_STATION_CROWD_OBSERVATION_FINAL.png",
          alt: "조각 1 웹툰 2컷 - 목포역 앞 사람들의 움직임을 살피는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-1/HP_C03_MST_WAIT_FINAL.png",
          alt: "조각 1 웹툰 3컷 - 목포역 앞에서 촬영 순간을 기다리는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-1/HP_C04_MST_SHOOT.png",
          alt: "조각 1 웹툰 4컷 - 목포역의 모습을 촬영하는 사진사"
        }
      ]),
      alt: "첫 번째 조각 4컷 고정 웹툰 - 목포역에서 시작된 사진사의 이야기"
    },
    2: {
      image: "addons/webtoon-reference/piece-2-style.jpg",
      alt: "두 번째 조각 고정 웹툰 - 목포 대중음악의 전당과 호남은행 목포지점"
    },
    3: {
      image: "addons/webtoon-reference/piece-3-style.jpg",
      alt: "세 번째 조각 고정 웹툰 - 목포근대역사관 2관과 동양척식주식회사 목포지점"
    }
  });

  const objectUrls = new Set();

  function state() {
    return global.appState || null;
  }

  function renderFixedPiece(pieceNumber) {
    const item = FIXED_WEBTOONS[pieceNumber];
    const page = document.getElementById(`piece-${pieceNumber}-comic-page`);
    const template = page && page.querySelector(".comic-template");
    if (!item || !page || !page.classList.contains("comic-page") || !template) return;

    const previousGenerated = page.querySelector(".hp-generated-webtoon");
    if (previousGenerated) previousGenerated.remove();

    template.classList.remove("hp-replaced");
    template.classList.add("hp-fixed-webtoon-template");
    template.replaceChildren();

    const figure = document.createElement("figure");
    figure.className = "hp-fixed-webtoon";

    if (Array.isArray(item.panels)) {
      figure.classList.add("hp-fixed-webtoon--multi");

      const panels = document.createElement("div");
      panels.className = "hp-fixed-webtoon-panels";
      panels.setAttribute("role", "list");
      panels.setAttribute("aria-label", item.alt);

      item.panels.forEach((panel, index) => {
        const panelFrame = document.createElement("div");
        panelFrame.className = "hp-fixed-webtoon-panel";
        panelFrame.setAttribute("role", "listitem");

        const image = document.createElement("img");
        image.src = panel.image;
        image.alt = panel.alt;
        image.loading = "eager";
        image.decoding = "async";

        const panelNumber = document.createElement("span");
        panelNumber.className = "hp-fixed-webtoon-number";
        panelNumber.textContent = String(index + 1).padStart(2, "0");
        panelNumber.setAttribute("aria-hidden", "true");

        panelFrame.append(image, panelNumber);
        panels.appendChild(panelFrame);
      });

      figure.appendChild(panels);
    } else {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = item.alt;
      image.loading = "eager";
      image.decoding = "async";
      figure.appendChild(image);
    }

    const caption = document.createElement("figcaption");
    const chinese = state() && state().language === "zh-CN";
    caption.textContent = chinese
      ? (pieceNumber === 1 ? "故事碎片 1 · 四格固定漫画" : `故事碎片 ${pieceNumber} · 固定漫画`)
      : (pieceNumber === 1 ? "이야기 조각 1 · 4컷 고정 웹툰" : `이야기 조각 ${pieceNumber} · 고정 웹툰`);

    figure.appendChild(caption);
    template.appendChild(figure);
  }

  async function unlockPieceComic(pieceNumber) {
    const piece = Number(pieceNumber);
    const currentState = state();
    if (currentState) {
      if (Array.isArray(currentState.collectedPieces) && !currentState.collectedPieces.includes(piece)) {
        currentState.collectedPieces.push(piece);
      }
      currentState.yuseokStories = currentState.yuseokStories || { pieces: {}, place: null };
      currentState.yuseokStories.pieces[piece] = {
        meta: { source: "fixed-local-asset", pieceNumber: piece }
      };
    }

    renderFixedPiece(piece);
    if (typeof global.showPage === "function") {
      global.showPage(`piece-${piece}-comic-page`);
    }
  }

  function cleanupObjectUrls() {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.clear();
  }

  function install() {
    const original = global.YuseokStory || {};
    global.YuseokStory = Object.assign({}, original, {
      unlockPieceComic,
      renderFixedPiece,
      cleanupObjectUrls
    });
    global.HistoryPiecesFixedWebtoon = Object.freeze({
      assets: FIXED_WEBTOONS,
      renderFixedPiece,
      unlockPieceComic
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})(window);
