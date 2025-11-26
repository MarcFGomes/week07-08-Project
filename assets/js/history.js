//Load localStorage
let previousSearches = JSON.parse(localStorage.getItem('placesSearched')) || [];

//The history containers
const historyButton = document.getElementById("history-button");
const searchButton = document.getElementById("search-button");
const placeInput = document.getElementById("place");
const historyList = document.getElementById("history-list");
previousSearches = [];
//Make sure the input is lowerCase except the 1st letter which is uppercase
const normalize = (str) => {
    str = str.toLowerCase();
    let upLetter = str[0].toUpperCase();
    str= str.slice(1);

    str = upLetter + str;
    console.log(str);

    return str;
}


//Add city searched in my array
const addSearch = (search, typeOfSearch) => {

    const exists = previousSearches.some(item => item.value=== search);

    if (exists) {
        handleQuickSearch(search);
        return;
    }

    if(previousSearches.length<8){
        previousSearches.push({value: search, type: typeOfSearch});
        
    }
    else {
        previousSearches.shift();
        previousSearches.push({value: search, type: typeOfSearch});
        
    }
    
    return;
}

//Save my array of searches
function saveState() {
    localStorage.setItem('placesSearched', JSON.stringify(previousSearches));
}

//Render the place searched in a li
const render = () => {

    historyList.innerHTML = "";
    
    for(let i=previousSearches.length-1; i>=0; i--){
        //let placeLi = createButton(previousSearches[i]);

        let li = document.createElement("li");

        li.textContent = previousSearches[i].value;
        
        li.classList.add(
        previousSearches[i].type === "Country" ? "search-country" : "search-capital"
        );
        li.addEventListener("click", () => handleQuickSearch(previousSearches[i].value));


        historyList.append(li);
    }


    return;
}


// Show/Hide dropdown functions
let hideTimeout;
const showHistory = () => {
     clearTimeout(hideTimeout);
     historyList.style.display = "block";
    }

const hideHistory =() => {
    hideTimeout = setTimeout(() => historyList.style.display = "none", 300);
}

//Hovering the button
historyButton.addEventListener("mouseenter", showHistory);
historyButton.addEventListener("mouseleave", hideHistory);

// Hovering the list itself
historyList.addEventListener("mouseenter", showHistory);
historyList.addEventListener("mouseleave", hideHistory);