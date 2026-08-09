# UI layout and recommendation route final verification

## Fixed screens
- Piece story 3 webtoon: title and SCENE 01 start visible at scrollTop 0
- Journey film: title visible at scrollTop 0
- Reservation complete: title visible at scrollTop 0
- Nickname: title visible at scrollTop 0
- First record: title visible at scrollTop 0

Long content starts at the top and remains vertically scrollable. Short content keeps the existing centered layout where possible.

## Recommendation route
The detail view for every recommendation is rendered in this fixed order:

`목포역 → selected destination`

Verified destinations:
- 목포근대역사관 1관
- 1897 개항문화거리
- 목포진 역사공원

The destination element keeps the existing `next-place-map-destination` ID, so the common recommendation code continues to update it automatically.

## Automated render checks
- Desktop viewport: 1280 x 900
- Mobile viewport: 390 x 844
- JavaScript page errors: 0
- Top clipping detected: 0
- Route node order failures: 0

Detailed measurements:
- `docs/final-layout-route-audit.json`
- `docs/final-layout-route-audit-mobile.json`

Screenshots:
- `docs/fix-audit-piece3.png`
- `docs/fix-audit-journey.png`
- `docs/fix-audit-reservation.png`
- `docs/fix-audit-nickname.png`
- `docs/fix-audit-firstrecord.png`
- `docs/fix-audit-route-1.png`
- `docs/fix-audit-route-2.png`
- `docs/fix-audit-route-3.png`
