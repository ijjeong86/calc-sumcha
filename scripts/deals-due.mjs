// 다시 확인할 때가 된 할인·쿠폰 글을 알려 줘요.
// 사용: node scripts/deals-due.mjs [YYYY-MM-DD]   (날짜를 빼면 오늘, 한국 시간)
// 글 맨 위 refresh: daily(매일) / weekly(7일) / biweekly(14일) / monthly(달이 바뀌면) / quarterly(90일), 기준은 updated: 날짜
import { readdir, readFile } from "node:fs/promises";
const today = process.argv[2] || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const g = (src, k) => { const m = src.match(new RegExp(`^${k}:\\s*"?([^"\\n]*)"?`, "m")); return m ? m[1].trim() : ""; };
const due = [], ok = [];
for (const f of (await readdir("posts")).filter(n => n.endsWith(".md")).sort()) {
  const src = await readFile(`posts/${f}`, "utf8");
  const refresh = g(src, "refresh"); if (!refresh) continue;
  const last = g(src, "updated") || g(src, "date");
  const d = days(last, today);
  const isDue = refresh === "daily" ? d >= 1 : refresh === "weekly" ? d >= 7 : refresh === "biweekly" ? d >= 14 : refresh === "quarterly" ? d >= 90
    : refresh === "monthly" ? today.slice(0, 7) > last.slice(0, 7) : false;
  (isDue ? due : ok).push(`${f}  (${refresh}, 마지막 확인 ${last}, ${d}일 전)`);
}
console.log(`기준일 ${today}\n\n다시 확인할 글 ${due.length}편:\n${due.map(x => "  - " + x).join("\n") || "  없음"}\n\n아직 괜찮은 글 ${ok.length}편:\n${ok.map(x => "  - " + x).join("\n")}`);
