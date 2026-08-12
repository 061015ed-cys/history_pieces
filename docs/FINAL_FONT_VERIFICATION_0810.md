# History Pieces 폰트 적용 최종 점검 (2026-08-10)

## 적용 기준

- 화면 제목·질문·선택 문구: `MuseumClassicM`
- 일반 본문·기록새 안내·버튼: `AritaBuriKR-SemiBold`
- 상단 레이블·강조 문구: `AritaBuriKR-Bold`
- 제외: `MuseumClassicB`, `MuseumClassicL`
- 제외 범위: `TimeTrace` 화면의 기존 폰트

## 변경 파일

- `index.html`: 폰트 전용 스타일시트 연결 1줄 추가
- `addons/history-pieces-fonts-0810.css`: 폰트 선언과 적용 범위 추가
- `assets/fonts/AritaBuriKR-Bold.ttf`
- `assets/fonts/AritaBuriKR-SemiBold.ttf`
- `assets/fonts/MuseumClassicM.TTF`
- `verify_fonts_0810.py`: 폰트·제외 범위 재검사용

기존 기능 파일, 화면 구조, 문구, 라우팅 및 TimeTrace 파일은 수정하지 않았다.

## 최종 점검 결과

- 기존 통합 검증 `verify_integrated.py`: 통과
- Python·JavaScript·JSON 문법 및 HTML ID 중복 검사: 통과
- 원본 대조: 기존 파일 156개 동일, 변경 파일은 `index.html` 1개뿐
- 추가 파일: 폰트 3개, 폰트 CSS 1개, 검증 자료
- 폰트 파일 무결성 및 한글 표본 글리프 확인: 통과
- `MuseumClassicM`의 손상된 원본 kerning 테이블을 글자 형태와 kerning 쌍을 유지한 웹 호환 구조로 재정렬
- Chromium 실구동 폰트 로드 확인: Museum M·Arita SemiBold·Arita Bold 모두 통과
- CSS와 폰트 파일 HTTP 응답 및 MIME(`text/css`, `font/ttf`) 확인: 통과
- `MuseumClassicB/L` 파일·참조 부재: 확인
- TimeTrace CSS 및 호스트 CSS 원본 SHA-256 유지: 확인

## 다시 점검하는 방법

프로젝트 폴더에서 아래 두 파일을 차례대로 실행한다.

```text
python verify_integrated.py
python verify_fonts_0810.py
```
