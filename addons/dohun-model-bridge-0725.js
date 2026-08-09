(function connectPthModels(global) {
  "use strict";

  const original = global.DohunAI || {};
  const originalClassifier = typeof original.runClueClassifier === "function"
    ? original.runClueClassifier.bind(original)
    : null;
  const definitions = original.DEFINITIONS || {};

  async function sourceToBase64(source) {
    if (!(source instanceof Blob)) throw new Error("이미지 입력 형식이 올바르지 않습니다.");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("이미지 읽기 실패"));
      reader.readAsDataURL(source);
    });
  }

  async function runClueClassifier(imageSource, pieceNumber, isSample = false) {
    // 1차 공통틀의 샘플 진행은 원본 로직을 그대로 사용한다.
    if (isSample || typeof imageSource === "string") {
      if (!originalClassifier) throw new Error("원본 샘플 판별 함수를 찾을 수 없습니다.");
      return originalClassifier(imageSource, pieceNumber, true);
    }

    const imageBase64 = await sourceToBase64(imageSource);
    const response = await fetch("/api/piece-detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ piece: Number(pieceNumber), imageBase64, isSample: false })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.details || result.error || `모델 API HTTP ${response.status}`);
    }
    return result;
  }

  global.DohunAI = Object.assign({}, original, {
    runClueClassifier,
    DEFINITIONS: definitions
  });
})(window);
