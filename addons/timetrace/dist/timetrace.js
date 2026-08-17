import {
  buildCompleteResult,
  buildRetryResult,
  createDemoAdapter,
  createLiveAdapter,
} from "./adapters.js";

const MANIFEST_URL = "./demo-manifest.json";
const GUIDANCE_COPY = {
  MOVE_BACK: { label: "건물 양쪽 모서리가 안내선 안에 들어올 때까지 뒤로 이동해주세요.", detail: "지붕과 하단, 좌우 여백을 함께 확인합니다.", icon: "arrow", direction: "back" },
  MOVE_FORWARD: { label: "조금 앞으로 이동해 주세요", detail: "건물이 안내 테두리에 닿도록 맞춰 주세요", icon: "arrow", direction: "forward" },
  MOVE_LEFT: { label: "카메라를 왼쪽으로 돌려 주세요", detail: "건물의 중심을 안내선에 맞춰 주세요", icon: "arrow", direction: "left" },
  MOVE_RIGHT: { label: "카메라를 오른쪽으로 돌려 주세요", detail: "건물의 중심을 안내선에 맞춰 주세요", icon: "arrow", direction: "right" },
  OCCLUSION: { label: "건물 모서리가 가려졌어요", detail: "화면을 유지하고 가림이 사라지길 기다려 주세요", icon: "eye", direction: "hold" },
  LOWER_PHONE: { label: "휴대폰을 조금 낮춰 주세요", detail: "건물 지붕과 지면이 함께 보이게 맞춰 주세요", icon: "arrow", direction: "down" },
};

const GUIDANCE_COPY_ZH = {
  MOVE_BACK: { label: "请向后移动，直到建筑两侧边角都进入引导线内。", detail: "请同时确认屋顶、建筑底部和左右留白。", icon: "arrow", direction: "back" },
  MOVE_FORWARD: { label: "请稍微向前移动", detail: "让建筑贴近引导边框", icon: "arrow", direction: "forward" },
  MOVE_LEFT: { label: "请将相机向左转", detail: "将建筑中心对准引导线", icon: "arrow", direction: "left" },
  MOVE_RIGHT: { label: "请将相机向右转", detail: "将建筑中心对准引导线", icon: "arrow", direction: "right" },
  OCCLUSION: { label: "建筑边角被遮挡了", detail: "请保持画面，等待遮挡消失", icon: "eye", direction: "hold" },
  LOWER_PHONE: { label: "请稍微放低手机", detail: "让建筑屋顶与地面同时入镜", icon: "arrow", direction: "down" },
};

const GUIDANCE_STAGE_ZH = [
  ["正在寻找可与历史记录重合的构图", "正在确认建筑屋顶与外轮廓", 28],
  ["请后退，直到建筑两侧边角进入引导线内", "再远一点就能与历史照片进行比较", 54],
  ["很好，建筑整体轮廓已经出现", "请暂时保持这个构图", 82],
];

const COMPARISON_DESCRIPTIONS = {
  current: "오늘 촬영한 현재의 모습입니다.",
  restored: "실제 역사 기록을 바탕으로 AI가 복원한 장면입니다.",
};

const DIRECTION_PRESENTATION = Object.freeze({
  back: { glyph: "↓", shortLabel: "한 걸음 뒤로" },
  forward: { glyph: "↑", shortLabel: "조금 앞으로" },
  left: { glyph: "←", shortLabel: "왼쪽으로 이동" },
  right: { glyph: "→", shortLabel: "오른쪽으로 이동" },
  down: { glyph: "↓", shortLabel: "휴대폰 낮추기" },
  hold: { glyph: "○", shortLabel: "구도 유지" },
});

const DIRECTION_PRESENTATION_ZH = Object.freeze({
  back: { glyph: "↓", shortLabel: "向后一步" },
  forward: { glyph: "↑", shortLabel: "稍微向前" },
  left: { glyph: "←", shortLabel: "向左移动" },
  right: { glyph: "→", shortLabel: "向右移动" },
  down: { glyph: "↓", shortLabel: "放低手机" },
  hold: { glyph: "○", shortLabel: "保持构图" },
});

let currentLocale = "ko";
const isChinese = () => currentLocale === "zh-CN";
const tr = (ko, zh) => isChinese() ? zh : ko;

export function getComparisonDescription(view, historicalYear = 1932) {
  return view === "historical"
    ? tr(`${historicalYear}년의 실제 역사 기록입니다.`, `这是${historicalYear}年的真实历史记录。`)
    : isChinese()
      ? ({ current: "这是今天拍摄的当前景象。", restored: "这是AI根据真实历史记录复原的场景。" }[view] ?? "这是AI根据真实历史记录复原的场景。")
      : COMPARISON_DESCRIPTIONS[view] ?? COMPARISON_DESCRIPTIONS.restored;
}

const state = {
  screen: "loading",
  comparison: "restored",
  opacity: 1,
  opacityAnimating: false,
  ready: false,
  replaying: false,
  alignmentStep: 0,
  selected: "initial",
  terminated: false,
  identityHistorical: false,
};

let timers = [];
let opacityFrame = null;
const mountedInstances = new WeakMap();

