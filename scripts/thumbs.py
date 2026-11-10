# 정보 글 대표 이미지(썸네일) 만들기 — 내 컴퓨터/클로드 작업 환경에서 실행해요 (Playwright 필요)
# 사용법: python3 scripts/thumbs.py            → 이미지가 없는 글만 만들기
#         python3 scripts/thumbs.py --all      → 전부 다시 만들기
# 글 맨 위에 thumb: "첫 줄|둘째 줄", icon: house 처럼 적으면 그 문구·그림으로 만들어요.
import os, re, sys, glob
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "img", "posts")
os.makedirs(OUT, exist_ok=True)

PAL = {  # 분류별 색: 배경, 진한색, 연한색
  "세금·연금": ("#e7f2ec", "#1d6a56", "#bfe0cf"),
  "월급·직장": ("#e9effb", "#2c5bb8", "#c4d4f2"),
  "대출·부동산": ("#fbefe3", "#c0632a", "#f2d2b4"),
  "예적금·투자": ("#f1ecfb", "#6a46b5", "#d7c9f1"),
  "지원금·혜택": ("#fcebee", "#c23a5a", "#f3c6d1"),
  "경제 이슈": ("#e6f4f5", "#1f7c86", "#bfe2e5"),
}

def icon(name, d, l):
  w = "#ffffff"
  I = {
  "doc": f'<rect x="70" y="40" width="180" height="230" rx="18" fill="{w}" stroke="{d}" stroke-width="8"/><rect x="100" y="85" width="120" height="12" rx="6" fill="{l}"/><rect x="100" y="120" width="120" height="12" rx="6" fill="{l}"/><rect x="100" y="155" width="80" height="12" rx="6" fill="{l}"/><circle cx="215" cy="230" r="48" fill="{d}"/><text x="215" y="248" font-size="52" font-weight="900" fill="#fff" text-anchor="middle">₩</text>',
  "house": f'<path d="M40 160 L160 60 L280 160 Z" fill="{d}"/><rect x="70" y="150" width="180" height="130" rx="10" fill="{w}" stroke="{d}" stroke-width="8"/><rect x="135" y="195" width="50" height="85" rx="6" fill="{l}"/><rect x="88" y="175" width="34" height="34" rx="4" fill="{l}"/><rect x="198" y="175" width="34" height="34" rx="4" fill="{l}"/>',
  "key": f'<path d="M40 160 L160 60 L280 160 Z" fill="{l}"/><rect x="70" y="150" width="180" height="130" rx="10" fill="{w}" stroke="{l}" stroke-width="8"/><circle cx="120" cy="200" r="46" fill="none" stroke="{d}" stroke-width="18"/><rect x="155" y="191" width="120" height="18" rx="9" fill="{d}"/><rect x="230" y="191" width="18" height="44" rx="6" fill="{d}"/><rect x="258" y="191" width="18" height="34" rx="6" fill="{d}"/>',
  "coins": f'<ellipse cx="120" cy="230" rx="80" ry="26" fill="{d}"/><rect x="40" y="170" width="160" height="60" fill="{d}"/><ellipse cx="120" cy="170" rx="80" ry="26" fill="{l}" stroke="{d}" stroke-width="6"/><ellipse cx="205" cy="160" rx="75" ry="24" fill="{d}"/><rect x="130" y="80" width="150" height="80" fill="{d}"/><ellipse cx="205" cy="80" rx="75" ry="24" fill="{l}" stroke="{d}" stroke-width="6"/><text x="205" y="94" font-size="36" font-weight="900" fill="{d}" text-anchor="middle">₩</text>',
  "piggy": f'<ellipse cx="160" cy="170" rx="120" ry="95" fill="{l}" stroke="{d}" stroke-width="8"/><circle cx="235" cy="145" r="10" fill="{d}"/><ellipse cx="275" cy="175" rx="22" ry="18" fill="{w}" stroke="{d}" stroke-width="6"/><rect x="85" y="245" width="30" height="40" rx="8" fill="{d}"/><rect x="195" y="245" width="30" height="40" rx="8" fill="{d}"/><path d="M110 85 L135 55 L150 90" fill="{d}"/><rect x="120" y="70" width="70" height="12" rx="6" fill="{d}"/><circle cx="160" cy="30" r="26" fill="{d}"/><text x="160" y="42" font-size="30" font-weight="900" fill="#fff" text-anchor="middle">₩</text>',
  "chart": f'<rect x="40" y="40" width="240" height="240" rx="22" fill="{w}" stroke="{d}" stroke-width="8"/><rect x="75" y="190" width="34" height="60" rx="6" fill="{l}"/><rect x="125" y="160" width="34" height="90" rx="6" fill="{l}"/><rect x="175" y="125" width="34" height="125" rx="6" fill="{l}"/><path d="M70 170 L130 130 L180 145 L250 80" fill="none" stroke="{d}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M225 75 L255 75 L255 105" fill="none" stroke="{d}" stroke-width="12" stroke-linecap="round"/>',
  "car": f'<path d="M60 170 L95 100 Q105 85 125 85 L200 85 Q220 85 230 100 L265 170 Z" fill="{l}" stroke="{d}" stroke-width="8"/><rect x="35" y="165" width="250" height="70" rx="22" fill="{d}"/><circle cx="95" cy="240" r="30" fill="{w}" stroke="{d}" stroke-width="10"/><circle cx="225" cy="240" r="30" fill="{w}" stroke="{d}" stroke-width="10"/><rect x="60" y="185" width="40" height="16" rx="8" fill="{w}"/><rect x="220" y="185" width="40" height="16" rx="8" fill="{w}"/>',
  "calendar": f'<rect x="45" y="60" width="230" height="210" rx="22" fill="{w}" stroke="{d}" stroke-width="8"/><rect x="45" y="60" width="230" height="55" rx="22" fill="{d}"/><rect x="95" y="38" width="16" height="45" rx="8" fill="{d}"/><rect x="209" y="38" width="16" height="45" rx="8" fill="{d}"/>' + "".join(f'<rect x="{75+c*45}" y="{135+r*42}" width="30" height="26" rx="6" fill="{l}"/>' for r in range(3) for c in range(4)) + f'<circle cx="255" cy="250" r="40" fill="{d}"/><path d="M237 250 L251 264 L275 238" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>',
  "gift": f'<rect x="55" y="130" width="210" height="145" rx="14" fill="{l}" stroke="{d}" stroke-width="8"/><rect x="40" y="95" width="240" height="50" rx="12" fill="{d}"/><rect x="148" y="95" width="24" height="180" fill="{w}"/><path d="M160 95 Q110 30 95 70 Q90 95 160 95 Q230 95 225 70 Q210 30 160 95" fill="none" stroke="{d}" stroke-width="10"/>',
  "shield": f'<path d="M160 35 L270 75 L270 150 Q270 240 160 285 Q50 240 50 150 L50 75 Z" fill="{l}" stroke="{d}" stroke-width="8"/><path d="M110 160 L148 198 L215 125" fill="none" stroke="{d}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>',
  "receipt": f'<path d="M75 35 L245 35 L245 285 L220 265 L195 285 L170 265 L145 285 L120 265 L95 285 L75 265 Z" fill="{w}" stroke="{d}" stroke-width="8"/><rect x="105" y="80" width="110" height="12" rx="6" fill="{l}"/><rect x="105" y="115" width="110" height="12" rx="6" fill="{l}"/><rect x="105" y="150" width="70" height="12" rx="6" fill="{l}"/><text x="160" y="232" font-size="54" font-weight="900" fill="{d}" text-anchor="middle">VAT</text>',
  "scale": f'<rect x="150" y="60" width="20" height="200" rx="8" fill="{d}"/><rect x="90" y="255" width="140" height="22" rx="10" fill="{d}"/><rect x="50" y="85" width="220" height="14" rx="7" fill="{d}"/><path d="M60 95 L30 175 L90 175 Z" fill="none" stroke="{d}" stroke-width="6"/><path d="M260 95 L230 175 L290 175 Z" fill="none" stroke="{d}" stroke-width="6"/><ellipse cx="60" cy="178" rx="38" ry="12" fill="{l}" stroke="{d}" stroke-width="6"/><ellipse cx="260" cy="178" rx="38" ry="12" fill="{l}" stroke="{d}" stroke-width="6"/><circle cx="160" cy="55" r="18" fill="{l}" stroke="{d}" stroke-width="6"/>',
  "medical": f'<rect x="50" y="50" width="220" height="220" rx="40" fill="{w}" stroke="{d}" stroke-width="8"/><rect x="135" y="85" width="50" height="150" rx="10" fill="{d}"/><rect x="85" y="135" width="150" height="50" rx="10" fill="{d}"/>',
  "payslip": f'<rect x="60" y="40" width="200" height="240" rx="18" fill="{w}" stroke="{d}" stroke-width="8"/><rect x="60" y="40" width="200" height="50" rx="18" fill="{d}"/><rect x="90" y="115" width="80" height="12" rx="6" fill="{l}"/><rect x="190" y="115" width="40" height="12" rx="6" fill="{d}"/><rect x="90" y="150" width="80" height="12" rx="6" fill="{l}"/><rect x="190" y="150" width="40" height="12" rx="6" fill="{d}"/><rect x="90" y="185" width="80" height="12" rx="6" fill="{l}"/><rect x="190" y="185" width="40" height="12" rx="6" fill="{d}"/><rect x="90" y="230" width="140" height="16" rx="8" fill="{l}"/>',
  "clock": f'<circle cx="150" cy="150" r="115" fill="{w}" stroke="{d}" stroke-width="10"/><path d="M150 85 L150 150 L200 180" fill="none" stroke="{d}" stroke-width="14" stroke-linecap="round"/><circle cx="250" cy="245" r="44" fill="{d}"/><text x="250" y="262" font-size="46" font-weight="900" fill="#fff" text-anchor="middle">₩</text>',
  }
  return I.get(name, I["doc"])

