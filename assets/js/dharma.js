/* 佛學知識：分類篩選、文章列表、文章內容 */
document.addEventListener("DOMContentLoaded", function () {
  var KT = window.KT, esc = KT.esc;
  var articles = window.ARTICLES || [];
  var indexEl = document.getElementById("article-index");
  var detailEl = document.getElementById("article-detail");
  var current = "全部";

  var cats = ["全部"];
  articles.forEach(function (a) { if (cats.indexOf(a.category) === -1) cats.push(a.category); });

  function renderFilters() {
    var el = document.getElementById("filters");
    el.innerHTML = cats.map(function (c) {
      return '<button type="button" class="btn' + (c === current ? " active" : "") + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
    el.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { current = b.dataset.cat; renderFilters(); renderList(); });
    });
  }

  function renderList() {
    var list = articles.filter(function (a) { return current === "全部" || a.category === current; });
    document.getElementById("article-grid").innerHTML = list.map(function (a) {
      return '<a class="card" href="#' + encodeURIComponent(a.id) + '"><div class="card-body">' +
        '<span class="badge">' + esc(a.category) + "</span>" + (a.sample ? ' <span class="badge badge-sample">範例</span>' : "") +
        "<h3>" + esc(a.title) + "</h3><p>" + esc(a.summary) + "</p></div></a>";
    }).join("") || '<p class="empty">此分類尚無文章。</p>';
  }

  function bodyHTML(body) {
    return (body || []).map(function (p) {
      if (p.indexOf("## ") === 0) return "<h2>" + esc(p.slice(3)) + "</h2>";
      if (p.indexOf("> ") === 0) return "<blockquote>" + esc(p.slice(2)) + "</blockquote>";
      return "<p>" + esc(p) + "</p>";
    }).join("");
  }

  function route() {
    var id = decodeURIComponent(location.hash.slice(1));
    var a = articles.filter(function (x) { return x.id === id; })[0];
    indexEl.hidden = !!a;
    detailEl.hidden = !a;
    if (a) {
      detailEl.innerHTML =
        '<div class="toolbar"><a class="btn" href="#">‹ 返回文章列表</a></div>' +
        '<article class="article"><h1>' + esc(a.title) + "</h1>" +
        '<div class="meta"><span class="badge">' + esc(a.category) + "</span>" +
        (a.sample ? ' <span class="badge badge-sample">範例初稿・待法師審閱</span>' : "") + "</div>" +
        bodyHTML(a.body) + "</article>";
      document.title = a.title + "｜佛學知識｜古亭院";
    } else {
      document.title = "佛學知識｜古亭院";
    }
    window.scrollTo(0, 0);
  }

  renderFilters();
  renderList();
  window.addEventListener("hashchange", route);
  route();
});
