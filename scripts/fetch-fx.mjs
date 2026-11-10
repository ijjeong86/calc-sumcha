// 달러·엔 환율을 받아 site/data/fx.json으로 저장해요. GitHub Actions가 매일 실행해요.
// 1순위: 한국수출입은행 환율 API (비밀 값 KOREAEXIM_API_KEY가 있을 때, 은행 매매기준율과 같은 기준)
// 2순위: Frankfurter(유럽중앙은행 기준환율) → 3순위: open.er-api.com
import { writeFile, mkdir } from "node:fs/promises";

const KEY = process.env.KOREAEXIM_API_KEY;
const kst = d => new Date(d.getTime() + 9 * 3600e3);
const ymd = d => kst(d).toISOString().slice(0, 10);
const num = s => Number(String(s).replace(/,/g, ""));

async function getJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": "calc-sumcha-fx/1.0" } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function fromExim() {
  const days = [];
  for (let i = 0; i < 12 && days.length < 2; i++) {
    const d = new Date(Date.now() - i * 864e5);
    const ds = ymd(d).replace(/-/g, "");
    let list = null;
    for (const base of ["https://oapi.koreaexim.go.kr", "http://oapi.koreaexim.go.kr"]) {
      try { list = await getJSON(`${base}/site/program/financial/exchangeJSON?authkey=${KEY}&searchdate=${ds}&data=AP01`); break; } catch { }
    }
    if (!Array.isArray(list) || !list.length) continue;
    const usd = list.find(x => x.cur_unit === "USD"), jpy = list.find(x => String(x.cur_unit).startsWith("JPY"));
    if (!usd || !jpy || usd.result !== 1) continue;
    days.push({ date: ymd(d), usd: num(usd.deal_bas_r), jpy100: num(jpy.deal_bas_r) });
  }
  if (!days.length) throw new Error("수출입은행 환율이 비어 있어요");
  return { source: "한국수출입은행 매매기준율", days };
}

async function fromFrankfurter() {
  const end = ymd(new Date()), start = ymd(new Date(Date.now() - 14 * 864e5));
  let j;
  for (const base of ["https://api.frankfurter.dev/v1", "https://api.frankfurter.app"]) {
    try { j = await getJSON(`${base}/${start}..${end}?from=USD&to=KRW,JPY`); break; } catch { }
  }
  if (!j || !j.rates) throw new Error("Frankfurter 응답이 없어요");
  const days = Object.keys(j.rates).sort().reverse().slice(0, 2).map(date => {
    const r = j.rates[date];
    return { date, usd: r.KRW, jpy100: r.KRW / r.JPY * 100 };
  });
  if (!days.length) throw new Error("Frankfurter 환율이 비어 있어요");
  return { source: "유럽중앙은행 기준환율", days };
}

async function fromErApi() {
  const j = await getJSON("https://open.er-api.com/v6/latest/USD");
  if (j.result !== "success") throw new Error("open.er-api 오류");
  return { source: "ExchangeRate-API", days: [{ date: ymd(new Date(j.time_last_update_unix * 1000)), usd: j.rates.KRW, jpy100: j.rates.KRW / j.rates.JPY * 100 }] };
}

const tries = [...(KEY ? [fromExim] : []), fromFrankfurter, fromErApi];
let out, errs = [];
for (const f of tries) {
  try { out = await f(); break; } catch (e) { errs.push(f.name + ": " + e.message); }
}
if (!out) { console.error("환율을 받지 못했어요\n" + errs.join("\n")); process.exit(1); }

const [now, prev] = out.days;
const r2 = n => Math.round(n * 100) / 100;
const data = {
  updated: ymd(new Date()),
  date: now.date,
  source: out.source,
  usd: { rate: r2(now.usd), prev: prev ? r2(prev.usd) : null },
  jpy100: { rate: r2(now.jpy100), prev: prev ? r2(prev.jpy100) : null },
};
await mkdir("site/data", { recursive: true });
await writeFile("site/data/fx.json", JSON.stringify(data, null, 1));
console.log(`환율 저장: 달러 ${data.usd.rate}원, 100엔 ${data.jpy100.rate}원 (${data.source}, ${data.date})`);
