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

// 예전 글꼴 미리보기 기록 지우기
try { sessionStorage.removeItem("fontPreview"); } catch (e) {}
