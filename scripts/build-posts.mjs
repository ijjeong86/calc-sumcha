// posts 폴더의 글(.md)을 사이트 글 페이지로 바꿔 site/posts/ 에 만들고,
// 글 목록(site/posts/index.html)과 사이트맵(site/sitemap.xml)을 새로 만듭니다.
// GitHub Actions가 사이트를 올릴 때마다 실행해요.
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";

// ---------- 외부 패키지 없이 쓰는 간단한 YAML · 마크다운 변환기 ----------
function unq(v) {
  v = v.trim();
  if (v.startsWith('"')) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
}
function parseYaml(src) {
  const lines = src.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#"));
  const out = {}; let i = 0;
  const ind = l => l.match(/^ */)[0].length;
  while (i < lines.length) {
    const m = lines[i].match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) { i++; continue; }
    const [, key, rest] = m; i++;
    if (rest.trim()) { out[key] = unq(rest); continue; }
    const block = [];
    while (i < lines.length && ind(lines[i]) > 0) block.push(lines[i++]);
    if (!block.length) { out[key] = ""; continue; }
    if (block[0].trim().startsWith("- ")) {
      const arr = []; let cur = null;
      for (const b of block) {
        const t = b.trim();
        if (t.startsWith("- ")) {
          const body = t.slice(2); const km = body.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
          if (km && !body.startsWith('"')) { cur = { [km[1]]: unq(km[2]) }; arr.push(cur); }
          else { cur = null; arr.push(unq(body)); }
        } else if (cur) { const km = t.match(/^([A-Za-z_][\w-]*):\s*(.*)$/); if (km) cur[km[1]] = unq(km[2]); }
      }
      out[key] = arr;
    } else {
      const obj = {};
      for (const b of block) { const km = b.trim().match(/^([A-Za-z_][\w-]*):\s*(.*)$/); if (km) obj[km[1]] = unq(km[2]); }
      out[key] = obj;
    }
  }
  return out;
}
const escH = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function inline(t) {
  t = escH(t);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, h) => {
    const ext = /^https?:/.test(h) && !h.startsWith(SITE);
    return `<a href="${h.replace(/"/g, "&quot;")}"${ext ? ' target="_blank" rel="noopener"' : ""}>${a}</a>`;
  });
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return t;
}
const marked = { parseInline: inline };
function mdToHtml(md, onH2) {
  const L = md.replace(/\r\n/g, "\n").split("\n"); let i = 0, out = "";
  const isTable = k => /^\s*\|.*\|\s*$/.test(L[k] || "") && /^\s*\|[\s:|-]+\|\s*$/.test(L[k + 1] || "");
  const cells = l => l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{2,4})\s+(.*)$/))) { const lv = m[1].length, txt = inline(m[2]); out += lv === 2 ? onH2(txt) : `<h${lv}>${txt}</h${lv}>\n`; i++; continue; }
    if (isTable(i)) {
      const hd = cells(L[i]); i += 2; let rows = "";
      while (i < L.length && /^\s*\|/.test(L[i])) { rows += `<tr>${cells(L[i]).map(c => `<td>${inline(c)}</td>`).join("")}</tr>`; i++; }
      out += `<div class="tablewrap"><table><thead><tr>${hd.map(c => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>\n`; continue;
    }
    if (/^\s*[-*]\s+/.test(l)) { let items = ""; while (i < L.length && /^\s*[-*]\s+/.test(L[i])) { items += `<li>${inline(L[i].replace(/^\s*[-*]\s+/, ""))}</li>`; i++; } out += `<ul>${items}</ul>\n`; continue; }
    if (/^\s*\d+[.)]\s+/.test(l)) { let items = ""; while (i < L.length && /^\s*\d+[.)]\s+/.test(L[i])) { items += `<li>${inline(L[i].replace(/^\s*\d+[.)]\s+/, ""))}</li>`; i++; } out += `<ol>${items}</ol>\n`; continue; }
    if (/^>\s?/.test(l)) { let q = []; while (i < L.length && /^>\s?/.test(L[i])) q.push(L[i++].replace(/^>\s?/, "")); out += `<blockquote><p>${inline(q.join(" "))}</p></blockquote>\n`; continue; }
    let para = [];
    while (i < L.length && L[i].trim() && !/^(#{2,4}\s|\s*[-*]\s|\s*\d+[.)]\s|>)/.test(L[i]) && !isTable(i)) para.push(L[i++].trim());
    out += `<p>${inline(para.join(" "))}</p>\n`;
  }
  return out;
}

