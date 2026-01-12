// === Image Modal (Lightbox) wiring ===
const imageModal = document.getElementById("image-modal");
const imageModalImg = document.getElementById("image-modal-img");
const imageModalClose = document.getElementById("image-modal-close");

// Open the image modal with a given URL
const openImageModal = (url) => {
  if (!imageModal || !imageModalImg) return;
  imageModalImg.src = url;
  imageModal.classList.remove("hidden"); // keep Tailwind flex centering
};

// Close the image modal
const closeImageModal = () => {
  if (!imageModal || !imageModalImg) return;
  imageModal.classList.add("hidden");
  imageModalImg.src = ""; // optional: prevents showing old image briefly next time
};

// Close button
if (imageModalClose) {
  imageModalClose.addEventListener("click", closeImageModal);
}

// Click outside (on overlay) closes
if (imageModal) {
  imageModal.addEventListener("click", (e) => {
    if (e.target === imageModal) closeImageModal();
  });
}

// ESC closes
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && imageModal && !imageModal.classList.contains("hidden")) {
    closeImageModal();
  }
});