document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  const toggleBtn = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  const root = document.documentElement;

  console.log("toggleBtn:", toggleBtn);
  console.log("icon:", icon);

  if (!toggleBtn || !icon) {
    console.error("Theme toggle elements not found");
    return;
  }

  // Initial state
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    root.classList.add("dark");
    icon.textContent = "☀️";
  } else {
    root.classList.remove("dark");
    icon.textContent = "🌙";
  }

  toggleBtn.addEventListener("click", () => {
    const isDark = root.classList.toggle("dark");
    icon.textContent = isDark ? "☀️" : "🌙";
    console.log("Theme toggled:", isDark ? "dark" : "light");
  });
});