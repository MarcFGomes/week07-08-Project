async function fetchPlaceData(placeName, type, number) {
  showSkeletons(); // show skeletons while loading
    console.log(type);

    if (type==="country") {type = "name";}
    else {type ="capital";}
    console.log("Right here");
  try {
    const response = await fetch(`https://restcountries.com/v3.1/${type}/${placeName}`);

    if (!response.ok) {
        previousSearches.splice(number, 1);//Delete the element in the array that provides no result;
        render();
        saveState();
        showModal("No information found with that search!");
        return;
    }

    const data = await response.json();
    console.log(data);

    // Replace skeletons with actual data
    renderCountryData(data);

  } catch (error) {
    showModal("Sorry, could not find what you were looking for");
    return;
  }
}

function renderCountryData(data) {
  resultsContainer.innerHTML = ""; // remove skeletons
  data.forEach(country => {
    const card = document.createElement("div");
    card.classList.add("country-card");
    card.innerHTML = `
      <img src="${country.flags.svg}" alt="${country.name.common}" />
      <h3>${country.name.common}</h3>
      <p>Capital: ${country.capital ? country.capital[0] : "N/A"}</p>
      <p>Region: ${country.region}</p>
    `;
    resultsContainer.appendChild(card);
  });
}