// 돈 달력 데이터 — /money-calendar.html 과 홈 '이번 달 놓치면 안 되는 돈' 칸이 같이 써요.
// 날짜는 법정 기한 기준이에요. 기한이 토·일·공휴일이면 다음 평일로 미뤄 적었어요.
// 날짜가 아직 발표되지 않은 일정은 tbd: 1 (달만 적고 "발표 전"으로 보여 줘요). 공식 발표가 나오면 start·end를 넣고 tbd를 지워요.
// who: all 누구나 · work 직장인 · biz 자영업·프리랜서 · car 차 있음 · home 집 있음 · kid 자녀 있음 · low 장려금(소득 적음) · student 대학생
window.MC_TAGS = [["work", "직장인"], ["biz", "자영업·프리랜서"], ["car", "차 있음"], ["home", "집 있음"], ["kid", "자녀 있음"], ["low", "장려금 대상"], ["student", "대학생"]];
window.MC = [
  { id: "eitc-late-2026", start: "2026-06-01", end: "2026-12-01", title: "근로·자녀장려금 기한 후 신청 마감", who: ["low", "kid"], desc: "2025년 소득분을 놓쳤다면 마지막 기회예요. 산정액의 95%를 받아요.", links: [["신청 방법", "/posts/earned-income-credit-late-application.html"], ["홈택스", "https://www.hometax.go.kr"]] },
  { id: "jongbu-2026", start: "2026-12-01", end: "2026-12-15", title: "종합부동산세 납부", who: ["home"], desc: "넘기면 가산세 3%가 바로 붙어요. 250만원 넘으면 나눠 낼 수 있어요.", links: [["납부·분납 정리", "/posts/comprehensive-property-tax-payment-2026.html"], ["홈택스", "https://www.hometax.go.kr"]] },
  { id: "ye-preview-2026", start: "2026-10-28", end: "2026-12-18", title: "연말정산 미리보기", who: ["work"], desc: "12월 지출 계획을 세울 마지막 기회예요. 카드·연금저축을 얼마나 더 쓸지 정해요.", links: [["사용법", "/posts/year-end-tax-preview-2026.html"], ["연말정산 계산기", "/yearend.html"]] },
  { id: "cartax-2-2026", start: "2026-12-16", end: "2026-12-31", title: "자동차세 2기분 납부", who: ["car"], desc: "1월에 연납했다면 고지서가 안 나와요.", links: [["위택스", "https://www.wetax.go.kr"], ["연납 할인 정리", "/posts/car-tax-annual-payment-2027.html"]] },
  { id: "pension-2026", start: "2026-01-01", end: "2026-12-31", title: "연금저축·IRP 올해 납입 마감", who: ["work", "biz"], desc: "12월 31일까지 넣은 돈만 올해 세액공제(최대 900만원의 13.2~16.5%)에 들어가요.", links: [["세액공제 계산", "/posts/pension-savings-irp-tax-credit.html"]] },
  { id: "checkup-2026", start: "2026-01-01", end: "2026-12-31", title: "직장인 건강검진 마감", who: ["work"], desc: "2026년은 짝수년도 출생자 대상이에요. 안 받으면 과태료가 나올 수 있어요.", links: [["대상·과태료", "/posts/employee-health-checkup-deadline-2026.html"]] },
  { id: "kosaf-2027-1", start: "2026-11-24", end: "2027-01-07", title: "국가장학금 2027년 1학기 1차 신청", who: ["student"], desc: "재학생은 1차에 신청해야 해요. 서류 제출은 1월 14일까지예요.", links: [["신청 정리", "/posts/national-scholarship-2027-first-application.html"], ["한국장학재단", "https://www.kosaf.go.kr"]] },

  { id: "vat-2026-2", start: "2027-01-01", end: "2027-01-25", title: "부가세 확정신고 (2026년 2기)", who: ["biz"], desc: "일반과세자는 2026년 7~12월분, 간이과세자는 2026년 1년분을 신고해요.", links: [["계산 방법", "/posts/vat-filing-january-2027.html"], ["부가세 계산기", "/vat.html"], ["홈택스", "https://www.hometax.go.kr"]] },
  { id: "ye-2026", start: "2027-01-15", end: "2027-02-26", title: "연말정산 (2026년 귀속)", who: ["work"], desc: "1월 15일 간소화 자료가 열려요. 회사 제출 마감은 회사마다 달라요(보통 1월 말~2월).", links: [["환급 늘리는 법", "/posts/year-end-tax-refund-tips-2026.html"], ["연말정산 계산기", "/yearend.html"]] },
  { id: "cartax-annual-1", start: "2027-01-16", end: "2027-02-01", title: "자동차세 연납 신청 (할인 가장 큼)", who: ["car"], desc: "1년치를 1월에 한 번에 내면 가장 많이 깎아 줘요. 1월 31일이 일요일이라 2월 1일까지예요.", links: [["연납 할인 계산", "/posts/car-tax-annual-payment-2027.html"], ["위택스", "https://www.wetax.go.kr"]] },
  { id: "license-tax-2027", start: "2027-01-16", end: "2027-02-01", title: "등록면허세(면허분) 납부", who: ["biz"], desc: "영업 허가·신고 면허를 가진 사업자가 1년에 한 번 내요.", links: [["위택스", "https://www.wetax.go.kr"]] },
  { id: "eitc-half-2026-2", start: "2027-03-02", end: "2027-03-15", title: "근로장려금 반기 신청 (2026년 하반기분)", who: ["low"], desc: "근로소득만 있는 사람은 반기 신청으로 더 빨리 받을 수 있어요.", links: [["소득·재산 조건", "/posts/earned-income-tax-credit-2027.html"], ["홈택스", "https://www.hometax.go.kr"]] },
  { id: "cartax-annual-3", start: "2027-03-16", end: "2027-03-31", title: "자동차세 연납 신청 (3월)", who: ["car"], desc: "1월에 못 했다면 3월에도 남은 기간분을 연납할 수 있어요. 할인은 1월보다 작아요.", links: [["연납 할인 계산", "/posts/car-tax-annual-payment-2027.html"]] },
  { id: "health-settle-2027", start: "2027-04-01", end: "2027-04-30", title: "건강보험료 연말정산", who: ["work"], desc: "작년 월급이 오른 만큼 4월분 보험료에 더 붙어요. 월급이 갑자기 줄어 보이는 이유예요.", links: [["2027 월급 공제", "/posts/2027-payroll-deductions.html"], ["연봉 실수령액 계산기", "/salary.html"]] },
  { id: "income-tax-2027", start: "2027-05-01", end: "2027-05-31", title: "종합소득세 신고 (2026년 소득)", who: ["biz", "work"], desc: "사업·프리랜서 소득이 있거나, 직장인이 부업·임대 소득이 있으면 신고해요.", links: [["홈택스", "https://www.hometax.go.kr"]] },
  { id: "eitc-2027", start: "2027-05-01", end: "2027-05-31", title: "근로·자녀장려금 정기 신청", who: ["low", "kid"], desc: "2026년 소득으로 심사해요. 단독 2,200만원·홑벌이 3,200만원·맞벌이 4,400만원 미만이 대상이에요.", links: [["근로장려금", "/posts/earned-income-tax-credit-2027.html"], ["자녀장려금", "/posts/child-tax-credit-2027.html"]] },
  { id: "kosaf-2027-2", tbd: 1, month: "2027-05", title: "국가장학금 2027년 2학기 1차 신청", who: ["student"], desc: "보통 5~6월에 열려요. 일정은 한국장학재단 발표 전이에요.", links: [["한국장학재단", "https://www.kosaf.go.kr"]] },
  { id: "jongbu-installment-2027", start: "2027-06-01", end: "2027-06-15", title: "종부세 분납분 납부", who: ["home"], desc: "작년 12월에 종부세를 나눠 내기로 했다면 남은 금액을 내요.", links: [["분납 정리", "/posts/comprehensive-property-tax-payment-2026.html"]] },
  { id: "cartax-1-2027", start: "2027-06-16", end: "2027-06-30", title: "자동차세 1기분 납부", who: ["car"], desc: "연납했다면 고지서가 안 나와요.", links: [["위택스", "https://www.wetax.go.kr"]] },
  { id: "vat-2027-1", start: "2027-07-01", end: "2027-07-26", title: "부가세 확정신고 (2027년 1기)", who: ["biz"], desc: "일반과세자의 1~6월분이에요. 7월 25일이 일요일이라 26일까지예요.", links: [["부가세 계산기", "/vat.html"], ["홈택스", "https://www.hometax.go.kr"]] },
  { id: "property-1-2027", start: "2027-07-16", end: "2027-08-02", title: "재산세 1기분 (주택 절반·건물)", who: ["home"], desc: "주택분 재산세의 절반과 건물분을 내요. 7월 31일이 토요일이라 8월 2일까지예요.", links: [["위택스", "https://www.wetax.go.kr"]] },
  { id: "resident-tax-2027", start: "2027-08-16", end: "2027-08-31", title: "주민세(개인분) 납부", who: ["all"], desc: "세대주에게 1년에 한 번 나와요. 시·군마다 다르고 1만원 이하예요.", links: [["위택스", "https://www.wetax.go.kr"]] },
  { id: "eitc-half-2027-1", start: "2027-09-01", end: "2027-09-17", title: "근로장려금 반기 신청 (2027년 상반기분)", who: ["low"], desc: "9월 15일이 추석이라 마감이 17일로 미뤄져요. 국세청 안내로 최종 확인하세요.", links: [["소득·재산 조건", "/posts/earned-income-tax-credit-2027.html"]] },
  { id: "property-2-2027", start: "2027-09-16", end: "2027-09-30", title: "재산세 2기분 (주택 절반·토지)", who: ["home"], desc: "주택분 나머지 절반과 토지분을 내요.", links: [["위택스", "https://www.wetax.go.kr"]] },
  { id: "ye-preview-2027", tbd: 1, month: "2027-10", title: "연말정산 미리보기 (2027년 귀속)", who: ["work"], desc: "해마다 10월 말쯤 홈택스에 열려요. 일정은 국세청 발표 전이에요.", links: [["연말정산 계산기", "/yearend.html"]] },
  { id: "jongbu-2027", start: "2027-12-01", end: "2027-12-15", title: "종합부동산세 납부", who: ["home"], desc: "넘기면 가산세 3%가 바로 붙어요.", links: [["홈택스", "https://www.hometax.go.kr"]] },
  { id: "cartax-2-2027", start: "2027-12-16", end: "2027-12-31", title: "자동차세 2기분 납부", who: ["car"], desc: "1월에 연납했다면 고지서가 안 나와요.", links: [["위택스", "https://www.wetax.go.kr"]] },
  { id: "pension-2027", start: "2027-01-01", end: "2027-12-31", title: "연금저축·IRP 올해 납입 마감", who: ["work", "biz"], desc: "12월 31일까지 넣은 돈만 올해 세액공제에 들어가요.", links: [["세액공제 계산", "/posts/pension-savings-irp-tax-credit.html"]] },
  { id: "checkup-2027", start: "2027-01-01", end: "2027-12-31", title: "직장인 건강검진 마감", who: ["work"], desc: "2027년은 홀수년도 출생자 대상이에요.", links: [["건강검진 정리", "/posts/employee-health-checkup-deadline-2026.html"]] }
];

