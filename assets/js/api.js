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
  const cardForImg = document.createElement("div");
  card.classList.add(
  "country-card", 
  "fade-in", 
  "bg-white", 
  "shadow-lg", 
  "rounded-lg", 
  "p-6", 
  "text-center", 
  "space-y-2", 
  "transition", 
  "transform", 
  "hover:scale-105",
  "w-full",
  "sm:w-1/3",
  "sm:h-full"
);

cardForImg.classList.add("fade-in", "p-4", "bg-gray-100", "rounded-lg", "shadow-md", "flex", "flex-col", "items-center", "gap-4", "sm:w-2/3", "w-full","sm:h-full");

  card.innerHTML = `
      <img src="${data[0].flags.svg}" alt="${data[0].name.common}"  class="w-full h-40 object-cover rounded-md shadow-sm"/>
      <h3 class="text-xl font-bold text-gray-800">${data[0].name.common}</h3>
      <p class="text-gray-600">Capital: ${data[0].capital ? data[0].capital[0] : "N/A"}</p>
      <p class="text-gray-600">Region: ${data[0].region}</p>
    `;
  resultsContainer.appendChild(card);

  cardForImg.innerHTML = `
      <div id="unsplash-gallery" class="flex flex-col sm:flex-row gap-4"></div>
      <div id="pagination" ></div>
    `;

  
  resultsContainer.appendChild(cardForImg);

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
      img.className = "fade-in w-32 h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 object-cover rounded-md shadow-md transition transform hover:scale-105 hover:shadow-lg cursor-pointer";
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
