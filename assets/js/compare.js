// Purpose: Manages the "Compare countries" feature:
// - stores up to 2 selected countries (shared state)
// - renders a side-by-side compare modal
// - highlights "winners" for key metrics (population/area/languages)
// Exposes a small public API via window.compare so other files (like the country modal)
// can trigger compare without duplicating logic.

let compareList = []; // stores 0-2 country objects (single source of truth for compare state)

// Modal elements
const compareModal = document.getElementById("compare-modal");
const compareBody = document.getElementById("compare-body");
const compareTitle = document.getElementById("compare-title");
const compareClose = document.getElementById("compare-close");
const compareClear = document.getElementById("compare-clear");
const compareShare = document.getElementById("compare-share");

// --- Formatting helpers ---
// Keep rendering code clean by centralizing formatting rules here.
function fmt(n) {
  if (typeof n !== "number") return "N/A";
  return n.toLocaleString();
}
function langs(c) {
  return c.languages ? Object.values(c.languages).join(", ") : "N/A";
}
function curr(c) {
  if (!c.currencies) return "N/A";
  return Object.values(c.currencies)
    .map((x) => (x.symbol ? `${x.name} (${x.symbol})` : x.name))
    .join(", ");
}

// Stable identifier used for dedupe comparisons.
// Prefer cca3 when available; fall back to common name if needed.
function idOf(c) {
  return c.cca3 || c.name?.common || "";
}
function isSame(a, b) {
  return idOf(a) && idOf(b) && idOf(a) === idOf(b);
}

// (Optional styling hook) winner/loser wrapper styles.
// Currently used as a reusable utility even if called with false in markup.
function winnerClass(isWinner) {
  // subtle highlight, works in dark mode too
  return isWinner
    ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
    : "bg-gray-50 dark:bg-white/5";
}

// Renders the compare modal using the two selected countries.
// Will only open when exactly 2 countries are selected.
function openCompareModal() {
  if (!compareModal || compareList.length !== 2) return;

  const [a, b] = compareList;

  compareTitle.textContent = `Compare: ${a.name?.common} vs ${b.name?.common}`;

  // Use -1 as a sentinel fallback so missing values always "lose" comparisons
  // (real values are non-negative, so they beat -1).
  const popA = a.population ?? -1;
  const popB = b.population ?? -1;
  const areaA = a.area ?? -1;
  const areaB = b.area ?? -1;
  const langA = a.languages ? Object.keys(a.languages).length : -1;
  const langB = b.languages ? Object.keys(b.languages).length : -1;

  // Highlight logic is computed at render time so UI always reflects current state.
  compareBody.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Country A -->
      <div class="rounded-lg p-4 ${winnerClass(false)}">
        <div class="flex items-center gap-3 mb-3">
          <img src="${a.flags?.png || a.flags?.svg || ""}" alt="" class="w-14 h-10 object-cover rounded shadow" />
          <div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">${a.name?.common || "—"}</div>
            <div class="text-sm text-gray-600 dark:text-white/70">${a.region || "—"}</div>
          </div>
        </div>

        ${row("Capital", a.capital?.[0] || "N/A")}
        ${row("Population", fmt(a.population), popA > popB)}
        ${row("Area", a.area ? `${fmt(a.area)} km²` : "N/A", areaA > areaB)}
        ${row("Languages", langs(a), langA > langB)}
        ${row("Currencies", curr(a))}
        ${row("Timezones", a.timezones?.join(", ") || "N/A")}
      </div>

      <!-- Country B -->
      <div class="rounded-lg p-4 ${winnerClass(false)}">
        <div class="flex items-center gap-3 mb-3">
          <img src="${b.flags?.png || b.flags?.svg || ""}" alt="" class="w-14 h-10 object-cover rounded shadow" />
          <div>
            <div class="text-lg font-bold text-gray-900 dark:text-white">${b.name?.common || "—"}</div>
            <div class="text-sm text-gray-600 dark:text-white/70">${b.region || "—"}</div>
          </div>
        </div>

        ${row("Capital", b.capital?.[0] || "N/A")}
        ${row("Population", fmt(b.population), popB > popA)}
        ${row("Area", b.area ? `${fmt(b.area)} km²` : "N/A", areaB > areaA)}
        ${row("Languages", langs(b), langB > langA)}
        ${row("Currencies", curr(b))}
        ${row("Timezones", b.timezones?.join(", ") || "N/A")}
      </div>
    </div>

    <p class="mt-3 text-sm text-gray-600 dark:text-white/70">
      Tip: highlighted rows show which country has the larger value.
    </p>
  `;

  compareModal.classList.remove("hidden");
}

// Renders one label/value row, with optional highlight styling for "winner" rows.
function row(label, value, highlight = false) {
  const cls = highlight
    ? "bg-emerald-100 dark:bg-emerald-500/15"
    : "bg-transparent";
  return `
    <div class="flex items-start justify-between gap-3 py-2 border-b last:border-b-0 border-gray-200 dark:border-white/10 ${cls}">
      <span class="text-sm font-semibold text-gray-700 dark:text-white/80">${label}</span>
      <span class="text-sm text-gray-900 dark:text-white text-right">${value}</span>
    </div>
  `;
}

// Public API for other scripts (ex: country_modal.js) to call without direct imports.
// This keeps compare state/logic centralized (single source of truth).
window.compare = {
  getList: () => compareList,

  add: (country) => {
    // Prevent duplicates (same country added twice)
    if (compareList.some((c) => isSame(c, country))) return;

    // Maintain a maximum of 2 items:
    // - if < 2, append
    // - if already 2, replace the oldest selection (simple and predictable UX)
    if (compareList.length < 2) compareList.push(country);
    else {
      compareList.shift();
      compareList.push(country);
    }

    // Update URL so compare state can be preserved/shared (optional feature).
    // Safe to keep even if you don't expose a "Copy URL" button.
    const [a, b] = compareList;
    const params = new URLSearchParams(window.location.search);
    if (compareList.length === 2) {
      params.set("compare", `${idOf(a)}|${idOf(b)}`);
    } else {
      params.set("compare", idOf(compareList[0]));
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );

    // "Wow moment": automatically open compare when the selection is complete.
    if (compareList.length === 2) openCompareModal();
  },

  clear: () => {
    // Reset compare state and close the compare modal for a clean restart.
    compareList = [];
    const params = new URLSearchParams(window.location.search);
    params.delete("compare");
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
    if (compareModal) compareModal.classList.add("hidden");
  },

  open: openCompareModal,
};

// Close handlers (click X, click outside, Escape) for consistent modal behavior.
if (compareClose)
  compareClose.addEventListener("click", () =>
    compareModal.classList.add("hidden")
  );

if (compareModal) {
  compareModal.addEventListener("click", (e) => {
    if (e.target === compareModal) compareModal.classList.add("hidden");
  });
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    compareModal &&
    !compareModal.classList.contains("hidden")
  ) {
    compareModal.classList.add("hidden");
  }
});

if (compareClear)
  compareClear.addEventListener("click", () => window.compare.clear());

// Share button is optional. If the element doesn't exist in HTML, this block safely does nothing.
if (compareShare) {
  compareShare.addEventListener("click", async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      compareShare.textContent = "Copied!";
      setTimeout(() => (compareShare.textContent = "Copy share link"), 1200);
    } catch {
      // Clipboard can be blocked in some browsers/contexts; prompt is the fallback.
      prompt("Copy this link:", url);
    }
  });
}