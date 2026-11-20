/* Shared behaviour for every page: theme toggle, mobile menu, live numbers,
   and rendering of publications, books, patents and grants from data.js. */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("theme", t); } catch (e) {}
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest(".theme-toggle")) {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    }
    var menuBtn = e.target.closest(".menu-toggle");
    if (menuBtn) {
      var nav = document.getElementById("site-nav");
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }
  });
  setTheme(root.getAttribute("data-theme") || "light");

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var TYPE_LABEL = { journal: "Journal article", conference: "Conference paper", chapter: "Book chapter" };
  var hasData = typeof SITE !== "undefined";

  /* ---------- Numbers (stats) ---------- */
  function fillStats(stats) {
    document.querySelectorAll("[data-stat]").forEach(function (el) {
      var key = el.getAttribute("data-stat");
      if (stats[key] != null) el.textContent = stats[key] + (el.hasAttribute("data-plus") ? "+" : "");
    });
  }
  if (hasData) {
    fillStats(SITE);
    // Live Google Scholar numbers, written daily by the GitHub Action (see README).
    if (window.fetch && location.protocol.indexOf("http") === 0) {
      fetch("data/metrics.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (m) {
          if (!m) return;
          var s = Object.assign({}, SITE);
          ["citations", "hIndex", "i10Index"].forEach(function (k) { if (m[k]) s[k] = m[k]; });
          fillStats(s);
          document.querySelectorAll("[data-metrics-date]").forEach(function (el) {
            if (m.updated && m.source !== "manual") el.textContent = "Citation figures from Google Scholar, updated " + m.updated + ".";
          });
        })
        .catch(function () {});
    }
  }

  /* ---------- Publication item ---------- */
  function pubItem(p, showType) {
    var meta = [];
    if (showType) meta.push('<span class="badge type">' + TYPE_LABEL[p.type] + "</span>");
    if (p.publisher) meta.push("<span>" + esc(p.publisher) + "</span>");
    if (p.index) meta.push('<span class="badge">' + esc(p.index === "Non-Scopus" ? "Non-Scopus" : "Scopus " + p.index) + "</span>");
    meta.push("<span>" + esc(p.position) + " author</span>");
    if (p.doi) meta.push('<span>DOI <a href="https://doi.org/' + esc(p.doi) + '" target="_blank" rel="noopener">' + esc(p.doi) + "</a></span>");
    else if (p.url) meta.push('<a href="' + esc(p.url) + '" target="_blank" rel="noopener">View publication</a>');
    return '<li class="pub"><span class="pub-year">' + p.year + '</span><div>' +
      '<p class="pub-title">' + esc(p.title) + "</p>" +
      '<p class="pub-venue">' + esc(p.venue || "") + "</p>" +
      '<div class="pub-meta">' + meta.join("") + "</div></div></li>";
  }

  /* Selected publications (home, research) */
  document.querySelectorAll("[data-selected-pubs]").forEach(function (el) {
    if (!hasData) return;
    var limit = parseInt(el.getAttribute("data-selected-pubs"), 10) || 99;
    el.innerHTML = PUBLICATIONS.filter(function (p) { return p.selected; })
      .sort(function (a, b) { return b.year - a.year; })
      .slice(0, limit).map(function (p) { return pubItem(p, true); }).join("");
  });

  /* Full publication list with filters */
  var list = document.getElementById("pub-list");
  if (list && hasData) {
    var q = document.getElementById("pub-search"),
        fType = document.getElementById("pub-type"),
        fYear = document.getElementById("pub-year"),
        fPos = document.getElementById("pub-position"),
        count = document.getElementById("pub-count");

    var years = Array.from(new Set(PUBLICATIONS.map(function (p) { return p.year; }))).sort(function (a, b) { return b - a; });
    years.forEach(function (y) { fYear.insertAdjacentHTML("beforeend", '<option value="' + y + '">' + y + "</option>"); });

    // Counts per type, computed from the data so they never disagree with the list
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var t = el.getAttribute("data-count");
      el.textContent = t === "all" ? PUBLICATIONS.length : PUBLICATIONS.filter(function (p) { return p.type === t; }).length;
    });

    // Allow links like publications.html#conference
    var hash = location.hash.replace("#", "");
    if (TYPE_LABEL[hash]) fType.value = hash;

    function render() {
      var term = q.value.trim().toLowerCase();
      var rows = PUBLICATIONS.filter(function (p) {
        if (fType.value !== "all" && p.type !== fType.value) return false;
        if (fYear.value !== "all" && String(p.year) !== fYear.value) return false;
        if (fPos.value === "first" && p.position !== "First") return false;
        if (term) {
          var hay = [p.title, p.venue, p.publisher, p.doi, p.year].join(" ").toLowerCase();
          if (hay.indexOf(term) === -1) return false;
        }
        return true;
      }).sort(function (a, b) { return b.year - a.year; });
      list.innerHTML = rows.length ? rows.map(function (p) { return pubItem(p, true); }).join("")
        : '<li class="pub"><span></span><div>No publications match these filters. Clear the search or choose "All".</div></li>';
      count.textContent = "Showing " + rows.length + " of " + PUBLICATIONS.length + " listed records";
    }
    [q, fType, fYear, fPos].forEach(function (el) { el.addEventListener("input", render); });
    render();
  }

  /* ---------- Books ---------- */
  var books = document.getElementById("book-list");
  if (books && hasData) {
    books.innerHTML = BOOKS.map(function (b) {
      var meta = ["<span>" + esc(b.authors) + "</span>"];
      if (b.isbn) meta.push("<span>ISBN " + esc(b.isbn) + "</span>");
      if (b.url) meta.push('<a href="' + esc(b.url) + '" target="_blank" rel="noopener">View book</a>');
      return '<li class="pub"><span class="pub-year">' + b.year + '</span><div><p class="pub-title">' + esc(b.title) +
        '</p><p class="pub-venue">' + esc(b.publisher) + '</p><div class="pub-meta">' + meta.join("") + "</div></div></li>";
    }).join("");
  }

  /* ---------- Patents ---------- */
  var pat = document.getElementById("patent-rows");
  if (pat && hasData) {
    var fmt = function (d) {
      var dt = new Date(d + "T00:00:00");
      return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    };
    pat.innerHTML = PATENTS.map(function (p) {
      var num = p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.number) + "</a>" : esc(p.number);
      return "<tr><td><strong>" + esc(p.title) + "</strong></td><td>" + esc(p.country) + "</td><td>" + esc(p.kind) +
        '</td><td class="num">' + num + '</td><td class="num">' + fmt(p.date) + "</td></tr>";
    }).join("");
  }

  /* ---------- Grants ---------- */
  var gr = document.getElementById("grant-rows");
  if (gr && hasData) {
    gr.innerHTML = GRANTS.map(function (g) {
      return '<tr><td class="num">' + g.year + "</td><td><strong>" + esc(g.title) + "</strong><br><span style=\"color:var(--muted)\">" +
        esc(g.funder) + '</span></td><td class="num">' + esc(g.amount) + "</td><td>" + esc(g.status) + "</td></tr>";
    }).join("");
  }
})();
