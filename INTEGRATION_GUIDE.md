# 통합 안내

이 폴더 자체가 실행 가능한 통합본입니다. 다른 폴더 안에 다시 복사할 필요가 없습니다.

1. `install_integrated.bat`을 최초 한 번 실행합니다.
2. `start_integrated.bat`을 실행합니다.
3. `http://127.0.0.1:5500`에서 화면을 확인합니다.

조각 웹툰 1·2·3은 로컬 고정 이미지로 동작하므로 생성형 API 키가 필요하지 않습니다. 장소 이야기의 사용자 사진 세 장 합성은 추후 작업 범위로 남겨두었습니다.

PTH 모델은 이미 `addons/models`에 포함되어 있습니다. 다른 모델로 교체할 때는 같은 파일명을 유지하세요.

- `first_piece_detection.pth`
- `second_piece_detection.pth`
- `third_piece_detection.pth`
