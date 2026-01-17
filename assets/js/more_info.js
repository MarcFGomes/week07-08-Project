const compareBtn = document.getElementById("country-modal-compare");

// Country modal logic
const countryModal = document.getElementById("country-modal");
const countryModalClose = document.getElementById("country-modal-close");
const countryModalClose2 = document.getElementById("country-modal-close-2");

// Fill elements
const cmTitle = document.getElementById("country-modal-title");
const cmFlag = document.getElementById("country-modal-flag");
const cmOfficial = document.getElementById("country-modal-official");
const cmCapital = document.getElementById("country-modal-capital");
const cmRegion = document.getElementById("country-modal-region");
const cmPopulation = document.getElementById("country-modal-population");
const cmArea = document.getElementById("country-modal-area");
const cmLanguages = document.getElementById("country-modal-languages");
const cmCurrencies = document.getElementById("country-modal-currencies");
const cmTimezones = document.getElementById("country-modal-timezones");
const cmMaps = document.getElementById("country-modal-maps");

function formatNumber(n) {
  if (typeof n !== "number") return "N/A";
  return n.toLocaleString();
}

function getLanguages(country) {
  const langs = country.languages ? Object.values(country.languages) : [];
  return langs.length ? langs.join(", ") : "N/A";
}

function getCurrencies(country) {
  if (!country.currencies) return "N/A";
  const entries = Object.values(country.currencies); // { name, symbol }
  if (!entries.length) return "N/A";
  return entries
    .map((c) => (c.symbol ? `${c.name} (${c.symbol})` : c.name))
    .join(", ");
}

function openCountryModal(country) {
  if (!countryModal) return;

  cmTitle.textContent = `${country.name?.common || "Country"} details`;

  cmFlag.src = country.flags?.svg || country.flags?.png || "";
  cmFlag.alt = `${country.name?.common || "Country"} flag`;

  cmOfficial.textContent = country.name?.official || "N/A";
  cmCapital.textContent = country.capital?.[0] || "N/A";
  cmRegion.textContent = country.region || "N/A";

  cmPopulation.textContent = formatNumber(country.population);
  cmArea.textContent = country.area ? `${formatNumber(country.area)} km²` : "N/A";

  cmLanguages.textContent = getLanguages(country);
  cmCurrencies.textContent = getCurrencies(country);
  cmTimezones.textContent = country.timezones?.length
    ? country.timezones.join(", ")
    : "N/A";

  // Maps link
  const [lat, lng] = country.latlng || [];
  const mapsUrl =
    lat != null && lng != null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : `https://www.google.com/maps?q=${encodeURIComponent(
          country.name?.common || ""
        )}`;

  cmMaps.href = mapsUrl;

    // Compare button wiring (requires compare.js to define window.compare.add)
  if (compareBtn) {
  const list = window.compare?.getList?.() || [];
  const alreadyAdded = list.some(
    (c) => c.cca3 && country.cca3 && c.cca3 === country.cca3
  );

  // Reset UI state correctly on every modal open
  compareBtn.textContent = alreadyAdded ? "Added ✓" : "Add to Compare";
  compareBtn.disabled = alreadyAdded;

  compareBtn.classList.toggle("opacity-60", alreadyAdded);
  compareBtn.classList.toggle("cursor-not-allowed", alreadyAdded);

  // Replace click handler (no stacking)
  compareBtn.onclick = () => {
    if (!alreadyAdded && window.compare?.add) {
      window.compare.add(country);

      // Immediate feedback
      compareBtn.textContent = "Added ✓";
      compareBtn.disabled = true;
      compareBtn.classList.add("opacity-60", "cursor-not-allowed");
    }
  };
}

  countryModal.classList.remove("hidden");
}

function closeCountryModal() {
  if (!countryModal) return;
  countryModal.classList.add("hidden");
}

// Close: X buttons
if (countryModalClose) countryModalClose.addEventListener("click", closeCountryModal);
if (countryModalClose2) countryModalClose2.addEventListener("click", closeCountryModal);

// Close: click outside
if (countryModal) {
  countryModal.addEventListener("click", (e) => {
    if (e.target === countryModal) closeCountryModal();
  });
}

// Close: Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && countryModal && !countryModal.classList.contains("hidden")) {
    closeCountryModal();
  }
});