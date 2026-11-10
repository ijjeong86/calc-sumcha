// 메뉴: 휴대폰 ☰ 열고 닫기, 펼침 메뉴 하나만 열기, 바깥 누르면 닫기
(function () {
  var bar = document.querySelector(".topnav");
  if (!bar) return;
  var btn = bar.querySelector(".nav-toggle"), dds = bar.querySelectorAll(".dd");
  if (btn) btn.addEventListener("click", function () {
    var open = bar.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
  dds.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) dds.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
  document.addEventListener("click", function (e) {
    if (!bar.contains(e.target)) dds.forEach(function (d) { d.open = false; });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { dds.forEach(function (d) { d.open = false; }); bar.classList.remove("open"); if (btn) btn.setAttribute("aria-expanded", "false"); }
  });
})();

// 글꼴 미리보기: 주소 끝에 ?font=paperlogy / wanted / suit 를 붙이면 그 글꼴로 보여요 (끄기: ?font=off)
(function () {
  var F = {
    paperlogy: { name: "제목 Paperlogy + 본문 Pretendard", css: "https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy.css",
      rule: "h1,h2,h3,.brand,.season h2,.sec-h h2,.calc-group h3{font-family:'Paperlogy',var(--font-body)!important;font-weight:700!important;letter-spacing:-.01em}h1{font-weight:800!important}.hero .big{font-family:'Paperlogy',var(--font-num)!important;font-weight:700!important}" },
    wanted: { name: "제목·숫자 Wanted Sans + 본문 Pretendard", css: "https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css",
      rule: ":root{--font-num:'Wanted Sans Variable',var(--font-body)!important}h1,h2,h3,.brand,.season h2,.sec-h h2,.calc-group h3,.menu>a,.dd>summary{font-family:'Wanted Sans Variable',var(--font-body)!important;letter-spacing:-.01em}h1{font-weight:800!important}" },
    suit: { name: "전체 SUIT", css: "https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css",
      rule: ":root{--font-body:'SUIT Variable',sans-serif!important;--font-num:'SUIT Variable',sans-serif!important}" }
  };
  var k = null;
  try {
    var q = new URLSearchParams(location.search).get("font");
    if (q === "off") sessionStorage.removeItem("fontPreview");
    else if (q && F[q]) sessionStorage.setItem("fontPreview", q);
    k = sessionStorage.getItem("fontPreview");
  } catch (e) {}
  if (!k || !F[k]) return;
  var f = F[k], l = document.createElement("link");
  l.rel = "stylesheet"; l.href = f.css; document.head.appendChild(l);
  var s = document.createElement("style"); s.textContent = f.rule; document.head.appendChild(s);
  var b = document.createElement("div");
  b.style.cssText = "position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:99;background:#16201c;color:#fff;padding:9px 14px;border-radius:999px;font-size:13px;box-shadow:0 6px 20px rgba(0,0,0,.2);white-space:nowrap";
  b.innerHTML = "글꼴 미리보기: " + f.name + ' · <a href="?font=off" style="color:#9fe0c8">끄기</a>';
  document.body.appendChild(b);
})();