const SITE = "https://calc-sumcha.com";
const CATS = { "연말정산·세금": "tax", "월급·직장": "work", "예적금·대출": "money", "자동차": "car", "생활·지원금": "life" };

// ---------- 공통 틀: car.html에서 머리말·광고·메뉴·바닥글을 가져와요 ----------
const tpl = await readFile("site/car.html", "utf8");
const abs = s => s.replace(/(href|src)="(?!https?:|#|\/|mailto:|tel:|data:)([^"]+)"/g, '$1="/$2"');
const headRaw = tpl.split("</head>")[0];
const rails = abs(tpl.split("<body>\n")[1].split('<div class="wrap">')[0]);
const navRaw = tpl.match(/<div class="topnav">[\s\S]*?<\/nav><\/div>/)[0];
const bottomStart = tpl.indexOf("  <!-- [쿠팡파트너스 상품 자리]");
const noteEnd = tpl.indexOf("</p>", tpl.indexOf('id="coupangNote"')) + 4;
const bottom = abs(tpl.slice(bottomStart, noteEnd));
const tail = abs(tpl.slice(tpl.indexOf('<div class="visit"')));
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function head({ title, desc, url, image, extra = "" }) {
  let h = headRaw;
  h = h.replace(/<title>.*?<\/title>/, `<title>${esc(title)}</title>`);
  h = h.replace(/(<meta name="description" content=")[^"]*/, `$1${esc(desc)}`);
  h = h.replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`);
  h = h.replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(desc)}`);
  h = h.replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);
  h = h.replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`);
  h = h.replace(/(<meta property="og:image" content=")[^"]*/, `$1${image}`);
  h = h.replace(/(<meta property="og:type" content=")[^"]*/, `$1article`);
  return abs(h) + extra + "\n</head>\n<body>\n";
}
function nav(current) {
  return abs(navRaw.replace(/ aria-current="page"/g, ""))
    .replace(`href="/posts/"`, `href="/posts/"${current === "posts" ? ' aria-current="page"' : ""}`);
}
const coupangScript = `<script>(function(){var s=document.getElementById("adCoupang");if(s&&s.children.length)document.getElementById("coupangNote").hidden=false;})();</script>\n`;

// ---------- 글 읽기 ----------
async function listMd() {
  const out = [];
  for (const dir of ["posts", "."]) {
    let names = [];
    try { names = await readdir(dir); } catch { continue; }
    for (const n of names) {
      if (!n.endsWith(".md") || n.toLowerCase() === "readme.md") continue;
      out.push(dir === "." ? n : `${dir}/${n}`);
    }
  }
  return out;
}
function parse(src, file) {
  const m = src.replace(/^﻿/, "").match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: 맨 위 --- 정보 칸이 없어요`);
  const meta = parseYaml(m[1]);
  for (const k of ["title", "slug", "category", "date"]) if (!meta[k]) throw new Error(`${file}: ${k} 칸이 비었어요`);
  meta.date = String(meta.date instanceof Date ? meta.date.toISOString().slice(0, 10) : meta.date);
  if (meta.updated) meta.updated = String(meta.updated instanceof Date ? meta.updated.toISOString().slice(0, 10) : meta.updated);
  meta.slug = String(meta.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  meta.body = m[2];
  meta.file = file;
  return meta;
}

// ---------- 본문 변환 ----------
function renderBody(md) {
  const toc = []; let n = 0;
  const html = mdToHtml(md, txt => { n++; const id = `s${n}`; toc.push({ id, text: txt.replace(/<[^>]+>/g, "").replace(/^\d+[.)]\s*/, "") }); return `<h2 id="${id}">${txt}</h2>\n`; });
  return { html, toc };
}
const fmtDate = d => { const [y, mo, da] = d.split("-"); return `${y}년 ${Number(mo)}월 ${Number(da)}일`; };

