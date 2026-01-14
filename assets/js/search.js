// Deep link helpers

function setSearchUrl(query, mode) {
  const params = new URLSearchParams(window.location.search);
  params.set("query", query);
  params.set("mode", mode);

  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}?${params.toString()}`
  );
}

function clearSearchUrl() {
  window.history.replaceState({}, "", window.location.pathname);
}

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("query");
  const mode = params.get("mode");

  if (!query || !mode) return;

  // Sync UI
  placeInput.value = query;
  searchMode.value = mode;

  // Sync placeholder
  if (mode === "country") {
    placeInput.placeholder = "Search by country name";
  } else if (mode === "capital") {
    placeInput.placeholder = "Search by capital city";
  }

  // Use the same flow as normal searches
  const normalized = normalize(query);
  addSearch(normalized, mode);
  render();
  saveState();

  const indexToPass = previousSearches.findIndex(
    (item) => item.value === normalized
  );
  fetchPlaceData(normalized, mode, indexToPass);
}

// Run once when the page loads
document.addEventListener("DOMContentLoaded", loadFromUrl);


// Search handlers
placeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});

searchButton.addEventListener("click", () => {
  handleSearch();
});

const handleSearch = () => {
  let searchValue = placeInput.value.trim();
  const mode = searchMode.value;

  if (!searchValue) {
    showModal("Please enter a place to search");
    clearSearchUrl();
    return;
  }


  // Normalize
  searchValue = normalize(searchValue);

  // Update shareable URL
  setSearchUrl(searchValue, mode);

  // Existing flow
  addSearch(searchValue, mode);
  render();
  saveState();

  placeInput.value = "";

  const indexToPass = previousSearches.findIndex(
    (item) => item.value === searchValue
  );
  fetchPlaceData(searchValue, mode, indexToPass);
};

// Searching from previous value
const handleQuickSearch = (place) => {
  const index = previousSearches.findIndex((item) => item.value === place);
  const typeOfSearch = previousSearches[index].type;

  previousSearches.splice(index, 1);
  previousSearches.push({ value: place, type: typeOfSearch });

  // ✅ Update URL when clicking history too
  setSearchUrl(place, typeOfSearch);

  render();
  saveState();

  placeInput.value = "";

  fetchPlaceData(place, typeOfSearch, index);
};

// Render previous searches on refresh/opening site
render();


// Modal logic
const showModal = (sentence) => {
  modalText.textContent = sentence;
  modal.classList.remove("hidden");
};

const hideModal = () => {
  modal.classList.add("hidden");
};

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


// Placeholder logic
searchMode.addEventListener("change", () => {
  if (searchMode.value === "country") {
    placeInput.placeholder = "Search by country name";
  } else if (searchMode.value === "capital") {
    placeInput.placeholder = "Search by capital city";
  }
  placeInput.focus();
});


// Skeletons
const showSkeletons = () => {
  resultsContainer.innerHTML = "";

  const CARD_H = "h-80"; // change to "h-96" if you later decide

  const leftCol = document.createElement("div");
  leftCol.classList.add("w-full", "sm:w-1/3", "flex", "flex-col", "gap-6");

  const rightCol = document.createElement("div");
  rightCol.classList.add("w-full", "sm:w-2/3", "flex", "flex-col", "gap-6");

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

const hideSkeletons = () => {
  resultsContainer.innerHTML = "";
};