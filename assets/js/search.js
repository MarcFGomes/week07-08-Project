// Purpose: Orchestrates search interactions + URL state + UI feedback:
// - deep links (query + mode in the URL)
// - search via input/button + history clicks
// - error modal behavior
// - skeleton loading UI
// Keeps "controller" logic here while API calls and rendering live elsewhere.

// -----------------------------
// Deep link helpers
// -----------------------------

// Keeps the current search state in the URL so users can refresh/share without losing context.
function setSearchUrl(query, mode) {
  const params = new URLSearchParams(window.location.search);
  params.set("query", query);
  params.set("mode", mode);

  // replaceState avoids polluting browser history with every search
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

// Clears URL parameters to return to a "clean" home state (no active search in address bar).
function clearSearchUrl() {
  window.history.replaceState({}, "", window.location.pathname);
}

// On page load, re-hydrate the app from URL params so the view matches the link.
function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");
  const mode = params.get("mode");

  // If the URL doesn't include a complete state, do nothing (stay on home view).
  if (!query || !mode) return;

  // Sync UI controls so the visible inputs match the loaded search.
  placeInput.value = query;
  searchMode.value = mode;

  // Keep the placeholder consistent with the selected search mode.
  if (mode === "country") {
    placeInput.placeholder = "Search by country name";
  } else if (mode === "capital") {
    placeInput.placeholder = "Search by capital city";
  }

  // Reuse the same flow as a normal user search to keep behavior consistent.
  const normalized = normalize(query);
  addSearch(normalized, mode);
  render();
  saveState();

  // Compute the index used by your history array (needed for cleanup on invalid results).
  const indexToPass = previousSearches.findIndex(
    (item) => item.value === normalized
  );

  fetchPlaceData(normalized, mode, indexToPass);
}

// Run once when the page loads so shared links restore state automatically.
document.addEventListener("DOMContentLoaded", loadFromUrl);

// -----------------------------
// Search handlers
// -----------------------------

// Enter key triggers search for faster UX.
placeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

// Clicking the search button triggers the same handler (single source of truth).
searchButton.addEventListener("click", () => {
  handleSearch();
});

const handleSearch = () => {
  let searchValue = placeInput.value.trim();
  const mode = searchMode.value;

  // Guard clause: prevent empty searches and keep URL clean.
  if (!searchValue) {
    showModal("Please enter a place to search");
    clearSearchUrl();
    return;
  }

  // Normalize input so history + comparisons remain consistent (e.g., spacing/case/accents).
  searchValue = normalize(searchValue);

  // Update URL to reflect current state (supports refresh/share).
  setSearchUrl(searchValue, mode);

  // Update app state + history, then fetch data.
  addSearch(searchValue, mode);
  render();
  saveState();

  // Clear input for a smoother repeated-search experience.
  placeInput.value = "";

  const indexToPass = previousSearches.findIndex(
    (item) => item.value === searchValue
  );

  fetchPlaceData(searchValue, mode, indexToPass);
};

// Searching from previous value (history dropdown)
// Note: we move clicked item to the end to represent "most recent search".
const handleQuickSearch = (place) => {
  const index = previousSearches.findIndex((item) => item.value === place);
  const typeOfSearch = previousSearches[index].type;

  previousSearches.splice(index, 1);
  previousSearches.push({ value: place, type: typeOfSearch });

  // Keep URL in sync when searching via history too.
  setSearchUrl(place, typeOfSearch);

  render();
  saveState();

  placeInput.value = "";

  fetchPlaceData(place, typeOfSearch, index);
};

// Render previous searches on refresh/opening site so history persists.
render();

// -----------------------------
// Modal logic (error modal)
// -----------------------------

// Centralized modal helpers so other files can show/hide errors consistently.
const showModal = (sentence) => {
  modalText.textContent = sentence;
  modal.classList.remove("hidden");
};

const hideModal = () => {
  modal.classList.add("hidden");
};

// Close patterns: X button, click outside, Escape key (standard modal UX).
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", hideModal);
}

if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    hideModal();
  }
});

// -----------------------------
// Placeholder logic
// -----------------------------

// Keep placeholder text aligned with search mode for better user guidance.
searchMode.addEventListener("change", () => {
  if (searchMode.value === "country") {
    placeInput.placeholder = "Search by country name";
  } else if (searchMode.value === "capital") {
    placeInput.placeholder = "Search by capital city";
  }
  placeInput.focus();
});

// -----------------------------
// Skeleton loading UI
// -----------------------------

// Skeletons improve perceived performance while APIs load (prevents layout jump).
const showSkeletons = () => {
  resultsContainer.innerHTML = "";

  // Shared height ensures skeletons match final cards (reduces layout shift).
  const CARD_H = "h-80"; // change to "h-96" if you later decide

  const leftCol = document.createElement("div");
  leftCol.classList.add("w-full", "sm:w-1/3", "flex", "flex-col", "gap-6");

  const rightCol = document.createElement("div");
  rightCol.classList.add("w-full", "sm:w-2/3", "flex", "flex-col", "gap-6");

  // Base skeleton styles reused across cards to keep design consistent.
  const base = [
    "skeleton-card",
    "relative",
    "overflow-hidden",
    "bg-pink-500",
    "shadow-lg",
    "rounded-lg",
    CARD_H,
  ];

  const skeletonCountry = document.createElement("div");
  skeletonCountry.classList.add(...base);

  const skeletonMap = document.createElement("div");
  skeletonMap.classList.add(...base);

  const skeletonVideo = document.createElement("div");
  skeletonVideo.classList.add(...base);

  const skeletonPictures = document.createElement("div");
  skeletonPictures.classList.add(...base);

  leftCol.appendChild(skeletonCountry);
  leftCol.appendChild(skeletonMap);

  rightCol.appendChild(skeletonVideo);
  rightCol.appendChild(skeletonPictures);

  resultsContainer.appendChild(leftCol);
  resultsContainer.appendChild(rightCol);
};

// Clears the skeletons once real content is ready (or on error).
const hideSkeletons = () => {
  resultsContainer.innerHTML = "";
};