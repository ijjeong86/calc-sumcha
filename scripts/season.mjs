// 시즌 바로가기: 날짜에 맞춰 위 메뉴의 '●' 링크와 홈 큰 카드를 바꾸거나 숨겨요.
// GitHub Actions가 매일 아침 실행해요. 시즌을 바꾸려면 아래 SEASONS만 고치면 돼요.
// 테스트: SEASON_DATE=2027-03-01 node scripts/season.mjs
import { readdir, readFile, writeFile } from "node:fs/promises";

const today = process.env.SEASON_DATE || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const [Y, M] = today.split("-").map(Number);
const md = today.slice(5);

// from/to는 월-일 (둘 다 포함). 위에 있는 시즌이 먼저 적용돼요.
const SEASONS = [
  { from: "11-01", to: "12-31", menu: "연말정산", href: "/yearend.html",
    tag: "지금 많이 찾는 계산기", title: `${Y} 연말정산 계산기`,
    desc: "12월 31일 전에 환급액을 미리 계산하고, 남은 기간 카드·연금저축 전략까지 확인하세요.", btn: "환급액 계산하기 →" },
  { from: "01-01", to: "02-29", menu: "연말정산", href: "/yearend.html",
    tag: "지금 많이 찾는 계산기", title: `${Y - 1}년 귀속 연말정산 계산기`,
    desc: "간소화 자료가 나왔다면 숫자만 옮겨 넣고 환급액과 추가 납부액을 바로 확인하세요.", btn: "환급액 확인하기 →" },
  { from: "05-01", to: "05-31", menu: "장려금 신청", href: "/posts/support/",
    tag: "5월 31일까지", title: "근로·자녀장려금 정기신청",
    desc: "소득·재산 조건과 받을 수 있는 금액을 확인하고 기간 안에 신청하세요.", btn: "조건 확인하기 →" },
  { from: "07-01", to: "07-25", menu: "부가세 신고", href: "/vat.html",
    tag: "7월 25일까지", title: "부가세 확정신고 계산기",
    desc: "1~6월 매출과 매입을 넣고 신고 때 낼 부가세를 미리 계산하세요.", btn: "부가세 계산하기 →" },
];
const s = SEASONS.find(x => x.from <= md && md <= x.to) || null;

const menuHtml = cur => s ? `<a class="m-season" href="${s.href}"${cur === s.href ? ' aria-current="page"' : ""}>${s.menu}</a>` : "";
const cardHtml = s ? `
  <a class="season" href="${s.href.replace(/^\//, "")}">
    <div><span class="tag">${s.tag}</span><h2>${s.title}</h2><p>${s.desc}</p></div>
    <span class="go">${s.btn}</span>
  </a>
  ` : "";

let n = 0;
for (const name of await readdir("site")) {
  if (!name.endsWith(".html") || name.startsWith("google")) continue;
  const f = `site/${name}`;
  const src = await readFile(f, "utf8");
  let out = src.replace(/<!--S-->[\s\S]*?<!--\/S-->/g, `<!--S-->${menuHtml("/" + name)}<!--/S-->`);
  out = out.replace(/<!--SEASON-->[\s\S]*?<!--\/SEASON-->/, `<!--SEASON-->${cardHtml}<!--/SEASON-->`);
  if (out !== src) { await writeFile(f, out); n++; }
}
console.log(`시즌 ${today}: ${s ? s.menu : "없음 (숨김)"} · ${n}개 파일 갱신`);
