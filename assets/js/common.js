/* 古亭院網站 共用程式：頁首、頁尾、選單、日期與農曆工具 */
(function () {
  var SITE = window.SITE || { name: "古亭院" };

  var NAV = [
    { href: "index.html", label: "首頁" },
    { href: "calendar.html", label: "法會行事曆" },
    { href: "gallery.html", label: "活動相簿" },
    { href: "dharma.html", label: "佛學知識" }
  ];

  var LOTUS_SVG =
    '<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">' +
    '<path d="M32 10c-6 8-6 22 0 32 6-10 6-24 0-32z"/>' +
    '<path d="M32 42c-10-2-17-10-19-20 9 0 16 6 19 20z"/>' +
    '<path d="M32 42c10-2 17-10 19-20-9 0-16 6-19 20z"/>' +
    '<path d="M32 42C20 44 10 40 5 32c10-3 20 1 27 10z"/>' +
    '<path d="M32 42c12 2 22-2 27-10-10-3-20 1-27 10z"/>' +
    '<path d="M14 50h36"/></svg>';

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function currentPage() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var here = currentPage();
    var links = NAV.map(function (n) {
      var cur = n.href === here ? ' aria-current="page"' : "";
      return '<li><a href="' + n.href + '"' + cur + ">" + esc(n.label) + "</a></li>";
    }).join("");
    el.className = "site-header";
    el.innerHTML =
      '<div class="container">' +
      '<a class="brand" href="index.html"><span class="brand-mark">' + LOTUS_SVG + "</span>" + esc(SITE.name) + "</a>" +
      '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">選單</button>' +
      '<nav class="site-nav" id="site-nav" aria-label="主選單"><ul>' + links + "</ul></nav>" +
      "</div>";
    var btn = el.querySelector(".nav-toggle");
    var nav = el.querySelector(".site-nav");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    if (SITE.testNotice) {
      var bar = document.createElement("div");
      bar.className = "notice-bar";
      bar.textContent = SITE.testNotice;
      el.parentNode.insertBefore(bar, el.nextSibling);
    }
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.className = "site-footer";
    var contact = [];
    if (SITE.address) contact.push("<p>地址：" + esc(SITE.address) +
      (SITE.mapUrl ? '（<a href="' + esc(SITE.mapUrl) + '" target="_blank" rel="noopener">地圖</a>）' : "") + "</p>");
    if (SITE.phone) contact.push('<p>電話：<a href="tel:' + String(SITE.phone).replace(/[^\d+]/g, "") + '">' + esc(SITE.phone) + "</a></p>");
    if (SITE.openHours) contact.push("<p>開放：" + esc(SITE.openHours) + "</p>");
    if (SITE.email) contact.push('<p>信箱：<a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a></p>");
    el.innerHTML =
      '<div class="container">' +
      "<div><h4>" + esc(SITE.name) + "</h4><p>" + esc(SITE.slogan || "") + "</p></div>" +
      "<div><h4>聯絡資訊</h4>" + contact.join("") + "</div>" +
      "<div><h4>網站導覽</h4><p>" +
      NAV.map(function (n) { return '<a href="' + n.href + '">' + esc(n.label) + "</a>"; }).join("　") +
      "</p></div>" +
      "</div>" +
      '<p class="copyright">© ' + new Date().getFullYear() + " " + esc(SITE.name) + "　南無阿彌陀佛</p>";
  }

  /* ---------- 日期工具 ---------- */
  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];
  var LUNAR_MONTH = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "臘"];
  var LUNAR_DAY_TENS = ["初", "十", "廿", "三"];
  var NUM = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

  // "2026-10-12" → Date（當地時間中午，避免時區造成日期偏移）
  function parseDate(s) {
    var p = String(s).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2], 12);
  }
  function ymd(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function today() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  }

  var lunarFmt = null;
  try {
    lunarFmt = new Intl.DateTimeFormat("en-u-ca-chinese", { month: "numeric", day: "numeric" });
    if (lunarFmt.resolvedOptions().calendar !== "chinese") lunarFmt = null;
  } catch (e) { lunarFmt = null; }

  // 回傳 { month: 9, day: 3, leap: false, text: "九月初三", dayText: "初三" }；瀏覽器不支援時回傳 null
  // 瀏覽器內建農曆在少數月份會與台灣農民曆差一天，在這裡校正
  // start～end 這段期間為農曆 month 月（從 start 當天算初一）
  // 例如 { start: "2027-02-06", end: "2027-03-07", month: 1 }
  var LUNAR_FIX = [];

  function lunar(d) {
    if (!lunarFmt) return null;
    var key = ymd(d);
    for (var i = 0; i < LUNAR_FIX.length; i++) {
      var f = LUNAR_FIX[i];
      if (key >= f.start && key <= f.end) {
        var dd = Math.round((parseDate(key) - parseDate(f.start)) / 86400000) + 1;
        return lunarText(f.month, dd, false);
      }
    }
    var parts = lunarFmt.formatToParts(d), m = "", day = "";
    parts.forEach(function (p) {
      if (p.type === "month") m = p.value;
      if (p.type === "day") day = p.value;
    });
    var leap = /bis/i.test(m);
    var mn = parseInt(m, 10), dn = parseInt(day, 10);
    if (!mn || !dn) return null;
    return lunarText(mn, dn, leap);
  }

  function lunarText(mn, dn, leap) {
    var dayText;
    if (dn === 10) dayText = "初十";
    else if (dn === 20) dayText = "二十";
    else if (dn === 30) dayText = "三十";
    else dayText = LUNAR_DAY_TENS[Math.floor(dn / 10)] + NUM[dn % 10];
    var monthText = (leap ? "閏" : "") + LUNAR_MONTH[mn - 1] + "月";
    return { month: mn, day: dn, leap: leap, monthText: monthText, dayText: dayText, text: monthText + dayText };
  }

  function formatDate(d) {
    return d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日（" + WEEK[d.getDay()] + "）";
  }

  /* ---------- 法會資料整理 ---------- */
  // 把 data/events.js 的固定法會，加上每月農曆初一、十五共修，整理成依日期排序的清單
  function allEvents(fromDate, toDate) {
    var list = (window.EVENTS || []).map(function (e) {
      var o = Object.assign({}, e);
      o.dateObj = parseDate(e.date);
      o.endObj = e.endDate ? parseDate(e.endDate) : o.dateObj;
      return o;
    });
    var reg = window.REGULAR_EVENTS || [];
    if (reg.length && lunarFmt && fromDate && toDate) {
      for (var d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
        var l = lunar(d);
        if (!l || l.leap) continue;
        reg.forEach(function (r) {
          if (r.lunarDays.indexOf(l.day) === -1) return;
          var key = ymd(d);
          // 同一天已經有大型法會時，不重複列出例行共修
          var clash = list.some(function (e) { return e.date === key && !e.regular; });
          if (clash) return;
          list.push({
            date: key, dateObj: new Date(d), endObj: new Date(d),
            title: r.title, time: r.time, place: r.place, description: r.description,
            regular: true, sample: r.sample
          });
        });
      }
    }
    list.sort(function (a, b) { return a.dateObj - b.dateObj; });
    return list;
  }

  function eventHTML(e, opts) {
    opts = opts || {};
    var d = e.dateObj;
    var l = lunar(d);
    var dateRange = e.endDate && e.endDate !== e.date
      ? "至 " + (e.endObj.getMonth() + 1) + "/" + e.endObj.getDate()
      : "";
    var meta = [];
    if (e.lunar) meta.push("<span>農曆" + esc(e.lunar) + "</span>");
    else if (l) meta.push("<span>農曆" + l.text + "</span>");
    if (dateRange) meta.push("<span>" + dateRange + "</span>");
    if (e.time) meta.push("<span>" + esc(e.time) + "</span>");
    if (e.place) meta.push("<span>" + esc(e.place) + "</span>");
    var badges = "";
    if (e.regular) badges += ' <span class="badge">例行共修</span>';
    if (e.sample) badges += ' <span class="badge badge-sample">範例</span>';
    var past = opts.markPast && e.endObj < today() ? " past" : "";
    return '<li class="event' + past + '">' +
      '<div class="event-date"><div class="m">' + (d.getMonth() + 1) + " 月</div>" +
      '<div class="d">' + d.getDate() + "</div>" +
      '<div class="w">星期' + WEEK[d.getDay()] + "</div></div>" +
      '<div class="event-info"><h3>' + esc(e.title) + badges + "</h3>" +
      '<div class="event-meta">' + meta.join("") + "</div>" +
      (e.description ? '<p class="event-desc">' + esc(e.description) + "</p>" : "") +
      "</div></li>";
  }

  window.KT = {
    esc: esc, parseDate: parseDate, ymd: ymd, today: today, lunar: lunar,
    formatDate: formatDate, allEvents: allEvents, eventHTML: eventHTML,
    WEEK: WEEK, LOTUS_SVG: LOTUS_SVG
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
  });
})();
