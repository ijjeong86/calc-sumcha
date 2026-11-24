// 새로 공개되거나 고친 글 주소를 IndexNow로 검색엔진(네이버·빙 등)에 바로 알려요.
// GitHub Actions에서 배포가 끝난 뒤 실행해요. 실패해도 배포에는 영향이 없어요.
// 알리는 주소: 오늘·어제(한국 시간) 공개되거나 수정된 글 + 홈·글 목록·할인 허브 + 이번에 바뀐 site/*.html
import { readdir, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";
const KEY = "84b4abd893cffab331c87a26f8de5b5d"; // site/84b4abd893cffab331c87a26f8de5b5d.txt 와 같아야 해요
const SITE = "https://calc-sumcha.com";
const kst = d => new Date(d.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
const today = kst(new Date()), yest = kst(new Date(Date.now() - 864e5));
const urls = new Set([`${SITE}/`, `${SITE}/posts/`, `${SITE}/posts/deals/`]);
for (const f of (await readdir("posts")).filter(n => n.endsWith(".md"))) {
  const src = await readFile(`posts/${f}`, "utf8");
  const g = k => (src.match(new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, "m")) || [])[1] || "";
  const d = g("updated") || g("date"), slug = g("slug");
  if (slug && (d === today || d === yest) && g("date") <= today) urls.add(`${SITE}/posts/${slug}.html`);
}
try {
  const changed = execSync("git diff --name-only HEAD~1 HEAD -- site/*.html", { encoding: "utf8" }).split("\n").filter(Boolean);
  for (const c of changed) urls.add(`${SITE}/${c.replace(/^site\//, "").replace(/^index\.html$/, "")}`);
} catch { }
const body = JSON.stringify({ host: "calc-sumcha.com", key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: [...urls] });
for (const ep of ["https://searchadvisor.naver.com/indexnow", "https://api.indexnow.org/indexnow"]) {
  try {
    const r = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body });
    console.log(`${ep} → ${r.status} (${urls.size}개 주소)`);
  } catch (e) { console.log(`${ep} 실패: ${e.message}`); }
}
console.log([...urls].join("\n"));
