/* 活動相簿：相簿列表、單一相簿、照片放大檢視、影片 */
document.addEventListener("DOMContentLoaded", function () {
  var KT = window.KT, esc = KT.esc;
  var albums = (window.ALBUMS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var videos = window.VIDEOS || [];

  var indexEl = document.getElementById("album-index");
  var detailEl = document.getElementById("album-detail");
  var sampleBadge = ' <span class="badge badge-sample">範例</span>';

  function youtubeId(url) {
    if (!url) return "";
    var m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(url);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(url) ? url : "";
  }

  function renderIndex() {
    document.getElementById("album-grid").innerHTML = albums.length ? albums.map(function (a) {
      return '<a class="card" href="#' + encodeURIComponent(a.id) + '">' +
        '<img class="album-cover" src="' + esc(a.cover || (a.photos[0] && a.photos[0].src)) + '" alt="' + esc(a.title) + '" loading="lazy">' +
        '<div class="card-body"><h3>' + esc(a.title) + (a.sample ? sampleBadge : "") + "</h3>" +
        "<p>" + esc(a.date.replace(/-/g, "/")) + "・" + a.photos.length + " 張照片</p></div></a>";
    }).join("") : '<p class="empty">相簿整理中，敬請期待。</p>';

    document.getElementById("video-grid").innerHTML = videos.length ? videos.map(function (v) {
      var id = youtubeId(v.youtube), media;
      if (id) {
        media = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="' + esc(v.title) +
          '" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      } else if (v.file) {
        media = '<video src="' + esc(v.file) + '" controls preload="metadata"></video>';
      } else {
        media = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#ccc">影片準備中</div>';
      }
      return '<div class="card"><div class="video-wrap">' + media + "</div>" +
        '<div class="card-body"><h3>' + esc(v.title) + (v.sample ? sampleBadge : "") + "</h3>" +
        "<p>" + esc((v.date || "").replace(/-/g, "/")) + (v.description ? "　" + esc(v.description) : "") + "</p></div></div>";
    }).join("") : '<p class="empty">影片整理中，敬請期待。</p>';
  }

  function renderDetail(a) {
    detailEl.innerHTML =
      '<div class="toolbar"><a class="btn" href="#">‹ 返回相簿列表</a></div>' +
      '<div class="section-head"><h2>' + esc(a.title) + (a.sample ? sampleBadge : "") + "</h2><span class=\"event-meta\">" +
      esc(a.date.replace(/-/g, "/")) + "</span></div>" +
      (a.description ? "<p>" + esc(a.description) + "</p>" : "") +
      '<div class="photo-grid">' + a.photos.map(function (p, i) {
        return '<button type="button" data-i="' + i + '" aria-label="放大檢視：' + esc(p.caption || "") + '">' +
          '<img src="' + esc(p.src) + '" alt="' + esc(p.caption || a.title) + '" loading="lazy"></button>';
      }).join("") + "</div>";
    detailEl.querySelectorAll(".photo-grid button").forEach(function (b) {
      b.addEventListener("click", function () { openLightbox(a.photos, +b.dataset.i); });
    });
  }

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    var a = albums.filter(function (x) { return x.id === id; })[0];
    indexEl.hidden = !!a;
    detailEl.hidden = !a;
    if (a) { renderDetail(a); document.title = a.title + "｜活動相簿｜古亭院"; }
    else document.title = "活動相簿｜古亭院";
    window.scrollTo(0, 0);
  }

  /* 照片放大檢視 */
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption");
  var lbList = [], lbIdx = 0;
  function show() {
    var p = lbList[lbIdx];
    lbImg.src = p.src; lbImg.alt = p.caption || "";
    lbCap.textContent = (p.caption || "") + "（" + (lbIdx + 1) + " / " + lbList.length + "）";
  }
  function openLightbox(list, i) { lbList = list; lbIdx = i; show(); lb.classList.add("open"); }
  function close() { lb.classList.remove("open"); }
  function step(n) { lbIdx = (lbIdx + n + lbList.length) % lbList.length; show(); }
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { step(-1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
  // 手機左右滑動切換照片
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    tx = null;
  });

  renderIndex();
  window.addEventListener("hashchange", route);
  route();
});
