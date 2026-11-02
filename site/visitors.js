// 최근 5일 방문자 그래프 (무료 카운터: abacus.jasoncameron.dev)
// 같은 브라우저는 하루에 한 번만 셉니다. 서비스가 응답하지 않으면 위젯을 숨깁니다.
(function () {
  var box = document.getElementById("visit");
  if (!box || !window.fetch) return;
  var NS = "calc-sumcha", BASE = "https://abacus.jasoncameron.dev";
  function day(o) { return new Date(Date.now() + 9 * 3600e3 - o * 864e5).toISOString().slice(0, 10); }
  var days = [4, 3, 2, 1, 0].map(day), today = days[4];
  var seen = false;
  try { seen = localStorage.getItem("calc-visit-day") === today; } catch (e) {}
  function req(path) {
    return fetch(BASE + path).then(function (r) { return r.ok ? r.json() : { value: 0 }; })
      .then(function (j) { return j && typeof j.value === "number" ? j.value : 0; })
      .catch(function () { return null; });
  }
  Promise.all(days.map(function (d, i) {
    return req((i === 4 && !seen ? "/hit/" : "/get/") + NS + "/v-" + d);
  })).then(function (vals) {
    if (vals[4] === null) return;               // 카운터 서비스가 안 되면 표시하지 않음
    try { localStorage.setItem("calc-visit-day", today); } catch (e) {}
    vals = vals.map(function (v) { return v || 0; });
    draw(vals);
  });
  function draw(vals) {
    var W = 230, H = 118, L = 22, R = 22, T = 30, B = 30;
    var max = Math.max.apply(null, vals.concat([1])), min = Math.min.apply(null, vals);
    var span = Math.max(max - min, max * 0.25, 1);
    var xs = vals.map(function (_, i) { return L + i * (W - L - R) / 4; });
    var ys = vals.map(function (v) { return T + (H - T - B) * (1 - (v - (max - span)) / span); });
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="최근 5일 방문자 수">';
    for (var i = 0; i < 4; i++) {
      s += '<line x1="' + xs[i] + '" y1="' + ys[i] + '" x2="' + xs[i + 1] + '" y2="' + ys[i + 1] + '" class="v-line' + (i === 3 ? ' v-line-now' : '') + '"/>';
    }
    vals.forEach(function (v, i) {
      var now = i === 4;
      s += '<text x="' + xs[i] + '" y="' + (ys[i] - 10) + '" class="v-num">' + v.toLocaleString("ko-KR") + '</text>';
      s += now ? '<circle cx="' + xs[i] + '" cy="' + ys[i] + '" r="5" class="v-dot-now"/>'
               : '<circle cx="' + xs[i] + '" cy="' + ys[i] + '" r="3.5" class="v-dot"/>';
      s += '<text x="' + xs[i] + '" y="' + (H - 8) + '" class="v-day' + (now ? ' v-day-now' : '') + '">' + Number(days[i].slice(8)) + '</text>';
    });
    s += '</svg>';
    box.querySelector(".visit-chart").innerHTML = s;
    box.querySelector(".visit-today").textContent = "오늘 " + vals[4].toLocaleString("ko-KR") + "명";
    box.hidden = false;
  }
})();
