// api2.js

const renderPlaceData = (data, images) => {
  resultsContainer.innerHTML = "";

  const country = data?.[0];
  if (!country) return;

  // Layout columns
  const leftCol = document.createElement("div");
  leftCol.classList.add("w-full", "sm:w-1/3", "flex", "flex-col", "gap-6");

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
    <img src="${country.flags?.svg}" alt="${country.name?.common}"
      class="w-full h-40 object-cover rounded-md shadow-sm"/>
    <h3 class="text-xl font-bold text-gray-800 dark:text-white">
      ${country.name?.common}
    </h3>
    <p class="text-gray-600 dark:text-white">
      Capital: ${country.capital ? country.capital[0] : "N/A"}
    </p>
    <p class="text-gray-600 dark:text-white">
      Region: ${country.region || "N/A"}
    </p>
  `;

  // Map card
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
    country.capital?.[0]
      ? `${country.capital[0]}, ${country.name.common}`
      : country.name.common
  );

  const mapSrc =
    lat != null && lng != null
      ? `https://www.google.com/maps?q=${lat},${lng}&z=5&output=embed`
      : `https://www.google.com/maps?q=${query}&z=5&output=embed`;

  mapCard.innerHTML = `
    
    <div class="w-full h-64 overflow-hidden rounded-md shadow-sm">
      <iframe class="w-full h-full dark:brightness-75 dark:contrast-125" loading="lazy" src="${mapSrc}"></iframe>
    </div>
  `;

  // Image gallery card
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

  leftCol.appendChild(card);
  leftCol.appendChild(mapCard);
  rightCol.appendChild(cardForImg);

  resultsContainer.appendChild(leftCol);
  resultsContainer.appendChild(rightCol);

  paginateImages(images);
};

// Pagination + modal
function paginateImages(images) {
  const gallery = document.getElementById("unsplash-gallery");
  const pagination = document.getElementById("pagination");

  const imagesPerPage = 4;
  const totalPages = Math.ceil(images.length / imagesPerPage);
  let currentPage = 1;

  function displayPage(page) {
    currentPage = page;
    gallery.innerHTML = "";

    images
      .slice((page - 1) * imagesPerPage, page * imagesPerPage)
      .forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.className =
          "fade-in w-32 h-24 md:w-40 md:h-28 lg:w-48 lg:h-32 object-cover rounded-md shadow-md transition transform hover:scale-105 cursor-pointer";
        img.addEventListener("click", () => openImageModal(url));
        gallery.appendChild(img);
      });

    updateActiveButton();
  } 

  function updateActiveButton() {
    [...pagination.children].forEach((btn, i) =>
      btn.classList.toggle("active-page", i + 1 === currentPage)
    );
  }

  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.addEventListener("click", () => displayPage(i));
    pagination.appendChild(btn);
  }

  displayPage(1);
}