
//The search containers
const modal = document.getElementById("empty-modal");
const closeModal = document.getElementById("close-modal");
const modalText = document.getElementById("modal-text");
const resultsContainer = document.getElementById("results");
const searchMode = document.getElementById("search-mode");
const modeSelect = document.getElementById("search-mode");


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

  // normal search code here
  console.log("Searching for:", searchValue);

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
  console.log(previousSearches);

  previousSearches.push({value: place, type: typeOfSearch});

  render();
  saveState();
    
  placeInput.value=""
  
  console.log(`my value is ${typeOfSearch}`)
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
modeSelect.addEventListener("change", () => {
    if (modeSelect.value === "country") {
        placeInput.placeholder = "Search by country name";
    } else if (modeSelect.value === "capital") {
        placeInput.placeholder = "Search by capital city";
    }
});

//skeleton function
function showSkeletons(count = 3) {
  resultsContainer.innerHTML = ""; // clear old content
  
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.classList.add("skeleton-card");
    resultsContainer.appendChild(skeleton);
  }
}