/* =========================================================
  History Pieces - 여정필름 비디오 모듈
  기준 자료: 2026-07-15 팀원 제출본

  통합 원칙
  - 공개 함수는 journey 접두사만 사용한다.
  - 3개 클립 적재, 순차 재생, Canvas + MediaRecorder 합성을 담당한다.
  - 브라우저 합성 실패 시 동일 컨테이너에서 순차 재생으로 전환한다.
  - 공통 화면 전환과 문구는 script.js가 담당한다.
========================================================= */

(function journeyFilmModule(global) {
  "use strict";

  const text = (key, params) => global.HistoryPiecesI18n
    ? global.HistoryPiecesI18n.tCurrent(key, params)
    : key;

  const FALLBACK_CLIPS = Object.freeze({
    1: "assets/videos/sample-record-1.mp4",
    2: "assets/videos/sample-record-2.mp4",
    3: "assets/videos/sample-record-3.mp4"
  });

  const state = {
    clipVideos: { 1: null, 2: null, 3: null },
    currentPlayingIndex: 1,
    currentPlayer: null,
    synthesizedBlob: null,
    synthesizedUrl: null,
    mimeType: null,
    isSynthesizing: false
  };

  const clipObjectUrls = new Map();

  function getCommonState() {
    return global.appState || null;
  }

  function syncCommonState() {
    const commonState = getCommonState();
    if (!commonState) return;
    commonState.journeyFilm = {
      blob: state.synthesizedBlob,
      url: state.synthesizedUrl,
      mimeType: state.mimeType,
      isSynthesizing: state.isSynthesizing
    };
  }

  function normalizeStageIndex(stageIndex) {
    const index = Number(stageIndex);
    if (![1, 2, 3].includes(index)) {
      throw new Error(`[JourneyFilm] ${text("invalidPiece")} ${stageIndex}`);
    }
    return index;
  }

  function releaseClipObjectUrl(source) {
    if (!(source instanceof Blob) || !clipObjectUrls.has(source)) return;
    URL.revokeObjectURL(clipObjectUrls.get(source));
    clipObjectUrls.delete(source);
  }

  function resolveClipUrl(source) {
    if (typeof source === "string") return source;
    if (!(source instanceof Blob)) return "";
    if (!clipObjectUrls.has(source)) {
      clipObjectUrls.set(source, URL.createObjectURL(source));
    }
    return clipObjectUrls.get(source);
  }

  function getCaption(stageIndex) {
    const commonState = getCommonState() || {};
    const response = commonState.emotionResponses?.[stageIndex];
    if (response?.value) return String(response.value);
    const fallback = commonState.language === "zh-CN"
      ? ["在木浦站开始的记录", "发现空间用途的变化", "记住留在建筑中的历史"]
      : ["목포역에서 시작한 오늘의 기록", "공간의 쓰임이 바뀐 흔적", "건물에 남은 역사를 기억합니다"];
    return fallback[stageIndex - 1];
  }

  /**
   * 각 조각에서 촬영한 비디오를 여정필름 상태에 저장한다.
   * @param {1|2|3} stageIndex
   * @param {Blob|string|null} videoSource
   */
  function journeySaveClipVideo(stageIndex, videoSource) {
    const index = normalizeStageIndex(stageIndex);
    releaseClipObjectUrl(state.clipVideos[index]);
    state.clipVideos[index] = videoSource || FALLBACK_CLIPS[index];
    return state.clipVideos[index];
  }

  function stopSequentialPlayer() {
    const player = state.currentPlayer;
    if (!player) return;
    player.onended = null;
    player.onerror = null;
    if (typeof player.pause === "function") player.pause();
    player.removeAttribute("src");
    state.currentPlayer = null;
  }

  /**
   * 1, 2, 3번 클립을 한 개의 플레이어에서 순서대로 반복 재생한다.
   * @param {string} containerElementId
   */
  function journeyPlayClipsSequentially(containerElementId) {
    const container = document.getElementById(containerElementId);
    if (!container) {
      console.error(`[여정필름] 재생 컨테이너를 찾을 수 없습니다: ${containerElementId}`);
      return false;
    }

    stopSequentialPlayer();
    container.innerHTML = "";

    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.controls = true;
    video.setAttribute("aria-label", text("journeySequentialLabel"));
    container.appendChild(video);
    const caption = document.createElement("p");
    caption.className = "journey-live-caption";
    container.appendChild(caption);

    state.currentPlayer = video;
    state.currentPlayingIndex = 1;
    let failedClipCount = 0;

    const showUnavailable = () => {
      stopSequentialPlayer();
      container.innerHTML = "";
      const status = document.createElement("p");
      status.className = "film-unavailable";
      status.textContent = text("journeyUnavailable");
      container.appendChild(status);
    };

    const playCurrentClip = () => {
      if (state.currentPlayer !== video) return;
      const index = state.currentPlayingIndex;
      const source = state.clipVideos[index] || FALLBACK_CLIPS[index];
      const url = resolveClipUrl(source);
      caption.textContent = getCaption(index);

      if (!url) {
        failedClipCount += 1;
        if (failedClipCount >= 3) {
          showUnavailable();
          return;
        }
        state.currentPlayingIndex = index === 3 ? 1 : index + 1;
        playCurrentClip();
        return;
      }

      video.src = url;
      video.load();
      video.play().catch(() => {
        // 모바일 자동 재생이 차단되면 controls를 통해 사용자가 직접 재생한다.
      });
    };

    const advance = () => {
      state.currentPlayingIndex = state.currentPlayingIndex === 3
        ? 1
        : state.currentPlayingIndex + 1;
      playCurrentClip();
    };

    video.onended = advance;
    video.onerror = () => {
      failedClipCount += 1;
      if (failedClipCount >= 3) {
        showUnavailable();
        return;
      }
      advance();
    };

    playCurrentClip();
    return true;
  }

  function getSafeMimeType() {
    if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
      return "";
    }

    const candidateTypes = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=h264",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];

    return candidateTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }

  function drawCover(ctx, media, width, height) {
    const mediaWidth = media.videoWidth || width;
    const mediaHeight = media.videoHeight || height;
    const scale = Math.max(width / mediaWidth, height / mediaHeight);
    const drawWidth = mediaWidth * scale;
    const drawHeight = mediaHeight * scale;
    ctx.drawImage(
      media,
      (width - drawWidth) / 2,
      (height - drawHeight) / 2,
      drawWidth,
      drawHeight
    );
  }

  function drawCaption(ctx, caption, stageIndex, width, height) {
    const safeCaption = String(caption || "").slice(0, 42);
    if (!safeCaption) return;
    const boxX = 48;
    const boxY = height - 190;
    const boxWidth = width - 96;
    const boxHeight = 112;
    ctx.save();
    ctx.fillStyle = "rgba(24, 19, 15, 0.78)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = "#f3d8a6";
    ctx.font = "600 24px sans-serif";
    ctx.fillText(`RECORD ${stageIndex}/3`, boxX + 24, boxY + 34);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 30px sans-serif";
    ctx.fillText(safeCaption, boxX + 24, boxY + 78, boxWidth - 48);
    ctx.restore();
  }

  function loadVideoSource(video, source) {
    return new Promise((resolve, reject) => {
      const url = resolveClipUrl(source);
      if (!url) {
        reject(new Error(text("journeySourceEmpty")));
        return;
      }

      const timeoutId = setTimeout(() => {
        clearHandlers();
        reject(new Error(text("journeyLoadTimeout")));
      }, 8000);

      const clearHandlers = () => {
        clearTimeout(timeoutId);
        video.onloadedmetadata = null;
        video.onerror = null;
      };

      video.onloadedmetadata = () => {
        clearHandlers();
        resolve();
      };
      video.onerror = () => {
        clearHandlers();
        reject(new Error(text("journeyFileLoadFailed")));
      };
      video.src = url;
      video.load();
    });
  }

  async function playVideoSegment(video, maxSeconds) {
    video.currentTime = 0;
    try {
      await video.play();
    } catch (error) {
      throw new Error(`${text("journeyPlaybackStartFailed")} ${error.message || error}`);
    }

    return new Promise((resolve) => {
      let settled = false;
      const duration = Number.isFinite(video.duration) && video.duration > 0
        ? Math.min(video.duration, maxSeconds)
        : maxSeconds;

      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timerId);
        video.onended = null;
        video.pause();
        resolve();
      };

      const timerId = setTimeout(finish, Math.max(300, duration * 1000));
      video.onended = finish;
    });
  }

  function revokeSynthesizedUrl() {
    if (!state.synthesizedUrl) return;
    URL.revokeObjectURL(state.synthesizedUrl);
    state.synthesizedUrl = null;
  }

  function renderSynthesizedPlayer(container, url) {
    container.innerHTML = "";
    const player = document.createElement("video");
    player.src = url;
    player.controls = true;
    player.playsInline = true;
    player.setAttribute("aria-label", text("journeyResultLabel"));
    container.appendChild(player);
    container.classList.remove("hidden");
  }

  /**
   * Canvas와 MediaRecorder로 세 클립을 720x1280 세로 영상으로 합성한다.
   * @param {string} containerElementId
   * @param {(success:boolean, url:string|null, result:Object)=>void=} onCompleteCallback
   * @returns {Promise<{success:boolean,combinedVideoUrl:string|null,blob:Blob|null,mimeType:string|null,duration:string,error:string|null}>}
   */
  async function journeySynthesizeFinalFilm(containerElementId, onCompleteCallback) {
    const container = document.getElementById(containerElementId);
    if (!container) {
      const missingContainerResult = {
        success: false,
        combinedVideoUrl: null,
        blob: null,
        mimeType: null,
        duration: "0s",
        error: `${text("journeyContainerMissing")} ${containerElementId}`
      };
      if (onCompleteCallback) onCompleteCallback(false, null, missingContainerResult);
      return missingContainerResult;
    }

    if (state.isSynthesizing) {
      const busyResult = {
        success: false,
        combinedVideoUrl: null,
        blob: null,
        mimeType: null,
        duration: "0s",
        error: text("journeyBusy")
      };
      if (onCompleteCallback) onCompleteCallback(false, null, busyResult);
      return busyResult;
    }

    const sources = [1, 2, 3].map((index) => state.clipVideos[index] || FALLBACK_CLIPS[index]);
    const mimeType = getSafeMimeType();
    const canCaptureCanvas = typeof HTMLCanvasElement !== "undefined"
      && typeof HTMLCanvasElement.prototype.captureStream === "function";

    if (!mimeType || !canCaptureCanvas) {
      journeyPlayClipsSequentially(containerElementId);
      const unsupportedResult = {
        success: false,
        combinedVideoUrl: null,
        blob: null,
        mimeType: null,
        duration: "15s",
        error: text("journeySynthesisUnavailable")
      };
      if (onCompleteCallback) onCompleteCallback(false, null, unsupportedResult);
      return unsupportedResult;
    }

    revokeSynthesizedUrl();
    state.synthesizedBlob = null;
    state.mimeType = null;
    state.isSynthesizing = true;
    syncCommonState();

    let animationFrameId = null;
    let drawing = false;
    let audioContext = null;
    let combinedStream = null;
    let recorder = null;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error(text("journeyCanvasContextFailed"));

      const video = document.createElement("video");
      video.playsInline = true;
      video.preload = "auto";

      const canvasStream = canvas.captureStream(30);
      const videoTrack = canvasStream.getVideoTracks()[0];
      if (!videoTrack) throw new Error(text("journeyVideoTrackFailed"));
      const tracks = [videoTrack];

      const AudioContextClass = global.AudioContext || global.webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
        await audioContext.resume();
        const audioDestination = audioContext.createMediaStreamDestination();
        const sourceNode = audioContext.createMediaElementSource(video);
        sourceNode.connect(audioDestination);
        const audioTrack = audioDestination.stream.getAudioTracks()[0];
        if (audioTrack) tracks.push(audioTrack);
      } else {
        video.muted = true;
      }

      combinedStream = new MediaStream(tracks);
      const chunks = [];
      let recorderError = null;
      recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 3500000
      });
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () => {
        recorderError = new Error(text("journeyEncodingFailed"));
      };

      let currentStageIndex = 1;
      drawing = true;
      const drawFrame = () => {
        if (!drawing) return;
        if (video.readyState >= 2) {
          drawCover(ctx, video, canvas.width, canvas.height);
          drawCaption(ctx, getCaption(currentStageIndex), currentStageIndex, canvas.width, canvas.height);
        }
        animationFrameId = requestAnimationFrame(drawFrame);
      };
      drawFrame();
      recorder.start(1000);

      for (const [sourceIndex, source] of sources.entries()) {
        currentStageIndex = sourceIndex + 1;
        if (source instanceof File && !source.type.startsWith("video/")) {
          throw new Error(text("journeyVideoOnly"));
        }
        await loadVideoSource(video, source);
        await playVideoSegment(video, 5);
        if (recorderError) throw recorderError;
      }

      drawing = false;
      await new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = () => reject(new Error(text("journeyEncodingFailed")));
        recorder.stop();
      });

      if (!chunks.length) throw new Error(text("journeyEmptyData"));

      revokeSynthesizedUrl();
      state.synthesizedBlob = new Blob(chunks, { type: mimeType });
      state.synthesizedUrl = URL.createObjectURL(state.synthesizedBlob);
      state.mimeType = mimeType;
      renderSynthesizedPlayer(container, state.synthesizedUrl);

      const successResult = {
        success: true,
        combinedVideoUrl: state.synthesizedUrl,
        blob: state.synthesizedBlob,
        mimeType: state.mimeType,
        duration: "15s",
        error: null
      };
      if (onCompleteCallback) onCompleteCallback(true, state.synthesizedUrl, successResult);
      return successResult;
    } catch (error) {
      console.error("[여정필름] 합성 실패. 순차 재생으로 전환합니다.", error);
      journeyPlayClipsSequentially(containerElementId);
      const failureResult = {
        success: false,
        combinedVideoUrl: null,
        blob: null,
        mimeType: null,
        duration: "15s",
        error: error instanceof Error ? error.message : String(error)
      };
      if (onCompleteCallback) onCompleteCallback(false, null, failureResult);
      return failureResult;
    } finally {
      drawing = false;
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      if (recorder && recorder.state !== "inactive") recorder.stop();
      if (combinedStream) combinedStream.getTracks().forEach((track) => track.stop());
      if (audioContext && audioContext.state !== "closed") await audioContext.close();
      state.isSynthesizing = false;
      syncCommonState();
    }
  }

  function journeyDownloadFilm(baseFilename = "history-pieces-journey") {
    if (!state.synthesizedBlob || !state.synthesizedUrl) return false;
    const extension = state.mimeType && state.mimeType.startsWith("video/mp4") ? "mp4" : "webm";
    const safeBaseName = String(baseFilename).replace(/[\\/:*?"<>|]/g, "_");
    const link = document.createElement("a");
    link.href = state.synthesizedUrl;
    link.download = `${safeBaseName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    return true;
  }

  function journeyConnectInstagramShare() {
    if (!state.synthesizedBlob) return false;
    global.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    return true;
  }

  function journeyReset() {
    stopSequentialPlayer();
    Object.values(state.clipVideos).forEach(releaseClipObjectUrl);
    clipObjectUrls.clear();
    revokeSynthesizedUrl();
    state.clipVideos = { 1: null, 2: null, 3: null };
    state.currentPlayingIndex = 1;
    state.synthesizedBlob = null;
    state.mimeType = null;
    state.isSynthesizing = false;
    syncCommonState();
  }

  global.JourneyFilm = Object.freeze({
    saveClipVideo: journeySaveClipVideo,
    playClipsSequentially: journeyPlayClipsSequentially,
    synthesizeFinalFilm: journeySynthesizeFinalFilm,
    downloadFilm: journeyDownloadFilm,
    connectInstagramShare: journeyConnectInstagramShare,
    getSafeMimeType,
    reset: journeyReset
  });

  // 팀원 간 약속한 공개 인터페이스 이름을 그대로 제공한다.
  global.journeySaveClipVideo = journeySaveClipVideo;
  global.journeyPlayClipsSequentially = journeyPlayClipsSequentially;
  global.journeySynthesizeFinalFilm = journeySynthesizeFinalFilm;
  global.journeyConnectInstagramShare = journeyConnectInstagramShare;
})(window);
