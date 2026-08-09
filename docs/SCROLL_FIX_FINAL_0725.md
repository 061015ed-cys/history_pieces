# 언어·국가 선택 스크롤 최종 수정

## 이전 수정이 작동하지 않은 원인

목록 카드에 `overflow-y: scroll`만 적용했지만 자동 화면 높이 보정 코드가 설정 화면의 레이아웃 높이를 다시 자동으로 변경했습니다. 그 결과 목록 카드가 제한된 스크롤 영역이 아니라 내용 전체 높이로 늘어나면서 실제 스크롤이 만들어지지 않았습니다.

## 이번 수정

- 언어·국가 선택 화면을 자동 높이 보정 대상에서 제외
- 목록 카드 높이를 `220px ~ 330px` 범위로 명확히 제한
- 카드에 `overflow-y: auto`, `touch-action: pan-y`, iOS 관성 스크롤 적용
- 데스크톱/VS Code 내장 브라우저에서 마우스휠이 전달되지 않는 경우를 위한 wheel 이벤트 보조 처리
- 키보드 방향키·Page Up/Down·Home·End 스크롤 지원
- 페이지 전체 스크롤도 안전망으로 허용
- CSS/JS 주소에 버전 값을 붙여 이전 브라우저 캐시를 사용하지 않도록 처리

## 변경 파일

- `addons/integrated-ui-0725.css`
- `addons/integrated-ui-0725.js`
- `run_integrated.py`

공통틀의 `index.html`, `style.css`, `script.js`와 기존 `modules` 파일은 변경하지 않았습니다.

## 적용 후 실행

1. 실행 중인 CMD 서버를 종료합니다.
2. `start_integrated.bat`을 다시 실행합니다.
3. 새 버전 주소가 자동 적용되므로 기존과 달리 강력 새로고침이 필수는 아닙니다.
