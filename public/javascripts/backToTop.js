document.addEventListener("DOMContentLoaded", function () {
  const backToTopBtn = document.getElementById("backToTop");

  // Show button when scrolling down
  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  // Smooth scroll to top when clicking the button
  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
