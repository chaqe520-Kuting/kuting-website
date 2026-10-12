/* 法會行事曆：每月月曆 + 全年列表 */
document.addEventListener("DOMContentLoaded", function () {
  var KT = window.KT;
  var now = KT.today();
  var state = { view: "month", year: now.getFullYear(), month: now.getMonth() };

  var label = document.getElementById("period-label");
  var grid = document.getElementById("cal-grid");
  var monthList = document.getElementById("month-list");
  var viewMonth = document.getElementById("view-month");
  var viewYear = document.getElementById("view-year");
  var tabs = document.querySelectorAll("[data-view]");

  // 網址可帶 #2027-02 直接打開某個月份
  var m = /^#(\d{4})-(\d{1,2})$/.exec(location.hash);
  if (m) { state.year = +m[1]; state.month = +m[2] - 1; }

  function eventsIn(from, to) {
    return KT.allEvents(from, to).filter(function (e) { return e.endObj >= from && e.dateObj <= to; });
  }

  function renderMonth() {
    var first = new Date(state.year, state.month, 1, 12);
    var last = new Date(state.year, state.month + 1, 0, 12);
    label.textContent = state.year + " 年 " + (state.month + 1) + " 月";

    var start = new Date(first); start.setDate(1 - first.getDay());
    var end = new Date(last); end.setDate(last.getDate() + (6 - last.getDay()));
    var evs = eventsIn(start, end);
    var todayKey = KT.ymd(now);

    var html = KT.WEEK.map(function (w) { return '<div class="wd">' + w + "</div>"; }).join("");
    for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      var key = KT.ymd(d);
      var l = KT.lunar(d);
      var lunarText = "";
      if (l) {
        var keyDay = l.day === 1 || l.day === 15;
        lunarText = '<span class="lunar' + (keyDay ? " key" : "") + '">' + (l.day === 1 ? l.monthText : l.dayText) + "</span>";
      }
      var dayEvs = evs.filter(function (e) { return e.dateObj <= d && e.endObj >= d; });
      var cls = "cal-cell" + (d.getMonth() !== state.month ? " other" : "") + (key === todayKey ? " today" : "");
      html += '<div class="' + cls + '"><span class="num">' + d.getDate() + "</span>" + lunarText +
        dayEvs.map(function (e) {
          return '<span class="cal-ev' + (e.regular ? " regular" : "") + '" title="' + KT.esc(e.title) + '">' + KT.esc(e.title) + "</span>";
        }).join("") + "</div>";
    }
    grid.innerHTML = html;

    var list = eventsIn(first, last);
    monthList.innerHTML = list.length
      ? list.map(function (e) { return KT.eventHTML(e, { markPast: true }); }).join("")
      : '<li class="empty">本月尚無法會資訊。</li>';
  }

  function renderYear() {
    label.textContent = state.year + " 年";
    var from = new Date(state.year, 0, 1, 12), to = new Date(state.year, 11, 31, 12);
    var evs = eventsIn(from, to).filter(function (e) { return !e.regular; });
    var html = '<p class="event-meta">全年列表僅列出大型法會；每月農曆初一、十五例行共修請見「每月」檢視。</p>';
    var any = false;
    for (var mo = 0; mo < 12; mo++) {
      var inMonth = evs.filter(function (e) { return e.dateObj.getMonth() === mo; });
      if (!inMonth.length) continue;
      any = true;
      html += '<div class="month-block"><h3>' + (mo + 1) + ' 月</h3><ul class="event-list">' +
        inMonth.map(function (e) { return KT.eventHTML(e, { markPast: true }); }).join("") + "</ul></div>";
    }
    if (!any) html += '<p class="empty">' + state.year + " 年尚無法會資訊。</p>";
    viewYear.innerHTML = html;
  }

  function render() {
    var isMonth = state.view === "month";
    viewMonth.hidden = !isMonth;
    viewYear.hidden = isMonth;
    tabs.forEach(function (t) { t.classList.toggle("active", t.dataset.view === state.view); });
    if (isMonth) renderMonth(); else renderYear();
  }

  tabs.forEach(function (t) {
    t.addEventListener("click", function () { state.view = t.dataset.view; render(); });
  });
  document.getElementById("prev").addEventListener("click", function () {
    if (state.view === "month") {
      state.month--; if (state.month < 0) { state.month = 11; state.year--; }
    } else state.year--;
    render();
  });
  document.getElementById("next").addEventListener("click", function () {
    if (state.view === "month") {
      state.month++; if (state.month > 11) { state.month = 0; state.year++; }
    } else state.year++;
    render();
  });

  render();
});
