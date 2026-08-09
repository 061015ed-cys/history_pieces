export const REQUIRED_FIELDS = Object.freeze([
  "missionStatus",
  "alignmentStatus",
  "guidance",
  "captures",
  "selection",
  "overlay",
  "placeId",
  "pieceNumber",
  "totalPieces",
]);

const ALIGNMENT_STATUS = Object.freeze({
  aligned: "ready",
  ready: "ready",
  retry: "retake_required",
  retake_required: "retake_required",
  unsupported: "unsupported",
  not_evaluated: "unsupported",
  pending: "pending",
});

const GUIDANCE_DIRECTION = Object.freeze({
  MOVE_BACK: "back",
  MOVE_FORWARD: "forward",
  MOVE_LEFT: "left",
  MOVE_RIGHT: "right",
  LOWER_PHONE: "down",
  OCCLUSION: "hold",
});

const positiveInteger = (value, fallback) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
};

export function resolveCaptureDate({ captureDate, manifestCaptureDate, now = new Date() } = {}) {
  const source = captureDate ?? manifestCaptureDate;
  const dateParts = source ? String(source).match(/\d+/g)?.slice(0, 3) : null;
  const value = dateParts?.length === 3
    ? new Date(`${dateParts[0]}-${dateParts[1].padStart(2, "0")}-${dateParts[2].padStart(2, "0")}T00:00:00+09:00`)
    : new Date(now);
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const read = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}. ${read("month")}. ${read("day")}.`;
}

const definedEntries = (object) => Object.fromEntries(
  Object.entries(object).filter(([, value]) => value !== undefined),
);

function normalizeGuidance(value) {
  const items = Array.isArray(value) ? value : value ? [value] : [];
  return items.map((item) => {
    const source = typeof item === "string" ? { code: item } : item;
    const code = source.code ?? source.guidanceCode ?? "UNSPECIFIED";
    return {
      code,
      message: source.message ?? source.label ?? source.text ?? null,
      direction: source.direction ?? GUIDANCE_DIRECTION[code] ?? "none",
    };
  });
}

function looksLikePreview(value) {
  return typeof value === "string" && (
    /^(https?:|data:|blob:|\/)/i.test(value)
    || /\.(?:avif|gif|jpe?g|png|webp)(?:[?#].*)?$/i.test(value)
  );
}

function normalizeCapture(value, fallbackRef, explicitUrl, fallbackUrl) {
  const source = value && typeof value === "object" ? value : {};
  const primitiveRef = typeof value === "string" && !looksLikePreview(value) ? value : null;
  const primitiveUrl = looksLikePreview(value) ? value : null;
  const ref = fallbackRef ?? source.ref ?? source.id ?? primitiveRef ?? null;
  const previewUrl = explicitUrl ?? source.previewUrl ?? source.url ?? primitiveUrl ?? fallbackUrl ?? null;
  return ref || previewUrl ? { ref, previewUrl } : null;
}

export function normalizeTimeTracePayload(input = {}) {
  const assets = input.assets ?? {};
  const overlayInput = input.overlay ?? {};
  const selectionInput = input.selection ?? {};
  const capturesInput = input.captures ?? {};
  const alignmentStatus = ALIGNMENT_STATUS[
    input.alignmentStatus ?? input.overlayStatus ?? "pending"
  ] ?? "unsupported";
  const historicalYear = overlayInput.historicalYear
    ?? input.historicalYear
    ?? assets.historicalYear
    ?? null;
  const currentImage = overlayInput.currentImage
    ?? assets.currentImage
    ?? input.currentImage
    ?? input.initialCaptureUrl
    ?? null;
  const initial = normalizeCapture(
    capturesInput.initial ?? input.initialCapture,
    input.initialCaptureRef,
    input.initialCaptureUrl,
    currentImage,
  );
  const retake = normalizeCapture(
    capturesInput.retake ?? input.retakeCapture,
    input.retakeCaptureRef,
    input.retakeCaptureUrl,
    null,
  );
  const selected = selectionInput.selected ?? input.selectedCapture ?? null;
  const selectedCapture = selected === "retake" && retake ? "retake" : selected === "initial" ? "initial" : null;
  const selectedObject = selectedCapture === "retake" ? retake : selectedCapture === "initial" ? initial : null;
  const pieceNumber = positiveInteger(input.pieceNumber, 1);
  const totalPieces = Math.max(pieceNumber, positiveInteger(input.totalPieces, 3));
  const sequenceIndex = positiveInteger(input.sequenceIndex, pieceNumber);
  const sequenceTotal = Math.max(sequenceIndex, positiveInteger(input.sequenceTotal, totalPieces));
  const maxAttempts = Math.min(2, positiveInteger(input.maxRetakes ?? input.retake?.maxAttempts, 1));
  const overlay = {
    ready: Boolean(overlayInput.ready ?? input.overlayReady ?? alignmentStatus === "ready"),
    currentImage,
    alignedHistoricalRgba: overlayInput.alignedHistoricalRgba ?? assets.alignedHistoricalRgba ?? input.alignedHistoricalRgba ?? null,
    historicalSourceImage: overlayInput.historicalSourceImage ?? assets.historicalSourceImage ?? input.historicalSourceImage ?? null,
    aiRestoredScene: overlayInput.aiRestoredScene ?? assets.aiRestoredScene ?? input.aiRestoredScene ?? null,
    aiRestorationMetadata: overlayInput.aiRestorationMetadata ?? assets.aiRestorationMetadata ?? input.aiRestorationMetadata ?? null,
    backgroundGenerationMask: overlayInput.backgroundGenerationMask ?? assets.aiBackgroundGenerationMask ?? input.aiBackgroundGenerationMask ?? null,
    alphaMask: overlayInput.alphaMask ?? assets.historicalAlphaMask ?? input.historicalAlphaMask ?? null,
    staticPreview: overlayInput.staticPreview ?? assets.staticOverlayPreview ?? input.staticOverlayPreview ?? null,
    historicalYear,
    metadata: overlayInput.metadata ?? assets.overlayMetadata ?? input.overlayMetadata ?? null,
  };
  const normalized = {
    missionStatus: input.missionStatus === "passed" ? "passed" : input.missionStatus === "failed" ? "failed" : "pending",
    alignmentStatus,
    guidance: normalizeGuidance(input.guidance),
    captures: { initial, retake },
    selection: { selected: selectedCapture, selectedRef: selectionInput.selectedRef ?? selectedObject?.ref ?? null },
    overlay,
    placeId: input.placeId ?? null,
    placeName: input.placeName ?? null,
    currentPlaceName: input.currentPlaceName ?? input.placeName ?? null,
    currentDisplayName: input.currentDisplayName ?? input.currentPlaceName ?? input.placeName ?? null,
    captureDate: input.captureDate ?? null,
    currentDate: input.currentDate ?? resolveCaptureDate({
      captureDate: input.captureDate,
      manifestCaptureDate: input.manifestCaptureDate,
      now: input.now,
    }),
    historicalPlaceName: input.historicalPlaceName ?? input.placeName ?? null,
    historicalDisplayName: input.historicalDisplayName ?? input.historicalPlaceName ?? input.placeName ?? null,
    historicalYear,
    pieceNumber,
    totalPieces,
    sequenceIndex,
    sequenceTotal,
    completionSequenceLabel: input.completionSequenceLabel ?? null,
    retry: { attempt: positiveInteger(input.retake?.attempt, 1), maxAttempts },
    reason: input.reason ?? input.reasonCode ?? input.missionReason ?? "MISSION_MISMATCH",
    initialCapture: initial,
    retakeCapture: retake,
    selectedCapture,
    overlayStatus: alignmentStatus,
    currentImage: overlay.currentImage,
    historicalSourceImage: overlay.historicalSourceImage,
    aiRestoredScene: overlay.aiRestoredScene,
    aiRestorationMetadata: overlay.aiRestorationMetadata,
    alignedHistoricalRgba: overlay.alignedHistoricalRgba,
    historicalAlphaMask: overlay.alphaMask,
    staticOverlayPreview: overlay.staticPreview,
    overlayMetadata: overlay.metadata,
  };
  normalized.missingFields = REQUIRED_FIELDS.filter((key) => normalized[key] == null);
  return normalized;
}

export function createLiveAdapter({ aiResult, getResult, defaults = {} } = {}) {
  return {
    mode: "live",
    async load() {
      if (aiResult != null) {
        return normalizeTimeTracePayload({
          ...aiResult,
          ...definedEntries(defaults),
          assets: { ...(aiResult.assets ?? {}), ...(defaults.assets ?? {}) },
        });
      }
      if (typeof getResult !== "function") {
        return normalizeTimeTracePayload({
          ...defaults,
          missionStatus: "pending",
          alignmentStatus: "pending",
          guidance: [],
          // TODO(integration): inject the host's Mission AI and TimeTrace result.
        });
      }
      const result = await getResult();
      return normalizeTimeTracePayload({
        ...result,
        ...definedEntries(defaults),
        assets: { ...(result.assets ?? {}), ...(defaults.assets ?? {}) },
      });
    },
  };
}

export function createDemoAdapter(manifest, { scenario = "instant", placeId = "MMH2", overrides = {} } = {}) {
  const scenarioData = manifest.scenarios[scenario] ?? manifest.scenarios.instant;
  const place = manifest.places[placeId] ?? manifest.places.MMH2;
  const hasPlaceVideo = Object.prototype.hasOwnProperty.call(scenarioData.videoByPlace ?? {}, place.contract.placeId);
  const selectedVideoId = hasPlaceVideo ? scenarioData.videoByPlace[place.contract.placeId] : scenarioData.videoId;
  const selectedVideo = manifest.videos.find((item) => item.id === selectedVideoId) ?? null;
  const video = selectedVideo && (!hasPlaceVideo || scenarioData.videoByPlace[place.contract.placeId] === selectedVideo.id)
    ? selectedVideo
    : null;
  return {
    mode: "demo",
    async load() {
      const retakeScenario = scenarioData.contract.selectedCapture === "retake";
      return normalizeTimeTracePayload({
        ...place.contract,
        ...scenarioData.contract,
        captures: {
          initial: {
            ref: `${place.contract.placeId}-DEMO-INITIAL`,
            previewUrl: place.contract.currentImage,
          },
          retake: retakeScenario ? {
            ref: `${place.contract.placeId}-DEMO-${scenario.toUpperCase()}`,
            previewUrl: place.contract.currentImage,
          } : null,
        },
        ...definedEntries(overrides),
        assets: { ...(overrides.assets ?? {}) },
        placeName: overrides.placeName ?? place.label,
        currentPlaceName: overrides.currentPlaceName ?? place.contract.currentPlaceName ?? place.label,
        currentDisplayName: overrides.currentDisplayName ?? place.contract.currentDisplayName ?? place.contract.currentPlaceName ?? place.label,
        captureDate: overrides.captureDate ?? place.contract.captureDate ?? null,
        manifestCaptureDate: place.contract.captureDate ?? null,
        now: overrides.now,
        currentDate: overrides.currentDate ?? resolveCaptureDate({
          captureDate: overrides.captureDate,
          manifestCaptureDate: place.contract.captureDate,
          now: overrides.now,
        }),
        historicalPlaceName: overrides.historicalPlaceName ?? place.contract.historicalPlaceName ?? place.label,
        historicalDisplayName: overrides.historicalDisplayName ?? place.contract.historicalDisplayName ?? place.contract.historicalPlaceName ?? place.label,
      });
    },
    scenario: {
      ...scenarioData,
      video,
      guidance: {
        ...(scenarioData.guidance ?? {}),
        ...(place.guidanceProfile ?? {}),
      },
    },
  };
}

export function buildCompleteResult(data, demoMode) {
  return {
    missionPassed: data.missionStatus === "passed",
    alignmentStatus: data.alignmentStatus,
    pieceNumber: data.pieceNumber,
    totalPieces: data.totalPieces,
    selectedCapture: data.selection.selected,
    selectedCaptureRef: data.selection.selectedRef,
    placeId: data.placeId,
    overlayReady: data.overlay.ready,
    recordCardId: `TIMETRACE-${data.placeId}-${data.historicalYear}-P${data.pieceNumber}`,
    demoMode: Boolean(demoMode),
  };
}

export function buildRetryResult(data) {
  return {
    missionPassed: false,
    pieceNumber: data.pieceNumber,
    totalPieces: data.totalPieces,
    placeId: data.placeId,
    reason: data.reason,
  };
}
