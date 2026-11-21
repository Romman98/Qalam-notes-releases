// Download links point at the newest GitHub release of the public repo.
// Fixed asset names are uploaded by the release workflow, so links never change.
const SITE = {
  repo: "Romman98/Qalam-notes-releases",            // e.g. "your-user/qalam-notes"
  storeUrl: "",   // Microsoft Store link once the app is live ("" hides the button)
};

(function () {
  const base = `https://github.com/${SITE.repo}/releases`;
  document.querySelectorAll("[data-asset]").forEach((a) => {
    a.href = `${base}/latest/download/${a.dataset.asset}`;
  });
  for (const id of ["all-releases", "foot-releases"]) document.getElementById(id).href = base;
  document.getElementById("year").textContent = new Date().getFullYear();

  if (SITE.storeUrl) {
    const s = document.getElementById("store-link");
    s.href = SITE.storeUrl;
    s.classList.remove("hidden");
    document.querySelector('[data-asset="Qalam-Notes-Setup-x64.exe"]').classList.replace("primary", "ghost");
  }

  // Point the hero button at the right download for this visitor.
  const ua = navigator.userAgent;
  const hero = document.getElementById("hero-download");
  const sub = document.getElementById("hero-sub");
  if (/Windows/i.test(ua)) {
    sub.textContent = "For Windows 10 / 11 · also on Linux";
    document.getElementById("dl-windows").classList.add("you");
  } else if (/Linux/i.test(ua) && !/Android/i.test(ua)) {
    sub.textContent = "For Linux · also on Windows";
    document.getElementById("dl-linux").classList.add("you");
  } else if (/Mac/i.test(ua)) {
    sub.textContent = "Windows and Linux today, macOS is planned";
  }
  hero.href = "#download";

  // Show the latest version number (best effort; links work without it).
  fetch(`https://api.github.com/repos/${SITE.repo}/releases/latest`)
    .then((r) => (r.ok ? r.json() : null))
    .then((rel) => {
      if (!rel) return;
      const v = rel.tag_name.replace(/^v/, "");
      const d = new Date(rel.published_at).toLocaleDateString(undefined, { dateStyle: "medium" });
      document.getElementById("version-line").textContent = `Version ${v}, released ${d}.`;
    })
    .catch(() => {});

  // Screenshot tabs
  const img = document.getElementById("shot");
  document.querySelectorAll(".tabs button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("on", x === b));
      img.src = `assets/${b.dataset.shot}.webp`;
    }));
})();
