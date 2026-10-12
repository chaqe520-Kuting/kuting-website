/* 首頁 */
document.addEventListener("DOMContentLoaded", function () {
  var KT = window.KT, SITE = window.SITE || {}, esc = KT.esc;

  document.getElementById("hero-lotus").innerHTML = KT.LOTUS_SVG;
  document.getElementById("hero-name").textContent = SITE.name || "古亭院";
  document.getElementById("hero-slogan").textContent = SITE.slogan || "";

  // 近期法會：今天起一年內，最近的 5 筆
  var from = KT.today();
  var to = new Date(from); to.setDate(to.getDate() + 365);
  var upcoming = KT.allEvents(from, to).filter(function (e) {
    return e.endObj >= from && e.dateObj <= to;
  }).slice(0, 5);
  document.getElementById("upcoming").innerHTML = upcoming.length
    ? upcoming.map(function (e) { return KT.eventHTML(e); }).join("")
    : '<li class="empty">近期暫無法會，請參閱完整行事曆。</li>';

  document.getElementById("intro-text").innerHTML = (SITE.intro || []).map(function (p) {
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

  var albums = (window.ALBUMS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 3);
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
