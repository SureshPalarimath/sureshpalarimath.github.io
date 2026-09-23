document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelector(".nav-links");
  const menuToggle = document.querySelector(".menu-toggle");
  const themeToggle = document.querySelector(".theme-toggle");

  const menu = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["teaching.html", "Teaching"],
    ["research.html", "Research"],
    ["experience.html", "Experience & Qualifications"],
    ["publications.html", "Publications"],
    ["patents.html", "Patents"],
    ["achievements.html", "Achievements"],
    ["contact.html", "Contact"]
  ];

  if (navLinks) {
    const current = window.location.pathname.split("/").pop() || "index.html";
    navLinks.innerHTML = menu.map(([href, label]) =>
      `<a href="${href}"${current === href ? ' class="active"' : ""}>${label}</a>`
    ).join("");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
    navLinks.addEventListener("click", () => navLinks.classList.remove("open"));
  }

  const savedTheme = localStorage.getItem("site-theme");
  if (savedTheme === "light") document.body.classList.add("light-theme");

  if (themeToggle) {
    themeToggle.textContent = document.body.classList.contains("light-theme") ? "☀" : "◐";
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const light = document.body.classList.contains("light-theme");
      localStorage.setItem("site-theme", light ? "light" : "dark");
      themeToggle.textContent = light ? "☀" : "◐";
    });
  }

  document.querySelectorAll("#year").forEach(el => el.textContent = new Date().getFullYear());

  const search = document.getElementById("pubSearch");
  const yearFilter = document.getElementById("yearFilter");
  const authorFilter = document.getElementById("authorFilter");
  const quartileFilter = document.getElementById("quartileFilter");
  const publisherFilter = document.getElementById("publisherFilter");
  const result = document.getElementById("filterResult");
  const entries = [...document.querySelectorAll(".publication-entry")];

  if (entries.length && (search || yearFilter || authorFilter || quartileFilter || publisherFilter)) {
    const addOptions = (select, values) => {
      if (!select) return;
      [...new Set(values.filter(Boolean))].sort((a,b) =>
        a.localeCompare(b, undefined, {numeric:true, sensitivity:"base"})
      ).forEach(value => {
        const o = document.createElement("option");
        o.value = value;
        o.textContent = value;
        select.appendChild(o);
      });
    };

    addOptions(yearFilter, entries.map(e => e.querySelector(".pub-year")?.textContent.trim()));
    addOptions(authorFilter, entries.map(e => e.querySelector(".pub-number")?.textContent.trim()));
    addOptions(quartileFilter, entries.map(e =>
      e.querySelector(".quartile-badge")?.textContent.trim() ||
      (e.textContent.includes("Non-Scopus") ? "Non-Scopus" : "")
    ));
    addOptions(publisherFilter, entries.map(e => {
      const p = [...e.querySelectorAll("p")].find(x => x.textContent.includes("Publisher:"));
      return p ? p.textContent.replace("Publisher:", "").trim() : "";
    }));

    const filter = () => {
      const q = (search?.value || "").toLowerCase().trim();
      const year = yearFilter?.value || "all";
      const author = authorFilter?.value || "all";
      const quartile = quartileFilter?.value || "all";
      const publisher = publisherFilter?.value || "all";
      let visible = 0;

      entries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        const ey = entry.querySelector(".pub-year")?.textContent.trim() || "";
        const ea = entry.querySelector(".pub-number")?.textContent.trim() || "";
        const eq = entry.querySelector(".quartile-badge")?.textContent.trim() ||
          (entry.textContent.includes("Non-Scopus") ? "Non-Scopus" : "");
        const pn = [...entry.querySelectorAll("p")].find(x => x.textContent.includes("Publisher:"));
        const ep = pn ? pn.textContent.replace("Publisher:", "").trim() : "";

        const match = (!q || text.includes(q)) &&
          (year === "all" || ey === year) &&
          (author === "all" || ea === author) &&
          (quartile === "all" || eq === quartile) &&
          (publisher === "all" || ep === publisher);

        entry.style.display = match ? "" : "none";
        if (match) visible++;
      });

      if (result) result.textContent = `Showing ${visible} of ${entries.length} publications`;
    };

    [search, yearFilter, authorFilter, quartileFilter, publisherFilter]
      .filter(Boolean).forEach(c => c.addEventListener("input", filter));

    filter();
  }
});