// 한국 날짜 기준 오늘
window.mcToday = function () { const k = new Date(Date.now() + 9 * 3600e3); return k.toISOString().slice(0, 10); };
window.mcDays = function (a, b) { return Math.round((Date.parse(b) - Date.parse(a)) / 864e5); };
window.mcFmt = function (s) { const d = new Date(s + "T00:00:00Z"); return (d.getUTCMonth() + 1) + "월 " + d.getUTCDate() + "일(" + "일월화수목금토"[d.getUTCDay()] + ")"; };

// 홈 화면: 지금 열려 있거나 30일 안에 시작하는 일정 4개
(function () {
  const box = document.getElementById("mcHome"); if (!box) return;
  const t = mcToday();
  const list = MC.filter(e => !e.tbd && e.end >= t && mcDays(t, e.start) <= 30)
    .sort((a, b) => a.end.localeCompare(b.end)).slice(0, 4);
  if (!list.length) return;
  box.querySelector("ol").innerHTML = list.map(e => {
    const open = e.start <= t, d = open ? mcDays(t, e.end) : mcDays(t, e.start);
    const badge = open ? (d === 0 ? "오늘 마감" : "마감 D-" + d) : "시작 D-" + d;
    return `<li><span class="mc-d${open && d <= 7 ? " hot" : ""}">${badge}</span><a href="/money-calendar.html#${e.id}">${e.title}</a><small>~${mcFmt(e.end)}</small></li>`;
  }).join("");
  box.hidden = false;
})();
