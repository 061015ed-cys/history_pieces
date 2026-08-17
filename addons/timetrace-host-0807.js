import { mountTimeTrace } from "./timetrace/dist/timetrace.js?v=20260816-zh-audit-v1";

const PLACE_BY_PIECE = Object.freeze({
  1: "MST",
  2: "HNB",
  3: "MMH2",
});

const PLACE_ZH_BY_PIECE = Object.freeze({
  1: Object.freeze({ current: "木浦站", historical: "木浦站", completion: "获得第一把记录钥匙" }),
  2: Object.freeze({ current: "木浦大众音乐殿堂", historical: "旧湖南银行木浦支店", completion: "获得第二把记录钥匙" }),
  3: Object.freeze({ current: "木浦近代历史馆2馆", historical: "旧东洋拓殖株式会社木浦支店", completion: "获得第三把记录钥匙" }),
});

const MANIFEST_URL = "./addons/timetrace/config/places-integrated.json";
let instance = null;
let activePiece = null;
let photoObjectUrl = null;
let openingToken = 0;

function state() {
  return window.appState || {};
}

function show(pageId) {
  if (typeof window.showPage === "function") window.showPage(pageId);
}

function notify(message) {
  if (typeof window.showToast === "function") window.showToast(message);
}

function dispose() {
  openingToken += 1;
  instance?.destroy?.();
  instance = null;
  activePiece = null;
  if (photoObjectUrl) {
    URL.revokeObjectURL(photoObjectUrl);
    photoObjectUrl = null;
  }
}

function currentPhotoUrl(pieceNumber) {
  const photo = state().photos?.[`piece${pieceNumber}`];
  if (!photo || (typeof photo === "string" && photo.startsWith("sample-photo://"))) return undefined;
  if (photo instanceof Blob) {
    photoObjectUrl = URL.createObjectURL(photo);
    return photoObjectUrl;
  }
  return typeof photo === "string" ? photo : undefined;
}

function continueAfterTimeTrace(pieceNumber) {
  const pdfUx = window.HistoryPiecesPdfUx;
  if (pdfUx?.showHistoryEvidence) {
    pdfUx.showHistoryEvidence(pieceNumber);
    return;
  }
  const flow = window.HistoryPiecesWireframe;
  if (pieceNumber === 2 || pieceNumber === 3) {
    if (flow?.showSurpriseQuiz) flow.showSurpriseQuiz(pieceNumber);
    else show("piece-overlay-page");
    return;
  }
  if (flow?.showAcquired) flow.showAcquired(pieceNumber);
  else show("piece-overlay-page");
}

function retryPiece(pieceNumber) {
  dispose();
  show(`piece-${pieceNumber}-upload-page`);
}

async function open(pieceNumber) {
  const piece = Number(pieceNumber);
  const placeId = PLACE_BY_PIECE[piece];
  const chinese = state().language === "zh-CN";
  const placeZh = PLACE_ZH_BY_PIECE[piece];
  if (!placeId) {
    notify(chinese ? "未找到TimeTrace地点信息，将进入安全画面。" : "TimeTrace 장소 정보를 찾지 못해 안전 화면으로 이동합니다.");
    show("piece-overlay-page");
    return;
  }

  dispose();
  const token = openingToken;
  activePiece = piece;
  const app = state();
  app.currentPiece = piece;
  app.timeTraceResults = app.timeTraceResults || { 1: null, 2: null, 3: null };

  const root = document.getElementById("timetrace-root");
  if (!root) {
    notify(chinese ? "未找到TimeTrace画面，将进入安全画面。" : "TimeTrace 화면을 찾지 못해 안전 화면으로 이동합니다.");
    show("piece-overlay-page");
    return;
  }

  root.innerHTML = `<p class="loading"><i></i>${chinese ? "正在准备TimeTrace。" : "TimeTrace를 준비하고 있습니다."}</p>`;
  show("timetrace-page");

  try {
    const mounted = await mountTimeTrace({
      root,
      mode: "demo",
      embedded: true,
      scenario: "retake-back",
      placeId,
      locale: chinese ? "zh-CN" : "ko",
      currentPlaceName: chinese ? placeZh.current : undefined,
      currentDisplayName: chinese ? placeZh.current : undefined,
      historicalPlaceName: chinese ? placeZh.historical : undefined,
      historicalDisplayName: chinese ? placeZh.historical : undefined,
      completionSequenceLabel: chinese ? placeZh.completion : undefined,
      manifestUrl: MANIFEST_URL,
      autoAdvance: false,
      initialCaptureUrl: currentPhotoUrl(piece),
      onComplete(result) {
        app.timeTraceResults[piece] = result;
        const completed = instance;
        instance = null;
        activePiece = null;
        completed?.destroy?.();
        if (photoObjectUrl) {
          URL.revokeObjectURL(photoObjectUrl);
          photoObjectUrl = null;
        }
        continueAfterTimeTrace(piece);
      },
      onRetry() {
        retryPiece(piece);
      },
    });

    if (token !== openingToken || activePiece !== piece) {
      mounted.destroy?.();
      return;
    }
    instance = mounted;

    // 앞 화면에서 장소 확인을 이미 마쳤으므로 TimeTrace의 중복 판정 화면은 건너뛴다.
    const beginButton = root.querySelector('[data-action="guide"], [data-action="align"]');
    if (beginButton) beginButton.click();
  } catch (error) {
    console.error("[History Pieces] TimeTrace를 불러오지 못했습니다.", error);
    app.timeTraceResults[piece] = {
      missionPassed: true,
      alignmentStatus: "fallback",
      pieceNumber: piece,
      totalPieces: 3,
      placeId,
      overlayReady: false,
      demoMode: true,
      error: String(error),
    };
    dispose();
    notify(chinese ? "无法加载TimeTrace，将以安全模式继续。" : "TimeTrace를 불러오지 못해 안전 모드로 계속합니다.");
    continueAfterTimeTrace(piece);
  }
}

window.HistoryPiecesTimeTrace = Object.freeze({
  open,
  dispose,
  get activePiece() {
    return activePiece;
  },
});

window.addEventListener("beforeunload", dispose, { once: true });
