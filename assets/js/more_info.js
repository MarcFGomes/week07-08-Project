// Purpose: Controls the "More info" country modal:
// - populates modal fields from a country object
// - handles open/close interactions (X, outside click, Escape)
// - wires the Compare button to shared compare logic (window.compare)

const compareBtn = document.getElementById("country-modal-compare");

// Modal + controls
const countryModal = document.getElementById("country-modal");
const countryModalClose = document.getElementById("country-modal-close");
const countryModalClose2 = document.getElementById("country-modal-close-2");

// Modal content elements (filled dynamically)
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

// Formatting helper to keep UI consistent and prevent "undefined" showing up
function formatNumber(n) {
  if (typeof n !== "number") return "N/A";
  return n.toLocaleString();
}

// Normalize language object into a readable string for display
function getLanguages(country) {
  const langs = country.languages ? Object.values(country.languages) : [];
  return langs.length ? langs.join(", ") : "N/A";
}

// Normalize currencies object into readable names (and symbols when available)
function getCurrencies(country) {
  if (!country.currencies) return "N/A";
  const entries = Object.values(country.currencies); // { name, symbol }
  if (!entries.length) return "N/A";
  return entries
    .map((c) => (c.symbol ? `${c.name} (${c.symbol})` : c.name))
    .join(", ");
}

// Opens the modal and hydrates it with data from the selected country
function openCountryModal(country) {
  if (!countryModal) return;

  cmTitle.textContent = `${country.name?.common || "Country"} details`;

  cmFlag.src = country.flags?.svg || country.flags?.png || "";
  cmFlag.alt = `${country.name?.common || "Country"} flag`;

  cmOfficial.textContent = country.name?.official || "N/A";
  cmCapital.textContent = country.capital?.[0] || "N/A";
  cmRegion.textContent = country.region || "N/A";

  cmPopulation.textContent = formatNumber(country.population);
  cmArea.textContent = country.area
    ? `${formatNumber(country.area)} km²`
    : "N/A";

  cmLanguages.textContent = getLanguages(country);
  cmCurrencies.textContent = getCurrencies(country);
  cmTimezones.textContent = country.timezones?.length
    ? country.timezones.join(", ")
    : "N/A";

  // Maps link:
  // Prefer exact coordinates when available for better accuracy,
  // otherwise fall back to searching by country name.
  const [lat, lng] = country.latlng || [];
  const mapsUrl =
    lat != null && lng != null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : `https://www.google.com/maps?q=${encodeURIComponent(
          country.name?.common || ""
        )}`;

  cmMaps.href = mapsUrl;

  // Compare button state is computed each time the modal opens
  // so the UI always reflects current compare selection.
  if (compareBtn) {
    const list = window.compare?.getList?.() || [];
    const alreadyAdded = list.some(
      (c) => c.cca3 && country.cca3 && c.cca3 === country.cca3
    );

    // Reset button appearance on every open (prevents stale "Added ✓" state)
    compareBtn.textContent = alreadyAdded ? "Added ✓" : "Add to Compare";
    compareBtn.disabled = alreadyAdded;

    compareBtn.classList.toggle("opacity-60", alreadyAdded);
    compareBtn.classList.toggle("cursor-not-allowed", alreadyAdded);

    // Use onclick to avoid stacking multiple listeners across modal opens
    compareBtn.onclick = () => {
      if (!alreadyAdded && window.compare?.add) {
        window.compare.add(country);

        // Immediate feedback so users know the click worked
        compareBtn.textContent = "Added ✓";
        compareBtn.disabled = true;
        compareBtn.classList.add("opacity-60", "cursor-not-allowed");
      }
    };
  }

  countryModal.classList.remove("hidden");
}

// Centralized close logic used by all close actions
function closeCountryModal() {
  if (!countryModal) return;
  countryModal.classList.add("hidden");
}

// Close: X buttons
if (countryModalClose)
  countryModalClose.addEventListener("click", closeCountryModal);

if (countryModalClose2)
  countryModalClose2.addEventListener("click", closeCountryModal);

// Close: click outside modal content
if (countryModal) {
  countryModal.addEventListener("click", (e) => {
    if (e.target === countryModal) closeCountryModal();
  });
}

// Close: Escape key (accessibility + expected modal behavior)
document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    countryModal &&
    !countryModal.classList.contains("hidden")
  ) {
    closeCountryModal();
  }
});