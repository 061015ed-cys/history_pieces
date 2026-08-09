(function historyPiecesWireframeFlow(global) {
  "use strict";

  const PIECES = Object.freeze({
    1: {
      label: "첫 번째 조각",
      publicPlace: "목포역",
      verifiedPlace: "목포역",
      missionTitle: "목포의 첫인상을\n기록해주세요",
      missionDescription: "목포역에 도착한 후 무엇이 눈에 먼저 보였나요? 그 장면을 사진으로 기록해주세요.",
      missionLine: "사진을 찍어서 목포에서의 첫 기록을 남겨볼까?",
      captureTitle: "목포의 첫인상을\n기록해주세요",
      acquiredLine: "드디어 첫 번째 조각을 획득했군. 이제 나의 기록을 보여주지.",
      recordLine: "이제 네가 기록할 차례야. {nickname}, 5초 동안 영상을 찍어.",
      reflectionTitle: "목포역\n어떠셨나요?",
      reflectionQuestion: "옛 목포역에는 승객과 상인, 짐을 나르는 사람들이 끊임없이 오갔지. 방금 네가 남긴 목포역은 어떤 느낌이었어?",
      reflectionOptions: [
        "여행이 시작되는 장소처럼 느껴졌어.",
        "과거와 지금의 시간이 겹쳐 보였어.",
        "사람들이 오가는 모습이 가장 기억에 남아."
      ],
      reflectionReply: "같은 장소라도 누구는 건물을 보고, 누구는 그곳을 오간 사람을 기억하네. 네가 본 목포역도 잘 기록해두지.",
      nextPublicPlace: "목포 대중음악의 전당",
      nextPieceLabel: "두 번째 조각",
      sampleMarker: "sample-photo://piece-1"
    },
    2: {
      label: "두 번째 조각",
      publicPlace: "목포 대중음악의 전당",
      verifiedPlace: "호남은행 목포지점",
      missionTitle: "목포 대중음악의 전당\n촬영해주세요",
      missionDescription: "목포 대중음악의 전당 건물이 보이도록 촬영해주세요.",
      missionLine: "목포 대중음악의 전당에 제대로 도착했는지 확인해볼까?",
      captureTitle: "목포 대중음악의 전당\n촬영해주세요",
      acquiredLine: "두 번째 조각을 획득했군. 이제 나의 기록을 보여주지.",
      recordLine: "이제 네가 기록할 차례야. {nickname}, 5초 동안 영상을 찍어.",
      reflectionTitle: "목포 대중음악의 전당\n어떠셨나요?",
      reflectionQuestion: "한때 돈과 장부가 오가던 건물이 지금은 음악을 담는 공간이 되었어. 이 변화를 알고 다시 보니 어떤 느낌이 들지?",
      reflectionOptions: [
        "오래된 건물이 새 쓰임을 얻은 것이 좋았어.",
        "같은 공간의 역할이 달라진 점이 신기했어.",
        "과거의 흔적이 아직 남아 있는 것 같았어."
      ],
      reflectionReply: "공간의 쓰임은 바뀌어도, 그 안에 쌓인 시간까지 사라지는 건 아니니까. 네가 느낀 변화도 이번 기록에 남겨두지.",
      nextPublicPlace: "목포근대역사관 2관",
      nextPieceLabel: "세 번째 조각",
      sampleMarker: "sample-photo://piece-2"
    },
    3: {
      label: "세 번째 조각",
      publicPlace: "목포근대역사관 2관",
      verifiedPlace: "동양척식주식회사 목포지점",
      missionTitle: "목포근대역사관 2관\n촬영해주세요",
      missionDescription: "목포근대역사관 2관 건물이 보이도록 촬영해주세요.",
      missionLine: "목포근대역사관 2관에 잘 찾아왔겠지? 한 번 확인해봐야겠어.",
      captureTitle: "목포근대역사관 2관\n촬영해주세요",
      acquiredLine: "세 번째 조각을 획득했군. 이제 나의 기록을 보여주지.",
      recordLine: "이제 네가 기록할 차례야. {nickname}, 5초 동안 영상을 찍어.",
      reflectionTitle: "목포근대역사관 2관\n어떠셨나요?",
      reflectionQuestion: "건물만 볼 때와 그 앞에 있었던 사람들의 이야기를 알고 난 뒤에는 이 장소가 조금 다르게 보이지 않아?",
      reflectionOptions: [
        "꼭 기억해야 할 역사로 보였어.",
        "사람들의 삶이 남은 장소처럼 느껴졌어.",
        "아직도 여러 질문을 던지는 공간 같았어."
      ],
      reflectionReply: "건물은 말이 없지만, 그곳을 지나간 사람들의 이야기는 기록 속에 남아 있어. 네가 발견한 시선도 함께 기억해 둘게.",
      sampleMarker: "sample-photo://piece-3"
    }
  });

  const PIECES_ZH = Object.freeze({
    1: Object.freeze({
      ...PIECES[1],
      label: "第一个故事碎片",
      publicPlace: "木浦站",
      verifiedPlace: "木浦站",
      missionTitle: "请记录\n木浦的第一印象",
      missionDescription: "抵达木浦站后，最先映入眼帘的是什么？请拍下那个画面。",
      missionLine: "拍张照片，留下我们在木浦的第一份记录吧？",
      captureTitle: "请记录\n木浦的第一印象",
      acquiredLine: "终于获得第一个故事碎片了。现在让你看看我的记录。",
      recordLine: "现在轮到你记录了。{nickname}，请拍摄5秒视频。",
      reflectionTitle: "木浦站\n给您留下了怎样的印象？",
      reflectionQuestion: "过去的木浦站里，乘客、商人和搬运行李的人川流不息。你刚刚记录的木浦站给你什么感觉？",
      reflectionOptions: [
        "感觉像旅程开始的地方。",
        "仿佛过去与现在的时间重叠在一起。",
        "人们来来往往的样子最让我难忘。"
      ],
      reflectionReply: "同一个地方，有人记住建筑，也有人记住从这里走过的人。我会把你眼中的木浦站好好记录下来。",
      nextPublicPlace: "木浦大众音乐殿堂",
      nextPieceLabel: "第二个故事碎片"
    }),
    2: Object.freeze({
      ...PIECES[2],
      label: "第二个故事碎片",
      publicPlace: "木浦大众音乐殿堂",
      verifiedPlace: "湖南银行木浦支店",
      missionTitle: "请拍摄\n木浦大众音乐殿堂",
      missionDescription: "请将木浦大众音乐殿堂建筑完整拍入画面。",
      missionLine: "确认一下我们是否顺利到达木浦大众音乐殿堂吧？",
      captureTitle: "请拍摄\n木浦大众音乐殿堂",
      acquiredLine: "获得第二个故事碎片了。现在让你看看我的记录。",
      recordLine: "现在轮到你记录了。{nickname}，请拍摄5秒视频。",
      reflectionTitle: "木浦大众音乐殿堂\n给您留下了怎样的印象？",
      reflectionQuestion: "这座曾经流动着金钱与账簿的建筑，如今成了盛放音乐的空间。知道这种变化后再看它，你有什么感受？",
      reflectionOptions: [
        "老建筑获得新的用途，这一点很好。",
        "同一空间承担了不同角色，让我觉得很神奇。",
        "仿佛还能看到过去留下的痕迹。"
      ],
      reflectionReply: "空间的用途会改变，但积累在其中的时间不会消失。我也会把你感受到的变化留在这次记录里。",
      nextPublicPlace: "木浦近代历史馆2馆",
      nextPieceLabel: "第三个故事碎片"
    }),
    3: Object.freeze({
      ...PIECES[3],
      label: "第三个故事碎片",
      publicPlace: "木浦近代历史馆2馆",
      verifiedPlace: "东方拓殖株式会社木浦支店",
      missionTitle: "请拍摄\n木浦近代历史馆2馆",
      missionDescription: "请将木浦近代历史馆2馆建筑完整拍入画面。",
      missionLine: "你应该顺利找到木浦近代历史馆2馆了吧？让我确认一下。",
      captureTitle: "请拍摄\n木浦近代历史馆2馆",
      acquiredLine: "获得第三个故事碎片了。现在让你看看我的记录。",
      recordLine: "现在轮到你记录了。{nickname}，请拍摄5秒视频。",
      reflectionTitle: "木浦近代历史馆2馆\n给您留下了怎样的印象？",
      reflectionQuestion: "了解曾经站在这座建筑前的人们之后，这里是否与只看建筑时有些不同？",
      reflectionOptions: [
        "这是一段必须被记住的历史。",
        "这里像是还留着人们生活的痕迹。",
        "这个空间至今仍在提出许多问题。"
      ],
      reflectionReply: "建筑不会说话，但从这里走过的人们仍留在记录之中。我也会记住你发现的视角。"
    })
  });

  const CHINA_COMMENTARY_KO = Object.freeze({
    2: Object.freeze({
      missionLine: "중국의 근대 은행 건축과도 비교해보며, 이곳이 옛 호남은행이었는지 확인해볼까?",
      reflectionQuestion: "중국의 개항도시에서도 오래된 금융 건물이 새로운 문화공간으로 바뀐 사례를 볼 수 있어. 한때 돈과 장부가 오가던 이곳이 음악 공간이 된 변화를 어떻게 느꼈어?",
      reflectionReply: "서로 다른 도시도 오래된 건물을 오늘의 문화와 연결하며 기억을 이어가네. 네가 발견한 공통점도 기록해둘게."
    }),
    3: Object.freeze({
      missionLine: "동아시아 근대사의 연결 속에서 이 건물의 흔적을 함께 확인해보자.",
      reflectionQuestion: "이 건물은 한 도시의 건축물이면서 동아시아 근대사와도 연결돼 있어. 그 안에 있었던 사람들의 이야기를 알고 나니 어떻게 보였어?",
      reflectionReply: "국경은 달라도 근대사의 변화는 여러 도시와 사람을 이어 놓았어. 네가 발견한 연결도 함께 기억해둘게."
    })
  });

  const UI = Object.freeze({
    ko: Object.freeze({
      photoCapture: "사진 촬영", photoConfirm: "현재 사진으로\n확정하시겠습니까?", no: "아니오", yes: "예",
      placeCheck: "장소 확인", checking: "장소를\n확인중입니다", checkingDesc: "사진 속 건물과 장소의 흔적을 확인하고 있습니다.",
      congrats: "축하합니다", acquiredDesc: "여정의 {piece}을 획득하였습니다.", openRecord: "기록 보러 가기",
      recordVideo: "5초 영상을\n기록해주세요", fiveSecondRecord: "5초 영상 기록", startRecord: "5초 영상 기록",
      videoCapture: "5초 기록 촬영", videoConfirm: "현재 영상으로\n확정하시겠습니까?", next: "다음",
      nextPlaceMove: "다음 장소로\n이동해주세요", nextPlaceDesc: "다음 장소로 이동한 뒤, 새로운 이야기 조각을 찾아보세요.", depart: "다음 장소로 출발하기",
      placeMission: "장소 미션", firstImpression: "첫인상 남기기", checkPlace: "장소 확인하기", choosePhoto: "화면을 눌러 사진 선택 또는 촬영",
      photoGuide: "{place} 건물이 잘 보이도록 촬영해주세요.", checkPhoto: "사진 확인", samplePhoto: "샘플 사진으로 진행하기",
      placeConfirmed: "장소를\n확인하였습니다", traceFound: "장소의 흔적을 찾았어요", alignmentDesc: "과거 기록과 더 정확히 겹치도록 구도를 한 번 보정할 수 있습니다.",
      alignTime: "시간 맞추기", wrongPlace: "이 장소가 아닙니다", chooseVideo: "화면을 눌러 5초 동안 영상 촬영", videoGuide: "{place}의 현재 장면을 5초로 기록합니다.",
      checkVideo: "영상 확인", sampleVideo: "샘플 영상으로 진행하기", overlay: "과거와 현재를\n겹치고 있습니다", suddenMission: "돌발 미션", question: "문제",
      checkAnswer: "정답 확인", wrongAnswer: "선택한 기록을 다시 확인해주세요.", correct: "정답입니다", record: "기록",
      photoRequired: "사진을 먼저 선택하거나 샘플 사진으로 진행해주세요.", detectDesc: "{place}의 건물 윤곽과 장소 단서를 확인하고 있습니다.",
      chatbot: "챗봇", chatbotTitle: "기록새 챗봇", chatbotGreeting: "궁금한 내용을 물어보세요. 현재 화면에 맞춰 안내해드릴게요.",
      chatbotPlaceholder: "질문을 입력하세요", send: "전송", close: "닫기", helpMission: "현재 미션 도움", helpPlace: "장소 설명", helpRecord: "기록 방법",
      botMission: "현재 화면의 안내 문구에 맞춰 건물이나 거리의 특징이 잘 보이게 촬영해주세요. 샘플 진행 버튼으로 시연할 수도 있어요.",
      botPlace: "목포역에서 시작해 호남은행 목포지점과 동양척식주식회사 목포지점의 흔적을 따라가는 여정입니다.",
      botRecord: "사진은 장소 확인에 사용되고, 5초 영상은 마지막 여정필름에 이어집니다.", botFallback: "현재 여정과 관련된 장소, 미션, 기록 방법을 질문해주세요."
    }),
    zh: Object.freeze({
      photoCapture: "拍摄照片", photoConfirm: "确定使用\n这张照片吗？", no: "否", yes: "是",
      placeCheck: "确认地点", checking: "正在\n确认地点", checkingDesc: "正在识别照片中的建筑轮廓与地点线索。",
      congrats: "恭喜", acquiredDesc: "已获得旅程中的{piece}。", openRecord: "查看记录",
      recordVideo: "请拍摄\n5秒视频", fiveSecondRecord: "5秒视频记录", startRecord: "开始5秒记录",
      videoCapture: "拍摄5秒记录", videoConfirm: "确定使用\n这段视频吗？", next: "下一步",
      nextPlaceMove: "请前往\n下一个地点", nextPlaceDesc: "到达下一个地点后，寻找新的故事碎片。", depart: "出发前往下一个地点",
      placeMission: "地点任务", firstImpression: "留下第一印象", checkPlace: "确认地点", choosePhoto: "点击画面选择照片或拍摄",
      photoGuide: "请将{place}建筑清晰拍入画面。", checkPhoto: "确认照片", samplePhoto: "使用示例照片继续",
      placeConfirmed: "地点\n确认完成", traceFound: "找到了地点线索", alignmentDesc: "可再调整一次构图，让现在的画面与过去记录更准确地重合。",
      alignTime: "对准时间", wrongPlace: "这不是该地点", chooseVideo: "点击画面拍摄5秒视频", videoGuide: "用5秒记录{place}现在的样子。",
      checkVideo: "确认视频", sampleVideo: "使用示例视频继续", overlay: "正在重叠\n过去与现在", suddenMission: "突发任务", question: "问题",
      checkAnswer: "确认答案", wrongAnswer: "请重新检查所选记录。", correct: "回答正确", record: "记录",
      photoRequired: "请先选择照片，或使用示例照片继续。", detectDesc: "正在确认{place}的建筑轮廓与地点线索。",
      chatbot: "聊天", chatbotTitle: "记录鸟聊天助手", chatbotGreeting: "请输入您想了解的内容。我会根据当前画面为您说明。",
      chatbotPlaceholder: "请输入问题", send: "发送", close: "关闭", helpMission: "当前任务帮助", helpPlace: "地点说明", helpRecord: "记录方法",
      botMission: "请按照当前画面的提示，让建筑或街道特征清晰出现在照片中。演示时也可以使用示例按钮继续。",
      botPlace: "旅程从木浦站开始，沿着湖南银行木浦支店和东方拓殖株式会社木浦支店的历史痕迹展开。",
      botRecord: "照片用于确认地点，5秒视频会连接到最后的专属旅程影片。", botFallback: "您可以询问当前旅程中的地点、任务或记录方法。"
    })
  });

  function isChineseLanguage() {
    return appState().language === "zh-CN";
  }

  function ui() {
    return isChineseLanguage() ? UI.zh : UI.ko;
  }

  function format(value, params = {}) {
    return Object.entries(params).reduce((result, [key, replacement]) => result.replaceAll(`{${key}}`, replacement), String(value || ""));
  }

  function pieceConfig(pieceNumber) {
    if (isChineseLanguage()) return PIECES_ZH[pieceNumber];
    const base = PIECES[pieceNumber];
    if (appState().culture === "china" && CHINA_COMMENTARY_KO[pieceNumber]) {
      return Object.freeze({ ...base, ...CHINA_COMMENTARY_KO[pieceNumber] });
    }
    return base;
  }

  let introStep = 0;
  let pendingPiece = 1;
  let transitionPhase = 0;
  let reflectionPiece = 1;
  let finalOrder = [];
  const previewUrls = new Map();

  function appState() {
    return global.appState || {};
  }

  function stopEvent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function page(id) {
    return document.getElementById(id);
  }

  function text(selector, value, root = document) {
    const element = root.querySelector(selector);
    if (element) element.textContent = value;
    return element;
  }

  function html(selector, value, root = document) {
    const element = root.querySelector(selector);
    if (element) element.innerHTML = value;
    return element;
  }

  function show(id) {
    if (typeof global.showPage === "function") global.showPage(id);
  }

  function sourceUrl(source, key) {
    if (!source) return "";
    if (typeof source === "string") {
      if (source.startsWith("sample-photo://")) return "";
      const isPhotoPreview = String(key || "").startsWith("photo-");
      const isWebtoonAsset = source.includes(["addons", "webtoon-reference"].join("/") + "/");
      if (isPhotoPreview && isWebtoonAsset) {
        console.error("[History Pieces] 웹툰 이미지는 사진 미리보기에 사용할 수 없습니다.");
        return "";
      }
      return source;
    }
    if (!(source instanceof Blob)) return "";
    if (previewUrls.has(key)) URL.revokeObjectURL(previewUrls.get(key));
    const url = URL.createObjectURL(source);
    previewUrls.set(key, url);
    return url;
  }

  function nicknameLine(value) {
    const nickname = String(appState().nickname || "여행자");
    return String(value || "").replaceAll("{nickname}", nickname);
  }

  function appendWireframePages() {
    const shell = document.querySelector(".app-shell");
    if (!shell || page("wire-photo-confirm-page")) return;

    shell.insertAdjacentHTML("beforeend", `
      <section id="wire-photo-confirm-page" class="page capture-page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout record-layout">
          <p id="wire-photo-confirm-label" class="ornament-label">사진 촬영</p>
          <h1 id="wire-photo-confirm-title" class="setup-title">현재 사진으로<br>확정하시겠습니까?</h1>
          <div class="camera-frame wire-confirm-frame">
            <img id="wire-photo-confirm-preview" class="camera-preview hidden" alt="선택한 장소 사진">
            <div id="wire-photo-confirm-sample" class="sample-photo-placeholder hidden" role="img" aria-label="샘플 사진">
              <span aria-hidden="true">🖼️</span>
              <strong>샘플 사진</strong>
            </div>
          </div>
          <div class="wire-confirm-actions">
            <button type="button" class="sub-button" data-wire-action="photo-retry">아니오</button>
            <button type="button" class="big-button" data-wire-action="photo-confirm">예 <span>→</span></button>
          </div>
        </div>
      </section>

      <section id="wire-place-loading-page" class="page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout center-layout" role="status" aria-live="polite" aria-busy="true">
          <p class="ornament-label">장소 확인</p>
          <div class="loader-lens">⌕</div>
          <h1 class="mini-title">장소를<br>확인중입니다</h1>
          <p id="wire-place-loading-text" class="setup-desc">사진 속 건물과 장소의 흔적을 확인하고 있습니다.</p>
        </div>
      </section>

      <section id="wire-piece-acquired-page" class="page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-unlock"></div>
        <div class="screen-layout standard-layout">
          <p id="wire-acquired-label" class="ornament-label">첫 번째 조각 · 목포역</p>
          <h1 id="wire-acquired-title" class="mini-title">첫 번째 조각을<br>획득하였습니다</h1>
          <div class="unlock-card">
            <span>✨</span>
            <h2>축하합니다</h2>
            <p id="wire-acquired-description">여정의 이야기 조각을 획득하였습니다.</p>
          </div>
          <div class="giroksae-note wire-feather-note"><img src="assets/images/giroksae-reward.png" alt="조각 획득을 축하하는 기록새"><p id="wire-acquired-line"></p></div>
          <button type="button" class="big-button" data-wire-action="open-fixed-webtoon">기록 보러 가기 <span>→</span></button>
        </div>
      </section>

      <section id="wire-record-intro-page" class="page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p id="wire-record-intro-label" class="ornament-label">첫 번째 조각 · 목포역</p>
          <h1 class="mini-title">5초 영상을<br>기록해주세요</h1>
          <div class="content-card wire-record-card">
            <p class="tag">5초 영상 기록</p>
            <div class="wire-record-icon">▶</div>
          </div>
          <div class="giroksae-note wire-feather-note"><img src="assets/images/giroksae-record.png" alt="5초 기록을 안내하는 기록새"><p id="wire-record-intro-line"></p></div>
          <button type="button" class="big-button" data-wire-action="start-recording">5초 영상 기록 <span>→</span></button>
        </div>
      </section>

      <section id="wire-video-confirm-page" class="page capture-page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout record-layout">
          <p id="wire-video-confirm-label" class="ornament-label">5초 기록 촬영</p>
          <h1 class="setup-title">현재 영상으로<br>확정하시겠습니까?</h1>
          <div class="camera-frame video-frame wire-confirm-frame">
            <video id="wire-video-confirm-preview" class="camera-preview" muted loop playsinline controls></video>
          </div>
          <div class="wire-confirm-actions">
            <button type="button" class="sub-button" data-wire-action="video-retry">아니오</button>
            <button type="button" class="big-button" data-wire-action="video-confirm">예 <span>→</span></button>
          </div>
        </div>
      </section>

      <section id="wire-reflection-page" class="page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p id="wire-reflection-label" class="ornament-label"></p>
          <h1 id="wire-reflection-title" class="mini-title"></h1>
          <div class="giroksae-note wire-feather-note"><img src="assets/images/giroksae-record.png" alt="기록을 살펴보는 기록새"><p id="wire-reflection-question"></p></div>
          <div id="wire-reflection-options" class="quiz-list wire-choice-list"></div>
          <div class="wire-reflection-input-row">
            <input id="wire-reflection-input" type="text" maxlength="20" placeholder="짧은 감정 입력 (20자 이내)">
            <button type="button" class="sub-button" data-wire-action="reflection-text">입력</button>
          </div>
          <button type="button" class="text-button" data-wire-action="reflection-skip">건너뛰기</button>
        </div>
      </section>

      <section id="wire-reflection-result-page" class="page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p id="wire-reflection-result-label" class="ornament-label"></p>
          <h1 id="wire-reflection-result-title" class="mini-title"></h1>
          <div class="giroksae-note wire-feather-note"><img src="assets/images/giroksae-reward.png" alt="감상에 반응하는 기록새"><p id="wire-reflection-reply"></p></div>
          <button type="button" class="big-button" data-wire-action="reflection-next">다음 <span>→</span></button>
        </div>
      </section>

      <section id="wire-transition-page" class="page wireframe-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p id="wire-transition-label" class="ornament-label"></p>
          <h1 id="wire-transition-title" class="mini-title"></h1>
          <div class="content-card wire-location-card">
            <div class="wire-location-symbol">⌖</div>
            <h2 id="wire-transition-place"></h2>
            <p id="wire-transition-description" class="description"></p>
          </div>
          <div class="giroksae-note wire-feather-note"><img src="assets/images/giroksae-mission.png" alt="다음 장소를 가리키는 기록새"><p id="wire-transition-line"></p></div>
          <button type="button" id="wire-transition-button" class="big-button" data-wire-action="transition-next">다음 장소로 출발하기 <span>→</span></button>
        </div>
      </section>

      <section id="wire-surprise-quiz-page" class="page wireframe-page wire-quiz-page" data-owner="와이어프레임 통합">
        <div class="page-bg bg-record"></div>
        <div class="screen-layout standard-layout">
          <p id="wire-surprise-label" class="ornament-label">돌발 미션</p>
          <h1 class="mini-title">돌발 미션</h1>
          <div class="content-card">
            <p class="tag">문제</p>
            <h2 id="wire-surprise-title"></h2>
            <p id="wire-surprise-question" class="description"></p>
            <div id="wire-surprise-options" class="quiz-list wire-choice-list"></div>
            <p id="wire-surprise-feedback" class="quiz-feedback hidden" aria-live="polite"></p>
          </div>
          <div id="wire-surprise-note" class="giroksae-note wire-feather-note"><img src="assets/images/giroksae-mission.png" alt="돌발 미션을 안내하는 기록새"><p></p></div>
          <button type="button" id="wire-surprise-submit" class="big-button" data-wire-action="surprise-submit">정답 확인 <span>→</span></button>
        </div>
      </section>

      <div id="wire-chatbot-modal" class="wire-chatbot-modal hidden" role="dialog" aria-modal="true" aria-labelledby="wire-chatbot-title">
        <div class="wire-chatbot-panel">
          <div class="wire-chatbot-header">
            <h2 id="wire-chatbot-title">기록새 챗봇</h2>
            <button type="button" class="wire-chatbot-close" data-wire-action="chatbot-close" aria-label="챗봇 닫기">×</button>
          </div>
          <div id="wire-chatbot-messages" class="wire-chatbot-messages" aria-live="polite"></div>
          <div id="wire-chatbot-quick" class="wire-chatbot-quick"></div>
          <form id="wire-chatbot-form" class="wire-chatbot-form">
            <input id="wire-chatbot-input" type="text" maxlength="160" autocomplete="off" placeholder="질문을 입력하세요">
            <button type="submit" id="wire-chatbot-send">전송</button>
          </form>
        </div>
      </div>
    `);
  }

  function configureIntroAndGuide() {
    const chinese = isChineseLanguage();
    const intro = page("giroksae-intro-page");
    if (intro) {
      text(".character-label", chinese ? "记录鸟回应了您的旅程。" : "기록새가 당신의 여정에 반응하였습니다.", intro);
      text("#giroksae-intro-text", chinese ? "我是收集记录的记录鸟。你要从木浦站开始旅程吗？" : "나는 기록을 모으는 위대한 기록새야. 목포역에서 여정을 시작한다고?", intro);
    }

    const guide = page("mokpo-guide-page");
    if (guide) {
      text(".ornament-label", chinese ? "第一个故事碎片" : "첫 번째 조각", guide);
      html(".mini-title", chinese ? "木浦站" : "목포역", guide);
      const mapCard = guide.querySelector(".piece-map-card");
      if (mapCard) {
        mapCard.classList.add("wire-single-place-card");
        mapCard.innerHTML = `
          <article>
            <span>01</span>
            <strong>${chinese ? "第一个故事碎片 · 木浦站" : "첫 번째 조각 · 목포역"}</strong>
            <small>${chinese ? "从铁路尽头开始的城市第一份记录" : "철길 끝에서 시작되는 도시의 첫 기록"}</small>
          </article>`;
      }
      text(".giroksae-note p", chinese ? "从我们相遇的木浦站开始记录吧。" : "우리가 만난 목포역에서 기록을 시작하자.", guide);
      html(".big-button", `${ui().next} <span>→</span>`, guide);
    }
  }

  function configurePiecePages(pieceNumber) {
    const config = pieceConfig(pieceNumber);
    const copy = ui();
    const mission = page(`piece-${pieceNumber}-mission-page`);
    const upload = page(`piece-${pieceNumber}-upload-page`);
    const result = page(`piece-${pieceNumber}-ai-result-page`);
    const record = page(`record-${pieceNumber}-page`);

    if (mission) {
      text(".ornament-label", `${config.label} · ${config.publicPlace}`, mission);
      html(".mini-title", config.missionTitle.replace("\n", "<br>"), mission);
      text(".content-card .tag", copy.placeMission, mission);
      text(".content-card h2", config.publicPlace, mission);
      text(".content-card .description", config.missionDescription, mission);
      let note = mission.querySelector(".giroksae-note");
      if (!note) {
        note = document.createElement("div");
        note.className = "giroksae-note wire-feather-note";
        note.innerHTML = `<img src="assets/images/giroksae-mission.png" alt="장소 미션을 안내하는 기록새"><p></p>`;
        mission.querySelector(".big-button")?.insertAdjacentElement("beforebegin", note);
      }
      text("p", config.missionLine, note);
      html(".big-button", `${pieceNumber === 1 ? copy.firstImpression : copy.checkPlace} <span>→</span>`, mission);
    }

    if (upload) {
      text(".ornament-label", copy.photoCapture, upload);
      html(".setup-title", config.captureTitle.replace("\n", "<br>"), upload);
      text(".camera-empty strong", copy.choosePhoto, upload);
      text(".camera-empty small", format(copy.photoGuide, { place: config.publicPlace }), upload);
      html(`[data-action="run-piece-ai"]`, `${copy.checkPhoto} <span>→</span>`, upload);
      text(`[data-action="load-sample-piece-photo"]`, copy.samplePhoto, upload);
    }

    if (result) {
      text(".ornament-label", copy.placeCheck, result);
      html(".mini-title", copy.placeConfirmed.replace("\n", "<br>"), result);
      const card = result.querySelector(".ai-result-card");
      if (card) {
        card.innerHTML = `
          <div class="wire-place-result-icon">✓</div>
          <h2>${copy.traceFound}</h2>
          <p class="description">${copy.alignmentDesc}</p>
          <div class="wire-verified-place">${config.publicPlace}</div>`;
      }
      const next = result.querySelector(`#piece-${pieceNumber}-next-btn`);
      if (next) {
        next.classList.remove("hidden");
        next.innerHTML = `${copy.alignTime} <span>→</span>`;
      }
      const retry = result.querySelector(`#piece-${pieceNumber}-retry-btn`);
      if (retry) {
        retry.classList.remove("hidden");
        retry.textContent = copy.wrongPlace;
      }
      result.querySelector(`#piece-${pieceNumber}-fallback-btn`)?.classList.add("hidden");
    }

    if (record) {
      text(".ornament-label", copy.videoCapture, record);
      html(".setup-title", copy.recordVideo.replace("\n", "<br>"), record);
      text(".camera-empty strong", copy.chooseVideo, record);
      text(".camera-empty small", format(copy.videoGuide, { place: config.publicPlace }), record);
      html(`[data-action="save-record"]`, `${copy.checkVideo} <span>→</span>`, record);
      text(`[data-action="load-sample-record"]`, copy.sampleVideo, record);
    }

    if (global.DohunAI && global.DohunAI.DEFINITIONS && global.DohunAI.DEFINITIONS[pieceNumber]) {
      global.DohunAI.DEFINITIONS[pieceNumber].sampleImage = config.sampleMarker;
    }
  }

  function configureOverlayAndEnding() {
    const chinese = isChineseLanguage();
    const overlay = page("piece-overlay-page");
    if (overlay) {
      html("#piece-overlay-title", ui().overlay.replace("\n", "<br>"), overlay);
      html(`[data-action="continue-piece-comic"]`, `${ui().next} <span>→</span>`, overlay);
    }

    const unlock = page("unlock-page");
    if (unlock) {
      text(".ornament-label", chinese ? "地点故事漫画" : "장소 이야기 웹툰", unlock);
      html(".mini-title", chinese ? "碎片汇集成了<br>一个完整故事" : "조각이 모여 하나의<br>이야기가 되었습니다", unlock);
      text(".unlock-card h2", chinese ? "三个故事碎片已集齐" : "세 개의 이야기 조각 완성", unlock);
      text(".unlock-card p", chinese ? "木浦站、湖南银行木浦支店与东方拓殖株式会社木浦支店的故事连接在了一起。" : "목포역, 호남은행 목포지점, 동양척식주식회사 목포지점의 이야기가 하나로 이어졌습니다.", unlock);
      text("#unlock-giroksae-line", chinese ? "三个碎片都集齐了，现在让你看看我的记录故事。" : "조각 3개를 모두 모았으니 나의 기록 이야기를 보여줄게.", unlock);
      html(`[data-action="unlock-place-story"]`, `${chinese ? "查看故事" : "이야기 보러 가기"} <span>→</span>`, unlock);
    }

    const story = page("place-story-comic-page");
    if (story) {
      text(".ornament-label", chinese ? "地点故事漫画" : "장소 이야기 웹툰", story);
      html("#place-story-title", chinese ? "碎片汇集成了<br>一个完整故事" : "조각이 모여 하나의<br>이야기가 되었습니다", story);
      html(`[data-next="quiz-page"]`, `${ui().next} <span>→</span>`, story);
    }

    configureFinalQuiz();

    const result = page("quiz-result-page");
    if (result) {
      text(".ornament-label", chinese ? "旅程影片" : "여정 필름", result);
      html(".mini-title", chinese ? "您的记录<br>已经完成" : "당신의 기록이<br>완료되었습니다", result);
      text(".unlock-card h2", chinese ? "木浦旧城区旅程完成" : "목포 원도심 여정 완료", result);
      text(".unlock-card p", chinese ? "已收集三个地点的记录与故事碎片。" : "세 장소에서 남긴 기록과 이야기 조각을 모두 모았습니다.", result);
      text(".giroksae-note p", chinese ? "我把一路上的记录整理好了。一起确认吧。" : "지금까지의 기록을 모아보았어. 확인해보자.", result);
      html(`[data-next="journey-film-page"]`, `${chinese ? "查看旅程影片" : "여정필름 확인"} <span>→</span>`, result);
    }

    const film = page("journey-film-page");
    if (film) {
      text(".ornament-label", chinese ? "旅程影片" : "여정 필름", film);
      html("#journey-film-title", chinese ? "请确认<br>您的记录" : "당신의 기록을<br>확인하세요", film);
      html(`[data-next="next-place-page"]`, `${ui().next} <span>→</span>`, film);
    }

    const confirmation = page("reservation-page");
    if (confirmation) {
      text(".ornament-label", chinese ? "确定下一地点" : "다음 장소 확정", confirmation);
      html(".mini-title", chinese ? "下一地点<br>已确定" : "다음 장소가<br>확정되었습니다", confirmation);
      text(".unlock-card p", chinese
        ? "前往确定的地点后，请识别现场二维码，继续下一段旅程。"
        : "확정한 장소로 이동한 뒤 현장의 QR 코드를 인식하면 다음 여정을 이어갈 수 있습니다.", confirmation);
      text(".giroksae-note p", chinese ? "很好，下一段记录就从那里继续吧。" : "좋아. 다음 기록은 그곳에서 이어가자.", confirmation);
      text('[data-action="reset-demo"]', chinese ? "返回语言选择" : "언어 선택으로 돌아가기", confirmation);
    }
  }

  function configureFinalQuiz() {
    const quiz = page("quiz-page");
    if (!quiz) return;
    const chinese = isChineseLanguage();
    text(".ornament-label", chinese ? "最终问答" : "최종 퀴즈", quiz);
    html(".mini-title", chinese ? "最终问答<br>木浦站一带的流动" : "최종 퀴즈<br>목포역 일대의 흐름", quiz);
    text(".content-card .tag", ui().question, quiz);
    text(".content-card h2", chinese ? "请按照地点故事中出现的顺序，排列木浦站一带的流动。" : "장소 이야기에서 확인한 목포역 일대의 흐름을 순서대로 배열해주세요.", quiz);
    text(".content-card .description", chinese ? "请按发生顺序选择下列三条记录。" : "아래 세 기록을 일어난 흐름에 맞게 차례로 선택하세요.", quiz);
    const list = quiz.querySelector(".quiz-list");
    if (!list) return;
    list.innerHTML = `
      <button type="button" data-wire-final-order="A"><b>A</b> ${chinese ? "在银行存钱或借取经营资金" : "은행에서 돈을 맡기거나 사업 자금을 빌린다"}</button>
      <button type="button" data-wire-final-order="B"><b>B</b> ${chinese ? "人和物资进入木浦站" : "목포역으로 사람과 물자가 들어온다"}</button>
      <button type="button" data-wire-final-order="C"><b>C</b> ${chinese ? "物品在车站周边街道与商店中交易" : "역 주변 거리와 상점에서 물건이 거래된다"}</button>
      <div id="wire-final-order-display" class="wire-order-display">${chinese ? "选择顺序" : "선택 순서"}: <strong>－ → － → －</strong></div>
      <button type="button" id="wire-final-submit" class="sub-button" data-wire-action="final-submit" disabled>${ui().checkAnswer}</button>`;
    const feedback = quiz.querySelector("#quiz-feedback");
    if (feedback) {
      feedback.textContent = chinese ? "请依次选择三个项目。" : "세 항목을 순서대로 선택해주세요.";
      feedback.classList.remove("hidden");
    }
  }

  function configureWireframeStaticCopy() {
    const copy = ui();
    text("#wire-photo-confirm-page .ornament-label", copy.photoCapture);
    html("#wire-photo-confirm-title", copy.photoConfirm.replace("\n", "<br>"));
    text('[data-wire-action="photo-retry"]', copy.no);
    html('[data-wire-action="photo-confirm"]', `${copy.yes} <span>→</span>`);
    text("#wire-place-loading-page .ornament-label", copy.placeCheck);
    html("#wire-place-loading-page .mini-title", copy.checking.replace("\n", "<br>"));
    text("#wire-place-loading-text", copy.checkingDesc);
    text("#wire-piece-acquired-page .unlock-card h2", copy.congrats);
    html('#wire-piece-acquired-page [data-wire-action="open-fixed-webtoon"]', `${copy.openRecord} <span>→</span>`);
    html("#wire-record-intro-page .mini-title", copy.recordVideo.replace("\n", "<br>"));
    text("#wire-record-intro-page .tag", copy.fiveSecondRecord);
    html('#wire-record-intro-page [data-wire-action="start-recording"]', `${copy.startRecord} <span>→</span>`);
    text("#wire-video-confirm-page .ornament-label", copy.videoCapture);
    html("#wire-video-confirm-page .setup-title", copy.videoConfirm.replace("\n", "<br>"));
    text('[data-wire-action="video-retry"]', copy.no);
    html('[data-wire-action="video-confirm"]', `${copy.yes} <span>→</span>`);
    html('#wire-reflection-result-page [data-wire-action="reflection-next"]', `${copy.next} <span>→</span>`);
    text("#wire-surprise-quiz-page .mini-title", copy.suddenMission);
    text("#wire-surprise-quiz-page .tag", copy.question);
    html("#wire-surprise-submit", `${copy.checkAnswer} <span>→</span>`);
  }

  function installChatbotButtons() {
    const excluded = new Set([
      "start-page", "language-page", "country-page", "china-mode-intro-page", "nickname-page",
      "first-record-page", "first-record-camera-page", "place-loading-page", "place-confirm-page",
      "piece-1-upload-page", "piece-2-upload-page", "piece-3-upload-page",
      "piece-1-ai-result-page", "piece-2-ai-result-page", "piece-3-ai-result-page",
      "piece-overlay-page", "timetrace-page", "record-1-page", "record-2-page", "record-3-page",
      "wire-photo-confirm-page", "wire-place-loading-page", "wire-video-confirm-page"
    ]);
    document.querySelectorAll(".page").forEach((screen) => {
      if (excluded.has(screen.id) || screen.querySelector(".wire-chatbot-button")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wire-chatbot-button";
      button.dataset.wireAction = "chatbot-open";
      screen.appendChild(button);
    });
  }

  function configureChatbot() {
    const copy = ui();
    document.querySelectorAll(".wire-chatbot-button").forEach((button) => {
      button.textContent = copy.chatbot;
      button.setAttribute("aria-label", copy.chatbotTitle);
    });
    text("#wire-chatbot-title", copy.chatbotTitle);
    const close = document.querySelector(".wire-chatbot-close");
    if (close) close.setAttribute("aria-label", copy.close);
    const input = document.getElementById("wire-chatbot-input");
    if (input) input.placeholder = copy.chatbotPlaceholder;
    text("#wire-chatbot-send", copy.send);
    const quick = document.getElementById("wire-chatbot-quick");
    if (quick) {
      quick.innerHTML = [copy.helpMission, copy.helpPlace, copy.helpRecord]
        .map((label) => `<button type="button" data-chatbot-prompt="${label}">${label}</button>`)
        .join("");
    }
  }

  function addChatbotMessage(role, message) {
    const messages = document.getElementById("wire-chatbot-messages");
    if (!messages) return;
    const bubble = document.createElement("p");
    bubble.className = `wire-chatbot-message ${role}`;
    bubble.textContent = message;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  function openChatbot() {
    const modal = document.getElementById("wire-chatbot-modal");
    const messages = document.getElementById("wire-chatbot-messages");
    if (!modal || !messages) return;
    appState().chatOpen = true;
    if (!messages.children.length) addChatbotMessage("bot", ui().chatbotGreeting);
    modal.classList.remove("hidden");
    document.getElementById("wire-chatbot-input")?.focus();
  }

  function closeChatbot() {
    document.getElementById("wire-chatbot-modal")?.classList.add("hidden");
    appState().chatOpen = false;
  }

  function answerChatbot(prompt) {
    const copy = ui();
    const value = String(prompt || "").trim();
    if (!value) return;
    addChatbotMessage("user", value);
    let answer = copy.botFallback;
    if (value === copy.helpMission || /미션|촬영|任务|拍摄/.test(value)) answer = copy.botMission;
    else if (value === copy.helpPlace || /장소|목포|地点|木浦/.test(value)) answer = copy.botPlace;
    else if (value === copy.helpRecord || /기록|영상|记录|视频/.test(value)) answer = copy.botRecord;
    addChatbotMessage("bot", answer);
  }

  function configureAll() {
    configureIntroAndGuide();
    [1, 2, 3].forEach(configurePiecePages);
    configureOverlayAndEnding();
    configureWireframeStaticCopy();
    installChatbotButtons();
    configureChatbot();
  }

  function saveNicknameAndStart() {
    const input = document.getElementById("nickname-input");
    const entered = input ? input.value.trim() : "";
    const safe = Array.from(entered || (isChineseLanguage() ? "旅行者" : "여행자")).slice(0, 20).join("");
    if (input) input.value = safe;
    appState().nickname = safe;
    appState().chatEnabled = true;
    introStep = 0;
    text("#giroksae-intro-text", "나는 기록을 모으는 위대한 기록새야. 목포역에서 여정을 시작한다고?");
    show("giroksae-intro-page");
  }

  function advanceIntro() {
    if (introStep === 0) {
      introStep = 1;
      text("#giroksae-intro-text", "나한테 궁금한 게 있으면 오른쪽 위 버튼을 눌러. 친절히 답변해주지.");
      return;
    }
    introStep = 0;
    text("#giroksae-intro-text", "나는 기록을 모으는 위대한 기록새야. 목포역에서 여정을 시작한다고?");
    show("mokpo-guide-page");
  }

  function openPhotoConfirmation(pieceNumber) {
    const state = appState();
    const photo = state.photos && state.photos[`piece${pieceNumber}`];
    if (!photo) {
      alert(ui().photoRequired);
      return;
    }
    pendingPiece = pieceNumber;
    state.currentPiece = pieceNumber;
    const config = pieceConfig(pieceNumber);
    text("#wire-photo-confirm-label", `${config.label} · ${config.publicPlace}`);
    const preview = document.getElementById("wire-photo-confirm-preview");
    const sample = document.getElementById("wire-photo-confirm-sample");
    const isSample = typeof photo === "string" && photo.startsWith("sample-photo://");
    if (preview) {
      if (isSample) {
        preview.removeAttribute("src");
        preview.classList.add("hidden");
      } else {
        preview.src = sourceUrl(photo, `photo-${pieceNumber}`);
        preview.classList.remove("hidden");
      }
    }
    if (sample) {
      sample.classList.toggle("hidden", !isSample);
      const sampleLabel = sample.querySelector("strong");
      if (sampleLabel) sampleLabel.textContent = appState().language === "zh-CN" ? "示例照片" : "샘플 사진";
    }
    show("wire-photo-confirm-page");
  }

  async function runDetection(pieceNumber) {
    const state = appState();
    const photo = state.photos && state.photos[`piece${pieceNumber}`];
    const config = pieceConfig(pieceNumber);
    text("#wire-place-loading-text", format(ui().detectDesc, { place: config.publicPlace }));
    show("wire-place-loading-page");

    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 650));
    let result;
    try {
      const isSample = typeof photo === "string";
      if (!global.DohunAI || typeof global.DohunAI.runClueClassifier !== "function") {
        throw new Error("장소 판별 모듈을 찾을 수 없습니다.");
      }
      const prediction = global.DohunAI.runClueClassifier(photo, pieceNumber, isSample);
      result = await Promise.race([
        prediction,
        new Promise((_, reject) => setTimeout(() => reject(new Error("장소 판별 시간이 초과되었습니다.")), 30000))
      ]);
    } catch (error) {
      console.warn("[History Pieces] 장소 판별에 실패했습니다.", error);
      result = {
        label: "detection_error",
        confidence: 0,
        success: false,
        verified: false,
        reason: isChineseLanguage() ? "地点识别失败，请重试或重新拍摄。" : "장소 판별에 실패했습니다. 다시 시도하거나 재촬영해주세요.",
        error: String(error)
      };
    }
    await minimumDelay;

    const normalized = Object.assign({}, result, {
      success: Boolean(result && result.success === true),
      verified: Boolean(result && result.success === true),
      locationName: config.publicPlace
    });
    state.aiResults[pieceNumber] = normalized;
    state.currentPiece = pieceNumber;
    renderPlaceResult(pieceNumber);
    show(`piece-${pieceNumber}-ai-result-page`);
  }

  function renderPlaceResult(pieceNumber) {
    const config = pieceConfig(pieceNumber);
    const resultPage = page(`piece-${pieceNumber}-ai-result-page`);
    if (!resultPage) return;
    const result = appState().aiResults && appState().aiResults[pieceNumber];
    const success = Boolean(result && result.success);
    html(".mini-title", success
      ? ui().placeConfirmed.replace("\n", "<br>")
      : (isChineseLanguage() ? "未能确认<br>地点" : "장소를<br>확인하지 못했습니다"), resultPage);
    const cardTitle = resultPage.querySelector(".ai-result-card h2");
    const cardDesc = resultPage.querySelector(".ai-result-card .description");
    if (cardTitle) cardTitle.textContent = success ? ui().traceFound : (isChineseLanguage() ? "未找到地点线索" : "장소의 흔적을 찾지 못했어요");
    if (cardDesc) cardDesc.textContent = success ? ui().alignmentDesc : (isChineseLanguage() ? "请让建筑完整出现在画面中，然后重新拍摄。" : "건물이 제대로 나오도록 다시 촬영해주세요.");
    text(".wire-verified-place", success ? config.publicPlace : "", resultPage);
    resultPage.querySelector(`#piece-${pieceNumber}-next-btn`)?.classList.toggle("hidden", !success);
    resultPage.querySelector(`#piece-${pieceNumber}-retry-btn`)?.classList.toggle("hidden", success);
  }

  function openOverlay(pieceNumber) {
    const state = appState();
    state.currentPiece = pieceNumber;
    if (global.HistoryPiecesTimeTrace && typeof global.HistoryPiecesTimeTrace.open === "function") {
      global.HistoryPiecesTimeTrace.open(pieceNumber);
      return;
    }
    if (typeof global.openPieceOverlay === "function") {
      global.openPieceOverlay(pieceNumber);
    } else {
      show("piece-overlay-page");
    }
    const config = pieceConfig(pieceNumber);
    html("#piece-overlay-title", ui().overlay.replace("\n", "<br>"));
    text("#piece-overlay-subtitle", `${config.label} · ${config.verifiedPlace}`);
    html(`[data-action="continue-piece-comic"]`, `${ui().next} <span>→</span>`);
  }

  function showAcquired(pieceNumber) {
    pendingPiece = pieceNumber;
    const config = pieceConfig(pieceNumber);
    text("#wire-acquired-label", `${config.label} · ${config.verifiedPlace}`);
    html("#wire-acquired-title", isChineseLanguage() ? `已获得<br>${config.label}` : `${config.label}을<br>획득하였습니다`);
    text("#wire-acquired-description", format(ui().acquiredDesc, { piece: config.label }));
    text("#wire-acquired-line", config.acquiredLine);
    show("wire-piece-acquired-page");
  }

  function openFixedWebtoon(pieceNumber) {
    if (global.YuseokStory && typeof global.YuseokStory.unlockPieceComic === "function") {
      global.YuseokStory.unlockPieceComic(pieceNumber);
      return;
    }
    show(`piece-${pieceNumber}-comic-page`);
  }

  function showRecordIntro(pieceNumber) {
    pendingPiece = pieceNumber;
    const config = pieceConfig(pieceNumber);
    text("#wire-record-intro-label", `${config.label} · ${config.verifiedPlace}`);
    text("#wire-record-intro-line", nicknameLine(config.recordLine));
    show("wire-record-intro-page");
  }

  function showVideoConfirmation(pieceNumber) {
    const state = appState();
    let record = state.records && state.records[pieceNumber];
    if (!record) {
      record = `assets/videos/sample-record-${pieceNumber}.mp4`;
      state.records[pieceNumber] = record;
      if (typeof global.renderRecordPreview === "function") global.renderRecordPreview(pieceNumber, record);
    }
    pendingPiece = pieceNumber;
    const config = pieceConfig(pieceNumber);
    text("#wire-video-confirm-label", `${config.label} · ${config.verifiedPlace}`);
    const preview = document.getElementById("wire-video-confirm-preview");
    if (preview) {
      preview.src = sourceUrl(record, `video-${pieceNumber}`);
      preview.load();
    }
    show("wire-video-confirm-page");
  }

  function showReflection(pieceNumber) {
    reflectionPiece = pieceNumber;
    const config = pieceConfig(pieceNumber);
    text("#wire-reflection-label", `${config.label} · ${config.verifiedPlace}`);
    html("#wire-reflection-title", config.reflectionTitle.replace("\n", "<br>"));
    text("#wire-reflection-question", config.reflectionQuestion);
    const options = document.getElementById("wire-reflection-options");
    if (options) {
      options.innerHTML = config.reflectionOptions
        .map((option, index) => `<button type="button" data-wire-reflection="${index}">${option}</button>`)
        .join("");
    }
    const input = document.getElementById("wire-reflection-input");
    if (input) {
      input.value = "";
      input.placeholder = isChineseLanguage() ? "输入简短感受（20字以内）" : "짧은 감정 입력 (20자 이내)";
    }
    text('[data-wire-action="reflection-text"]', isChineseLanguage() ? "输入" : "입력");
    text('[data-wire-action="reflection-skip"]', isChineseLanguage() ? "跳过" : "건너뛰기");
    show("wire-reflection-page");
  }

  function showReflectionReply(pieceNumber, optionIndex) {
    const config = pieceConfig(pieceNumber);
    const value = config.reflectionOptions[Number(optionIndex)] || "";
    appState().emotionResponses = appState().emotionResponses || { 1: null, 2: null, 3: null };
    const tags = pieceNumber === 1 ? ["교통", "사람과 생활"] : pieceNumber === 2 ? ["건축", "과거-현재 변화", "금융"] : ["근대사", "사람과 생활"];
    appState().emotionResponses[pieceNumber] = {
      type: "choice",
      value,
      tags
    };
    appState().storyTags = [...new Set([...(appState().storyTags || []), ...tags])];
    text("#wire-reflection-result-label", `${config.label} · ${config.verifiedPlace}`);
    html("#wire-reflection-result-title", config.reflectionTitle.replace("\n", "<br>"));
    text("#wire-reflection-reply", config.reflectionReply);
    show("wire-reflection-result-page");
  }

  function saveReflectionText(pieceNumber, skip = false) {
    const input = document.getElementById("wire-reflection-input");
    const value = skip ? "" : Array.from((input && input.value.trim()) || "").slice(0, 20).join("");
    if (!skip && !value) {
      if (input) input.focus();
      return;
    }
    appState().emotionResponses = appState().emotionResponses || { 1: null, 2: null, 3: null };
    appState().emotionResponses[pieceNumber] = { type: skip ? "skip" : "text", value, tags: [] };
    const config = pieceConfig(pieceNumber);
    text("#wire-reflection-result-label", `${config.label} · ${config.verifiedPlace}`);
    html("#wire-reflection-result-title", config.reflectionTitle.replace("\n", "<br>"));
    text("#wire-reflection-reply", skip
      ? (isChineseLanguage() ? "没关系。你留下的画面本身也是一份记录。" : "괜찮아. 네가 남긴 장면 자체도 하나의 기록이니까.")
      : config.reflectionReply);
    show("wire-reflection-result-page");
  }

  function showTransition(pieceNumber) {
    pendingPiece = pieceNumber;
    transitionPhase = 0;
    const current = pieceConfig(pieceNumber);
    text("#wire-transition-label", `${current.label} · ${current.verifiedPlace}`);
    html("#wire-transition-title", ui().nextPlaceMove.replace("\n", "<br>"));
    text("#wire-transition-place", current.nextPublicPlace);
    text("#wire-transition-description", ui().nextPlaceDesc);
    text("#wire-transition-line", isChineseLanguage() ? `下一个地点是${current.nextPublicPlace}。现在出发吧！` : `다음 장소는 ${current.nextPublicPlace}이야. 자, 이제 출발하자!`);
    html("#wire-transition-button", `${ui().depart} <span>→</span>`);
    show("wire-transition-page");
  }

  function advanceTransition() {
    const current = pieceConfig(pendingPiece);
    const nextPiece = pendingPiece + 1;
    if (transitionPhase === 0) {
      transitionPhase = 1;
      text("#wire-transition-label", current.nextPieceLabel);
      html("#wire-transition-title", `${current.nextPieceLabel}<br>${current.nextPublicPlace}`);
      text("#wire-transition-place", current.nextPublicPlace);
      text("#wire-transition-description", isChineseLanguage()
        ? (nextPiece === 2 ? "在如今的木浦大众音乐殿堂中，寻找旧湖南银行木浦支店的历史痕迹。" : "在如今的木浦近代历史馆2馆中，寻找旧东方拓殖株式会社木浦支店的历史痕迹。")
        : (nextPiece === 2 ? "현재 목포 대중음악의 전당으로 쓰이는 건물에서 호남은행 목포지점의 흔적을 찾아봅니다." : "현재 목포근대역사관 2관으로 쓰이는 건물에서 동양척식주식회사 목포지점의 흔적을 찾아봅니다."));
      text("#wire-transition-line", isChineseLanguage() ? `这次的地点是${current.nextPublicPlace}。` : `이번 장소는 ${current.nextPublicPlace}이야.`);
      html("#wire-transition-button", `${ui().next} <span>→</span>`);
      return;
    }
    if (global.HistoryPiecesIntegratedUi && typeof global.HistoryPiecesIntegratedUi.showMissionDirect === "function") {
      global.HistoryPiecesIntegratedUi.showMissionDirect(nextPiece);
    } else {
      show(`piece-${nextPiece}-mission-page`);
    }
  }

  function surpriseDefinition(pieceNumber) {
    const chinese = isChineseLanguage();
    if (pieceNumber === 2) {
      return {
        title: chinese ? "任务 - 寻找湖南银行的记录" : "미션 - 호남은행의 기록 찾기",
        question: chinese ? "请选择两条与湖南银行木浦支店业务最直接相关的记录。" : "다음 중 호남은행 목포지점의 업무와 가장 직접적으로 연결되는 기록 두 개를 고르세요.",
        multi: true,
        answer: ["A", "B"],
        options: {
          A: chinese ? "记录商人存款金额与日期的存款账簿" : "상인이 맡긴 돈의 금액과 날짜가 적힌 예금 장부",
          B: chinese ? "商人申请店铺经营资金的贷款文件" : "가게 운영 자금을 신청한 상인의 대출 서류",
          C: chinese ? "记录木浦站受理货物目的地的运单" : "목포역에서 접수한 화물의 목적지가 적힌 운송장",
          D: chinese ? "记录将土地交给农民耕作后收取佃租的账簿" : "농민에게 토지를 맡기고 거둔 소작료가 적힌 장부"
        },
        intro: chinese ? "这里过去是湖南银行。现在清楚了吧？来完成这个任务。" : "이곳은 과거에 호남은행이었어. 이제 잘 알겠지? 그럼 이 미션을 해결해봐.",
        explanation: chinese ? "湖南银行木浦支店面向商人与市民办理存款和贷款等金融业务，因此存款账簿与贷款文件最直接相关。" : "호남은행 목포지점은 상인과 시민을 대상으로 예금과 대출 등 금융 업무를 수행한 공간이므로, 예금 장부와 대출 서류가 가장 직접적으로 연결됩니다."
      };
    }
    return {
      title: chinese ? "任务 - 找出伪造记录" : "미션 - 위조된 기록 찾기",
      question: chinese ? "请从下列四条东方拓殖株式会社记录中找出伪造的一条。" : "아래 동양척식주식회사의 기록 네 개 중 위조된 기록을 찾으세요.",
      multi: false,
      answer: ["D"],
      options: {
        A: chinese ? "取得并管理土地，交由佃农耕作，并将佃租作为公司收益。" : "토지를 확보·관리하고 소작농에게 경작을 맡겨 소작료를 회사 수익으로 활용한다.",
        B: chinese ? "为土地改良与农业项目提供资金，并以土地和不动产作为担保。" : "토지개량과 농업 사업에 자금을 빌려주고 토지와 부동산을 담보로 설정한다.",
        C: chinese ? "支持日本人的农业移民，并提供所需土地与资金。" : "일본인의 농업 이주를 지원하고 필요한 토지와 자금을 제공한다.",
        D: chinese ? "将未偿债务按欠税处理，并把查封土地编入总督府国有地。" : "미상환 채무를 조세 체납으로 처리하고 압류 토지를 총독부 국유지로 편입한다."
      },
      intro: chinese ? "我知道你已经很熟练了。不过，你能找出藏在这些记录中的伪造内容吗？" : "네가 제법 하는 건 알겠어. 그래도 기록들 사이에 숨어 있는 가짜까지 찾아낼 수 있을까?",
      explanation: chinese ? "记录A、B、C反映了东方拓殖株式会社的土地经营、佃租收入、农业移民与担保金融结构。记录D把贷款未偿还改写成欠税并称土地会编入总督府国有地，因此是伪造记录。" : "기록 A, B, C는 동양척식주식회사의 토지 경영, 소작료 수입, 농업 이민 사업과 담보 금융 구조를 반영합니다. 기록 D는 대출금 상환 실패를 조세 체납으로 바꾸고 토지를 총독부 국유지로 편입한다고 서술하므로 위조 기록입니다."
    };
  }

  function showSurpriseQuiz(pieceNumber) {
    pendingPiece = pieceNumber;
    const config = pieceConfig(pieceNumber);
    const definition = surpriseDefinition(pieceNumber);
    text("#wire-surprise-label", `${config.label} · ${config.verifiedPlace}`);
    text("#wire-surprise-quiz-page .mini-title", ui().suddenMission);
    text("#wire-surprise-quiz-page .content-card .tag", ui().question);
    text("#wire-surprise-title", definition.title);
    text("#wire-surprise-question", definition.question);
    const options = document.getElementById("wire-surprise-options");
    if (options) {
      options.dataset.multi = String(definition.multi);
      options.innerHTML = Object.entries(definition.options)
        .map(([key, value]) => `<button type="button" data-wire-surprise-option="${key}"><b>${ui().record} ${key}</b>${value}</button>`)
        .join("");
    }
    text("#wire-surprise-note p", definition.intro);
    const feedback = document.getElementById("wire-surprise-feedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.add("hidden");
    }
    const submit = document.getElementById("wire-surprise-submit");
    if (submit) {
      submit.dataset.mode = "answer";
      submit.innerHTML = `${ui().checkAnswer} <span>→</span>`;
    }
    show("wire-surprise-quiz-page");
  }

  function toggleSurpriseOption(button) {
    const list = document.getElementById("wire-surprise-options");
    const multi = list && list.dataset.multi === "true";
    if (!multi && list) {
      list.querySelectorAll("button").forEach((option) => option.classList.remove("selected"));
    }
    button.classList.toggle("selected", multi ? !button.classList.contains("selected") : true);
  }

  function submitSurprise() {
    const submit = document.getElementById("wire-surprise-submit");
    if (submit && submit.dataset.mode === "continue") {
      showAcquired(pendingPiece);
      return;
    }
    const definition = surpriseDefinition(pendingPiece);
    const selected = [...document.querySelectorAll("#wire-surprise-options button.selected")]
      .map((button) => button.dataset.wireSurpriseOption)
      .sort();
    const answer = [...definition.answer].sort();
    const correct = selected.length === answer.length && selected.every((value, index) => value === answer[index]);
    if (global.HistoryPiecesPdfUx?.showMissionResult) {
      appState().challengeResults = appState().challengeResults || { 2: null, 3: null };
      appState().challengeResults[pendingPiece] = { selected, correct };
      global.HistoryPiecesPdfUx.showMissionResult(pendingPiece, selected, correct, definition);
      return;
    }
    const feedback = document.getElementById("wire-surprise-feedback");
    if (!correct) {
      if (feedback) {
        feedback.textContent = ui().wrongAnswer;
        feedback.classList.remove("hidden");
      }
      return;
    }
    if (feedback) {
      feedback.innerHTML = `<strong>${ui().correct}</strong><br>${definition.explanation}`;
      feedback.classList.remove("hidden");
    }
    appState().challengeResults = appState().challengeResults || { 2: null, 3: null };
    appState().challengeResults[pendingPiece] = { selected, correct: true };
    document.querySelectorAll("#wire-surprise-options button").forEach((button) => {
      button.disabled = true;
    });
    if (submit) {
      submit.dataset.mode = "continue";
      submit.innerHTML = `${ui().next} <span>→</span>`;
    }
  }

  function updateFinalOrder() {
    const display = document.querySelector("#wire-final-order-display strong");
    if (display) {
      const slots = [0, 1, 2].map((index) => finalOrder[index] || "－");
      display.textContent = slots.join(" → ");
    }
    document.querySelectorAll("[data-wire-final-order]").forEach((button) => {
      const position = finalOrder.indexOf(button.dataset.wireFinalOrder);
      button.classList.toggle("selected", position >= 0);
      button.dataset.order = position >= 0 ? String(position + 1) : "";
    });
    const submit = document.getElementById("wire-final-submit");
    if (submit) submit.disabled = finalOrder.length !== 3;
  }

  function chooseFinalOrder(value) {
    if (finalOrder.includes(value)) {
      finalOrder = finalOrder.filter((item) => item !== value);
    } else if (finalOrder.length < 3) {
      finalOrder.push(value);
    }
    appState().finalQuizOrder = [...finalOrder];
    updateFinalOrder();
  }

  function submitFinalQuiz() {
    const correct = finalOrder.join("") === "BCA";
    const feedback = document.getElementById("quiz-feedback");
    if (!correct) {
      finalOrder = [];
      appState().finalQuizOrder = [];
      updateFinalOrder();
      if (feedback) feedback.textContent = isChineseLanguage() ? "顺序不正确。请重新思考从木浦站开始的流动。" : "순서가 맞지 않습니다. 목포역에서 시작한 흐름을 다시 생각해보세요.";
      return;
    }
    appState().finalQuizOrder = [...finalOrder];
    show("quiz-result-page");
  }

  function handleCapture(event) {
    const target = event.target.closest("button, [role='button']");
    if (!target) return;

    if (target.dataset.language) {
      appState().language = target.dataset.language;
      document.documentElement.lang = target.dataset.language;
      queueMicrotask(configureAll);
      return;
    }

    if (target.dataset.country) {
      appState().culture = target.dataset.country;
      document.body.dataset.culture = target.dataset.country;
      queueMicrotask(configureAll);
      return;
    }

    if (target.dataset.action === "confirm-country") {
      stopEvent(event);
      show("nickname-page");
      return;
    }

    if (target.dataset.action === "reset-demo") {
      stopEvent(event);
      closeChatbot();
      show("language-page");
      return;
    }

    if (target.dataset.wireAction === "chatbot-open") {
      stopEvent(event);
      openChatbot();
      return;
    }
    if (target.dataset.wireAction === "chatbot-close") {
      stopEvent(event);
      closeChatbot();
      return;
    }

    if (target.closest("#giroksae-intro-page")) {
      stopEvent(event);
      advanceIntro();
      return;
    }

    if (target.dataset.action === "save-nickname") {
      stopEvent(event);
      saveNicknameAndStart();
      return;
    }

    if (target.dataset.action === "run-piece-ai") {
      stopEvent(event);
      openPhotoConfirmation(Number(target.dataset.piece));
      return;
    }

    if (target.dataset.action === "unlock-piece-comic") {
      stopEvent(event);
      openOverlay(Number(target.dataset.piece));
      return;
    }

    if (target.dataset.action === "continue-piece-comic") {
      stopEvent(event);
      const pieceNumber = Number(appState().currentPiece || pendingPiece);
      if (pieceNumber === 2 || pieceNumber === 3) showSurpriseQuiz(pieceNumber);
      else showAcquired(pieceNumber);
      return;
    }

    if (target.dataset.action === "save-record") {
      stopEvent(event);
      showVideoConfirmation(Number(target.dataset.record));
      return;
    }

    if (target.dataset.action === "unlock-place-story") {
      stopEvent(event);
      if (global.YuseokStory && typeof global.YuseokStory.unlockPlaceStory === "function") {
        global.YuseokStory.unlockPlaceStory();
      } else if (typeof global.unlockPlaceStoryComic === "function") {
        global.unlockPlaceStoryComic();
      } else {
        show("place-story-comic-page");
      }
      return;
    }

    const comicPage = target.closest(".comic-page[id^='piece-']");
    if (comicPage && target.dataset.next && /^record-[123]-page$/.test(target.dataset.next)) {
      stopEvent(event);
      const pieceNumber = Number(comicPage.id.match(/^piece-([123])-/)[1]);
      showRecordIntro(pieceNumber);
      return;
    }

    if (target.dataset.wireReflection != null) {
      stopEvent(event);
      showReflectionReply(reflectionPiece, target.dataset.wireReflection);
      return;
    }

    if (target.dataset.wireSurpriseOption) {
      stopEvent(event);
      toggleSurpriseOption(target);
      return;
    }

    if (target.dataset.wireFinalOrder) {
      stopEvent(event);
      chooseFinalOrder(target.dataset.wireFinalOrder);
      return;
    }

    if (target.dataset.chatbotPrompt) {
      stopEvent(event);
      answerChatbot(target.dataset.chatbotPrompt);
      return;
    }

    const wireAction = target.dataset.wireAction;
    if (!wireAction) return;
    stopEvent(event);

    if (wireAction === "chatbot-open") {
      openChatbot();
    } else if (wireAction === "chatbot-close") {
      closeChatbot();
    } else if (wireAction === "photo-retry") {
      show(`piece-${pendingPiece}-upload-page`);
    } else if (wireAction === "photo-confirm") {
      runDetection(pendingPiece);
    } else if (wireAction === "open-fixed-webtoon") {
      openFixedWebtoon(pendingPiece);
    } else if (wireAction === "start-recording") {
      show(`record-${pendingPiece}-page`);
    } else if (wireAction === "video-retry") {
      show(`record-${pendingPiece}-page`);
    } else if (wireAction === "video-confirm") {
      showReflection(pendingPiece);
    } else if (wireAction === "reflection-text") {
      saveReflectionText(reflectionPiece, false);
    } else if (wireAction === "reflection-skip") {
      saveReflectionText(reflectionPiece, true);
    } else if (wireAction === "reflection-next") {
      if (global.HistoryPiecesPdfUx?.showPlaceComplete) {
        global.HistoryPiecesPdfUx.showPlaceComplete(reflectionPiece);
      } else if (reflectionPiece < 3) showTransition(reflectionPiece);
      else show("unlock-page");
    } else if (wireAction === "transition-next") {
      advanceTransition();
    } else if (wireAction === "surprise-submit") {
      submitSurprise();
    } else if (wireAction === "final-submit") {
      submitFinalQuiz();
    }
  }

  function install() {
    const state = appState();
    state.currentPlace = "mokpo_station";
    state.chatEnabled = false;
    state.chatOpen = false;
    state.challengeResults = state.challengeResults || { 2: null, 3: null };
    state.emotionResponses = state.emotionResponses || { 1: null, 2: null, 3: null };
    state.finalQuizOrder = state.finalQuizOrder || [];
    state.selectedNextPlace = state.selectedNextPlace || null;
    appendWireframePages();
    configureAll();
    document.addEventListener("click", handleCapture, true);
    show("language-page");
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-language], [data-country]")) {
        queueMicrotask(() => {
          const messages = document.getElementById("wire-chatbot-messages");
          if (messages) messages.innerHTML = "";
          configureAll();
        });
      }
    });
    document.getElementById("wire-chatbot-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("wire-chatbot-input");
      answerChatbot(input?.value);
      if (input) input.value = "";
    });
    global.HistoryPiecesWireframe = Object.freeze({
      pieces: PIECES,
      showAcquired,
      showRecordIntro,
      showReflection,
      showSurpriseQuiz,
      configureAll
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})(window);
