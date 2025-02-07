document.addEventListener("DOMContentLoaded", () => {
  const rateButton = document.querySelector(".rate-hotel");

  if (rateButton) {
    rateButton.addEventListener("click", async () => {
      const hotelId = rateButton.getAttribute("data-id");
      let value = prompt("Rate the hotel from 1 to 5");

      value = parseInt(value, 10);
      if (!value || value < 1 || value > 5) {
        alert("❌ Please enter a valid rating between 1 and 5.");
        return;
      }

      try {
        const response = await fetch(`/hotels/${hotelId}/rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("✅ " + data.message);
          window.location.reload();
        } else {
          alert("❌ " + data.message);
        }
      } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Something went wrong.");
      }
    });
  }
});
