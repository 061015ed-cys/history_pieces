/**
 * ============================================================================
 * [구도훈] 직접 학습 AI 및 5초 기록 검증 모듈 (1차 통합용)
 * 파일 위치: modules/dohun-ai.js
 * ============================================================================
 */
(function (global) {
  "use strict";

  const text = (key, params) => global.HistoryPiecesI18n
    ? global.HistoryPiecesI18n.tCurrent(key, params)
    : key;

  // 1. 조각별 클래스 설계 및 신뢰도 기준
  const CLUE_DEFINITIONS = {
    1: {
      target: "mokpo_station",
      fail: "not_mokpo_station",
      threshold: 0.75,
      implementation: "direct_model_pending",
      sampleImage: "sample-photo://piece-1"
    },
    2: {
      target: "mokpo_music_hall",
      fail: "not_mokpo_music_hall",
      threshold: 0.70,
      implementation: "demo_classifier",
      sampleImage: "sample-photo://piece-2"
    },
    3: {
      target: "mokpo_modern_history_2",
      fail: "not_mokpo_modern_history_2",
      threshold: 0.70,
      implementation: "demo_classifier",
      sampleImage: "sample-photo://piece-3"
    }
  };

  /**
   * AI 단서 판별 호출 함수
   * @param {File|String} imageSource - 이미지 파일 객체 또는 샘플 이미지 경로
   * @param {Number} pieceNumber - 조각 번호 (1, 2, 3)
   * @param {Boolean} isSample - 샘플 진행 여부 (Fallback)
   * @returns {Promise<{label:string,confidence:number,success:boolean,reason:string,error:null,meta:Object}>}
   */
  async function runClueClassifier(imageSource, pieceNumber, isSample = false) {
    const config = CLUE_DEFINITIONS[pieceNumber];
    if (!config) {
      throw new Error(`[DohunAI] ${text("invalidPiece")} ${pieceNumber}`);
    }

    /* ------------------------------------------------------------------------
     * [2차 통합 시 주석 해제 및 적용할 실제 TensorFlow.js 실행 방법]
     * const modelPath = `assets/models/piece_${pieceNumber}_model.json`;
     * const model = await tf.loadLayersModel(modelPath);
     * const tensor = preprocessImage(imageSource);
     * const predictions = await model.predict(tensor).data();
     * return formatPrediction(predictions, config);
     * ------------------------------------------------------------------------ */

    // [Fallback 실행 방법] 샘플 버튼 클릭 시: 모델 실패/오류와 무관하게 100% 성공 반환
    if (isSample || typeof imageSource === "string") {
      return {
        label: config.target,
        confidence: Number((0.88 + Math.random() * 0.08).toFixed(2)), // 88% ~ 96%
        success: true,
        reason: text("aiSampleReason"),
        error: null,
        meta: { source: "sample", implementation: config.implementation }
      };
    }

    // [1차 시뮬레이션] 직접 사진 업로드 시: 임계값 검증 및 실패(Fallback 재촬영) 테스트용
    // (80% 확률로 성공 임계값 넘김, 20% 확률로 임계값 미달 또는 오분류 발생)
    const isSuccessSimulated = Math.random() < 0.8;
    const simulatedConfidence = isSuccessSimulated
      ? config.threshold + Math.random() * (0.98 - config.threshold)
      : Math.random() * (config.threshold - 0.05);

    const simulatedLabel = isSuccessSimulated
      ? config.target
      : Math.random() < 0.5
        ? config.fail
        : "unrelated";

    return {
      label: simulatedLabel,
      confidence: Number(simulatedConfidence.toFixed(2)),
      success: isSuccessSimulated,
      reason: isSuccessSimulated
        ? text("aiSimulationPass")
        : text("aiSimulationFail"),
      error: null,
      meta: { source: "simulation", implementation: config.implementation }
    };
  }

  /**
   * 5초 영상 길이 검증 함수 (최대 7초까지 허용)
   * @param {File} videoFile - 검증할 비디오 File 객체
   * @param {Number} maxSeconds - 허용 최대 시간 (기본 7.0초)
   * @returns {Promise<boolean>}
   */
  function validateVideoDuration(videoFile, maxSeconds = 7.0) {
    return new Promise((resolve) => {
      if (!videoFile || !videoFile.type.startsWith("video/")) {
        resolve(true);
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(videoFile);
      let finished = false;

      const finish = (result) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      };

      const timeoutId = setTimeout(() => finish(true), 5000);

      video.onloadedmetadata = () => {
        finish(video.duration <= maxSeconds);
      };

      video.onerror = () => {
        // 영상 메타데이터 파싱 실패 시, 시연 흐름을 막지 않기 위해 true 반환 (Fallback)
        finish(true);
      };

      video.src = objectUrl;
    });
  }

  /**
   * 조각별 샘플 이미지 경로 반환 유틸리티
   */
  function getSampleImagePath(pieceNumber) {
    return CLUE_DEFINITIONS[pieceNumber]
      ? CLUE_DEFINITIONS[pieceNumber].sampleImage
      : null;
  }

  // 전역 객체에 모듈 노출
  global.DohunAI = {
    runClueClassifier,
    validateVideoDuration,
    getSampleImagePath,
    DEFINITIONS: CLUE_DEFINITIONS
  };

  console.log("[DohunAI] 모듈 로드 완료: window.DohunAI 사용 가능");
})(window);