TPL = '''<html><head><style>body{{margin:0}}*{{font-family:'Noto Sans CJK KR',sans-serif}}</style></head><body>
<div style="width:1200px;height:675px;background:linear-gradient(135deg,{bg} 0%,#ffffff 140%);position:relative;overflow:hidden">
 <div style="position:absolute;right:-120px;top:-120px;width:520px;height:520px;border-radius:50%;background:{l};opacity:.45"></div>
 <div style="position:absolute;left:84px;top:96px;width:640px">
  <span style="display:inline-block;padding:10px 22px;border-radius:999px;background:{d};color:#fff;font-size:28px;font-weight:700">{cat}</span>
  <div style="margin-top:42px;font-size:76px;line-height:1.22;font-weight:900;color:#16201c;letter-spacing:-2px;word-break:keep-all">{l1}<br><span style="color:{d}">{l2}</span></div>
 </div>
 <div style="position:absolute;left:84px;bottom:64px;display:flex;align-items:center;gap:12px;font-size:28px;font-weight:700;color:#3b4a44"><span style="display:inline-grid;place-items:center;width:44px;height:44px;border-radius:11px;background:#1d6a56;color:#fff;font-size:26px">₩</span>숨차의 경제노트</div>
 <svg style="position:absolute;right:70px;top:150px" width="380" height="380" viewBox="0 0 320 320">{svg}</svg>
</div></body></html>'''


