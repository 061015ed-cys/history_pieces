# History Pieces 기록새·TimeTrace 최종 검수 (2026-08-08)

## 기준본

- 비교 기준: 2026-08-07 `HistoryPieces_merged.zip`
- 기준 ZIP SHA-256: `58d85bb0c2d934bfce31363b9c57f83d6dfe007a2fd1cce9c26b7e5bfb59636c`
- 기준 ZIP 무결성 검사: 통과

## 기록새 이미지 배치

| 이미지 | 적용 화면 |
|---|---|
| `giroksae-mission.png` | 첫 등장, 조각 미션, 다음 장소 이동, 돌발 미션 |
| `giroksae-reward.png` | 조각 획득, 감상 응답, 장소 이야기 완성 |
| `giroksae-record.png` | 웹툰 기록새 패널, 5초 기록, 감상 질문, 여정 기록 정리 |

- 업로드 원본 PNG와 포함된 세 이미지의 SHA-256이 각각 일치함
- DOM 실행 후 기록새 이미지 19개 확인
- 기존 기록새 자리표시자로 치환된 이미지 0개
- HTML 정적 화면과 와이어프레임 동적 화면의 용도별 매핑 일치

## TimeTrace 유지 확인

- 조각 1: `MST` / 목포역 → 조각 획득
- 조각 2: `HNB` / 호남은행 목포지점 → 돌발 미션 → 조각 획득
- 조각 3: `MMH2` / 동양척식주식회사 목포지점 → 돌발 미션 → 조각 획득
- `addons/timetrace/` 파일 36개의 파일 목록과 SHA-256이 기준본과 전부 동일함
- `timetrace-host-0807.js`, `timetrace-host-0807.css`도 기준본과 동일함
- TimeTrace 설정이 참조하는 이미지·영상 29개 존재 확인
- 로컬 HTTP에서 TimeTrace ES 모듈, JSON 설정, 기록새 PNG 응답 확인

## 기준본 보존 비교

- 삭제된 파일: 0개
- 기능 코드 중 `script.js`, `style.css`, 다국어 UI, 고정 웹툰, TimeTrace 호스트 코드는 기준본과 동일
- 화면 변경은 기록새 이미지 경로와 브라우저 캐시 버전 표시에 한정
- 와이어프레임 변경은 깃털 자리표시자를 용도에 맞는 기록새 이미지로 교체한 부분에 한정

## 다른 PC 실행

- `RUN_ONE_CLICK.bat`이 Python 모델 환경을 자동 감지함
- 모델 환경이 있으면 기존 `run_integrated.py`를 사용함
- 모델 환경이 없으면 `START_NO_INSTALL.bat`과 Windows 기본 PowerShell 서버를 사용함
- 무설치 서버는 ES 모듈, JSON, PNG/JPG, MP4와 영상 Range 요청을 지원함
- PowerShell 서버 구문 파싱 통과
- 다른 PC에서도 `index.html` 직접 실행 없이 `http://127.0.0.1:5517`로 TimeTrace를 실행하도록 구성함

## 정적 검증 결과

- Python·JavaScript·JSON 구문 검사 통과
- HTML ID 148개, 중복 0개
- 활성 화면 1개 유지
- 세 PTH 모델 파일 존재 확인
- 고정 웹툰과 샘플 사진 경로 분리 유지
- 생성형 API 및 키 파일 미포함 유지
