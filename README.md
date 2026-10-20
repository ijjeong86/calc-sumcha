# 숨차의 계산기 (calc-sumcha.com)

- `site/` : 사이트 파일 (Netlify가 이 폴더를 그대로 올려요)
- `scripts/fetch-rates.mjs` : 금융감독원 오픈API에서 예금·적금 금리를 받아 `site/data/rates.json`으로 저장
- `.github/workflows/update-rates.yml` : 매일 오전 6시쯤 금리를 자동으로 갱신

인증키는 GitHub 저장소 Settings → Secrets and variables → Actions 에 `FSS_API_KEY` 이름으로 넣어요.
