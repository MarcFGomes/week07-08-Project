let compareList = []; // stores 0-2 country objects

const compareModal = document.getElementById("compare-modal");
const compareBody = document.getElementById("compare-body");
const compareTitle = document.getElementById("compare-title");
const compareClose = document.getElementById("compare-close");
const compareClear = document.getElementById("compare-clear");
const compareShare = document.getElementById("compare-share");

// --- Helpers ---
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
    .map(x => (x.symbol ? `${x.name} (${x.symbol})` : x.name))
    .join(", ");
}
function idOf(c) {
  return c.cca3 || c.name?.common || "";
}
function isSame(a, b) {
  return idOf(a) && idOf(b) && idOf(a) === idOf(b);
}

// --- Smart highlight (winner/loser) ---
function winnerClass(isWinner) {
  // subtle highlight, works in dark mode too
  return isWinner
    ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
    : "bg-gray-50 dark:bg-white/5";
}

function openCompareModal() {
  if (!compareModal || compareList.length !== 2) return;

  const [a, b] = compareList;

  compareTitle.textContent = `Compare: ${a.name?.common} vs ${b.name?.common}`;

  const popA = a.population ?? -1;
  const popB = b.population ?? -1;
  const areaA = a.area ?? -1;
  const areaB = b.area ?? -1;
  const langA = a.languages ? Object.keys(a.languages).length : -1;
  const langB = b.languages ? Object.keys(b.languages).length : -1;

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

// Expose functions for other files to call
window.compare = {
  getList: () => compareList,
  add: (country) => {
    // prevent duplicates
    if (compareList.some(c => isSame(c, country))) return;

    if (compareList.length < 2) compareList.push(country);
    else {
      compareList.shift();
      compareList.push(country);
    }

    // update URL for sharing
    const [a, b] = compareList;
    const params = new URLSearchParams(window.location.search);
    if (compareList.length === 2) {
      params.set("compare", `${idOf(a)}|${idOf(b)}`);
    } else {
      params.set("compare", idOf(compareList[0]));
    }
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);

    // auto-open when ready (wow moment)
    if (compareList.length === 2) openCompareModal();
  },
  clear: () => {
    compareList = [];
    const params = new URLSearchParams(window.location.search);
    params.delete("compare");
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    if (compareModal) compareModal.classList.add("hidden");
  },
  open: openCompareModal,
};

// Close handlers
if (compareClose) compareClose.addEventListener("click", () => compareModal.classList.add("hidden"));
if (compareModal) {
  compareModal.addEventListener("click", (e) => {
    if (e.target === compareModal) compareModal.classList.add("hidden");
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && compareModal && !compareModal.classList.contains("hidden")) {
    compareModal.classList.add("hidden");
  }
});

if (compareClear) compareClear.addEventListener("click", () => window.compare.clear());

if (compareShare) {
  compareShare.addEventListener("click", async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      compareShare.textContent = "Copied!";
      setTimeout(() => (compareShare.textContent = "Copy share link"), 1200);
    } catch {
      // fallback
      prompt("Copy this link:", url);
    }
  });
}