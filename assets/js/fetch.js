// Purpose: Centralizes all external API calls (REST Countries + Unsplash + Pexels)
// and returns normalized data to the UI renderer.
// Note: Keys in frontend are visible to users—OK for demos/bootcamps, but in production
// they should live on a backend/proxy.

const apiKey = "2vbM3VqQrwr1zyvrJWuNrkmEXhvOE3mFbkHgO7xN6Xs";
const apiKeyPexels = "1aV7yeyP7yvRlkQztrchVH8LrQd5Bvu2Rlxtj61wHqNeSUfOpexu55t3";

// Fetch country data by either country name or capital city.
// `number` is the index used to remove invalid searches from the history array if needed.
async function fetchPlaceData(placeName, type, number) {
  showSkeletons();

  // REST Countries uses different endpoints depending on search mode
  const endpoint = type === "country" ? "name" : "capital";

  try {
    const response = await fetch(
      `https://restcountries.com/v3.1/${endpoint}/${placeName}`
    );

    // If the API returns "not found", we clean up the UI state:
    // remove the bad item from history and show a friendly modal instead of breaking the app.
    if (!response.ok) {
      previousSearches.splice(number, 1);
      render();
      saveState();
      hideSkeletons();
      showModal("No information found with that search!");
      return;
    }

    const data = await response.json();

    // Media is based on the user's search term (placeName) so "Paris" yields Paris media
    // rather than always using the country name (France).
    const images = await fetchUnsplashImages(placeName);
    const videos = await fetchPexelsVideos(placeName);

    // Pass everything to the renderer so UI code stays separate from networking code
    renderPlaceData(data, images, placeName, type, videos);
  } catch (error) {
    // Catch network errors (offline, CORS issues, API downtime) and fail gracefully
    hideSkeletons();
    showModal("Sorry, could not find what you were looking for");
  }
}

// Unsplash image search.
// Returns an array of image URLs (small size) so the UI layer doesn't need Unsplash-specific logic.
async function fetchUnsplashImages(query) {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${apiKey}`
    );

    // Keep the UI stable even if Unsplash fails (rate limit, bad key, etc.)
    if (!res.ok) return [];

    const json = await res.json();
    return json.results.map((img) => img.urls.small);
  } catch (err) {
    // Never throw from this helper; return an empty list so rendering can continue
    return [];
  }
}

// Pexels video search.
// Returns direct mp4 links so the video element can play them immediately.
async function fetchPexelsVideos(query, count = 2) {
  try {
    // encodeURIComponent prevents broken URLs for inputs like "New York" or "Côte d'Ivoire"
    const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(
      query
    )}&per_page=${count}&orientation=landscape`;

    // Pexels requires the API key in the Authorization header (not in the URL)
    const res = await fetch(url, {
      headers: { Authorization: apiKeyPexels },
    });

    // If Pexels fails, return [] so the UI can show fallback messaging
    if (!res.ok) return [];

    const json = await res.json();
    const videos = json.videos || [];

    // Prefer HD mp4 when available, otherwise fall back to any mp4.
    // Result: stable playback across browsers and consistent quality when possible.
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

    // Enforce max results so the UI logic stays predictable
    return mp4Links.slice(0, count);
  } catch (err) {
    // Same rule: never crash the app because a third-party API failed
    return [];
  }
}