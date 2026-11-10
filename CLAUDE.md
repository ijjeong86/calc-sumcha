# 숨차의 경제노트 (calc-sumcha.com) 작업 안내

정적 사이트. `site/`만 GitHub Pages로 배포돼요. `main`에 push하면 `.github/workflows/update-rates.yml`이 금리·환율·사진을 받고 `scripts/build-posts.mjs`로 글 페이지를 만들어 배포해요. 매일 06:17(KST)에도 실행돼서 날짜가 된 예약 글이 공개돼요.

사용자 답변·글은 항상 한국어로 써요.

## 새 정보 글 쓰는 법 (posts/YYYY-MM-DD-slug.md)

맨 위 정보 칸 형식은 기존 글을 그대로 따라요.

- `title`: 검색 키워드를 앞에, 뒤쪽은 답을 숨기는 질문·숫자형 훅
- `description`, `category`(세금·연금 / 월급·직장 / 대출·부동산 / 예적금·투자 / 지원금·혜택 / 경제 이슈 중 하나), `date`(미래 날짜면 그날 자동 공개), `slug`
- `image: "/img/posts/<slug>.jpg"`, `thumb: "첫 줄|둘째 줄"`, `icon:` (그림 썸네일 대비용)
- `photo:` Higgsfield로 만든 사진 주소 (아래 참고)
- `lead`, `summary`(3줄 요약 3개), `calc`(관련 계산기 url·label), `faq`, `sources`(공식 자료 링크)

본문은 `##` 소제목 4~6개, 표를 적극 사용. 숫자 예시는 계산해서 검증하고, 확정 안 된 제도는 "정부안·국회 통과 후 확정"이라고 적어요.

## 대표 사진 (필수)

글마다 Higgsfield `gpt_image_2_6`, 정사각(1:1) 사진 1장을 만들어 `photo:`에 결과 주소를 넣어요 (약 0.25크레딧).
프롬프트 형식: "Editorial lifestyle photograph for a Korean personal finance article about <주제>. <주제에 맞는 소품·장면>, soft natural light, <분류 색> tones, clean minimal composition, no readable text, no logos, no faces. Realistic magazine photo."
분류 색: 세금·연금 green, 월급·직장 blue, 대출·부동산 warm orange/beige, 예적금·투자 purple, 지원금·혜택 pink/cream, 경제 이슈 teal.
그림 썸네일도 같이 만들어 둬요: `python3 scripts/thumbs.py` (사진을 못 받을 때 대신 쓰여요).

## 그 밖에

- 메뉴는 `site/*.html`의 topnav를 같이 고쳐야 해요 (글 페이지는 `site/car.html`의 메뉴를 복사해 만들어요).
- 시즌 바로가기는 `scripts/season.mjs`의 SEASONS에서 바꿔요.
- 금리 API 키(`FSS_API_KEY`), 환율 키(`KOREAEXIM_API_KEY`, 선택)는 GitHub Secrets에만 있어요. 파일에 쓰지 않아요.
- 디자인을 바꾸면 `style.css?v=` 값을 올려 캐시를 갱신해요.
