const modal = document.getElementById("empty-modal");
const closeModal = document.getElementById("close-modal");
const modalText = document.getElementById("modal-text");


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
    if (!searchValue) {
        modalText.textContent = "Please enter a place to search";
        modal.style.display = "block"; // show modal
        return;
    }

    // normal search code here
    console.log("Searching for:", searchValue);

    //Secondary functions
    searchValue = normalize (searchValue);
    addSearch(searchValue);
    render();
    saveState();

    placeInput.value=""
}

//Searching from previous value
const handleQuickSearch = (place) =>{

    //Reorganize the array
    const indexToMove = previousSearches.indexOf(place);
    previousSearches.splice(indexToMove, 1);
    previousSearches.push(place);

    render();
    saveState();
    
    placeInput.value=""
    

};


//Render my previous searches on refresh or opening site
render();