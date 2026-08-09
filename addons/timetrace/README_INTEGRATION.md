# TimeTrace 통합 패키지 (수동 진행)

이 폴더는 MST/HNB/MMH2 중 한 장소를 독립적으로 mount하는 ES module입니다. 기본값은 수동 진행이며 `mode: "demo"`도 자동 클릭하거나 다음 장소를 열지 않습니다.

## 로컬 실행

```powershell
python -m http.server 8081 --directory TimeTrace_integration_handoff_2026-08-05
```

- MST: http://127.0.0.1:8081/examples/mst-manual.html
- HNB: http://127.0.0.1:8081/examples/hnb-manual.html
- MMH2: http://127.0.0.1:8081/examples/mmh2-manual.html
- 호스트 예제: http://127.0.0.1:8081/examples/host-integration-example.html

## 삽입

```html
<link rel="stylesheet" href="./dist/timetrace.css">
<div id="timetrace-root"></div>
<script type="module">
import { mountTimeTrace } from "./dist/timetrace.js";
const instance = await mountTimeTrace({
  root: document.querySelector("#timetrace-root"),
  mode: "demo", embedded: true, scenario: "retake-back", placeId: "HNB",
  manifestUrl: "./config/places.json", autoAdvance: false,
  onComplete(result) { hostRouter.openNextScreen(result); }
});
// 호스트 화면 종료 시 instance.unmount() 또는 instance.destroy()
</script>
```

실제 live-ready 통합은 `mode: "live"`와 `aiResult` 또는 `getLiveResult`를 전달합니다. TimeTrace는 `이 구도로 기록하기`, `기록 열쇠 획득`, `완료` 클릭을 기다립니다. 완료 시 callback과 bubbling `timetrace:complete` 이벤트가 각각 정확히 한 번 발생합니다. retry는 `timetrace:retry`입니다.

완료 payload는 `missionPassed`, `alignmentStatus`, `pieceNumber`, `totalPieces`, `selectedCapture`, `selectedCaptureRef`, `placeId`, `overlayReady`, 호환 필드 `recordCardId`, `demoMode`를 포함합니다. 이후 라우팅은 호스트가 결정합니다.

| placeId | 현재 표시 | 역사 표시 | 순서 |
| --- | --- | --- | --- |
| MST | 목포역 | 목포역과 소화교 / 1932 | 01 — 03 |
| HNB | 목포 대중음악의 전당 | 호남은행 목포지점 / 1932 | 02 — 03 |
| MMH2 | 목포근대역사관 2관 | 동양척식주식회사 목포지점 / 1932 | 03 — 03 |

자산 URL은 예제 HTML을 기준으로 한 상대경로입니다. 다른 배치에서는 `places.json`의 상대경로 또는 호스트 `assets` override를 함께 조정하십시오. 승인된 `historical-source`, `aligned-historical-rgba`, mask, overlay metadata 및 원본 영상을 수정하지 마십시오. `checksums.sha256`으로 전달 파일을 검증할 수 있습니다. 패키지에는 자동 시연 runner가 없습니다.

세 장소의 정합 애니메이션은 현재 프레임에서 승인 AI 복원 장면 100%로 끝납니다. 실제 1932년 사진은 별도의 `1932 원본` 탭 자산이며 AI 복원 슬롯과 서로 다른 파일입니다.