SQ = '''<html><head><style>body{{margin:0}}*{{font-family:'Noto Sans CJK KR',sans-serif}}</style></head><body>
<div id="c" style="width:720px;height:720px;background:linear-gradient(160deg,{bg} 0%,#ffffff 150%);position:relative;overflow:hidden">
 <div style="position:absolute;right:-90px;top:-90px;width:420px;height:420px;border-radius:50%;background:{l};opacity:.5"></div>
 <svg style="position:absolute;right:40px;top:44px" width="330" height="330" viewBox="0 0 320 320">{svg}</svg>
 <span style="position:absolute;left:48px;top:52px;padding:10px 22px;border-radius:999px;background:{d};color:#fff;font-size:34px;font-weight:700">{cat}</span>
 <div style="position:absolute;left:48px;right:44px;bottom:56px">
  <div class="fit" style="font-size:92px;line-height:1.15;font-weight:900;color:#16201c;letter-spacing:-3px;white-space:nowrap">{l1}</div>
  <div class="fit" style="font-size:80px;line-height:1.2;font-weight:900;color:{d};letter-spacing:-3px;white-space:nowrap;margin-top:6px">{l2}</div>
 </div>
</div>
<script>document.querySelectorAll('.fit').forEach(function(e){{var w=628,s=parseFloat(e.style.fontSize);while(e.scrollWidth>w&&s>40){{s-=2;e.style.fontSize=s+'px';}}}});</script>
</body></html>'''

def meta(src):
  m = re.match(r"---\s*\n([\s\S]*?)\n---", src)
  y = m.group(1) if m else ""
  g = lambda k: (re.search(rf'^{k}:\s*"?([^"\n]*)"?\s*$', y, re.M) or [None, None])[1]
  return g("slug"), g("category"), g("thumb"), g("icon"), g("image")

def main():
  every = "--all" in sys.argv
  jobs = []
  for f in sorted(glob.glob(os.path.join(ROOT, "posts", "*.md"))):
    src = open(f, encoding="utf8").read()
    slug, cat, thumb, ic, image = meta(src)
    if not slug or not thumb: continue
    path = f"/img/posts/{slug}.jpg"
    if not every and image and os.path.exists(os.path.join(ROOT, "site", image.lstrip("/"))): continue
    jobs.append((f, src, slug, cat, thumb, ic or "doc", path, image))
  if not jobs: print("만들 이미지가 없어요"); return
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1200, "height": 675})
    for f, src, slug, cat, thumb, ic, path, image in jobs:
      bg, d, l = PAL.get(cat, PAL["경제 이슈"])
      l1, _, l2 = thumb.partition("|")
      pg.set_content(TPL.format(bg=bg, d=d, l=l, cat=cat, l1=l1, l2=l2, svg=icon(ic, d, l)))
      pg.wait_for_timeout(150)
      pg.set_viewport_size({"width": 1200, "height": 675})
      pg.screenshot(path=os.path.join(ROOT, "site", path.lstrip("/")), type="jpeg", quality=84)
      pg.set_viewport_size({"width": 720, "height": 720})
      pg.set_content(SQ.format(bg=bg, d=d, l=l, cat=cat, l1=l1, l2=l2, svg=icon(ic, d, l)))
      pg.wait_for_timeout(150)
      pg.screenshot(path=os.path.join(ROOT, "site", path.lstrip("/").replace(".jpg", "-sq.jpg")), type="jpeg", quality=86)
      if not image or image != path:  # 글 맨 위에 image 줄 추가·고치기
        src = re.sub(r'^image:.*\n', "", src, flags=re.M)
        src = re.sub(r"^(slug:.*)$", rf'\1\nimage: "{path}"', src, count=1, flags=re.M)
        open(f, "w", encoding="utf8").write(src)
      print("만듦:", path)
    b.close()

main()
