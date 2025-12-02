



placeInput.addEventListener('keydown', (e) => {
    if (e.key === "Enter") handleSearch();
});

searchButton.addEventListener("click", () => {
  handleSearch();
})

// Close modal when clicking X
  closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
});


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


//Show Modal
const showModal = (sentence) => {
  modalText.textContent = sentence;
  modal.style.display = "block"; // show modal
}

//Change the placeholder info
searchMode.addEventListener("change", () => {
    if (searchMode.value === "country") {
        placeInput.placeholder = "Search by country name";
    } else if (searchMode.value === "capital") {
        placeInput.placeholder = "Search by capital city";
    }
});

//skeleton function
const showSkeletons = () => {
  resultsContainer.innerHTML = ""; 

  const skeletonCard = document.createElement("div");
  const skeletonCardForImg = document.createElement("div");

  skeletonCard.classList.add(
  "skeleton-card",
  "relative",
  "overflow-hidden",
  "bg-pink-500",
  "shadow-lg", 
  "rounded-lg", 
  "w-full",    
  "sm:w-1/3",   
  "h-40",
  "sm:h-full"
);
  
  skeletonCardForImg.classList.add("skeleton-card", "relative", "overflow-hidden", "rounded-lg", "shadow-lg", "bg-pink-500", "w-full", "sm:w-2/3", "h-40", "sm:h-full");

  resultsContainer.appendChild(skeletonCard);
  resultsContainer.appendChild(skeletonCardForImg);
  
}

const hideSkeletons = () => {
  resultsContainer.innerHTML = ""; // clear old content
}
