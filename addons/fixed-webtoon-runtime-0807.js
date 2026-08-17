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
      panels: Object.freeze([
        {
          image: "addons/webtoon-reference/piece-2/HP_C05_HNB_ARRIVAL.png",
          alt: "조각 2 웹툰 5컷 - 호남은행 목포지점에 도착해 촬영을 준비하는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-2/HP_C06_HNB_ACCIDENTAL_PEOPLE.png",
          alt: "조각 2 웹툰 6컷 - 호남은행 목포지점 앞 인물들이 우연히 사진에 담기는 장면"
        },
        {
          image: "addons/webtoon-reference/piece-2/HP_C07_HNB_HOLDER_PAUSE.png",
          alt: "조각 2 웹툰 7컷 - 촬영을 멈추고 은행으로 들어가는 인물들을 바라보는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-2/HP_C08_HNB_NO_RESHOOT.png",
          alt: "조각 2 웹툰 8컷 - 재촬영하지 않고 호남은행 목포지점을 떠나는 사진사"
        }
      ]),
      alt: "두 번째 조각 5·6·7·8컷 고정 웹툰 - 호남은행 목포지점에서 이어지는 사진사의 이야기"
    },
    // Legacy placeholder piece-3-style.jpg remains packaged for compatibility only; it is not rendered.
    3: {
      panels: Object.freeze([
        {
          image: "addons/webtoon-reference/piece-3/HP_C09_MMH2_FARMER_GROUP.png",
          alt: "조각 3 웹툰 9컷 - 목포근대역사관 2관 앞 사람들을 살피는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-3/HP_C10_MMH2_RECONSIDERING_PEOPLE_FINAL_STATION_V3.png",
          alt: "조각 3 웹툰 10컷 - 촬영 구도를 다시 생각하는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-3/HP_C11_MMH2_FINAL_APPROVED.png",
          alt: "조각 3 웹툰 11컷 - 최종 구도로 사진을 촬영하는 사진사"
        },
        {
          image: "addons/webtoon-reference/piece-3/HP_C12_MMH2_INTENTIONAL_PEOPLE.png",
          alt: "조각 3 웹툰 12컷 - 사람과 장소의 기록을 함께 남기는 사진사"
        }
      ]),
      alt: "세 번째 조각 9·10·11·12컷 고정 웹툰 - 목포근대역사관 2관에서 이어지는 사진사의 이야기"
    }
  });

  const objectUrls = new Set();

  function state() {
    return global.appState || null;
  }

  function isChinese() {
    return state()?.language === "zh-CN";
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
      panels.setAttribute("aria-label", isChinese() ? `故事碎片${pieceNumber}固定漫画` : item.alt);

      item.panels.forEach((panel, index) => {
        const panelFrame = document.createElement("div");
        panelFrame.className = "hp-fixed-webtoon-panel";
        panelFrame.setAttribute("role", "listitem");

        const image = document.createElement("img");
        image.src = panel.image;
        image.alt = isChinese() ? `故事碎片${pieceNumber}漫画第${index + 1}格` : panel.alt;
        image.loading = "eager";
        image.decoding = "async";

        panelFrame.appendChild(image);
        panels.appendChild(panelFrame);
      });

      figure.appendChild(panels);
    } else {
      const image = document.createElement("img");
      image.src = item.image;
      image.alt = isChinese() ? `故事碎片${pieceNumber}固定漫画` : item.alt;
      image.loading = "eager";
      image.decoding = "async";
      figure.appendChild(image);
    }

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
