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

  const country = data?.[0];
  if (!country) return;

  // === Layout columns ===
  const leftCol = document.createElement("div");
  leftCol.classList.add(
    "w-full",
    "sm:w-1/3",
    "flex",
    "flex-col",
    "gap-6"
  );

  const rightCol = document.createElement("div");
  rightCol.classList.add("w-full", "sm:w-2/3");

  // Country card 
  const card = document.createElement("div");
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
    "dark:bg-gray-500"
  );

  card.innerHTML = `
    <img
      src="${country.flags?.svg}"
      alt="${country.name?.common}"
      class="w-full h-40 object-cover rounded-md shadow-sm"
    />
    <h3 class="text-xl font-bold text-gray-800 dark:text-white">${country.name?.common}</h3>
    <p class="text-gray-600 dark:text-white">
      Capital: ${country.capital ? country.capital[0] : "N/A"}
    </p>
    <p class="text-gray-600 dark:text-white">Region: ${country.region || "N/A"}</p>
  `;

  //Map card (stacked under country card)
  const mapCard = document.createElement("div");
  mapCard.classList.add(
    "fade-in",
    "bg-white",
    "shadow-lg",
    "rounded-lg",
    "p-4",
    "dark:bg-gray-500"
  );

  const [lat, lng] = country.latlng || [];
  const query = encodeURIComponent(
    country.capital?.[0] ? `${country.capital[0]}, ${country.name.common}` : country.name.common
  );

  const mapSrc =
    lat != null && lng != null
      ? `https://www.google.com/maps?q=${lat},${lng}&z=5&output=embed`
      : `https://www.google.com/maps?q=${query}&z=5&output=embed`;

  mapCard.innerHTML = `
    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-3">Map</h3>

    <div class="w-full h-64 overflow-hidden rounded-md shadow-sm">
      <iframe
        class="w-full h-full"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        src="${mapSrc}"
        allowfullscreen
      ></iframe>
    </div>

    <a
      class="inline-block mt-3 text-sm underline text-gray-700 dark:text-white/90"
      href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        lat != null && lng != null ? `${lat},${lng}` : query
      )}"
      target="_blank"
      rel="noreferrer"
    >
      Open in Google Maps
    </a>
  `;

  //Images card (right column)
  const cardForImg = document.createElement("div");
  cardForImg.classList.add(
    "fade-in",
    "p-4",
    "bg-gray-100",
    "rounded-lg",
    "shadow-md",
    "flex",
    "flex-col",
    "items-center",
    "gap-4",
    "dark:bg-gray-500"
  );

  cardForImg.innerHTML = `
    <div id="unsplash-gallery" class="flex flex-col sm:flex-row gap-4"></div>
    <div id="pagination"></div>
  `;

  // Assemble columns
  leftCol.appendChild(card);
  leftCol.appendChild(mapCard);
  rightCol.appendChild(cardForImg);

  // Add to results container
  resultsContainer.appendChild(leftCol);
  resultsContainer.appendChild(rightCol);

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

      //Open image modal on click
      img.addEventListener("click", () => openImageModal(url));
      
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
