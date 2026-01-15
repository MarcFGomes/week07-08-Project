// Refresh page when clicking the Globe Lens title
document.addEventListener("DOMContentLoaded", () => {
  const home = document.getElementById("left-header");

  if (!home) return;

  home.addEventListener("click", () => {
    // refresh
    clearSearchUrl();
    document.getElementById("results").innerHTML = "";
  });
});