export const pathToUrl = (path) => {
  if (!path) return "";
  if (/^(?:https?:|data:|blob:|\/|\.\.?\/)/i.test(path)) return path;
  const normalized = String(path).replaceAll("\\", "/");
  const repositoryPart = normalized.match(/\/(data|evaluation|frontend)\/(.+)$/i);
  const relative = repositoryPart ? `${repositoryPart[1]}/${repositoryPart[2]}` : normalized.replace(/^\.\//, "");
  return `/${relative.split("/").map(encodeURIComponent).join("/")}`;
};
export const formatPieceLabel = (pieceNumber) => isChinese()
  ? `获得第${pieceNumber}把记录钥匙`
  : `${pieceNumber === 2 ? "두" : pieceNumber === 3 ? "세" : "첫"} 번째 기록 열쇠 획득`;
export const overlayOpacityAtElapsed = (elapsed, duration = 1800, target = 1) => (
  target * Math.min(1, Math.max(0, elapsed / duration))
);
const clearTimers = () => {
  timers.forEach(clearTimeout);
  timers = [];
  if (opacityFrame != null) cancelAnimationFrame(opacityFrame);
  opacityFrame = null;
  state.opacityAnimating = false;
};
const schedule = (fn, delay) => { const id = setTimeout(fn, delay); timers.push(id); return id; };

function icon(name) {
  const paths = {
    check: '<path d="m6 12 4 4 8-9"/>',
    back: '<path d="M12 5v14M7 10l5-5 5 5"/>',
    arrow: '<path d="M12 4v16M6.5 9.5 12 4l5.5 5.5"/>',
    eye: '<path d="M3 12s3.4-5 9-5 9 5 9 5-3.4 5-9 5-9-5-9-5Z"/><circle cx="12" cy="12" r="2.2"/>',
    play: '<path d="m9 7 8 5-8 5Z"/>',
    archive: '<path d="M5 7h14v13H5zM4 4h16v3H4zM9 11h6"/>',
    close: '<path d="m7 7 10 10M17 7 7 17"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name] ?? paths.archive}</svg>`;
}

function shell(content, data, { eyebrow = "TIMETRACE", title = tr("시간의 조각", "时间碎片"), compact = false } = {}) {
  const pieceNumber = data?.sequenceIndex ?? data?.pieceNumber ?? 1;
  const totalPieces = data?.sequenceTotal ?? data?.totalPieces ?? 3;
  return `
    <section class="app-shell${compact ? " app-shell--compact" : ""}">
      <header class="topbar">
        <div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div>
        <span class="piece-count" aria-label="${tr("기록 열쇠 진행도", "记录钥匙进度")}">${String(pieceNumber).padStart(2, "0")} <i></i> ${String(totalPieces).padStart(2, "0")}</span>
      </header>
      ${content}
    </section>`;
}

function placeIdentity(data, historical = false) {
  const name = historical
    ? data.historicalDisplayName ?? data.historicalPlaceName ?? data.placeName ?? data.placeId
    : data.currentDisplayName ?? data.currentPlaceName ?? data.placeName ?? data.placeId;
  const time = historical ? String(data.historicalYear ?? "") : data.currentDate ?? "";
  return `<div class="place-identity${historical ? " place-identity--historical" : ""}" data-place-identity>
    <strong data-place-name>${name}</strong><span data-place-time>${time}</span>
  </div>`;
}

function missionResult(data, scenario) {
  const failed = data.missionStatus !== "passed";
  if (failed) {
    return shell(`
      <section class="status-panel status-panel--fail">
        <span class="status-mark">${icon("close")}</span>
        <p class="overline">${tr("미션 판정 완료", "任务判定完成")}</p>
        <h2>${tr("장소가 미션과 일치하지 않아요", "地点与任务不一致")}</h2>
        <p>${data.reason === "SUBJECT_NOT_FOUND" ? tr("요청된 건물이 사진에서 확인되지 않았습니다.", "照片中未识别到指定建筑。") : tr("요청된 장소가 화면에 충분히 담기지 않았습니다.", "指定地点未完整进入画面。")}</p>
      </section>
      <button class="primary" data-action="retry">${tr("다시 촬영하기", "重新拍摄")}</button>
    `, data, { eyebrow: "MISSION CHECK", title: tr("장소 확인", "确认地点") });
  }
  const ready = data.alignmentStatus === "ready";
  const unsupported = data.alignmentStatus === "unsupported";
  return shell(`
    <section class="status-panel status-panel--success">
      <span class="status-mark">${icon("check")}</span>
      <p class="overline">${tr("미션 성공", "任务成功")}</p>
      <h2>${tr("미션 완료! 장소의 흔적을 찾았어요.", "任务完成！找到了地点的历史痕迹。")}</h2>
      <p>${ready ? tr("현재 사진에서 과거 기록의 위치를 바로 맞출 수 있습니다.", "可以直接将当前照片与历史记录的位置对齐。") : unsupported ? tr("이 사진은 시간 기록과 맞추기 어려워 다시 촬영이 필요합니다.", "这张照片难以与时间记录对齐，需要重新拍摄。") : tr("과거 기록과 더 정확히 겹치도록 구도를 한 번 보정할 수 있어요.", "可以再调整一次构图，使其与历史记录更准确地重合。")}</p>
      ${placeIdentity(data)}
    </section>
    <button class="primary" data-action="${ready ? "align" : unsupported ? "retry" : "guide"}">${ready ? tr("시간 기록 보기", "查看时间记录") : unsupported ? tr("다시 촬영하기", "重新拍摄") : tr("시간 맞추기", "对准时间")}</button>
    ${!ready && !unsupported ? `<button class="secondary" data-action="continue-current">${tr("현재 사진으로 계속", "使用当前照片继续")}</button>` : ""}
  `, data, { eyebrow: "MISSION PASSED", title: tr("미션 판정", "任务判定") });
}

function guidanceOverlay(profile = {}) {
  const viewBox = profile.viewBox ?? [0, 0, 1080, 1920];
  const targetPath = profile.targetPath ?? "M145 560 L535 410 L910 670 L930 1450 L160 1450 Z";
  const paths = profile.detectedPaths ?? [
    "M90 500 L500 350 L975 625 L990 1510 L110 1510 Z",
    "M120 535 L520 390 L940 650 L960 1480 L135 1480 Z",
    targetPath,
  ];
  const points = profile.trackingPoints ?? [[145, 560], [535, 410], [910, 670], [160, 1450], [930, 1450]];
  return `<svg class="ar-overlay" viewBox="${viewBox.join(" ")}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <path class="ar-target" d="${targetPath}"/>
    ${paths.map((path, index) => `<path class="ar-detected ar-detected--${index}" d="${path}"/>`).join("")}
    <g class="ar-points">${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8"/>`).join("")}</g>
    <line class="ar-scan" x1="120" y1="960" x2="960" y2="960"/>
    <path class="ar-check" d="m480 980 42 42 86-96"/>
  </svg>`;
}

function guidanceScreen(data, scenarioData, mode) {
  const video = scenarioData.video;
  const guidance = scenarioData.guidance;
  const captureStill = data.captures.initial?.previewUrl ?? data.overlay.currentImage;
  const replacementRequired = guidance?.demoAssetStatus === "replacement_required";
  const mediaFit = guidance?.objectFit ?? "contain";
  const mediaPosition = guidance?.objectPosition ?? "50% 0%";
  const initialCopy = isChinese() ? GUIDANCE_STAGE_ZH[0] : guidance?.stageCopy?.[0] ?? ["과거 기록과 겹칠 수 있는 구도를 찾고 있어요", "건물의 지붕과 외곽선을 확인하고 있습니다"];
  const direction = guidance?.direction ?? guidance?.code?.replace("MOVE_", "").toLowerCase() ?? "back";
  const directionUi = isChinese() ? (DIRECTION_PRESENTATION_ZH[direction] ?? DIRECTION_PRESENTATION_ZH.back) : (DIRECTION_PRESENTATION[direction] ?? DIRECTION_PRESENTATION.back);
  const successInstruction = isChinese() ? "构图已固定" : guidance?.successInstruction ?? "구도 고정 완료";
  return shell(`
    ${placeIdentity(data, state.identityHistorical)}
    <section class="camera-stage${state.ready ? " camera-stage--ready" : ""}">
    ${!video && captureStill ? `<img class="camera-fallback" src="${pathToUrl(captureStill)}" alt="${data.currentDisplayName ?? data.currentPlaceName ?? data.placeName ?? data.placeId}${tr(" 현재 사진", "当前照片")}" style="object-fit:${mediaFit};object-position:${mediaPosition}"/>` : ""}

${video ? `<video class="camera-video" src="${pathToUrl(video.path)}" muted playsinline autoplay preload="auto" style="object-fit:${mediaFit};object-position:${mediaPosition}" data-playback-rate="${guidance.playbackRate ?? 1}" data-segment-start="${guidance.segmentStartSeconds ?? 0}" data-segment-end="${guidance.segmentEndSeconds ?? ""}"></video>` : !captureStill ? `<div class="camera-placeholder"><span>LIVE CAMERA SURFACE</span><p>${tr("호스트 카메라 스트림 연결 대기", "等待连接主机相机画面")}</p></div>` : ""}<div class="camera-shade"></div>
      ${guidanceOverlay(guidance?.arOverlay)}
      <span class="shutter-flash" aria-hidden="true"></span>
      <div class="camera-meta"><span>${video ? tr("촬영 구도 안내", "拍摄构图引导") : captureStill ? mode === "demo" ? tr("구도 분석 데모", "构图分析演示") : "HOST CAPTURE" : "LIVE-READY"}</span><span>${tr("시도", "尝试")} ${data.retry.attempt} / ${data.retry.maxAttempts}</span></div>
      <span class="tracking-status" data-tracking-status>${tr("건물 윤곽 인식", "识别建筑轮廓")}</span>
      <span class="move-cue${state.ready ? " move-cue--locked" : ""}" data-move-cue data-direction="${direction}" aria-hidden="true">${state.ready ? `${icon("check")}<small>${successInstruction}</small>` : `${directionUi.glyph}<small>${guidance?.shortLabel ?? directionUi.shortLabel}</small>`}</span>
      <div class="guidance-pill" role="status">
        <div data-guide-slot></div>
        <div><strong data-guidance-title>${state.ready ? successInstruction : initialCopy[0]}</strong><small data-guidance-detail>${state.ready ? tr(`${data.historicalYear}년의 모습과 비교를 시작합니다`, `开始与${data.historicalYear}年的景象进行比较`) : initialCopy[1]}</small></div>
      </div>
      ${!replacementRequired && mode === "demo" ? `<button class="skip-link" data-action="skip-guidance">${tr("안내 건너뛰기", "跳过引导")}</button>` : ""}
    </section>
    <div class="guidance-footer">
      <div class="alignment-progress"><div><span>${tr("정합 준비", "准备对齐")}</span><output data-guidance-progress>12%</output></div><progress max="100" value="12" data-guidance-progress-bar>12%</progress></div>
      <p data-guidance-status><span class="pulse-dot"></span>${state.ready ? successInstruction : tr("구도 분석 중", "正在分析构图")}</p>
      <button class="primary" data-action="align-retake" ${state.ready && !replacementRequired ? "" : "disabled"}>${tr("이 구도로 기록하기", "按此构图记录")}</button>
      ${mode === "live" && !state.ready ? `<p class="live-note">${tr("실제 정합 완료 응답을 받으면 활성화됩니다.", "收到实际对齐完成结果后即可使用。")}</p>` : ""}
    </div>
  `, data, { eyebrow: "ALIGNMENT GUIDE", title: tr("시간 맞추기", "对准时间"), compact: true });
}

function selectedCurrent(data) {
  const capture = state.selected === "retake" ? data.captures.retake : data.captures.initial;
  return capture?.previewUrl ?? data.overlay.currentImage;
}

function cardLayers(data, active = state.comparison) {
  const current = pathToUrl(selectedCurrent(data));
  const restored = pathToUrl(data.overlay.aiRestoredScene);
  const historical = pathToUrl(data.overlay.historicalSourceImage);
  return `
    <div class="photo-layers" id="timetrace-photo-panel" role="tabpanel" data-view="${active}" style="--view-duration:450ms;--restored-opacity:${state.opacity}">
      <img class="photo-current" src="${current}" alt="${tr("선택된 현재 사진", "已选择的当前照片")}" />
      ${restored ? `<img class="photo-restored" src="${restored}" alt="${tr("역사 기록을 조건으로 사전 생성하고 검수한 AI 복원 장면", "根据历史记录预先生成并审核的AI复原场景")}" style="opacity:${state.opacity}" />` : ""}
      <img class="photo-historical" src="${historical}" alt="${tr(`${data.historicalYear}년 역사 원본 사진`, `${data.historicalYear}年历史原始照片`)}" />
      <div class="photo-vignette"></div>
    </div>`;
}

function comparisonScreen(data, selected = "initial") {
  const tabs = [["current", tr("현재 사진", "当前照片")], ["restored", tr("AI 복원", "AI复原")], ["historical", tr(`${data.historicalYear} 원본`, `${data.historicalYear}年原图`)]];
  return shell(`
    <p class="selection-note"><span>${icon("check")}</span>${selected === "retake" ? tr("AI가 더 적합한 보정 사진을 선택했어요", "AI已选择更适合的校正照片") : tr("촬영한 사진을 과거 기록과 맞췄어요", "已将拍摄照片与历史记录对齐")}</p>
    ${placeIdentity(data, true)}
    <article class="record-card">
      <div class="record-photo">
        ${cardLayers(data)}
        <span class="year-stamp" data-year-stamp>AI RESTORED</span>
        <span class="restoration-badge" data-restoration-badge>${tr("AI 복원 장면", "AI复原场景")}</span>
        <button class="replay" data-action="replay" aria-label="${tr("시간의 겹침 보기", "查看时间重叠")}">${icon("play")}<span>${tr("시간의 겹침 보기", "查看时间重叠")}</span></button>
      </div>
      <div class="card-caption"><p>ARCHIVE NO. ${data.placeId}-${data.historicalYear}</p><h2>${data.historicalDisplayName ?? data.historicalPlaceName ?? data.placeName ?? data.placeId}</h2><span data-comparison-description aria-live="polite" aria-atomic="true">${getComparisonDescription(state.comparison, data.historicalYear)}</span></div>
    </article>
    <div class="compare-controls">
      <div class="tabs" role="tablist" aria-label="${tr("사진 비교", "照片对比")}">
        ${tabs.map(([id, label]) => `<button id="timetrace-tab-${id}" role="tab" aria-controls="timetrace-photo-panel" aria-selected="${state.comparison === id}" tabindex="${state.comparison === id ? 0 : -1}" data-view="${id}">${label}</button>`).join("")}
      </div>
      <label class="opacity-control" ${state.comparison === "restored" ? "" : "hidden"}><span>${tr("AI 복원 장면", "AI复原场景")}</span><input type="range" min="0" max="100" value="${Math.round(state.opacity * 100)}" data-action="opacity" aria-label="${tr("현재 사진 위 AI 복원 장면 투명도", "当前照片上AI复原场景的透明度")}"/><output>${Math.round(state.opacity * 100)}%</output></label>
    </div>
    <button class="primary" data-action="complete">${tr("기록 열쇠 획득", "获得记录钥匙")}</button>
  `, data, { eyebrow: "ARCHIVE DISCOVERED", title: tr("기록 비교", "记录对比") });
}

function alignmentScreen(data) {
  const messages = isChinese() ? [
    "正在寻找建筑边角",
    "正在将窗户和屋顶线与历史记录对齐",
    "正在把已对齐建筑的周边复原为过去景象",
    "AI复原场景已完成",
  ] : [
    "건물의 모서리를 찾고 있어요",
    "창문과 지붕선을 과거 기록과 맞추고 있어요",
    "정합된 건물 주변을 과거 풍경으로 복원하고 있어요",
    "AI 복원 장면이 완성됐어요",
  ];
  return shell(`
    ${placeIdentity(data, state.identityHistorical)}
    <section class="alignment-stage alignment-place-${String(data.placeId).toLowerCase()} alignment-step-${state.alignmentStep}" aria-live="polite">
      <button class="animation-skip" data-action="skip-alignment">${tr("건너뛰기", "跳过")}</button>
      <article class="alignment-card">
        <img class="alignment-current" src="${pathToUrl(selectedCurrent(data))}" alt="${tr("선택된 현재 사진", "已选择的当前照片")}"/>
        ${data.overlay.aiRestoredScene ? `<img class="alignment-restored" src="${pathToUrl(data.overlay.aiRestoredScene)}" alt="${tr("사전 생성된 AI 복원 장면", "预先生成的AI复原场景")}"/>` : ""}
        <img class="alignment-past" src="${pathToUrl(data.overlay.alignedHistoricalRgba)}" alt=""/>
        <div class="record-lines" aria-hidden="true"><i></i><i></i><i></i></div>
        <span class="card-join" aria-hidden="true"></span>
        <span class="alignment-restoration-label">${tr("AI 복원 장면", "AI复原场景")}</span>
      </article>
      <div class="alignment-copy"><span data-alignment-number>0${state.alignmentStep + 1}</span><p data-alignment-message>${messages[state.alignmentStep]}</p></div>
    </section>
  `, data, { eyebrow: "TIME ALIGNMENT", title: tr("시간 기록 정합", "时间记录对齐") });
}

function completeScreen(data, selected) {
  return shell(`
    <section class="completion">
      <div class="piece-lock" aria-hidden="true">${icon("archive")}<i></i></div>
      <p class="overline">STORY KEY ACQUIRED</p>
      <h2>${tr("옛 이야기의 열쇠가<br/>획득되었습니다", "已获得<br/>往昔故事的钥匙")}</h2>
      <p>${data.completionSequenceLabel ?? formatPieceLabel(data.sequenceIndex ?? data.pieceNumber)}</p>
      <article class="mini-card"><img src="${pathToUrl(data.overlay.aiRestoredScene)}" alt="${tr("획득한 기록 열쇠의 AI 복원 대표 장면", "已获得记录钥匙的AI复原代表场景")}"/><div><strong>${data.historicalDisplayName ?? data.historicalPlaceName ?? data.placeName ?? data.placeId}</strong><span>${data.historicalYear}</span></div></article>
      <div class="join-mark" aria-label="${tr("다음 시간의 조각과 연결될 위치", "与下一个时间碎片连接的位置")}"><i></i><i></i><i></i></div>
    </section>
    <button class="primary" data-action="finish">${tr("완료", "完成")}</button>
    <p class="integration-note">${tr("다음 화면은 호스트가 완료 결과를 받은 뒤 결정합니다.", "主程序收到完成结果后将决定下一画面。")}</p>
  `, data, { eyebrow: "TIMETRACE COMPLETE", title: tr("기록 보관함", "记录档案盒") });
}

function loadingScreen(message = tr("기록을 불러오는 중입니다", "正在加载记录")) {
  return shell(`<section class="loading"><i></i><p>${message}</p></section>`, null, { title: tr("시간의 조각", "时间碎片") });
}

function liveWaiting(data) {
  return shell(`
    <section class="status-panel">
      <span class="status-mark status-mark--waiting">···</span>
      <p class="overline">LIVE ADAPTER</p>
      <h2>${tr("AI 결과를 기다리고 있어요", "正在等待AI结果")}</h2>
      <p>${tr("실시간 AI는 이 UI에서 모사하지 않습니다. 호스트가 Mission AI와 TimeTrace 응답을 adapter에 전달하면 같은 흐름이 시작됩니다.", "此界面不模拟实时AI。主程序向适配器传递Mission AI与TimeTrace响应后，将开始相同流程。")}</p>
      <p class="todo">TODO(api): ${data.missingFields.join(", ") || tr("응답 연결", "连接响应")}</p>
    </section>
  `, data, { eyebrow: "INTEGRATION READY", title: tr("실시간 연결", "实时连接") });
}

function applyGuideCharacter(root, guideCharacter) {
  const slot = root.querySelector("[data-guide-slot]");
  if (!slot || guideCharacter == null) return;
  if (typeof guideCharacter === "function") {
    const rendered = guideCharacter(slot);
    if (rendered instanceof Node) slot.append(rendered);
    return;
  }
  if (guideCharacter instanceof Node) {
    slot.append(guideCharacter);
    return;
  }
  if (typeof guideCharacter === "string") slot.textContent = guideCharacter;
}

export async function mountTimeTrace(root, options = {}) {
  if (root && !root.nodeType && root.root) {
    options = root;
    root = options.root;
  }
  if (!root) throw new Error("TimeTrace mount element is required");
  currentLocale = options.locale === "zh-CN" ? "zh-CN" : "ko";
  mountedInstances.get(root)?.destroy();
  clearTimers();
  state.screen = "loading";
  state.comparison = "restored";
  state.opacity = 1;
  state.opacityAnimating = false;
  state.ready = false;
  state.replaying = false;
  state.alignmentStep = 0;
  state.selected = "initial";
  state.terminated = false;
  state.identityHistorical = false;
  root.classList.add("timetrace");
  root.dataset.display = options.embedded ? "embedded" : "standalone";
  root.innerHTML = loadingScreen();

  const mode = options.mode === "live" ? "live" : "demo";
  const scenarioName = options.scenario || "instant";
  const defaults = {
    placeId: options.placeId,
    placeName: options.placeName,
    historicalYear: options.historicalYear,
    currentPlaceName: options.currentPlaceName,
    currentDisplayName: options.currentDisplayName,
    captureDate: options.captureDate,
    currentDate: options.currentDate,
    now: options.now,
    historicalPlaceName: options.historicalPlaceName,
    historicalDisplayName: options.historicalDisplayName,
    pieceNumber: options.pieceNumber,
    totalPieces: options.totalPieces,
    completionSequenceLabel: options.completionSequenceLabel,
    initialCaptureRef: options.initialCaptureRef,
    initialCaptureUrl: options.initialCaptureUrl,
    assets: options.assets,
    maxRetakes: options.maxRetakes,
  };
  const manifestUrl = options.manifestUrl ?? root.dataset.manifestUrl ?? MANIFEST_URL;
  const manifest = mode === "demo" ? await fetch(manifestUrl).then((response) => {
    if (!response.ok) throw new Error(`Demo manifest load failed: ${response.status}`);
    return response.json();
  }) : null;
  const adapter = mode === "live"
    ? createLiveAdapter({ aiResult: options.aiResult, getResult: options.getLiveResult, defaults })
    : createDemoAdapter(manifest, { scenario: scenarioName, placeId: options.placeId, overrides: defaults });
  const data = await adapter.load();
  const normalizedGuidance = data.guidance[0] ?? { code: "MOVE_BACK" };
  const liveGuidanceCode = normalizedGuidance.code;
  const scenario = mode === "demo" ? {
    ...adapter.scenario,
    guidance: adapter.scenario.guidance ? {
      ...(GUIDANCE_COPY[adapter.scenario.guidance.code] ?? GUIDANCE_COPY.MOVE_BACK),
      ...adapter.scenario.guidance,
    } : null,
  } : {
    contract: { selectedCapture: data.selectedCapture },
    guidance: {
      code: liveGuidanceCode,
      ...(GUIDANCE_COPY[liveGuidanceCode] ?? GUIDANCE_COPY.MOVE_BACK),
      ...(normalizedGuidance.message ? { label: normalizedGuidance.message } : {}),
      direction: normalizedGuidance.direction,
      readyAtMs: null,
    },
    video: options.liveVideo ?? null,
  };
  if (isChinese() && scenario.guidance) {
    const code = scenario.guidance.code ?? "MOVE_BACK";
    scenario.guidance = {
      ...scenario.guidance,
      ...(GUIDANCE_COPY_ZH[code] ?? GUIDANCE_COPY_ZH.MOVE_BACK),
      stageCopy: GUIDANCE_STAGE_ZH.map((stage) => [...stage]),
      successInstruction: "构图已固定",
      shortLabel: (DIRECTION_PRESENTATION_ZH[scenario.guidance.direction] ?? DIRECTION_PRESENTATION_ZH.back).shortLabel,
    };
  }
  state.selected = data.selection.selected || scenario?.contract?.selectedCapture || "initial";
  state.terminated = false;

  const preloadReferences = [];
  [
    data.overlay.currentImage,
    data.overlay.aiRestoredScene,
    data.overlay.historicalSourceImage,
    data.overlay.alignedHistoricalRgba,
    data.overlay.staticPreview,
  ].filter(Boolean).forEach((path) => {
    const image = new Image();
    image.decoding = "async";
    image.src = pathToUrl(path);
    preloadReferences.push(image);
  });
  if (scenario.video?.path) {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = pathToUrl(scenario.video.path);
    video.load();
    preloadReferences.push(video);
  }

  const resetScrollPosition = () => {
    root.scrollTop = 0;
    const shellElement = root.querySelector(".app-shell");
    if (shellElement) shellElement.scrollTop = 0;
    if (!options.embedded) window.scrollTo?.({ top: 0, left: 0, behavior: "instant" });
  };

  function render(screen) {
    state.screen = screen;
    root.dataset.flowState = screen === "guidance" ? (state.ready ? "aligned" : "guiding")
      : screen === "alignment" ? "matching"
        : screen === "compare" ? "compare"
          : screen === "complete" ? "archived"
            : screen;
    if (screen === "mission") root.innerHTML = missionResult(data, scenarioName);
    if (screen === "guidance") root.innerHTML = guidanceScreen(data, scenario, mode);
    if (screen === "alignment") root.innerHTML = alignmentScreen(data);
    if (screen === "compare") root.innerHTML = comparisonScreen(data, state.selected);
    if (screen === "complete") root.innerHTML = completeScreen(data, state.selected);
    if (screen === "live-waiting") root.innerHTML = liveWaiting(data);
    bind();
    applyGuideCharacter(root, options.guideCharacter);
    resetScrollPosition();
  }

  function emitComplete() {
    if (state.terminated) return;
    state.terminated = true;
    const detail = buildCompleteResult(data, mode === "demo");
    root.dispatchEvent(new CustomEvent("timetrace:complete", { bubbles: true, detail }));
    options.onComplete?.(detail);
  }

  function emitRetry() {
    if (state.terminated) return;
    state.terminated = true;
    const detail = buildRetryResult(data);
    root.dispatchEvent(new CustomEvent("timetrace:retry", { bubbles: true, detail }));
    options.onRetry?.(detail);
  }

  function showComparison() {
    clearTimers();
    state.comparison = "restored";
    state.opacity = 1;
    render("compare");
    setComparisonView("restored");
  }

  function updateAlignmentStep(step) {
    state.alignmentStep = step;
    const stage = root.querySelector(".alignment-stage");
    if (!stage) return;
    [...stage.classList].filter((name) => name.startsWith("alignment-step-")).forEach((name) => stage.classList.remove(name));
    stage.classList.add(`alignment-step-${step}`);
    const messages = isChinese() ? [
      "正在寻找建筑边角",
      "正在将窗户和屋顶线与历史记录对齐",
      "正在把已对齐建筑的周边复原为过去景象",
      "AI复原场景已完成",
    ] : [
      "건물의 모서리를 찾고 있어요",
      "창문과 지붕선을 과거 기록과 맞추고 있어요",
      "정합된 건물 주변을 과거 풍경으로 복원하고 있어요",
      "AI 복원 장면이 완성됐어요",
    ];
    const number = stage.querySelector("[data-alignment-number]");
    const message = stage.querySelector("[data-alignment-message]");
    if (number) number.textContent = `0${step + 1}`;
    if (message) message.textContent = messages[step];
  }

  function transitionPlaceIdentity() {
    const identity = root.querySelector("[data-place-identity]");
    if (!identity) return;
    state.identityHistorical = true;
    const duration = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 1 : 225;
    const fadeOut = identity.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: "linear", fill: "forwards" });
    fadeOut.finished.then(() => {
      if (!identity.isConnected) return;
      fadeOut.cancel();
      const name = identity.querySelector("[data-place-name]");
      const time = identity.querySelector("[data-place-time]");
      if (name) name.textContent = data.historicalDisplayName ?? data.historicalPlaceName ?? data.placeName ?? data.placeId;
      if (time) time.textContent = String(data.historicalYear ?? "");
      identity.classList.add("place-identity--historical");
      const fadeIn = identity.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing: "linear", fill: "forwards" });
      fadeIn.finished.then(() => fadeIn.cancel());
    });
  }

  function beginAlignment(selected) {
    clearTimers();
    state.selected = selected;
    const selectedCapture = selected === "retake" ? data.captures.retake : data.captures.initial;
    data.selection = { selected, selectedRef: selectedCapture?.ref ?? null };
    data.selectedCapture = selected;
    data.alignmentStatus = "ready";
    data.overlayStatus = "ready";
    data.overlay.ready = Boolean(data.overlay.alignedHistoricalRgba);
    state.alignmentStep = 0;
    const identityWasHistorical = state.identityHistorical;
    render("alignment");
    if (!identityWasHistorical) transitionPlaceIdentity();
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      schedule(showComparison, 240);
      return;
    }
    schedule(() => updateAlignmentStep(1), 360);
    schedule(() => updateAlignmentStep(2), 780);
    schedule(() => updateAlignmentStep(3), 1200);
    schedule(showComparison, 1700);
  }

  function syncOpacity(value) {
    const clamped = Math.min(1, Math.max(0, value));
    state.opacity = clamped;
    root.querySelector(".photo-restored")?.style.setProperty("opacity", String(clamped));
    root.querySelector(".photo-layers")?.style.setProperty("--restored-opacity", String(clamped));
    const slider = root.querySelector('[data-action="opacity"]');
    const output = root.querySelector(".opacity-control output");
    const percentage = Math.round(clamped * 100);
    if (slider) slider.value = String(percentage);
    if (output) output.value = `${percentage}%`;
  }

  function animateOpacity(from, target, duration, onDone) {
    if (opacityFrame != null) cancelAnimationFrame(opacityFrame);
    state.opacityAnimating = true;
    syncOpacity(from);
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
      syncOpacity(from + ((target - from) * progress));
      if (progress < 1) {
        opacityFrame = requestAnimationFrame(tick);
        return;
      }
      opacityFrame = null;
      state.opacityAnimating = false;
      onDone?.();
    };
    opacityFrame = requestAnimationFrame(tick);
  }

  function setComparisonView(view) {
    if (opacityFrame != null) cancelAnimationFrame(opacityFrame);
    opacityFrame = null;
    state.opacityAnimating = false;
    state.comparison = view;
    const layers = root.querySelector(".photo-layers");
    if (!layers) return;
    layers.style.setProperty("--view-duration", view === "historical" ? "600ms" : "400ms");
    layers.dataset.view = view;
    root.querySelectorAll("button[data-view]").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.view === view));
      button.tabIndex = button.dataset.view === view ? 0 : -1;
    });
    const yearStamp = root.querySelector("[data-year-stamp]");
    if (yearStamp) yearStamp.textContent = view === "historical" ? tr(`${data.historicalYear} 원본`, `${data.historicalYear}年原图`) : view === "current" ? tr("현재 사진", "当前照片") : "AI RESTORED";
    const badge = root.querySelector("[data-restoration-badge]");
    if (badge) badge.hidden = view !== "restored";
    const description = root.querySelector("[data-comparison-description]");
    if (description) description.textContent = getComparisonDescription(view, data.historicalYear);
    const replayButton = root.querySelector('[data-action="replay"]');
    if (replayButton) replayButton.hidden = view !== "restored";
    const control = root.querySelector(".opacity-control");
    const slider = root.querySelector('[data-action="opacity"]');
    if (control) control.hidden = view !== "restored";
    if (slider) slider.disabled = false;
  }

  function replay() {
    clearTimers();
    state.replaying = true;
    setComparisonView("restored");
    const control = root.querySelector(".opacity-control");
    if (control) control.hidden = false;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      animateOpacity(state.opacity, 0, 80, () => schedule(() => animateOpacity(0, 1, 160, () => {
        state.replaying = false;
      }), 80));
      return;
    }
    animateOpacity(state.opacity, 0, 400, () => {
      schedule(() => animateOpacity(0, 1, 1800, () => {
        state.replaying = false;
      }), 200);
    });
  }

  function setGuidanceReady() {
    if (scenario.guidance?.demoAssetStatus === "replacement_required") return;
    const video = root.querySelector(".camera-video");
    video?.pause();
    state.ready = true;
    root.dataset.flowState = "aligned";
    root.querySelector(".camera-stage")?.classList.add("camera-stage--ready");
    const title = root.querySelector("[data-guidance-title]");
    const detail = root.querySelector("[data-guidance-detail]");
    const status = root.querySelector("[data-guidance-status]");
    const trackingStatus = root.querySelector("[data-tracking-status]");
    const moveCue = root.querySelector("[data-move-cue]");
    const primary = root.querySelector('[data-action="align-retake"]');
    const successInstruction = isChinese() ? "构图已固定" : scenario.guidance?.successInstruction ?? "구도 고정 완료";
    if (title) title.textContent = successInstruction;
    if (detail) detail.textContent = tr(`${data.historicalYear}년의 모습과 비교를 시작합니다`, `开始与${data.historicalYear}年的景象进行比较`);
    if (status) status.innerHTML = `<span class="pulse-dot"></span>${successInstruction}`;
    if (trackingStatus) trackingStatus.textContent = successInstruction;
    if (moveCue) {
      moveCue.classList.add("move-cue--locked");
      moveCue.innerHTML = `${icon("check")}<small>${successInstruction}</small>`;
    }
    if (primary) primary.disabled = false;
    transitionPlaceIdentity();
  }

  function captureAndBeginAlignment(selected) {
    clearTimers();
    root.dataset.flowState = "captured";
    root.querySelector(".camera-video")?.pause();
    root.querySelector(".camera-stage")?.classList.add("camera-stage--captured");
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    schedule(() => beginAlignment(selected), reducedMotion ? 20 : 260);
  }

  function updateGuidanceStage(stage) {
    const title = root.querySelector("[data-guidance-title]");
    const detail = root.querySelector("[data-guidance-detail]");
    const progress = root.querySelector("[data-guidance-progress]");
    const progressBar = root.querySelector("[data-guidance-progress-bar]");
    const trackingStatus = root.querySelector("[data-tracking-status]");
    const camera = root.querySelector(".camera-stage");
    const values = isChinese() ? GUIDANCE_STAGE_ZH.map((item) => [...item]) : scenario.guidance?.stageCopy ?? [
      ["과거 기록과 겹칠 수 있는 구도를 찾고 있어요", "건물의 지붕과 외곽선을 확인하고 있습니다", 28],
      ["건물 양쪽 모서리가 안내선 안에 들어올 때까지 뒤로 이동해주세요.", "조금만 더 멀어지면 과거 사진과 비교할 수 있어요", 54],
      ["좋아요, 건물의 전체 형태가 보이기 시작했어요", "이 구도를 잠시 유지해 주세요", 82],
    ];
    if (stage === 1 && scenario.guidance?.primaryInstruction) {
      values[1] = [
        scenario.guidance.primaryInstruction,
        scenario.guidance.secondaryInstruction ?? values[1][1],
        values[1][2],
      ];
    }
    const stageValue = values[stage];
    if (!stageValue) return;
    if (title) title.textContent = stageValue[0];
    if (detail) detail.textContent = stageValue[1];
    if (progress) progress.value = `${stageValue[2]}%`;
    if (progressBar) progressBar.value = stageValue[2];
    if (camera) camera.dataset.guidanceStage = String(stage);
    if (trackingStatus) trackingStatus.textContent = isChinese()
      ? ["识别建筑轮廓", "正在调整构图", "正在调整构图"][stage]
      : ["건물 윤곽 인식", "구도 맞추는 중", "구도 맞추는 중"][stage];
  }

  function prepareGuidanceVideo() {
    const video = root.querySelector("video.camera-video");
    if (!video) return;
    const playbackRate = Number(video.dataset.playbackRate || 1);
    const segmentStart = Number(video.dataset.segmentStart || 0);
    const segmentEnd = Number(video.dataset.segmentEnd || 0);
    const holdMs = Number(scenario.guidance?.holdBeforeReadyMs ?? 700);
    const markFrameReady = () => video.classList.add("camera-video--has-frame");
    video.addEventListener("loadeddata", markFrameReady, { once: true });
    video.addEventListener("canplay", markFrameReady, { once: true });
    video.addEventListener("loadedmetadata", () => {
      video.playbackRate = playbackRate;
      if (segmentStart > 0 && segmentStart < video.duration) video.currentTime = segmentStart;
      video.play().catch(() => {
        const fallbackButton = document.createElement("button");
        fallbackButton.type = "button";
        fallbackButton.className = "video-play-fallback";
        fallbackButton.textContent = tr("촬영 영상 재생", "播放拍摄视频");
        fallbackButton.addEventListener("click", () => {
          video.play().then(() => fallbackButton.remove()).catch(() => {});
        });
        video.parentElement?.append(fallbackButton);
      });
    }, { once: true });
    video.addEventListener("timeupdate", () => {
      const progress = segmentEnd > segmentStart
        ? Math.min(1, Math.max(0, (video.currentTime - segmentStart) / (segmentEnd - segmentStart)))
        : 0;
      updateGuidanceStage(progress < 0.28 ? 0 : progress < 0.72 ? 1 : 2);
      if (segmentEnd > 0 && video.currentTime >= segmentEnd && video.dataset.segmentHeld !== "true") {
        video.dataset.segmentHeld = "true";
        video.pause();
        // Pause the last decoded valid frame in place. Seeking again here can
        // briefly expose an undecoded/black frame on cancelled Range requests.
        video.dataset.frozenAt = String(video.currentTime);
        root.querySelector(".camera-stage")?.classList.add("camera-stage--holding");
        if (scenario.guidance?.demoAssetStatus !== "replacement_required") schedule(setGuidanceReady, holdMs);
      }
    });
    video.addEventListener("ended", () => video.pause());
    video.addEventListener("error", () => video.classList.remove("camera-video--has-frame"));
    video.addEventListener("emptied", () => video.classList.remove("camera-video--has-frame"));
  }

  function bind() {
    const tabs = [...root.querySelectorAll("button[data-view]")];
    tabs.forEach((button, index) => {
      button.addEventListener("click", () => {
        clearTimers();
        state.replaying = false;
        setComparisonView(button.dataset.view);
      });
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const offset = event.key === "ArrowRight" ? 1 : -1;
        const target = tabs[(index + offset + tabs.length) % tabs.length];
        target.focus();
        setComparisonView(target.dataset.view);
      });
    });
    root.querySelector('[data-action="opacity"]')?.addEventListener("input", (event) => {
      clearTimers();
      state.replaying = false;
      state.comparison = "restored";
      event.target.disabled = false;
      syncOpacity(Number(event.target.value) / 100);
    });
    root.querySelector('[data-action="guide"]')?.addEventListener("click", () => {
      state.ready = false;
      render("guidance");
      prepareGuidanceVideo();
      if (mode === "demo" && Number.isFinite(scenario.guidance.readyAtMs)) schedule(setGuidanceReady, scenario.guidance.readyAtMs);
    });
    root.querySelector('[data-action="skip-guidance"]')?.addEventListener("click", setGuidanceReady);
    root.querySelector('[data-action="align"]')?.addEventListener("click", () => captureAndBeginAlignment("initial"));
    root.querySelector('[data-action="align-retake"]')?.addEventListener("click", () => captureAndBeginAlignment("retake"));
    root.querySelector('[data-action="continue-current"]')?.addEventListener("click", () => beginAlignment("initial"));
    root.querySelector('[data-action="skip-alignment"]')?.addEventListener("click", showComparison);
    root.querySelector('[data-action="replay"]')?.addEventListener("click", replay);
    root.querySelector('[data-action="complete"]')?.addEventListener("click", () => render("complete"));
    root.querySelector('[data-action="finish"]')?.addEventListener("click", emitComplete);
    root.querySelector('[data-action="retry"]')?.addEventListener("click", emitRetry);
  }

  if (mode === "live" && (data.missionStatus === "pending" || data.alignmentStatus === "pending")) {
    render("live-waiting");
  } else if (scenarioName === "compare") {
    render("compare");
    setComparisonView("restored");
  } else if (scenarioName === "complete") {
    render("complete");
  } else {
    render("mission");
  }

  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    clearTimers();
    root.querySelector(".camera-video")?.pause();
    root.replaceChildren();
    root.classList.remove("timetrace");
    delete root.dataset.display;
    delete root.dataset.flowState;
    mountedInstances.delete(root);
  };
  const controller = { data, destroy, unmount: destroy, retry: emitRetry, complete: emitComplete, showComparison };
  mountedInstances.set(root, controller);
  return controller;
}
