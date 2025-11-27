const apiKey = "2vbM3VqQrwr1zyvrJWuNrkmEXhvOE3mFbkHgO7xN6Xs";

async function fetchPlaceData(placeName, type, number) {
  showSkeletons(); // show skeletons while loading

  const endpoint = type === "country" ? "name" : "capital";

  console.log(type + placeName + number);

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/${endpoint}/${placeName}`
    );

    if (!response.ok) {
      previousSearches.splice(number, 1); //Delete the element in the array that provides no result;
      render();
      saveState();
      hideSkeletons();
      showModal("No information found with that search!");
      return;
    }

    const data = await response.json();
    console.log(data);

    //Fetch Unsplash images
    const images = await fetchUnsplashImages(placeName);

    // Replace skeletons with actual data
    renderPlaceData(data, images);
  } catch (error) {
    hideSkeletons();
    showModal("Sorry, could not find what you were looking for");
    return;
  }
}

const renderPlaceData = (data, images) => {
  resultsContainer.innerHTML = ""; // remove skeletons

  const card = document.createElement("div");
  card.classList.add("country-card");
  card.innerHTML = `
      <img src="${data[0].flags.svg}" alt="${data[0].name.common}" />
      <h3>${data[0].name.common}</h3>
      <p>Capital: ${data[0].capital ? data[0].capital[0] : "N/A"}</p>
      <p>Region: ${data[0].region}</p>
      <div id="unsplash-gallery"></div>
      <div id="pagination"></div>
    `;
  resultsContainer.appendChild(card);

  paginateImages(images);
};

// Fetch Unsplash images
async function fetchUnsplashImages(query) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${apiKey}`
    );

    if (!res.ok) return [];

    const json = await res.json();
    return json.results.map((img) => img.urls.small);
  } catch (err) {
    return [];
  }
}

function paginateImages(images) {
  const gallery = document.getElementById("unsplash-gallery");
  const pagination = document.getElementById("pagination");

  const imagesPerPage = 4;
  const totalPages = Math.ceil(images.length / imagesPerPage);
  let currentPage = 1;

  function displayPage(page) {
    currentPage = page;
    gallery.innerHTML = "";

    const start = (page - 1) * imagesPerPage;
    const end = start + imagesPerPage;

    images.slice(start, end).forEach((url) => {
      const img = document.createElement("img");
      img.src = url;
      img.className = "unsplash-img fade-in";
      gallery.appendChild(img);
    });

    updateActiveButton();
  }

  function updateActiveButton() {
    const buttons = pagination.querySelectorAll("button");

    buttons.forEach((btn, index) => {
      if (index + 1 === currentPage) {
        btn.classList.add("active-page");
      } else {
        btn.classList.remove("active-page");
      }
    });
  }

  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;

    btn.addEventListener("click", () => displayPage(i));
    pagination.appendChild(btn);
  }

  //Always display page 1
  displayPage(1);
}
