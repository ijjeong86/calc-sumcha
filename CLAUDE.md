# 숨차의 경제노트 (calc-sumcha.com) 작업 안내

정적 사이트. `site/`만 GitHub Pages로 배포돼요. `main`에 push하면 `.github/workflows/update-rates.yml`이 금리·환율·사진을 받고 `scripts/build-posts.mjs`로 글 페이지를 만들어 배포해요. 매일 06:17(KST)에도 실행돼서 날짜가 된 예약 글이 공개돼요.

사용자 답변·글은 항상 한국어로 써요.

## 새 정보 글 쓰는 법 (posts/YYYY-MM-DD-slug.md)

맨 위 정보 칸 형식은 기존 글을 그대로 따라요.

- `title`: 검색 키워드를 앞에, 뒤쪽은 답을 숨기는 질문·숫자형 훅
- `description`, `category`(세금·연금 / 월급·직장 / 대출·부동산 / 예적금·투자 / 지원금·혜택 / 할인·쿠폰 / 경제 이슈 중 하나), `date`(미래 날짜면 그날 자동 공개), `slug`
- `image: "/img/posts/<slug>.jpg"`, `thumb: "첫 줄|둘째 줄"`, `icon:` (그림 썸네일 대비용)
- `photo:` Higgsfield로 만든 사진 주소 (아래 참고)
- `lead`, `summary`(3줄 요약 3개), `calc`(관련 계산기 url·label), `faq`, `sources`(공식 자료 링크)

글은 계산기형(계산기로 이어지는 글)과 정보형(신청 방법·조건·제도 해설, calc 생략, 관련 글 링크)을 반반 섞어요. 지원금·혜택은 사용자 블로그가 지금 다루지 않아서 이 사이트가 맡아요.

본문은 `##` 소제목 4~6개, 표를 적극 사용. 숫자 예시는 계산해서 검증하고, 확정 안 된 제도는 "정부안·국회 통과 후 확정"이라고 적어요.

## 할인·쿠폰 글 (/posts/deals/)

쇼핑몰·여행·카드 할인 정리 글이에요. 맨 위에 `group:`(해외직구 / 여행 / 패션·뷰티 / 카드 혜택)을 넣으면 분류 페이지에서 묶음별로 보여요.
- 확인 안 된 할인코드는 쓰지 않아요. 행사 일정·카드사 이벤트처럼 공식 자료로 확인한 것만 적고, 미발표 일정은 "공식 발표 전"이라고 적어요.
- 해외직구 글은 면세 한도(150달러·미국 특송 200달러)와 `/customs.html` 계산기로 이어요.
- 카드 글은 제휴(발급) 링크 없이 정보만 써요. 제휴 링크(알리·테무 어필리에이트 등)를 넣으면 글 아래에 수수료 안내 문구를 함께 넣어요.
- 행사가 바뀌면 새 글을 쓰지 않고 **같은 파일을 고쳐요** (주소를 지켜야 검색 순위가 쌓여요).

### 할인·쿠폰 글 정기 갱신

- 글 맨 위 `refresh:`가 확인 주기예요: `weekly`(7일) / `biweekly`(14일) / `monthly`(달이 바뀌면) / `quarterly`(90일). 행사가 몰리는 시기엔 주기를 바꿔도 돼요.
- `node scripts/deals-due.mjs`로 확인할 때가 된 글을 봐요.
- 고칠 때: ① 끝난 행사는 `deals:`에서 빼고, 공식 페이지(쇼핑몰·카드사·보도자료)에서 확인한 새 행사만 넣어요 (name·period·url·note, 제휴 링크면 `sponsored: "true"`). ② 본문·요약의 날짜·숫자도 맞춰요. ③ `updated:`를 오늘로 바꾸고 `log:` 맨 위에 "YYYY-MM-DD: 바뀐 내용"을 한 줄 추가해요.
- 제목 앞 `[YYYY년 M월]`은 `updated:` 날짜로 자동으로 붙어요. 제목에 연도를 따로 쓰지 않아요.

## 대표 사진 (필수)

글마다 Higgsfield `gpt_image_2_6`, 정사각(1:1) 사진 1장을 만들어 `photo:`에 결과 주소를 넣어요 (약 0.25크레딧).
프롬프트 형식: "Editorial lifestyle photograph for a Korean personal finance article about <주제>. <주제에 맞는 소품·장면>, soft natural light, <분류 색> tones, clean minimal composition, no readable text, no logos, no faces. Realistic magazine photo."
분류 색: 세금·연금 green, 월급·직장 blue, 대출·부동산 warm orange/beige, 예적금·투자 purple, 지원금·혜택 pink/cream, 할인·쿠폰 warm amber/cream, 경제 이슈 teal.
그림 썸네일도 같이 만들어 둬요: `python3 scripts/thumbs.py` (사진을 못 받을 때 대신 쓰여요).

## 그 밖에

- 계산기 아래 설명(계산 기준·예시·FAQ·관련 글)은 `scripts/calc-guides.py`에서 고치고 `python3 scripts/calc-guides.py`로 다시 넣어요. 계산기 상수(세율·요율·상한액)를 바꾸면 여기 숫자도 같이 고쳐요.
- 애드센스 코드(pub-6702302972903144)와 `site/ads.txt`가 있어요. 새 페이지를 만들면 `<head>`에 같은 코드를 넣어요.

- 메뉴는 `site/*.html`의 topnav를 같이 고쳐야 해요 (글 페이지는 `site/car.html`의 메뉴를 복사해 만들어요).
- 시즌 바로가기는 `scripts/season.mjs`의 SEASONS에서 바꿔요.
- 금리 API 키(`FSS_API_KEY`), 환율 키(`KOREAEXIM_API_KEY`, 선택)는 GitHub Secrets에만 있어요. 파일에 쓰지 않아요.
- 디자인을 바꾸면 `style.css?v=` 값을 올려 캐시를 갱신해요. 글꼴은 SUIT(본문·제목·숫자 모두)예요.
- 방문자 그래프(site/visitors.js)는 사주노트 서버 `https://saju-note.co.kr/api/account?action=visit&site=calc` (Upstash Redis)에서 숫자를 받아요. 안 되면 예전 무료 카운터(abacus)로 넘어가요.
