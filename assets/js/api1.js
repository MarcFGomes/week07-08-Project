// api1.js

const apiKey = "2vbM3VqQrwr1zyvrJWuNrkmEXhvOE3mFbkHgO7xN6Xs";
const apiKeyPexels = "1aV7yeyP7yvRlkQztrchVH8LrQd5Bvu2Rlxtj61wHqNeSUfOpexu55t3"

// Fetch country or capital data
async function fetchPlaceData(placeName, type, number) {
  showSkeletons();

  const endpoint = type === "country" ? "name" : "capital";

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/${endpoint}/${placeName}`
    );

    if (!response.ok) {
      previousSearches.splice(number, 1);
      render();
      saveState();
      hideSkeletons();
      showModal("No information found with that search!");
      return;
    }

    const data = await response.json();

    // Fetch Unsplash images
    const images = await fetchUnsplashImages(placeName);

    // Fetch Pexels Video
    const videos = await fetchPexelsVideo(placeName);

    renderPlaceData(data, images, videos);
  } catch (error) {
    hideSkeletons();
    showModal("Sorry, could not find what you were looking for");
  }
}

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

// Fetch Pexels Video
async function fetchPexelsVideo(query, count = 2) {
  try {
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(
      query
    )}&per_page=${count}&orientation=landscape`;

    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const videos = json.videos || [];

    // Convert each result into a usable mp4 link
    const mp4Links = videos
      .map((v) => {
        const file =
          v.video_files?.find(
            (f) => f.file_type === "video/mp4" && f.quality === "hd"
          ) ||
          v.video_files?.find((f) => f.file_type === "video/mp4") ||
          null;

        return file ? file.link : null;
      })
      .filter(Boolean);

    // Return at most 2 (or count)
    return mp4Links.slice(0, count);
  } catch (err) {
    return [];
  }
}