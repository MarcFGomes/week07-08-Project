// Purpose: Renders all UI components for a selected country:
// - country summary card
// - map embed
// - video carousel
// - image gallery with pagination
// Keeps rendering logic separate from data-fetching logic.

const renderPlaceData = (data, images, searchedValue, mode, videos) => {
  // Clear previous results before rendering new content
  resultsContainer.innerHTML = "";

  // REST Countries may return multiple matches; we intentionally use the first one
  const country = data?.[0];
  if (!country) return;

  // Two-column responsive layout:
  // left = country + map, right = video + images
  const leftCol = document.createElement("div");
  leftCol.classList.add("w-full", "sm:w-1/3", "flex", "flex-col", "gap-6");

  const rightCol = document.createElement("div");
  rightCol.classList.add("w-full", "sm:w-2/3", "flex", "flex-col", "gap-6");

  // -----------------------------
  // COUNTRY SUMMARY CARD
  // -----------------------------
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
    "dark:bg-gray-500",
    "h-auto",
    "sm:h-80"
  );

  card.innerHTML = `
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-bold text-gray-800 dark:text-white">
        ${mode === "capital" ? "Country (found by capital)" : "Country Info"}
      </h3>

      <!-- Opens the detailed country modal -->
      <button
        id="more-info-btn"
        class="text-sm px-3 py-1 rounded-md
               bg-blue-400 hover:bg-blue-600
               dark:bg-blue-600 dark:hover:bg-blue-700
               text-white transition"
        type="button"
      >
        More info
      </button>
    </div>

    ${
      // When searching by capital, explicitly show what matched
      mode === "capital"
        ? `<p class="text-sm text-gray-600 dark:text-white/80">
             Matched capital: <span class="font-semibold">${searchedValue}</span>
           </p>`
        : ""
    }

    <img src="${country.flags?.svg}" alt="${country.name?.common}"
      class="w-full h-28 object-cover rounded-md shadow-sm"/>

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

  // Wire modal opening after HTML injection
  card.querySelector("#more-info-btn").addEventListener("click", () => {
    openCountryModal(country);
  });

  // -----------------------------
  // MAP CARD
  // -----------------------------
  const mapCard = document.createElement("div");
  mapCard.classList.add(
    "fade-in",
    "transition",
    "hover:scale-105",
    "bg-white",
    "shadow-lg",
    "rounded-lg",
    "p-4",
    "dark:bg-gray-500",
    "h-auto",
    "sm:h-80"
  );

  // Prefer coordinates when available for precise map centering
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
    <h3 class="text-lg font-bold text-gray-800 dark:text-white">Map</h3>
    <div class="fade-in w-full flex-1 overflow-hidden rounded-md shadow-sm">
      <iframe
        class="w-full h-full dark:brightness-75 dark:contrast-125"
        loading="lazy"
        src="${mapSrc}">
      </iframe>
    </div>
  `;

  // -----------------------------
  // VIDEO CARD
  // -----------------------------
  const videoCard = document.createElement("div");
  videoCard.classList.add(
    "fade-in",
    "bg-white",
    "shadow-lg",
    "rounded-lg",
    "p-4",
    "dark:bg-gray-500",
    "h-auto",
    "sm:h-80"
  );

  videoCard.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-bold text-gray-800 dark:text-white">Video</h3>
      <p id="video-counter" class="text-sm text-gray-600 dark:text-white/80">1 / 2</p>
    </div>

    <div class="relative w-full overflow-hidden rounded-md shadow-sm">
      <video
        id="pexels-video"
        class="w-full h-[calc(16rem-2.5rem)] object-cover rounded-md"
        autoplay
        muted
        loop
        playsinline
        controls
      ></video>

      <!-- Manual carousel navigation -->
      <button id="video-prev" class="absolute left-2 top-1/2 -translate-y-1/2 ...">←</button>
      <button id="video-next" class="absolute right-2 top-1/2 -translate-y-1/2 ...">→</button>
    </div>

    <p id="video-fallback" class="hidden mt-3 text-gray-600 dark:text-white/80">
      No videos found for this location.
    </p>
  `;

  // -----------------------------
  // IMAGE GALLERY CARD
  // -----------------------------
  const cardForImg = document.createElement("div");
  cardForImg.classList.add(
    "fade-in",
    "p-4",
    "bg-white",
    "rounded-lg",
    "shadow-md",
    "flex",
    "flex-col",
    "items-center",
    "gap-4",
    "dark:bg-gray-500",
    "h-auto",
    "sm:h-80"
  );

  cardForImg.innerHTML = `
    <h3 class="w-full text-left text-lg font-bold text-gray-800 dark:text-white">Pictures</h3>
    <div id="unsplash-gallery" class="flex-1 flex flex-col sm:flex-row gap-4 items-center"></div>
    <div id="pagination" class="mt-auto"></div>
  `;

  // Assemble layout
  leftCol.appendChild(card);
  leftCol.appendChild(mapCard);
  rightCol.appendChild(videoCard);
  rightCol.appendChild(cardForImg);

  resultsContainer.appendChild(leftCol);
  resultsContainer.appendChild(rightCol);

  // -----------------------------
  // VIDEO CAROUSEL LOGIC
  // Wrapped in IIFE to keep variables scoped
  // -----------------------------
  (async () => {
    const videoEl = videoCard.querySelector("#pexels-video");
    const prevBtn = videoCard.querySelector("#video-prev");
    const nextBtn = videoCard.querySelector("#video-next");
    const counter = videoCard.querySelector("#video-counter");
    const fallback = videoCard.querySelector("#video-fallback");

    const videoLinks = Array.isArray(videos) ? videos : [];

    // Graceful fallback when no videos are available
    if (!videoLinks.length) {
      fallback.classList.remove("hidden");
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      prevBtn.classList.add("opacity-40", "cursor-not-allowed");
      nextBtn.classList.add("opacity-40", "cursor-not-allowed");
      return;
    }

    let idx = 0;

    // Centralized video swap logic
    function showVideo(i) {
      idx = i;
      videoEl.src = videoLinks[idx];
      videoEl.load();

      // Explicit play call improves autoplay reliability
      const tryPlay = () => {
        const p = videoEl.play();
        if (p?.catch) {
          p.catch(() => videoEl.setAttribute("controls", "controls"));
        }
      };

      tryPlay();
      videoEl.onloadedmetadata = tryPlay;

      counter.textContent = `${idx + 1} / ${videoLinks.length}`;
    }

    prevBtn.addEventListener("click", () =>
      showVideo((idx - 1 + videoLinks.length) % videoLinks.length)
    );
    nextBtn.addEventListener("click", () =>
      showVideo((idx + 1) % videoLinks.length)
    );

    // Disable arrows when only one video exists
    if (videoLinks.length < 2) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      prevBtn.classList.add("opacity-40", "cursor-not-allowed");
      nextBtn.classList.add("opacity-40", "cursor-not-allowed");
    }

    showVideo(0);
  })();

  // Image pagination lives outside render logic for clarity
  paginateImages(images);
};

// -----------------------------
// IMAGE PAGINATION
// -----------------------------
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

        // Clicking an image opens the lightbox modal
        img.addEventListener("click", () => openImageModal(url));
        gallery.appendChild(img);
      });

    updateActiveButton();
  }

  // Highlight current pagination button
  function updateActiveButton() {
    [...pagination.children].forEach((btn, i) =>
      btn.classList.toggle("active-page", i + 1 === currentPage)
    );
  }

  // Build pagination controls dynamically
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.addEventListener("click", () => displayPage(i));
    pagination.appendChild(btn);
  }

  displayPage(1);
}