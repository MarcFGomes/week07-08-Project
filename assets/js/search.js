



placeInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") handleSearch();
});

searchButton.addEventListener("click", () => {
  handleSearch();
})



const handleSearch = () => {
  let searchValue = placeInput.value.trim();
  let mode = searchMode.value;


  if (!searchValue) {
    showModal("Please enter a place to search");
    return;
  }

  //Secondary functions
  searchValue = normalize (searchValue);
  addSearch(searchValue, mode);
  render();
  saveState();

  placeInput.value=""

  const indexToPass = previousSearches.findIndex(item => item.value === searchValue);
  fetchPlaceData(searchValue, mode, indexToPass);
}

//Searching from previous value
const handleQuickSearch = (place) =>{

  //Reorganize the array
  const index = previousSearches.findIndex(item => item.value === place);
  
  const typeOfSearch = previousSearches[index].type;

  previousSearches.splice(index, 1);

  previousSearches.push({value: place, type: typeOfSearch});

  render();
  saveState();
    
  placeInput.value=""
  
  fetchPlaceData(place, typeOfSearch, index);
};


//Render my previous searches on refresh or opening site
render();


//Show and hide Modal
const showModal = (sentence) => {
  modalText.textContent = sentence;
   modal.classList.remove("hidden");
}

const hideModal = () => {
  modal.classList.add("hidden");
};

// Close modal (X)
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", hideModal);
}

// Close modal (click overlay only)
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
}

// Optional: close modal (Esc)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    hideModal();
  }
});

//Change the placeholder info
searchMode.addEventListener("change", () => {
    if (searchMode.value === "country") {
        placeInput.placeholder = "Search by country name";
    } else if (searchMode.value === "capital") {
        placeInput.placeholder = "Search by capital city";
    }
  placeInput.focus();
});

//skeleton function
const showSkeletons = () => {
    resultsContainer.innerHTML = "";

  // Layout columns (same structure as renderPlaceData)
  const leftCol = document.createElement("div");
  leftCol.classList.add("w-full", "sm:w-1/3", "flex", "flex-col", "gap-6");

  const rightCol = document.createElement("div");
  rightCol.classList.add("w-full", "sm:w-2/3");

  // Country skeleton (roughly your card size)
  const skeletonCountry = document.createElement("div");
  skeletonCountry.classList.add(
    "skeleton-card",
    "relative",
    "overflow-hidden",
    "bg-pink-500",
    "shadow-lg",
    "rounded-lg",
    "h-[320px]" // 👈 make it tall like the country card
  );

  // Map skeleton (MUST match iframe height h-64)
  const skeletonMap = document.createElement("div");
  skeletonMap.classList.add(
    "skeleton-card",
    "relative",
    "overflow-hidden",
    "bg-pink-500",
    "shadow-lg",
    "rounded-lg",
    "h-64" // 👈 matches your map iframe height
  );

  // Gallery skeleton (same area as right column)
  const skeletonGallery = document.createElement("div");
  skeletonGallery.classList.add(
    "skeleton-card",
    "relative",
    "overflow-hidden",
    "bg-pink-500",
    "shadow-lg",
    "rounded-lg",
    "h-[320px]" // 👈 matches the gallery container height
  );

  leftCol.appendChild(skeletonCountry);
  leftCol.appendChild(skeletonMap);
  rightCol.appendChild(skeletonGallery);

  resultsContainer.appendChild(leftCol);
  resultsContainer.appendChild(rightCol);
  
}

const hideSkeletons = () => {
  resultsContainer.innerHTML = ""; // clear old content
}
