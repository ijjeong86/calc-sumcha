// 금융감독원 "금융상품 한눈에" 오픈API에서 예금·적금 금리를 받아 site/data/rates.json으로 저장해요.
// GitHub Actions가 매일 실행해요. 인증키는 FSS_API_KEY 비밀 값으로 넣어요.
import { writeFile, mkdir } from "node:fs/promises";

const KEY = process.env.FSS_API_KEY;
if (!KEY) { console.error("FSS_API_KEY가 없어요"); process.exit(1); }

const GROUPS = { "020000": "은행", "030300": "저축은행" };
const KINDS = { deposit: "depositProductsSearch", saving: "savingProductsSearch" };
const BASES = ["https://finlife.fss.or.kr/finlifeapi/", "http://finlife.fss.or.kr/finlifeapi/"];

async function getJSON(path) {
  let lastErr;
  for (const base of BASES) {
    try {
      const res = await fetch(base + path, { headers: { "User-Agent": "calc-sumcha-rates/1.0" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

async function fetchKind(kind, grp) {
  const base = [], opts = [];
  let page = 1, maxPage = 1;
  do {
    const j = await getJSON(`${KINDS[kind]}.json?auth=${KEY}&topFinGrpNo=${grp}&pageNo=${page}`);
    const r = j.result;
    if (!r || (r.err_cd && r.err_cd !== "000")) throw new Error(`API 오류 ${r?.err_cd} ${r?.err_msg}`);
    base.push(...(r.baseList || []));
    opts.push(...(r.optionList || []));
    maxPage = Number(r.max_page_no || 1);
    page++;
  } while (page <= maxPage);
  const byId = new Map(base.map(b => [b.fin_co_no + "|" + b.fin_prdt_cd, b]));
  const out = [];
  for (const o of opts) {
    const b = byId.get(o.fin_co_no + "|" + o.fin_prdt_cd);
    if (!b) continue;
    const rate = Number(o.intr_rate), max = Number(o.intr_rate2);
    if (!isFinite(rate) && !isFinite(max)) continue;
    out.push({
      g: GROUPS[grp],
      bank: b.kor_co_nm,
      name: b.fin_prdt_nm,
      term: Number(o.save_trm),
      type: o.intr_rate_type_nm || "",          // 단리 / 복리
      rsrv: o.rsrv_type_nm || "",               // 적금: 정액적립식 / 자유적립식
      base: isFinite(rate) ? rate : null,
      max: isFinite(max) ? max : null,
      way: b.join_way || "",
      cond: (b.spcl_cnd || "").replace(/\s+/g, " ").trim().slice(0, 300),
      member: b.join_member || "",
      limit: b.max_limit ?? null,
      month: b.dcls_month || ""
    });
  }
  return out;
}

const data = { updated: new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10), deposit: [], saving: [] };
for (const kind of Object.keys(KINDS)) {
  for (const grp of Object.keys(GROUPS)) {
    const rows = await fetchKind(kind, grp);
    data[kind].push(...rows);
    console.log(kind, GROUPS[grp], rows.length);
  }
  data[kind].sort((a, b) => (b.max ?? b.base ?? 0) - (a.max ?? a.base ?? 0));
}
if (!data.deposit.length && !data.saving.length) { console.error("받아온 상품이 없어요"); process.exit(1); }
await mkdir("site/data", { recursive: true });
await writeFile("site/data/rates.json", JSON.stringify(data));
console.log("저장 완료", data.updated);
