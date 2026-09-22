const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
const themeToggle = document.querySelector("#theme-toggle");

menuToggle?.addEventListener("click", () => nav.classList.toggle("open"));

document.querySelectorAll("#main-nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

document.querySelector("#year").textContent = new Date().getFullYear();
