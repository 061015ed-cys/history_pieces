# TimeTrace 3개 조각 통합 확인서 (2026-08-07)

## 와이어프레임 대조 결과

| 조각 | 현재 장소 | TimeTrace 장소 ID | TimeTrace 이후 과거 명칭 | 완료 후 화면 |
| --- | --- | --- | --- | --- |
| 1 | 목포역 | MST | 목포역 | 첫 번째 조각 획득 |
| 2 | 목포 대중음악의 전당 | HNB | 호남은행 목포지점 | 호남은행 돌발 미션 |
| 3 | 목포근대역사관 2관 | MMH2 | 동양척식주식회사 목포지점 | 위조 기록 돌발 미션 |

세 조각 모두 `미션 안내 → 사진 선택·확정 → 장소 확인 → TimeTrace → 후속 미션/조각 획득` 순서로 연결되어 있습니다.

## 적용 내용

- 기존 임시 오버레이 대신 전달받은 TimeTrace 모듈과 MST/HNB/MMH2 승인 자산을 연결했습니다.
- 장소 확인 화면에서 `시간 맞추기`를 누르면 해당 조각의 TimeTrace가 열립니다.
- 사용자가 촬영한 사진이 있으면 TimeTrace의 최초 촬영 참조로 전달하고, 샘플 진행에서는 장소별 승인 자산을 사용합니다.
- TimeTrace 완료 결과를 `appState.timeTraceResults[1~3]`에 저장합니다.
- TimeTrace 로드 실패 시에도 흐름이 멈추지 않도록 안전 진행 분기를 적용했습니다.
- 기존 웹툰, PTH 모델, 중국어/중국 해설 모드, 5초 영상, 감상, 추천 흐름은 유지했습니다.

## 점검

- `verify_integrated.py`: 통과
- JavaScript/Python/JSON 구문 검사: 통과
- HTML ID 중복: 0건
- TimeTrace 세 장소 코드·자산·영상 HTTP 경로: 28/28 정상
- TimeTrace 원본 모듈 integration smoke test: 통과
- 세 PTH 모델 파일 존재 및 크기 검사: 통과

Windows에서는 `RUN_ONE_CLICK.bat`을 실행하면 통합 검사 후 서버가 시작됩니다.
