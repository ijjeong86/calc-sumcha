// 띠별 오늘의 금전운 — 날짜와 띠로 매일 정해지는 재미용 문구 (같은 날 같은 띠는 항상 같은 결과)
(function () {
  var box = document.getElementById("fortune");
  if (!box) return;
  var TTI = [["쥐", "84·96·08"], ["소", "85·97·09"], ["호랑이", "86·98·10"], ["토끼", "87·99·11"], ["용", "88·00·12"], ["뱀", "89·01·13"],
             ["말", "90·02·14"], ["양", "91·03·15"], ["원숭이", "80·92·04"], ["닭", "81·93·05"], ["개", "82·94·06"], ["돼지", "83·95·07"]];
  var MSG = {
    5: ["생각지 못한 작은 수입이 들어올 수 있는 날이에요.", "미뤄 둔 환급·포인트를 챙기면 쏠쏠한 날이에요.", "돈 이야기가 술술 풀리는 날, 협상이나 연봉 이야기에 좋아요.", "꾸준히 모아 온 돈이 빛을 보는 날이에요."],
    4: ["지출과 수입이 균형을 이루는 무난한 날이에요.", "작은 절약이 모여 기분 좋은 하루가 돼요.", "금리·혜택을 비교해 보면 더 나은 선택지가 보여요.", "계획한 대로 쓰면 아쉬움 없는 하루예요."],
    3: ["큰 변화 없이 평온한 하루, 고정지출을 점검해 보세요.", "충동구매만 피하면 무난하게 지나가요.", "돈 계획을 다시 세우기 좋은 날이에요.", "남에게 빌려주는 돈은 오늘은 잠시 미루세요."],
    2: ["예상 못 한 지출이 생길 수 있으니 여유를 남겨 두세요.", "할인이라는 말에 마음이 흔들리기 쉬운 날이에요.", "카드 결제일과 자동이체를 한 번 확인해 보세요.", "큰 결정은 하루 미루고 숫자로 다시 따져 보세요."]
  };
  var TIP = ["가계부 한 줄 쓰기", "구독 서비스 정리하기", "적금 금리 비교하기", "영수증 챙기기", "카드 실적 확인하기", "비상금 통장 점검", "포인트 사용하기", "장바구니 하루 묵히기"];
  var COLOR = ["초록", "하늘색", "노랑", "흰색", "남색", "주황", "보라", "베이지"];
  function h(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  var d = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  var btns = box.querySelector(".tti"), out = box.querySelector(".ft-out");
  var saved = 0; try { saved = +localStorage.getItem("tti") || 0; } catch (e) {}
  btns.innerHTML = TTI.map(function (t, i) { return '<button type="button" data-i="' + i + '" aria-pressed="' + (i === saved) + '">' + t[0] + '<small>' + t[1] + '</small></button>'; }).join("");
  function show(i) {
    var r = h(d + "|" + i), star = [2, 3, 3, 4, 4, 4, 5, 5][r % 8], m = MSG[star][(r >>> 3) % 4];
    out.innerHTML = '<div class="ft-head"><b>' + TTI[i][0] + '띠</b> 오늘의 금전운 <span class="ft-star" aria-label="5점 중 ' + star + '점">' + "★★★★★".slice(0, star) + '<i>' + "★★★★★".slice(star) + '</i></span></div>'
      + '<p>' + m + '</p><div class="ft-meta"><span>행운의 숫자 <b>' + ((r >>> 6) % 9 + 1) + '</b></span><span>행운의 색 <b>' + COLOR[(r >>> 9) % 8] + '</b></span><span>오늘 할 일 <b>' + TIP[(r >>> 12) % 8] + '</b></span></div>';
    btns.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", +b.dataset.i === i); });
    try { localStorage.setItem("tti", i); } catch (e) {}
  }
  btns.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) show(+b.dataset.i); });
  box.querySelector(".ft-date").textContent = d.replace(/^(\d+)-(\d+)-(\d+)$/, function (_, y, m, dd) { return +m + "월 " + +dd + "일"; });
  show(saved);
})();
