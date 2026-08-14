/* =========================================================
  History Pieces - QR 모바일 고화질 5초 영상 촬영

  적용 범위
  - record-1/2/3 입력을 눌렀을 때만 실행한다.
  - 후면 카메라에 1080p·30fps를 우선 요청한다.
  - 10Mbps 비트레이트로 최대 5초를 녹화한다.
  - 미지원·비보안 환경에서는 기존 capture 입력을 그대로 사용한다.
========================================================= */

(function highQualityVideoRecorder(global) {
  "use strict";

  const MAX_RECORDING_MS = 5000;
  const TARGET_VIDEO_BITRATE = 10000000;
  const state = {
    overlay: null,
    input: null,
    pieceNumber: null,
    stream: null,
    recorder: null,
    chunks: [],
    stopTimer: null,
    clockTimer: null,
    startedAt: 0,
    discardRecording: false
  };

  function copy() {
    const chinese = global.appState && global.appState.language === "zh-CN";
    return chinese ? {
      title: "高清5秒记录",
      preparing: "正在准备后置摄像头…",
      ready: "摄像头已准备好",
      start: "开始5秒记录",
      recording: "记录中…",
      cancel: "取消",
      native: "使用手机默认相机",
      save: "正在保存高清记录…",
      failed: "无法打开高清摄像头。请使用手机默认相机。",
      empty: "未生成视频。请重新拍摄。",
      cameraLabel: "高清录像画面"
    } : {
      title: "고화질 5초 기록",
      preparing: "후면 카메라를 준비하고 있습니다…",
      ready: "카메라 준비 완료",
      start: "5초 기록 시작",
      recording: "기록 중…",
      cancel: "취소",
      native: "휴대폰 기본 카메라 사용",
      save: "고화질 기록을 저장하고 있습니다…",
      failed: "고화질 카메라를 열 수 없습니다. 휴대폰 기본 카메라를 사용해 주세요.",
      empty: "영상이 만들어지지 않았습니다. 다시 촬영해 주세요.",
      cameraLabel: "고화질 동영상 촬영 화면"
    };
  }

  function isSupported() {
    return global.isSecureContext
      && navigator.mediaDevices
      && typeof navigator.mediaDevices.getUserMedia === "function"
      && typeof global.MediaRecorder === "function";
  }

  function selectMimeType() {
    if (typeof global.MediaRecorder.isTypeSupported !== "function") return "";
    const candidates = [
      "video/mp4;codecs=avc1.42E01E",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm"
    ];
    return candidates.find((type) => global.MediaRecorder.isTypeSupported(type)) || "";
  }

  function clearTimers() {
    if (state.stopTimer) clearTimeout(state.stopTimer);
    if (state.clockTimer) clearInterval(state.clockTimer);
    state.stopTimer = null;
    state.clockTimer = null;
  }

  function stopCamera() {
    if (state.stream) state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
  }

  function removeOverlay() {
    clearTimers();
    stopCamera();
    if (state.overlay) state.overlay.remove();
    state.overlay = null;
    state.input = null;
    state.pieceNumber = null;
    state.recorder = null;
    state.chunks = [];
    state.startedAt = 0;
  }

  function updateClock() {
    if (!state.overlay || !state.startedAt) return;
    const elapsed = Math.min(MAX_RECORDING_MS, performance.now() - state.startedAt);
    const seconds = (elapsed / 1000).toFixed(1);
    const timer = state.overlay.querySelector("[data-hq-timer]");
    const progress = state.overlay.querySelector("[data-hq-progress]");
    if (timer) timer.textContent = `${seconds}s / 5.0s`;
    if (progress) progress.style.width = `${Math.min(100, elapsed / MAX_RECORDING_MS * 100)}%`;
  }

  function setStatus(message, error = false) {
    if (!state.overlay) return;
    const status = state.overlay.querySelector("[data-hq-status]");
    if (status) {
      status.textContent = message;
      status.classList.toggle("is-error", error);
    }
  }

  function showNativeFallback() {
    if (!state.overlay) return;
    const button = state.overlay.querySelector("[data-hq-native]");
    if (button) button.classList.remove("hidden");
  }

  function buildOverlay() {
    const labels = copy();
    const overlay = document.createElement("div");
    overlay.className = "hq-video-recorder";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "hq-video-recorder-title");
    overlay.innerHTML = `
      <div class="hq-video-recorder__panel">
        <div class="hq-video-recorder__header">
          <h2 id="hq-video-recorder-title">${labels.title}</h2>
          <button type="button" class="hq-video-recorder__close" data-hq-cancel aria-label="${labels.cancel}">×</button>
        </div>
        <div class="hq-video-recorder__viewport">
          <video autoplay muted playsinline data-hq-preview aria-label="${labels.cameraLabel}"></video>
          <div class="hq-video-recorder__quality" data-hq-quality>HD</div>
          <div class="hq-video-recorder__timer" data-hq-timer>0.0s / 5.0s</div>
          <div class="hq-video-recorder__actions">
            <button type="button" class="hq-video-recorder__record" data-hq-record disabled aria-label="${labels.start}">${labels.start}</button>
          </div>
        </div>
        <div class="hq-video-recorder__progress" aria-hidden="true"><i data-hq-progress></i></div>
        <p class="hq-video-recorder__status" data-hq-status aria-live="polite">${labels.preparing}</p>
        <button type="button" class="hq-video-recorder__native hidden" data-hq-native>${labels.native}</button>
      </div>`;
    document.body.appendChild(overlay);
    state.overlay = overlay;

    overlay.querySelectorAll("[data-hq-cancel]").forEach((button) => {
      button.addEventListener("click", cancelRecording);
    });
    overlay.querySelector("[data-hq-record]").addEventListener("click", startRecording);
    overlay.querySelector("[data-hq-native]").addEventListener("click", openNativeCamera);
    return overlay;
  }

  async function openRecorder(input, pieceNumber) {
    state.input = input;
    state.pieceNumber = pieceNumber;
    state.discardRecording = false;
    const labels = copy();
    const overlay = buildOverlay();
    const preview = overlay.querySelector("[data-hq-preview]");
    const recordButton = overlay.querySelector("[data-hq-record]");

    try {
      state.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 30 },
          aspectRatio: { ideal: 16 / 9 }
        }
      });
      preview.srcObject = state.stream;
      await preview.play();

      const track = state.stream.getVideoTracks()[0];
      const settings = track && typeof track.getSettings === "function" ? track.getSettings() : {};
      const quality = overlay.querySelector("[data-hq-quality]");
      if (quality) {
        const resolution = settings.width && settings.height
          ? `${settings.width}×${settings.height}`
          : "HD";
        const fps = settings.frameRate ? ` · ${Math.round(settings.frameRate)}fps` : "";
        quality.textContent = `${resolution}${fps}`;
      }
      setStatus(labels.ready);
      recordButton.disabled = false;
    } catch (error) {
      console.warn("[History Pieces] 고화질 카메라 준비 실패", error);
      stopCamera();
      setStatus(labels.failed, true);
      showNativeFallback();
    }
  }

  function createRecorder(stream, mimeType) {
    const bitrateOptions = [TARGET_VIDEO_BITRATE, 8000000, null];
    for (const bitrate of bitrateOptions) {
      try {
        const options = {};
        if (mimeType) options.mimeType = mimeType;
        if (bitrate) options.videoBitsPerSecond = bitrate;
        return new global.MediaRecorder(stream, options);
      } catch (_error) {
        // 기기별 허용 비트레이트 차이를 고려해 한 단계씩 낮춰 재시도한다.
      }
    }
    throw new Error("MediaRecorder initialization failed");
  }

  function startRecording() {
    if (!state.stream || !state.overlay || (state.recorder && state.recorder.state !== "inactive")) return;
    const labels = copy();
    const recordButton = state.overlay.querySelector("[data-hq-record]");
    const cancelButtons = state.overlay.querySelectorAll("[data-hq-cancel]");
    const mimeType = selectMimeType();

    try {
      state.chunks = [];
      state.recorder = createRecorder(state.stream, mimeType);
      state.recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) state.chunks.push(event.data);
      };
      state.recorder.onerror = (event) => {
        console.error("[History Pieces] 고화질 영상 녹화 오류", event.error || event);
        setStatus(labels.failed, true);
        showNativeFallback();
      };
      state.recorder.onstop = finishRecording;
      state.recorder.start(250);
      state.startedAt = performance.now();
      recordButton.disabled = true;
      recordButton.textContent = labels.recording;
      recordButton.setAttribute("aria-label", labels.recording);
      recordButton.classList.add("is-recording");
      cancelButtons.forEach((button) => { button.disabled = false; });
      setStatus(labels.recording);
      updateClock();
      state.clockTimer = setInterval(updateClock, 100);
      state.stopTimer = setTimeout(stopRecording, MAX_RECORDING_MS);
    } catch (error) {
      console.warn("[History Pieces] 고화질 녹화 시작 실패", error);
      setStatus(labels.failed, true);
      showNativeFallback();
    }
  }

  function stopRecording() {
    clearTimers();
    updateClock();
    if (state.recorder && state.recorder.state !== "inactive") state.recorder.stop();
  }

  function saveFileToExistingFlow(file) {
    const input = state.input;
    const pieceNumber = state.pieceNumber;
    if (!input || !pieceNumber) return;

    try {
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    } catch (_error) {
      // iOS 일부 버전은 DataTransfer 대입을 제한하므로 기존 공개 함수를 사용한다.
    }

    if (global.appState && global.appState.records) {
      if (typeof global.releasePreviewUrl === "function") {
        global.releasePreviewUrl(global.appState.records[pieceNumber]);
      }
      global.appState.records[pieceNumber] = file;
    }
    if (typeof global.renderRecordPreview === "function") {
      global.renderRecordPreview(pieceNumber, file);
    }
  }

  function finishRecording() {
    if (state.discardRecording) {
      removeOverlay();
      return;
    }

    const labels = copy();
    setStatus(labels.save);
    const actualType = (state.recorder && state.recorder.mimeType) || selectMimeType() || "video/webm";
    const blob = new Blob(state.chunks, { type: actualType });
    if (!blob.size) {
      setStatus(labels.empty, true);
      showNativeFallback();
      return;
    }

    const extension = actualType.startsWith("video/mp4") ? "mp4" : "webm";
    const file = new File(
      [blob],
      `history-pieces-record-${state.pieceNumber}-${Date.now()}.${extension}`,
      { type: actualType, lastModified: Date.now() }
    );
    saveFileToExistingFlow(file);
    removeOverlay();
  }

  function cancelRecording() {
    state.discardRecording = true;
    if (state.recorder && state.recorder.state !== "inactive") {
      state.recorder.stop();
    } else {
      removeOverlay();
    }
  }

  function openNativeCamera() {
    const input = state.input;
    state.discardRecording = true;
    removeOverlay();
    if (input) input.click();
  }

  document.addEventListener("click", (event) => {
    const label = event.target.closest('label[for^="record-"][for$="-input"]');
    if (!label || !isSupported()) return;
    const match = label.htmlFor.match(/^record-([123])-input$/);
    if (!match) return;
    const input = document.getElementById(label.htmlFor);
    if (!input) return;

    event.preventDefault();
    event.stopPropagation();
    openRecorder(input, Number(match[1]));
  }, true);

  global.addEventListener("historypieces:pagechange", () => {
    if (state.overlay) cancelRecording();
  });

  global.HistoryPiecesHighQualityRecorder = Object.freeze({
    isSupported,
    targetWidth: 1920,
    targetHeight: 1080,
    targetFrameRate: 30,
    targetVideoBitrate: TARGET_VIDEO_BITRATE,
    maxRecordingMs: MAX_RECORDING_MS
  });
})(window);
