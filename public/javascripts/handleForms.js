document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    form.addEventListener("submit", function (event) {
      const inputs = form.querySelectorAll("input, textarea, select");

      for (const input of inputs) {
        if (input.value.trim() === "" && input.hasAttribute("required")) {
          alert("Please fill out all required fields before submitting.");
          event.preventDefault();
          return;
        }
      }
    });
  });
});
