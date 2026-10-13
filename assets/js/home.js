/* 首頁 */
document.addEventListener("DOMContentLoaded", function () {
  var KT = window.KT, SITE = window.SITE || {}, esc = KT.esc;

  document.getElementById("hero-lotus").innerHTML = KT.LOTUS_SVG;
  document.getElementById("hero-name").textContent = SITE.name || "古亭院";
  // 標語仿白馬寺照壁：每個字放在黃底上的白色圓框裡
  var slogan = document.getElementById("hero-slogan");
  slogan.className = "zhaobi";
  slogan.setAttribute("aria-label", SITE.slogan || "");
  slogan.innerHTML = String(SITE.slogan || "").split(/[・·、\s]+/).filter(Boolean).map(function (g) {
    return '<span class="group" aria-hidden="true">' + Array.from(g).map(function (c) {
      return '<span class="ch">' + esc(c) + "</span>";
    }).join("") + "</span>";
  }).join("");

  // 近期法會：今天起三個月內的法會
  var from = KT.today();
  var to = new Date(from); to.setMonth(to.getMonth() + 3);
  var upcoming = KT.allEvents(from, to).filter(function (e) {
    return e.endObj >= from && e.dateObj <= to;
  });
  document.getElementById("upcoming").innerHTML = upcoming.length
    ? upcoming.map(function (e) { return KT.eventHTML(e); }).join("")
    : '<li class="empty">三個月內暫無法會，請參閱完整行事曆。</li>';

  // 本院簡介：昇龍觀世音菩薩信念，十句分左右兩欄
  var creed = SITE.creed || [];
  var half = Math.ceil(creed.length / 2);
  var creedHTML = creed.length ? '<div class="creed">' +
    (SITE.creedTitle ? "<h3>" + esc(SITE.creedTitle) + "</h3>" : "") +
    '<div class="creed-cols">' + [creed.slice(0, half), creed.slice(half)].map(function (col, c) {
      return '<ol start="' + (c * half + 1) + '">' + col.map(function (line) {
        return "<li>" + esc(line) + "</li>";
      }).join("") + "</ol>";
    }).join("") + "</div></div>" : "";
  document.getElementById("intro-text").innerHTML = creedHTML + (SITE.intro || []).map(function (p) {
    return "<p>" + esc(p) + "</p>";
  }).join("");

  var tel = String(SITE.phone || "").replace(/[^\d+]/g, "");
  var info = [
    ["開放時間", esc(SITE.openHours)],
    ["地址", esc(SITE.address)],
    ["電話", SITE.phone ? '<a href="tel:' + tel + '">' + esc(SITE.phone) + "</a>" : ""],
    ["交通", esc(SITE.transport) + (SITE.mapUrl ? '<br><a href="' + esc(SITE.mapUrl) + '" target="_blank" rel="noopener">開啟 Google 地圖導航 →</a>' : "")]
  ];
  document.getElementById("info-list").innerHTML = info.filter(function (i) { return i[1]; }).map(function (i) {
    return "<dt>" + esc(i[0]) + "</dt><dd>" + i[1] + "</dd>";
  }).join("");

  var albums = KT.albums().slice(0, 3);
  document.getElementById("latest-albums").innerHTML = albums.map(function (a) {
    return '<a class="card" href="gallery.html#' + encodeURIComponent(a.id) + '">' +
      '<img class="album-cover" src="' + esc(a.cover) + '" alt="' + esc(a.title) + '" loading="lazy">' +
      '<div class="card-body"><h3>' + esc(a.title) + (a.sample ? ' <span class="badge badge-sample">範例</span>' : "") + "</h3>" +
      "<p>" + esc(a.date.replace(/-/g, "/")) + "</p></div></a>";
  }).join("");

  var articles = (window.ARTICLES || []).slice(0, 3);
  document.getElementById("latest-articles").innerHTML = articles.map(function (a) {
    return '<a class="card" href="dharma.html#' + encodeURIComponent(a.id) + '"><div class="card-body">' +
      '<span class="badge">' + esc(a.category) + "</span>" +
      "<h3>" + esc(a.title) + "</h3><p>" + esc(a.summary) + "</p></div></a>";
  }).join("");
});
