// Download links point at the newest GitHub release of the public repo.
// Fixed asset names are uploaded by the release workflow, so links never change.
const SITE = {
  repo: "Romman98/Qalam-notes-releases",            // e.g. "your-user/qalam-notes"
  storeUrl: "",   // Microsoft Store link once the app is live ("" hides the button)
  feedbackUrl: "https://script.google.com/macros/s/AKfycbzqhQETzpf0Gk3uQ2yDdhddVXodL0HsqoEDNgLxtATgyoNhy9G-reHV1rF0oO1VCZQ/exec", // Google Apps Script web app ("" hides feedback and reviews)
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

  if (SITE.feedbackUrl) { setupFeedback(); loadReviews(); }

  // Screenshot tabs
  const img = document.getElementById("shot");
  document.querySelectorAll(".tabs button").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("on", x === b));
      img.src = `assets/${b.dataset.shot}.webp`;
    }));
})();

// Reviews: only real, approved reviews from the feedback sheet. The section
// stays hidden until there is at least one.
function loadReviews() {
  fetch(`${SITE.feedbackUrl}?action=reviews`)
    .then((r) => (r.ok ? r.json() : null))
    .then((d) => {
      const list = d && d.ok && Array.isArray(d.reviews) ? d.reviews : [];
      if (!list.length) return;
      const grid = document.getElementById("rv-grid");
      for (const r of list.slice(0, 9)) {
        const card = document.createElement("article");
        card.className = "rv";
        const stars = document.createElement("div");
        stars.className = "rv-stars";
        stars.setAttribute("aria-label", `${r.rating} out of 5`);
        stars.textContent = r.rating ? "★★★★★".slice(0, r.rating) + "☆☆☆☆☆".slice(0, 5 - r.rating) : "";
        const text = document.createElement("p");
        text.textContent = r.text;
        const who = document.createElement("div");
        who.className = "rv-who";
        who.textContent = r.name + (r.date ? ` · ${new Date(r.date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}` : "");
        card.append(stars, text, who);
        grid.append(card);
      }
      const rated = list.filter((r) => r.rating);
      if (rated.length) {
        const avg = rated.reduce((n, r) => n + r.rating, 0) / rated.length;
        document.getElementById("reviews-lead").textContent = `${avg.toFixed(1)} out of 5 from ${rated.length} review${rated.length > 1 ? "s" : ""}.`;
      }
      document.getElementById("reviews").classList.remove("hidden");
    })
    .catch(() => {});
}

function setupFeedback() {
  document.getElementById("feedback").classList.remove("hidden");
  document.getElementById("foot-feedback").classList.remove("hidden");
  const form = document.getElementById("fb-form");
  const status = document.getElementById("fb-status");
  const starsBox = document.getElementById("fb-stars");
  let rating = 0;
  const paint = () => starsBox.querySelectorAll("button").forEach((b, i) => b.classList.toggle("on", i < rating));
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = "★";
    b.setAttribute("aria-label", `${i} star${i > 1 ? "s" : ""}`);
    b.addEventListener("click", () => { rating = i; paint(); });
    starsBox.append(b);
  }
  const sync = () => {
    const review = form.type.value === "review";
    starsBox.classList.toggle("hidden", !review);
    document.getElementById("fb-public-row").classList.toggle("hidden", !review);
  };
  form.querySelectorAll('input[name="type"]').forEach((r) => r.addEventListener("change", sync));
  sync();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = form.message.value.trim();
    if (message.length < 3) { status.textContent = "Please write a message."; form.message.focus(); return; }
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = "Sending…";
    const body = {
      type: form.type.value, rating: form.type.value === "review" ? rating : 0, message,
      name: form.name.value.trim(), email: form.email.value.trim(),
      public: form.type.value === "review" && form.public.checked,
      website: form.website.value, source: "website", os: navigator.platform || "",
    };
    try {
      // text/plain keeps this a "simple" request (no CORS preflight, which Apps Script can't answer)
      const r = await fetch(SITE.feedbackUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "failed");
      form.reset(); rating = 0; paint(); sync();
      status.textContent = "Thank you! Your message was sent.";
    } catch (err) {
      status.textContent = `Couldn't send it (${err.message}). Please try again, or email romman.ahmad@outlook.com.`;
    } finally {
      btn.disabled = false;
    }
  });
}
