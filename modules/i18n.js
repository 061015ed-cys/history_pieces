/**
 * History Pieces 공통 다국어 계층
 * - 기존 마크업과 한국어 원문을 보존한 채 중국어 선택 시 화면 전체 문구를 전환합니다.
 * - 팀원 모듈의 동적 알림/상태 문구도 같은 사전을 사용합니다.
 */
(function initializeHistoryPiecesI18n(global) {
  "use strict";

  const ZH = "zh-CN";
  const originals = new Map();

  const staticCopy = [];
  const add = (selector, value, mode = "text") => {
    staticCopy.push({ selector, value, mode });
  };

  // 01. 표지
  add("#start-page .ornament-label", "AI故事旅游服务");
  add("#start-page .main-title", "用记录唤醒尘封已久的故事");
  add("#start-page .sub-text", "让你的此刻与过往的时间相遇，\n重新串联光州、全南各处的故事。");
  add("#start-btn", "开始 <span>→</span>", "html");
  add('#start-page [data-next="language-page"]', "开始 <span>→</span>", "html");
  add("#start-page .bottom-note", "✒ 你的记录将创造下一个故事");

  // 02. 언어 설정
  add("#language-page .ornament-label", "旅行者设置");
  add("#language-page .main-title", "请选择语言");
  add("#language-page .sub-text", "以后仍可在设置中更改。");
  add('#language-page [data-language="ko"] strong', "韩语");
  add('#language-page [data-language="ko"] small', "Korean");
  add('#language-page [data-language="en"] small', "英语");
  add('#language-page [data-language="zh-CN"] small', "简体中文");
  add('#language-page [data-language="zh-TW"] small', "繁体中文");
  add('#language-page [data-language="ja"] small', "日语");
  add('#language-page [data-language="vi"] small', "越南语");
  add('#language-page [data-language="th"] small', "泰语");
  add('#language-page [data-language="id"] small', "印度尼西亚语");
  add("#language-page .guide-line", "✒ 语言以后随时可以更改。");
  add("#language-next-btn", "下一步 <span>→</span>", "html");

  // 03. 국가/지역 설정
  add("#country-page .ornament-label", "旅行者设置");
  add("#country-page .main-title", "请选择国家或地区");
  add("#country-page .sub-text", "请设置服务提供范围。");
  const countries = [
    ["大韩民国（韩国）", "推荐"],
    ["中国", ""],
    ["日本", "目前暂不支持"],
    ["美国", "将依次开放"],
    ["中国台湾", "将依次开放"],
    ["泰国", "将依次开放"],
    ["越南", "将依次开放"],
    ["新加坡", "将依次开放"],
    ["法国", "将依次开放"],
    ["德国", "将依次开放"]
  ];
  countries.forEach(([name, status], index) => {
    add(`#country-page .select-row:nth-child(${index + 1}) strong`, name);
    if (status) add(`#country-page .select-row:nth-child(${index + 1}) small`, status);
  });
  add("#country-page .guide-line", "✒ 支持国家和服务将逐步扩展。");
  add("#country-next-btn", "下一步 <span>→</span>", "html");

  // 04. 중국인 모드 안내
  add("#china-intro-page .ornament-label", "中国游客专属模式");
  add("#china-intro-page .mode-badge", "中国游客模式");
  add("#china-intro-page .china-next-btn", "继续 <span>→</span>", "html");

  // 05. 닉네임
  add("#nickname-page .ornament-label", "旅行者设置");
  add("#nickname-page .main-title", "该怎么称呼你？");
  add("#nickname-page .sub-text", "请为旅途中的记录取一个名字。");
  add("#nickname-page .input-label", "昵称");
  add("#nickname-input", "请输入昵称", "placeholder");
  add('#nickname-page [data-nickname="여행자"]', "旅行者");
  add('#nickname-page [data-nickname="오늘의 기록자"]', "今日记录者");
  add("#nickname-page .guide-line", "✒ 昵称以后随时可以更改。");
  add("#nickname-next-btn", "下一步 <span>→</span>", "html");

  // 06~08. 첫 기록
  add("#first-record-intro-page .ornament-label", "首次记录准备");
  add("#first-record-intro-page .main-title", "从你的第一条记录开始旅程");
  add("#first-record-intro-page .sub-text", "请留下眼前的场景。\n也许某个人会对这条记录产生兴趣。");
  add("#first-record-intro-page .paper-note", "✒ 留下第一条记录后，旅程也许会流向稍有不同的方向。");
  add("#first-record-start-btn", "留下第一条记录 <span>→</span>", "html");
  add("#first-camera-page .ornament-label", "输入第一条记录");
  add("#first-camera-page .main-title", "记录场景");
  add("#first-camera-page .camera-guide", "请记录眼前的场景。<br><small>招牌、建筑与街景同时入镜效果更好。</small>", "html");
  add("#first-photo-label", "选择照片");
  add("#first-camera-page .analyze-btn", "⌕ 分析");
  add("#first-camera-page .sample-link", "使用示例照片继续");
  add("#first-camera-page .hint-box", "✦ 我来查看照片中的线索。");
  add("#first-loading-page .ornament-label", "确认第一条记录");
  add("#first-loading-page .main-title", "正在探索地点候选");
  add("#first-loading-page .loading-title", "正在解析场景中的地点线索");
  add("#first-loading-page .loading-desc", "根据照片中的招牌、建筑轮廓、街道结构和周边氛围，<br>正在缩小与当前场景相近的地点候选。", "html");
  add("#first-loading-page .step-row:nth-child(1) span:last-child", "确认醒目标识");
  add("#first-loading-page .step-row:nth-child(2) span:last-child", "比对建筑与街道结构");
  add("#first-loading-page .step-row:nth-child(3) span:last-child", "整理地点候选");
  add("#first-confirm-page .ornament-label", "确认第一条记录");
  add("#first-confirm-page .main-title", "记录已抵达");
  add("#first-confirm-page .place-card-badge", "📍 AI匹配地点");
  add("#first-confirm-page .place-card-title", "木浦站");
  add("#first-confirm-page .place-card-desc", "全罗南道木浦市湖南洞");
  add("#first-confirm-page .dialogue-box", "你的第一条记录已抵达木浦站。<br>要在这里开启故事吗？", "html");
  add("#confirm-place-btn", "在此开始 <span>→</span>", "html");

  // 09. 기록새
  add("#giroksae-intro-page .arrival-label", "✦ 记录鸟回应了第一条记录 ✦");
  add("#giroksae-intro-page .touch-hint", "✦ 轻触屏幕继续 ✦");

  // 10. 여정 안내
  add("#mokpo-guide-page .ornament-label", "木浦故事之旅");
  add("#mokpo-guide-page .main-title", "从木浦站前开始寻找旧时光");
  add("#mokpo-guide-page .sub-text", "记录三个场景碎片后，<br>AI会依据可靠资料重新串联当地的故事。", "html");
  add("#mokpo-guide-page .map-node.start span", "木浦站");
  add("#mokpo-guide-page .map-node.end span", "木浦近代历史馆");
  add("#mokpo-guide-page .legend-item:first-child", "● 当前位置");
  add("#mokpo-guide-page .legend-item:last-child", "● 推荐路线");
  add("#guide-next-btn", "出发 <span>→</span>", "html");

  const pieces = {
    1: {
      missionLabel: "场景碎片 1",
      missionTitle: "寻找木浦站的站名标识",
      missionGuide: "请找到写有木浦站名称的标识并拍照记录。",
      cardTag: "第一块碎片",
      cardTitle: "木浦的第一道门户",
      uploadTitle: "记录木浦站的站名标识",
      uploadHint: "AI会判断照片中是否包含目标线索。",
      aiTitle: "AI分析结果 — 场景碎片 1",
      aiSuccess: "✦ 已找到木浦站的招牌线索。"
    },
    2: {
      missionLabel: "场景碎片 2",
      missionTitle: "寻找通往旧城区的道路",
      missionGuide: "请记录从站前广场通往旧城区的方向。",
      cardTag: "第二块碎片",
      cardTitle: "通往旧城区的路",
      uploadTitle: "记录站前道路的方向",
      uploadHint: "AI会判断木浦站与旧城区之间的连接线索。",
      aiTitle: "AI分析结果 — 场景碎片 2",
      aiSuccess: "✦ 已找到通往旧城区的道路线索。"
    },
    3: {
      missionLabel: "场景碎片 3",
      missionTitle: "寻找人来人往的站前景象",
      missionGuide: "请记录站前广场周边人们往来与生活的痕迹。",
      cardTag: "第三块碎片",
      cardTitle: "人来人往的站前",
      uploadTitle: "记录站前的生活景象",
      uploadHint: "AI会判断人们移动与生活的场景线索。",
      aiTitle: "AI分析结果 — 场景碎片 3",
      aiSuccess: "✦ 已找到站前移动与生活的线索。"
    }
  };

  Object.entries(pieces).forEach(([piece, copy]) => {
    add(`#piece-${piece}-mission-page .ornament-label`, copy.missionLabel);
    add(`#piece-${piece}-mission-page .main-title`, copy.missionTitle);
    add(`#piece-${piece}-mission-page .mission-guide`, copy.missionGuide);
    add(`#piece-${piece}-mission-page .location-chip`, "📍 木浦站附近");
    add(`#piece-${piece}-mission-page .mission-card-tag`, copy.cardTag);
    add(`#piece-${piece}-mission-page .mission-card h2`, copy.cardTitle);
    add(`#piece-${piece}-upload-page .ornament-label`, copy.missionLabel);
    add(`#piece-${piece}-upload-page .main-title`, copy.uploadTitle);
    add(`#piece-${piece}-upload-page .sub-text`, copy.uploadHint);
    add(`#piece-${piece}-upload-page .camera-empty strong`, "选择任务照片");
    add(`#piece-${piece}-upload-page .camera-empty small`, "相机或相册");
    add(`#piece-${piece}-photo-label`, "选择照片");
    add(`#piece-${piece}-sample-btn`, "使用示例照片");
    add(`#piece-${piece}-analyze-btn`, "AI分析 <span>→</span>", "html");
    add(`#piece-${piece}-ai-result-page .ornament-label`, copy.missionLabel);
    add(`#piece-${piece}-ai-result-page .main-title`, copy.aiTitle);
    add(`#piece-${piece}-ai-result-page .result-row:nth-child(1) span`, "感知类别");
    add(`#piece-${piece}-ai-result-page .result-row:nth-child(2) span`, "置信度");
    add(`#piece-${piece}-ai-result-page .result-row:nth-child(3) span`, "判定");
    add(`#piece-${piece}-ai-result-page .result-success`, copy.aiSuccess);
    add(`#piece-${piece}-ai-result-page .retry-btn`, "重新拍摄");
    add(`#piece-${piece}-ai-next-btn`, "下一步 <span>→</span>", "html");
  });
  add("#piece-1-ai-result-page .result-row:nth-child(1) strong", "车站名标识");
  add("#piece-2-ai-result-page .result-row:nth-child(1) strong", "站前广场与道路");
  add("#piece-3-ai-result-page .result-row:nth-child(1) strong", "站前生活景象");

  // 촬영 오버레이
  add("#piece-camera-overlay .overlay-top", "场景碎片任务");
  add("#overlay-piece-label", "场景碎片");
  add("#piece-video-label", "选择视频");
  add("#overlay-sample-btn", "使用示例照片");
  add("#overlay-cancel-btn", "返回");
  add("#overlay-capture-btn", "拍摄");
  add("#overlay-shutter-btn", "拍摄");

  // 세 장면 이야기와 5초 기록
  [1, 2, 3].forEach((piece) => {
    add(`#piece-${piece}-comic-page .ornament-label`, `场景碎片 ${piece} 的故事`);
    add(`#piece-${piece}-comic-page .main-title`, pieces[piece].cardTitle);
    add(`#piece-${piece}-comic-page .sub-text`, "依据现场记录与可靠资料重构的场景故事");
    add(`#piece-${piece}-comic-next-btn`, piece === 3 ? "最后的记录 <span>→</span>" : "留下当下的记录 <span>→</span>", "html");
    add(`#record-${piece}-page .ornament-label`, `当下记录 ${piece}`);
    add(`#record-${piece}-page .main-title`, "记录当下的5秒");
    add(`#record-${piece}-page .sub-text`, "这段影像将在旅程结束时连接成一部短片。");
    add(`#record-${piece}-page .record-upload strong`, "上传5秒记录");
    add(`#record-${piece}-page .record-upload small`, "请上传已拍摄的视频，或使用示例记录继续。");
    add(`#record-${piece}-file-label`, "选择视频");
    add(`#record-${piece}-sample-btn`, "使用示例记录");
    add(`#record-${piece}-next-btn`, piece === 3 ? "解锁故事 <span>→</span>" : "下一块碎片 <span>→</span>", "html");
  });

  // 이야기 해금, 장소 서사, 퀴즈
  add("#story-unlock-page .ornament-label", "已完成三个场景碎片");
  add("#story-unlock-page .main-title", "一个地方的故事即将开启");
  add("#story-unlock-page .sub-text", "AI正在依据你的记录与可靠资料，<br>将分散的场景连接成一段历史。", "html");
  add("#story-unlock-page .unlock-card span", "✦ 故事已解锁 ✦");
  add("#story-unlock-page .unlock-card strong", "海边小城的摩登时光");
  add("#story-unlock-page .unlock-card small", "木浦近代历史故事");
  add("#story-start-btn", "阅读故事 <span>→</span>", "html");
  add("#place-story-page .ornament-label", "AI重构故事");
  add("#place-story-page .main-title", "海边小城的摩登时光");
  add("#place-story-page .sub-text", "木浦近代历史之旅");
  add("#story-credit", "AI故事 · 依据现场记录与可靠资料重构");
  add("#quiz-start-btn", "完成故事 <span>→</span>", "html");
  add("#quiz-page .ornament-label", "故事任务");
  add("#quiz-page .main-title", "你还记得故事吗？");
  add("#quiz-page .quiz-label", "Q. 场景中的变化");
  add("#quiz-page .quiz-question", "旧车站附近出现时钟塔和红砖建筑，与什么变化有关？");
  add("#quiz-option-0", "① 农村地区扩大");
  add("#quiz-option-1", "② 开港后近代城市发展");
  add("#quiz-option-2", "③ 建造山城");
  add("#quiz-option-3", "④ 宫殿迁移");
  add("#quiz-feedback", "选择答案后即可完成故事。");
  add("#quiz-submit-btn", "确认答案 <span>→</span>", "html");
  add("#quiz-result-page .ornament-label", "故事完成");
  add("#quiz-result-page .main-title", "已保存一块历史碎片");
  add("#quiz-result-page .result-badge", "✓ 正确答案");
  add("#quiz-result-page .result-title", "开港后近代城市发展");
  add("#quiz-result-page .result-desc", "随着港口开放，木浦站、时钟塔和红砖建筑等近代城市景观逐渐形成。");
  add("#quiz-result-page .stamp-title", "故事记录已完成");
  add("#quiz-result-page .stamp-sub", "木浦近代历史篇");
  add("#to-journey-film-btn", "查看我的旅程短片 <span>→</span>", "html");

  // 여정필름
  add("#journey-film-page .ornament-label", "旅程短片");
  add("#journey-film-page .main-title", "我的记录成为了一部短片");
  add("#journey-film-page .sub-text", "三个5秒场景已经连接在一起。");
  add("#journey-film-page .film-tag", "History Pieces · 木浦");
  add("#film-clip-1", "记录 1");
  add("#film-clip-2", "记录 2");
  add("#film-clip-3", "记录 3");
  add("#journey-download-btn", "正在准备短片…");
  add("#journey-instagram-btn", "分享到Instagram");
  add("#to-next-place-btn", "寻找下一个地点 <span>→</span>", "html");

  // 다음 장소 후보, 상세, 예약
  add("#next-place-page .ornament-label", "下一段故事");
  add("#next-place-page .main-title", "请选择下一处地点候选");
  add("#next-place-page .sub-text", "根据刚完成的记录，推荐了三处可继续展开故事的地点。<br>选择候选后可查看说明与地图，再决定是否预约。", "html");
  add("#next-place-page .recommendation-option:nth-child(1) .candidate-name", "木浦近代历史馆1馆");
  add("#next-place-page .recommendation-option:nth-child(1) .candidate-tags", "近代文化 · 旧城区 · 开港");
  add("#next-place-page .recommendation-option:nth-child(1) .candidate-reason", "与刚完成的木浦旧城区和开港故事直接相连，可以在真实历史空间继续探索。");
  add("#next-place-page .recommendation-option:nth-child(2) .candidate-name", "1897开港文化街");
  add("#next-place-page .recommendation-option:nth-child(2) .candidate-tags", "开港遗迹 · 街区探索 · 摄影记录");
  add("#next-place-page .recommendation-option:nth-child(2) .candidate-reason", "从木浦站前往旧城区的途中，可以感受开港后逐渐形成的街区风貌。");
  add("#next-place-page .recommendation-option:nth-child(3) .candidate-name", "木浦镇历史公园");
  add("#next-place-page .recommendation-option:nth-child(3) .candidate-tags", "港口防御 · 历史遗迹 · 后续故事");
  add("#next-place-page .recommendation-option:nth-child(3) .candidate-reason", "可以继续探访木浦作为港口城市发展过程中更早期的历史痕迹。");
  add("#next-place-page .candidate-action", "查看说明与地图 →");
  add("#next-place-page .candidate-action:nth-of-type(2)", "查看说明与地图 →");
  add("#next-place-page .candidate-action:nth-of-type(3)", "查看说明与地图 →");
  add("#recommendation-status", "正在准备三个地点候选。");
  add("#restart-btn", "从头开始");
  add("#candidate-detail-page .ornament-label", "地点候选详情");
  add("#candidate-detail-page .main-title", "地点说明与地图");
  add("#candidate-distance", "步行约12分钟");
  add("#candidate-description", "确认该地点与刚完成的场景记录如何连接后，再决定是否预约。");
  add("#candidate-source-link", "查看验证资料 ↗");
  add("#candidate-detail-page .map-placeholder span", "地图预览");
  add("#candidate-detail-page .map-placeholder small", "整合阶段的位置结构");
  add("#candidate-back-btn", "← 返回候选列表");
  add("#candidate-confirm-btn", "选择此地点 <span>→</span>", "html");
  add("#reservation-page .ornament-label", "下一段故事");
  add("#reservation-page .main-title", "地点预约完成");
  add("#reservation-page .sub-text", "下一段旅程的候选地点已保存。<br>你可以返回候选列表选择其他地点。", "html");
  add("#reservation-page .reservation-label", "✓ 预约完成");
  add("#reservation-back-btn", "返回候选列表");
  add("#reservation-restart-btn", "从头开始");

  // 공통 진행 상태
  add("#story-generation-status strong", "AI正在重构三个场景故事");
  add("#story-generation-status p", "正在连接现场记录与可靠资料。");

  // 현재 1차 통합본의 실제 DOM 구조에 맞춘 화면별 중국어 문구
  add('#language-page [role="group"]', "选择服务语言", "aria-label");
  add('#country-page [role="group"]', "选择国家或文化圈", "aria-label");
  add('img[alt="기록새"]', "记录鸟", "alt");
  add("#first-photo-preview", "第一条记录预览", "alt");
  [1, 2, 3].forEach((piece) => {
    add(`#piece-${piece}-photo-preview`, `场景碎片${piece}照片预览`, "alt");
    add(`#piece-${piece}-comic-photo`, `场景碎片${piece}故事第1格`, "alt");
  });
  add("#piece-overlay-current", "用户拍摄的当前记录", "alt");
  add("#piece-overlay-archive", "同一地点的旧记录", "alt");
  add("#piece-overlay-page .overlay-mode-row", "叠加显示方式", "aria-label");
  add("#next-place-candidate-list", "下一条记录的地点候选", "aria-label");
  add("#next-place-detail-page .mini-map", "从木浦站前往所选推荐地点的简略地图", "aria-label");
  add("#language-page .setup-title", "请选择<br>语言", "html");
  add("#language-page .setup-desc", "以后仍可在设置中更改。");
  ["将于后续支持", "繁体中文 · 将于后续支持", "将于后续支持", "越南语 · 将于后续支持", "泰语 · 将于后续支持", "印度尼西亚语 · 将于后续支持"].forEach((copy, index) => {
    add(`#language-page .select-row:nth-child(${index + 3}) small`, copy);
  });
  add('#language-page [data-next="country-page"]', "下一步 <span>→</span>", "html");

  add("#country-page .setup-title", "请选择<br>国家或地区", "html");
  add("#country-page .setup-desc", "请设置服务提供范围。");
  add('#country-page [data-country="korea"] small', "基本讲解模式");
  add('#country-page [data-country="korea"] em', "默认");
  add('#country-page [data-country="china"] small', "面向中国游客的定制讲解");
  add("#country-page .small-guide", "支持国家和服务将逐步扩展。");
  add('#country-page [data-action="confirm-country"]', "下一步 <span>→</span>", "html");

  add("#china-mode-intro-page .setup-title", "从中国游客的视角<br>解读地点", "html");
  add("#china-mode-intro-page .ornament-label", "中国游客模式");
  add("#china-mode-intro-page .culture-badge", "🇨🇳 面向中国游客的定制讲解");
  add("#china-mode-intro-page .mode-card > p", "记录鸟会以铁路、港口城市和开港街区的脉络为线索，从中国游客熟悉的视角讲述木浦站的故事。");
  add('#china-mode-intro-page [data-next="nickname-page"]', "继续 <span>→</span>", "html");

  add("#nickname-page .setup-title", "该怎么<br>称呼你？", "html");
  add("#nickname-page .setup-desc", "请为旅途中的记录取一个名字。");
  add("#nickname-page .nickname-card label", "昵称");
  add('#nickname-page [data-nickname-chip="여행자"]', "旅行者 ✦");
  add('#nickname-page [data-nickname-chip="오늘의 기록자"]', "今日记录者 ✦");
  add("#nickname-page .small-guide", "昵称以后随时可以更改。");
  add('#nickname-page [data-action="save-nickname"]', "下一步 <span>→</span>", "html");

  add("#first-record-page .ornament-label", "首次记录准备");
  add("#first-record-page .setup-title", "从你的第一条记录<br>开始旅程", "html");
  add("#first-record-page .setup-desc", "请记录眼前的场景。<br>画面中同时包含可识别地点的线索会更好。", "html");
  add('#first-record-page [data-next="first-record-camera-page"]', "留下第一条记录 <span>→</span>", "html");
  add("#first-record-camera-page .ornament-label", "输入第一条记录");
  add("#first-record-camera-page .setup-title", "记录场景");
  add("#first-record-camera-page .setup-desc", "请记录眼前的场景。<br>招牌、建筑与街景同时入镜效果更好。", "html");
  add("#first-record-camera-page .camera-empty strong", "选择照片或直接拍摄");
  add("#first-record-camera-page .camera-empty small", "画面中包含招牌、建筑和街道结构会更好。");
  add('#first-record-camera-page [data-action="analyze-first-photo"]', "开始分析 <span>→</span>", "html");
  add('#first-record-camera-page [data-action="load-sample-first-photo"]', "使用示例照片继续");
  add("#place-loading-page .ornament-label", "探索地点候选");
  add("#place-loading-page .mini-title", "正在解析照片中的<br>地点线索", "html");
  add("#place-loading-page .setup-desc", "正在根据招牌、建筑轮廓与街道结构，<br>寻找接近当前场景的地点。", "html");
  add("#place-confirm-page .ornament-label", "确认地点候选");
  add("#place-confirm-page .mini-title", "推测这里是<br>木浦站一带", "html");
  add("#place-confirm-page .tag", "分析线索");
  add("#place-confirm-page .content-card h2", "木浦站站名标识 · 站前广场 · 旧城区入口");
  add("#place-confirm-page .content-card .description", "上传的场景中发现了接近木浦站的视觉线索。你可以从这里寻找木浦站的故事碎片。");
  add('#place-confirm-page [data-next="giroksae-intro-page"]', "是这里 <span>→</span>", "html");
  add('#place-confirm-page [data-next="first-record-camera-page"]', "重新上传照片");
  add("#giroksae-intro-page .character-label", "记录鸟回应了第一条记录");
  add("#giroksae-intro-page .character-dialogue small", "轻触屏幕继续");

  add("#mokpo-guide-page .ornament-label", "探索木浦站故事");
  add("#mokpo-guide-page .mini-title", "来寻找三个<br>故事碎片吧", "html");
  const guidePieces = [
    ["木浦的第一道门户", "木浦站站名标识"],
    ["通往旧城区的路", "站前广场与方向"],
    ["人来人往的站前", "移动与生活的痕迹"]
  ];
  guidePieces.forEach(([title, description], index) => {
    add(`#mokpo-guide-page .piece-map-card article:nth-child(${index + 1}) strong`, title);
    add(`#mokpo-guide-page .piece-map-card article:nth-child(${index + 1}) small`, description);
  });
  add("#mokpo-guide-page .giroksae-note p", "很好，依次找出藏在木浦站的三个碎片吧。");
  add('#mokpo-guide-page [data-next="piece-1-mission-page"]', "寻找第一块碎片 <span>→</span>", "html");

  const actualPieceCopy = {
    1: {
      uploadTitle: "请清楚记录<br>木浦站的站名标识",
      uploadStrong: "上传站名标识线索照片",
      uploadSmall: "直接训练的AI会判断是否包含目标线索。",
      line: "这个站名标识不只是文字，它是告诉我们进入木浦第一道门户的碎片。"
    },
    2: {
      uploadTitle: "请记录能看出<br>站前道路方向的画面",
      uploadStrong: "上传旧城区方向线索照片",
      uploadSmall: "AI会确认木浦站与旧城区之间的连接线索。",
      line: "道路不只是用来移动的地方，它也是城市故事延续的线。"
    },
    3: {
      uploadTitle: "请记录<br>站前的生活景象",
      uploadStrong: "上传站前景象线索照片",
      uploadSmall: "AI会确认人们移动与生活的痕迹。",
      line: "车站不只是列车经过的地方，也是人们的时间层层积累的地方。"
    }
  };
  Object.entries(actualPieceCopy).forEach(([piece, copy]) => {
    add(`#piece-${piece}-mission-page .tag`, "任务");
    add(`#piece-${piece}-mission-page [data-next="piece-${piece}-upload-page"]`, "拍摄任务照片 <span>→</span>", "html");
    add(`#piece-${piece}-upload-page .setup-title`, copy.uploadTitle, "html");
    add(`#piece-${piece}-upload-page .camera-empty strong`, copy.uploadStrong);
    add(`#piece-${piece}-upload-page .camera-empty small`, copy.uploadSmall);
    add(`#piece-${piece}-upload-page [data-action="run-piece-ai"]`, "AI线索识别 <span>→</span>", "html");
    add(`#piece-${piece}-upload-page [data-action="load-sample-piece-photo"]`, "使用示例线索照片");
    add(`#piece-${piece}-ai-result-page .ornament-label`, "AI线索识别");
    add(`#piece-${piece}-ai-result-page .mini-title`, `已确认<br>第${piece === "1" ? "一" : piece === "2" ? "二" : "三"}块碎片`, "html");
    add(`#piece-${piece}-ai-result-page [data-action="unlock-piece-comic"]`, "查看碎片故事 <span>→</span>", "html");
    add(`#piece-${piece}-ai-result-page [data-action="retry-piece-photo"]`, "重新拍摄");
    add(`#piece-${piece}-ai-result-page [data-action="force-piece-success"]`, "使用演示示例结果继续");
    add(`#piece-${piece}-comic-page .webtoon-panel:nth-child(-n+3) [data-panel-speaker]`, "旁白");
    add(`#piece-${piece}-comic-page .webtoon-panel:nth-child(4) [data-panel-speaker]`, "记录鸟");
    add(`#piece-${piece}-comic-page .webtoon-panel:nth-child(2) [data-panel-text]`, "正在生成故事。");
    add(`#piece-${piece}-comic-page .webtoon-panel:nth-child(3) [data-panel-text]`, "正在把今天的记录连接到故事中。");
    add(`#piece-${piece}-giroksae-line`, copy.line);
    add(`#piece-${piece}-comic-page [data-next="record-${piece}-page"]`, "留下5秒记录 <span>→</span>", "html");
  });
  add("#piece-1-mission-page .content-card h2", "木浦的第一道门户");
  add("#piece-2-mission-page .content-card h2", "站前广场与道路方向");
  add("#piece-3-mission-page .content-card h2", "移动与相遇的痕迹");
  [1, 2, 3].forEach((piece) => {
    add(`#piece-${piece}-ai-success`, `已获得场景碎片${piece}`);
  });

  add("#piece-overlay-page .ornament-label", "对比过去与现在");
  add("#piece-overlay-title", "叠加查看<br>场景碎片的时间", "html");
  add("#piece-overlay-page .tag", "旧记录叠加");
  add("#piece-overlay-subtitle", "对比当前记录与旧记录");
  add("#piece-overlay-page .current-caption", "当前记录");
  add("#piece-overlay-page .archive-caption", "旧记录");
  add("#piece-overlay-fallback", "这块碎片的旧记录资料尚未连接。<br>确认当前记录后仍可继续查看故事。", "html");
  add('#piece-overlay-page [data-overlay-mode="current"]', "现在");
  add('#piece-overlay-page [data-overlay-mode="archive"]', "过去");
  add('#piece-overlay-page [data-overlay-mode="blend"]', "叠加查看");
  add('#piece-overlay-page [data-action="play-overlay"]', "从现在播放到过去");
  add("#piece-overlay-page .overlay-opacity-control span", "旧记录叠加强度 <strong id=\"piece-overlay-value\">58%</strong>", "html");
  add('#piece-overlay-page [data-action="continue-piece-comic"]', "查看碎片故事 <span>→</span>", "html");

  const recordNext = {
    1: "寻找下一块碎片 <span>→</span>",
    2: "寻找最后一块碎片 <span>→</span>",
    3: "解锁地点故事 <span>→</span>"
  };
  [1, 2, 3].forEach((record) => {
    add(`#record-${record}-page .setup-title`, `用5秒留下<br>第${record === 1 ? "一" : record === 2 ? "二" : "三"}块碎片的地点`, "html");
    add(`#record-${record}-page .camera-empty strong`, "上传5秒记录");
    add(`#record-${record}-page .camera-empty small`, "请用视频留下当前景象。<br>建议拍摄5秒以内。", "html");
    add(`#record-${record}-page [data-action="save-record"]`, recordNext[record], "html");
    add(`#record-${record}-page [data-action="load-sample-record"]`, "使用示例记录");
  });

  add("#unlock-page .ornament-label", "解锁地点故事");
  add("#unlock-page .mini-title", "三个碎片汇聚在一起<br>木浦站的故事开启了", "html");
  add("#unlock-page .unlock-card h2", "已解锁木浦站地点故事");
  add("#unlock-page .unlock-card p", "木浦的第一道门户、通往旧城区的路，以及人来人往的站前记忆已经连接在一起。");
  add('#unlock-page [data-action="unlock-place-story"]', "查看地点故事 <span>→</span>", "html");
  add("#place-story-comic-page .ornament-label", "地点故事");
  add("#place-story-title", "木浦站的三个碎片<br>已经连接成一个故事", "html");
  add("#place-panel-1", "木浦的第一道门户");
  add("#place-panel-2", "通往旧城区的路");
  add("#place-panel-3", "人来人往的站前");
  add("#place-panel-4", "木浦站故事完成");
  add("#place-story-line", "三个碎片都集齐了。现在，木浦站应该不再只是一座普通车站，而是一段城市记忆。");
  add('#place-story-comic-page [data-next="quiz-page"]', "完成地点问答 <span>→</span>", "html");
  add("#quiz-page .ornament-label", "地点理解问答");
  add("#quiz-page .mini-title", "木浦站的三个碎片<br>展现了什么？", "html");
  add("#quiz-page .tag", "问题");
  add("#quiz-page .content-card .description", "三个碎片连接起来后，木浦站被解读为怎样的地点？");
  add("#quiz-result-page .ornament-label", "问答结果");
  add("#quiz-result-page .mini-title", "回答正确");
  add("#quiz-result-page .unlock-card h2", "已理解木浦站地点故事");
  add("#quiz-result-page .unlock-card p", "你已理解木浦站既是木浦的第一道门户，也是连接旧城区与生活记忆的地点。");
  add("#quiz-result-page .giroksae-note p", "现在，我把你留下的当前记录串联成一部旅程短片。");
  add('#quiz-result-page [data-next="journey-film-page"]', "查看旅程短片 <span>→</span>", "html");

  add("#journey-film-page .journey-progress p", "正在把三段记录合成为旅程短片。");
  add('#journey-film-page [data-action="synthesize-journey-film"]', "生成旅程短片文件");
  add('#journey-film-page [data-action="share-instagram"]', "下载后打开Instagram");
  add('#journey-film-page [data-next="next-place-page"]', "获取下一地点推荐 <span>→</span>", "html");

  add("#next-place-page .ornament-label", "推荐下一地点");
  add("#next-place-page .mini-title", "请选择木浦站故事之后<br>要继续探索的地点", "html");
  add("#next-place-page .recommendation-intro", "点击候选可查看推荐理由与简略地图。");
  const staticCandidates = [
    ["木浦近代历史馆1馆", "近代建筑 · 旧城区历史 · 步行移动", "可以把从木浦站开始的旅程延续到展现近代城市木浦历史的真实空间。"],
    ["1897开港文化街", "开港遗迹 · 街区探索 · 摄影记录", "从木浦站前往旧城区的途中，可以感受开港后逐渐形成的街区风貌。"],
    ["木浦镇历史公园", "港口防御 · 历史遗迹 · 后续故事", "可以继续探访木浦作为港口城市发展过程中更早期的历史痕迹。"]
  ];
  staticCandidates.forEach(([name, tags, reason], index) => {
    add(`#next-place-page .recommendation-option:nth-child(${index + 1}) strong`, name);
    add(`#next-place-page .recommendation-option:nth-child(${index + 1}) span`, tags);
    add(`#next-place-page .recommendation-option:nth-child(${index + 1}) small`, reason);
  });
  add("#next-place-list-status", "请从三处候选中选择一处查看详情。");
  add("#next-place-detail-page .ornament-label", "确认推荐地点");
  add("#next-place-name", "木浦近代历史馆1馆");
  add("#next-place-time", "步行12分钟");
  add("#next-place-tags span:nth-child(1)", "近代文化");
  add("#next-place-tags span:nth-child(2)", "旧城区");
  add("#next-place-tags span:nth-child(3)", "开港");
  add("#next-place-detail-page .map-node.start", "木浦站");
  add("#next-place-map-destination", "近代历史馆1馆");
  add("#next-place-reason", "从木浦站前往旧城区的途中，可以继续了解木浦近代城市发展的故事。");
  add("#next-place-map-btn", "地图路线");
  add("#next-place-detail-btn", "官方信息");
  add('#next-place-detail-page [data-action="reserve-next-place"]', "确定选择此地点 <span>→</span>", "html");
  add('#next-place-detail-page [data-next="next-place-page"]', "返回查看其他候选");
  add("#reservation-page .ornament-label", "预约下一条记录");
  add("#reservation-page .mini-title", "下一处地点<br>已预约", "html");
  add("#reserved-place-title", "木浦近代历史馆1馆记录预约");
  add("#reservation-page .unlock-card p", "到达预约地点后再次留下第一条记录，从木浦站开始的旅程就会延续到下一处地点的故事。");
  add("#reservation-page .giroksae-note p", "很好，下一条记录就在那儿继续吧。");
  add('#reservation-page [data-action="reset-demo"]', "返回开始页面");

  const messages = {
    ko: {
      screenMissing: "화면을 찾을 수 없습니다: {id}",
      unsupportedCulture: "{name} 모드는 현재 통합본에서 비활성화되어 있습니다.",
      imageOnly: "이미지 파일만 선택할 수 있습니다.",
      firstSampleLoaded: "샘플 첫 기록 사진을 불러왔습니다.",
      firstPhotoRequired: "첫 사진을 업로드하거나 샘플 사진을 선택해 주세요.",
      pieceSampleLoaded: "샘플 조각 {piece} 사진을 불러왔습니다.",
      photoRequired: "먼저 사진을 선택해 주세요.",
      aiAnalyzing: "AI가 장면 조각 {piece}을 분석하고 있습니다.",
      aiError: "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      aiFallbackNotice: "AI 분석 중 오류가 발생해 검증 샘플 결과로 대체합니다.",
      aiFallbackReason: "모델 오류로 발표용 검증 샘플 결과를 사용했습니다.",
      aiSampleReason: "발표용 검증 샘플에서 목표 단서를 확인했습니다.",
      aiSimulationPass: "1차 통합용 시뮬레이션에서 성공 기준을 충족했습니다.",
      aiSimulationFail: "1차 통합용 시뮬레이션에서 신뢰도 또는 클래스 기준을 충족하지 못했습니다.",
      aiPassReason: "촬영 대상과 신뢰도 기준을 충족했습니다.",
      aiSuccessTitle: "이야기 조각 {piece}이(가)<br>확인되었습니다",
      aiSuccessStatus: "이야기 조각 {piece} 획득 (기준 충족)",
      aiFailTitle: "단서를 명확히<br>인식하지 못했습니다",
      aiFailStatus: "미션 실패 (신뢰도 부족 또는 무관한 사진)",
      aiRetryHint: "단서가 더 잘 보이도록 다시 촬영해 보세요.",
      aiInvalidLabel: "조각 {piece} AI 결과의 label 형식이 올바르지 않습니다.",
      aiInvalidConfidence: "조각 {piece} AI 결과의 confidence 범위가 올바르지 않습니다.",
      aiInvalidSuccess: "조각 {piece} AI 결과의 success 형식이 올바르지 않습니다.",
      aiModuleMissing: "DohunAI 모듈을 불러오지 못했습니다.",
      aiSuccess: "장면 조각 {piece} 분석이 완료되었습니다.",
      aiFail: "대상을 찾지 못했습니다. 다시 촬영해 주세요.",
      overlayUnavailable: "촬영 화면을 열 수 없습니다.",
      overlayLocked: "AI 판별에 성공한 조각만 오버레이를 확인할 수 있습니다.",
      overlayTitle: "이야기 조각 {piece}의 시간을 겹쳐봅니다",
      overlaySubtitle: "이야기 조각 {piece}",
      overlayArchiveMissing: "연결된 옛 기록 이미지가 없습니다.",
      videoOnly: "비디오 파일만 선택할 수 있습니다.",
      videoTrimmed: "장면 조각 {piece} 영상은 최대 5초로 반영됩니다.",
      recordSampleLoaded: "샘플 기록 {piece}을 적용했습니다.",
      recordRequired: "먼저 5초 기록 영상을 선택해 주세요.",
      recordFallback: "촬영 기록이 없어 발표용 샘플 기록으로 계속합니다.",
      recommendationError: "추천 정보를 불러오지 못해 기본 후보를 표시했습니다.",
      recommendationReady: "장소 후보 3곳을 확인해 주세요.",
      candidateSelected: "{name} 후보를 선택했습니다.",
      candidateLoadError: "선택한 장소 정보를 불러올 수 없습니다.",
      journeyFallback: "영상 합성이 제한되어 3개 기록을 순차 재생합니다.",
      journeyFallbackSwitched: "순차 재생으로 전환했습니다.",
      journeyModuleMissing: "여정필름 합성 모듈을 불러오지 못해 순차 재생으로 전환했습니다.",
      journeySynthesisFailed: "영상 합성에 실패해 세 기록을 순서대로 보여드립니다.",
      journeyDownloadModuleMissing: "여정필름 다운로드 모듈을 불러오지 못했습니다.",
      journeyDownloadRequired: "먼저 여정필름 파일을 만들어 주세요.",
      journeyShareModuleMissing: "인스타그램 연결 모듈을 불러오지 못했습니다.",
      journeyShareRequired: "여정필름을 먼저 만들고 다운로드해 주세요.",
      journeyShareGuide: "저장한 여정필름을 인스타그램에서 선택해 공유해 주세요.",
      journeyReady: "여정필름이 완성되었습니다.",
      journeyError: "여정필름을 준비하지 못했습니다. 순차 재생으로 전환합니다.",
      downloadPreparing: "여정필름을 준비 중입니다.",
      sharePreparing: "공유할 여정필름을 준비 중입니다.",
      sourceUnavailable: "검증 자료 주소가 없습니다.",
      resetComplete: "처음 화면으로 돌아왔습니다.",
      forceSampleReason: "재촬영 횟수 제한에 따라 발표용 검증 샘플 결과로 계속합니다.",
      forceSampleApplied: "샘플 성공 결과가 적용되었습니다.",
      generationFact: "검증된 장소 사실을 확인하고 있습니다.",
      generationCulture: "선택한 문화권의 해설 관점을 적용하고 있습니다.",
      generationPanels: "네 개의 웹툰 패널을 구성하고 있습니다.",
      reservationTitle: "{name} 기록 예약",
      recommendationLoading: "장소 후보를 불러오는 중입니다.",
      recommendationEmpty: "추천 후보를 찾지 못했습니다.",
      recommendationSelect: "다음 기록 장소를 선택해 주세요.",
      recommendationFailed: "장소 추천을 불러오지 못했습니다.",
      storyLoading: "이야기를 불러오는 중입니다.",
      storyFailed: "이야기를 불러오지 못했습니다.",
      invalidPiece: "유효하지 않은 조각 번호입니다.",
      journeyVideoLabel: "여정 기록 영상 {index}",
      journeySequentialLabel: "세 개의 5초 기록 순차 재생",
      journeyResultLabel: "합성된 여정필름",
      journeyUnavailable: "재생 가능한 여정 영상이 없습니다.",
      journeyContainerMissing: "영상을 표시할 영역을 찾을 수 없습니다.",
      journeySynthesisUnavailable: "이 브라우저에서는 영상 합성을 지원하지 않습니다.",
      journeySourceMissing: "장면 영상 {index}이 누락되었습니다.",
      journeyPlaybackFailed: "장면 영상 {index}을 재생하지 못했습니다.",
      journeyEncodingFailed: "여정필름 인코딩에 실패했습니다.",
      journeySourceEmpty: "영상 소스가 비어 있습니다.",
      journeyLoadTimeout: "영상 로딩 제한시간을 초과했습니다.",
      journeyFileLoadFailed: "영상 파일을 불러오지 못했습니다.",
      journeyPlaybackStartFailed: "영상 재생을 시작하지 못했습니다.",
      journeyBusy: "이미 여정필름을 합성하고 있습니다.",
      journeyCanvasContextFailed: "Canvas 2D 컨텍스트를 만들 수 없습니다.",
      journeyVideoTrackFailed: "Canvas 비디오 트랙을 만들 수 없습니다.",
      journeyVideoOnly: "여정필름에는 비디오 파일만 사용할 수 있습니다.",
      journeyEmptyData: "합성된 영상 데이터가 비어 있습니다.",
      classStationSign: "역명 표지판",
      classStationPath: "역전 광장과 길",
      classStationLife: "역전 생활 풍경",
      classUnrelated: "관련 없는 장면",
      classClockTower: "시계탑",
      classBrickBuilding: "벽돌 건축물"
    },
    [ZH]: {
      screenMissing: "找不到页面：{id}",
      unsupportedCulture: "当前整合版本尚未启用{name}模式。",
      imageOnly: "只能选择图片文件。",
      firstSampleLoaded: "已载入第一条记录的示例照片。",
      firstPhotoRequired: "请上传第一张照片或选择示例照片。",
      pieceSampleLoaded: "已载入场景碎片{piece}的示例照片。",
      photoRequired: "请先选择照片。",
      aiAnalyzing: "AI正在分析场景碎片{piece}。",
      aiError: "AI分析时发生错误，请稍后重试。",
      aiFallbackNotice: "AI分析时发生错误，已改用验证示例结果。",
      aiFallbackReason: "模型发生错误，已使用演示用验证示例结果。",
      aiSampleReason: "在演示用验证示例中确认了目标线索。",
      aiSimulationPass: "第一阶段整合模拟已达到成功标准。",
      aiSimulationFail: "第一阶段整合模拟未达到置信度或类别标准。",
      aiPassReason: "拍摄对象与置信度均达到标准。",
      aiSuccessTitle: "已确认<br>场景碎片{piece}",
      aiSuccessStatus: "已获得场景碎片{piece}（达到标准）",
      aiFailTitle: "未能清楚<br>识别线索",
      aiFailStatus: "任务失败（置信度不足或照片无关）",
      aiRetryHint: "请让线索更清晰后重新拍摄。",
      aiInvalidLabel: "场景碎片{piece}的AI结果label格式无效。",
      aiInvalidConfidence: "场景碎片{piece}的AI结果confidence超出有效范围。",
      aiInvalidSuccess: "场景碎片{piece}的AI结果success格式无效。",
      aiModuleMissing: "无法载入DohunAI模块。",
      aiSuccess: "场景碎片{piece}分析完成。",
      aiFail: "未找到目标，请重新拍摄。",
      overlayUnavailable: "无法打开拍摄页面。",
      overlayLocked: "只有AI识别成功的场景碎片才能查看叠加画面。",
      overlayTitle: "叠加查看场景碎片{piece}的时间",
      overlaySubtitle: "场景碎片{piece}",
      overlayArchiveMissing: "尚未连接对应的旧记录图片。",
      videoOnly: "只能选择视频文件。",
      videoTrimmed: "场景碎片{piece}的视频最多采用5秒。",
      recordSampleLoaded: "已应用示例记录{piece}。",
      recordRequired: "请先选择5秒记录视频。",
      recordFallback: "没有拍摄记录，将使用演示用示例记录继续。",
      recommendationError: "无法载入推荐信息，已显示基本候选。",
      recommendationReady: "请查看三处地点候选。",
      candidateSelected: "已选择{name}。",
      candidateLoadError: "无法载入所选地点的信息。",
      journeyFallback: "当前环境限制视频合成，将依次播放三段记录。",
      journeyFallbackSwitched: "已切换为依次播放。",
      journeyModuleMissing: "无法载入旅程短片合成模块，已切换为依次播放。",
      journeySynthesisFailed: "视频合成失败，将依次播放三段记录。",
      journeyDownloadModuleMissing: "无法载入旅程短片下载模块。",
      journeyDownloadRequired: "请先生成旅程短片文件。",
      journeyShareModuleMissing: "无法载入Instagram连接模块。",
      journeyShareRequired: "请先生成并下载旅程短片。",
      journeyShareGuide: "请在Instagram中选择已保存的旅程短片进行分享。",
      journeyReady: "旅程短片已完成。",
      journeyError: "无法准备旅程短片，将切换为依次播放。",
      downloadPreparing: "正在准备旅程短片。",
      sharePreparing: "正在准备要分享的旅程短片。",
      sourceUnavailable: "没有可用的验证资料链接。",
      resetComplete: "已返回开始页面。",
      forceSampleReason: "已达到重新拍摄次数上限，将使用演示用验证示例结果继续。",
      forceSampleApplied: "已应用示例成功结果。",
      generationFact: "正在确认经过验证的地点资料。",
      generationCulture: "正在应用所选文化圈的讲解视角。",
      generationPanels: "正在生成四格故事画面。",
      reservationTitle: "{name}记录预约",
      recommendationLoading: "正在载入地点候选。",
      recommendationEmpty: "未找到推荐候选。",
      recommendationSelect: "请选择下一处记录地点。",
      recommendationFailed: "无法载入地点推荐。",
      storyLoading: "正在载入故事。",
      storyFailed: "无法载入故事。",
      invalidPiece: "场景碎片编号无效。",
      journeyVideoLabel: "旅程记录视频{index}",
      journeySequentialLabel: "依次播放三段5秒记录",
      journeyResultLabel: "合成的旅程短片",
      journeyUnavailable: "没有可播放的旅程视频。",
      journeyContainerMissing: "找不到视频显示区域。",
      journeySynthesisUnavailable: "当前浏览器不支持视频合成。",
      journeySourceMissing: "缺少场景视频{index}。",
      journeyPlaybackFailed: "无法播放场景视频{index}。",
      journeyEncodingFailed: "旅程短片编码失败。",
      journeySourceEmpty: "视频来源为空。",
      journeyLoadTimeout: "视频载入超时。",
      journeyFileLoadFailed: "无法载入视频文件。",
      journeyPlaybackStartFailed: "无法开始播放视频。",
      journeyBusy: "旅程短片正在合成中。",
      journeyCanvasContextFailed: "无法创建Canvas 2D上下文。",
      journeyVideoTrackFailed: "无法创建Canvas视频轨道。",
      journeyVideoOnly: "旅程短片只能使用视频文件。",
      journeyEmptyData: "合成后的视频数据为空。",
      classStationSign: "车站名标识",
      classStationPath: "站前广场与道路",
      classStationLife: "站前生活景象",
      classUnrelated: "无关场景",
      classClockTower: "时钟塔",
      classBrickBuilding: "砖砌建筑"
    }
  };

  const interpolate = (template, params = {}) => String(template).replace(/\{(\w+)\}/g, (_, key) => (
    Object.prototype.hasOwnProperty.call(params, key) ? params[key] : `{${key}}`
  ));

  function getLanguage() {
    return global.appState?.language || document.documentElement.lang || "ko";
  }

  function t(key, language = getLanguage(), params = {}) {
    const locale = language === ZH ? ZH : "ko";
    const template = messages[locale][key] ?? messages.ko[key] ?? key;
    return interpolate(template, params);
  }

  function readValue(node, mode) {
    if (mode === "html") return node.innerHTML;
    if (mode === "placeholder") return node.getAttribute("placeholder") || "";
    if (mode === "aria-label") return node.getAttribute("aria-label") || "";
    if (mode === "alt") return node.getAttribute("alt") || "";
    return node.textContent;
  }

  function writeValue(node, mode, value) {
    if (mode === "html") node.innerHTML = value;
    else if (mode === "placeholder") node.setAttribute("placeholder", value);
    else if (mode === "aria-label") node.setAttribute("aria-label", value);
    else if (mode === "alt") node.setAttribute("alt", value);
    else node.textContent = value;
  }

  function apply(language = getLanguage()) {
    const useChinese = language === ZH;

    staticCopy.forEach((entry, entryIndex) => {
      document.querySelectorAll(entry.selector).forEach((node, nodeIndex) => {
        const key = `${entryIndex}:${nodeIndex}`;
        if (!originals.has(key)) originals.set(key, readValue(node, entry.mode));
        writeValue(node, entry.mode, useChinese ? entry.value : originals.get(key));
      });
    });

    if (!originals.has("document-title")) originals.set("document-title", document.title);
    document.title = useChinese ? "History Pieces | 决赛整合版" : originals.get("document-title");
  }

  global.HistoryPiecesI18n = Object.freeze({
    ZH,
    apply,
    getLanguage,
    isChinese: (language = getLanguage()) => language === ZH,
    t,
    tCurrent: (key, params) => t(key, getLanguage(), params)
  });
})(window);
