document.addEventListener("DOMContentLoaded", () => {
  const addHotelButton = document.getElementById("add-hotel");

  if (addHotelButton) {
    addHotelButton.addEventListener("click", async () => {
      const name = prompt("Enter hotel name:");
      const hotelLocation = prompt("Enter hotel location:");
      if (!name || !hotelLocation) return alert("Both fields are required!");

      try {
        const response = await fetch("/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, location: hotelLocation }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to add hotel.");
        }

        alert("Hotel added successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error adding hotel:", error);
        alert("Something went wrong: " + error.message);
      }
    });
  }
});