// ---------- 글 페이지 ----------
function pagePost(p, all) {
  const url = `${SITE}/posts/${p.slug}.html`;
  const { html, toc } = renderBody(p.body);
  const plain = p.body.replace(/[#|*>\-\[\]()`]/g, "");
  const mins = Math.max(1, Math.round(plain.length / 500));
  const faq = Array.isArray(p.faq) ? p.faq : [];
  const sources = Array.isArray(p.sources) ? p.sources : [];
  const related = all.filter(x => x.slug !== p.slug && x.category === p.category).concat(all.filter(x => x.slug !== p.slug && x.category !== p.category)).slice(0, 4);
  const ld = [{
    "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description || "",
    datePublished: p.date, dateModified: p.updated || p.date, author: { "@type": "Person", name: "숨차" },
    publisher: { "@type": "Organization", name: "숨차의 계산기" }, mainEntityOfPage: url
  }];
  if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  const extra = `<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
  const image = p.image ? `${SITE}/${String(p.image).replace(/^\//, "")}` : `${SITE}/og-site.png`;
  const catSlug = CATS[p.category] || "life";
  let s = head({ title: p.title, desc: p.description || p.title, url, image, extra }) + rails;
  s += `<div class="wrap">\n${nav("posts")}\n<main class="post">\n`;
  s += `<nav class="crumb" aria-label="위치"><a href="/posts/">정보 글</a> › <a href="/posts/#${catSlug}">${esc(p.category)}</a></nav>\n`;
  s += `<h1>${esc(p.title)}</h1>\n<p class="post-meta">${fmtDate(p.date)} 작성${p.updated ? ` · ${fmtDate(p.updated)} 수정` : ""} · ${mins}분 읽기</p>\n`;
  if (p.lead) s += `<p class="post-lead">${esc(p.lead)}</p>\n`;
  if (Array.isArray(p.summary) && p.summary.length) s += `<section class="post-sum"><h2 class="sum-h">3줄 요약</h2><ul>${p.summary.map(x => `<li>${marked.parseInline(String(x))}</li>`).join("")}</ul></section>\n`;
  if (p.calc && p.calc.url) s += `<a class="post-cta" href="${esc(p.calc.url)}"><span>${esc(p.calc.label || "계산기로 바로 계산하기")}</span><b>→</b></a>\n`;
  if (toc.length > 1) s += `<nav class="post-toc" aria-label="목차"><b>목차</b><ol>${toc.map(t => `<li><a href="#${t.id}">${t.text}</a></li>`).join("")}</ol></nav>\n`;
  s += `<!-- [글 광고 자리] 애드센스 승인 후 광고 코드를 아래 칸 안에 넣어요 -->\n<div class="ad-slot" id="adPost"></div>\n`;
  s += `<article class="post-body">\n${html}</article>\n`;
  if (p.calc && p.calc.url) s += `<a class="post-cta" href="${esc(p.calc.url)}"><span>${esc(p.calc.label || "계산기로 바로 계산하기")}</span><b>→</b></a>\n`;
  if (faq.length) s += `<section class="post-faq"><h2>자주 묻는 질문</h2>${faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${marked.parseInline(String(f.a))}</p></details>`).join("")}</section>\n`;
  if (sources.length) s += `<section class="post-src"><h2>참고한 자료</h2><ol>${sources.map(x => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a></li>`).join("")}</ol></section>\n`;
  if (related.length) s += `<section class="post-rel"><h2>함께 보면 좋은 글</h2><ul>${related.map(r => `<li><a href="/posts/${r.slug}.html"><span class="rel-cat">${esc(r.category)}</span>${esc(r.title)}</a></li>`).join("")}</ul></section>\n`;
  s += `<p class="post-note">이 글은 ${fmtDate(p.updated || p.date)} 기준 공개된 법령과 공식 안내를 바탕으로 정리했어요. 세법과 제도는 바뀔 수 있으니 실제 신고·신청 전에는 국세청 등 공식 기관에서 한 번 더 확인하세요.</p>\n`;
  s += `</main>\n${bottom}\n</div>\n${coupangScript}${tail}`;
  return s;
}

// ---------- 글 목록 ----------
function pageIndex(all) {
  const url = `${SITE}/posts/`;
  const cats = Object.keys(CATS).filter(c => all.some(p => p.category === c));
  let s = head({ title: "정보 글 | 숨차의 계산기", desc: "연말정산, 월급, 예적금·대출, 자동차까지 계산기와 함께 보면 좋은 돈 관련 정보를 정리한 글 모음", url, image: `${SITE}/og-site.png` }) + rails;
  s += `<div class="wrap">\n${nav("posts")}\n<main class="post-list">\n<h1>정보 글</h1>\n<p class="post-lead">계산기와 함께 보면 좋은 돈·세금 정보를 정리했어요. 글마다 관련 계산기로 바로 이어져요.</p>\n`;
  s += `<div class="cat-chips" role="tablist"><button type="button" data-c="" aria-pressed="true">전체 ${all.length}</button>${cats.map(c => `<button type="button" data-c="${CATS[c]}" aria-pressed="false">${esc(c)} ${all.filter(p => p.category === c).length}</button>`).join("")}</div>\n`;
  s += `<ul class="cards">${all.map(p => `<li data-c="${CATS[p.category] || "life"}"><a href="/posts/${p.slug}.html"><span class="rel-cat">${esc(p.category)}</span><b>${esc(p.title)}</b>${p.description ? `<span class="card-desc">${esc(p.description)}</span>` : ""}<span class="card-date">${fmtDate(p.updated || p.date)}</span></a></li>`).join("")}</ul>\n`;
  if (!all.length) s += `<p>아직 글이 없어요.</p>\n`;
  s += `</main>\n${bottom}\n</div>\n${coupangScript}`;
  s += `<script>(function(){var bs=document.querySelectorAll(".cat-chips button"),ls=document.querySelectorAll(".cards li");function go(c){bs.forEach(function(b){b.setAttribute("aria-pressed",b.dataset.c===c)});ls.forEach(function(l){l.hidden=c&&l.dataset.c!==c});}bs.forEach(function(b){b.onclick=function(){go(b.dataset.c);try{history.replaceState(null,"",b.dataset.c?"#"+b.dataset.c:location.pathname)}catch(e){}}});var h=location.hash.slice(1);if(h)go(h);})();</script>\n`;
  s += tail;
  return s;
}

// ---------- 사이트맵 ----------
async function sitemap(all) {
  const pages = (await readdir("site")).filter(n => n.endsWith(".html") && !n.startsWith("google"));
  const pri = { "index.html": "1.0", "salary.html": "0.9", "savings.html": "0.9", "loan.html": "0.9", "car.html": "0.9", "margin.html": "0.9" };
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  const urls = pages.map(n => `  <url><loc>${SITE}/${n === "index.html" ? "" : n}</loc><lastmod>${today}</lastmod><priority>${pri[n] || "0.5"}</priority></url>`);
  urls.push(`  <url><loc>${SITE}/posts/</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`);
  for (const p of all) urls.push(`  <url><loc>${SITE}/posts/${p.slug}.html</loc><lastmod>${p.updated || p.date}</lastmod><priority>0.7</priority></url>`);
  await writeFile("site/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
}

// ---------- 실행 ----------
const posts = [];
for (const f of await listMd()) {
  try { posts.push(parse(await readFile(f, "utf8"), f)); }
  catch (e) { console.error("건너뜀:", e.message); }
}
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const live = posts.filter(p => p.date <= today && p.draft !== true)          // 날짜가 미래인 글은 그날 자동 공개
  .sort((a, b) => (b.date + b.slug).localeCompare(a.date + a.slug));
const seen = new Set();
const unique = live.filter(p => (seen.has(p.slug) ? (console.error("주소 중복으로 건너뜀:", p.file), false) : seen.add(p.slug)));
await mkdir("site/posts", { recursive: true });
for (const p of unique) await writeFile(`site/posts/${p.slug}.html`, pagePost(p, unique));
await writeFile("site/posts/index.html", pageIndex(unique));
await sitemap(unique);
console.log(`글 ${unique.length}편 생성 (대기 ${posts.length - live.length}편)`);
