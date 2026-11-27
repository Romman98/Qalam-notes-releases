// Light/dark switch: each click flips what you see. Picking the same theme as your
// system goes back to following the system; anything else is remembered in this browser.
(function () {
  var btn = document.getElementById("theme-btn");
  if (!btn) return;
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  function shown() { return root.dataset.theme || (mq.matches ? "dark" : "light"); }
  function show() {
    var next = shown() === "dark" ? "light" : "dark";
    btn.title = "Switch to " + next + " mode";
    btn.setAttribute("aria-label", btn.title);
  }
  btn.addEventListener("click", function () {
    var next = shown() === "dark" ? "light" : "dark";
    var system = mq.matches ? "dark" : "light";
    if (next === system) delete root.dataset.theme; else root.dataset.theme = next;
    try { if (next === system) localStorage.removeItem("theme"); else localStorage.setItem("theme", next); } catch (e) {}
    show();
  });
  if (mq.addEventListener) mq.addEventListener("change", show);
  show();
})();
