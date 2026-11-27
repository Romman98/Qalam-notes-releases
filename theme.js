// Theme: system → light → dark → system. Remembered in this browser.
(function () {
  var btn = document.getElementById("theme-btn");
  if (!btn) return;
  var order = ["system", "light", "dark"];
  var label = { system: "follows your system", light: "light", dark: "dark" };
  function current() { return document.documentElement.dataset.theme || "system"; }
  function show() { var t = current(); btn.title = "Theme: " + label[t] + " (click to change)"; btn.setAttribute("aria-label", "Theme: " + label[t]); }
  btn.addEventListener("click", function () {
    var next = order[(order.indexOf(current()) + 1) % order.length];
    if (next === "system") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = next;
    try { if (next === "system") localStorage.removeItem("theme"); else localStorage.setItem("theme", next); } catch (e) {}
    show();
  });
  show();
})();
