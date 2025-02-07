document.addEventListener("DOMContentLoaded", () => {
  const addHotelButton = document.getElementById("add-hotel");

  if (addHotelButton) {
    addHotelButton.addEventListener("click", async () => {
      const name = prompt("Enter hotel name:");
      const hotelLocation = prompt("Enter hotel location:");
      if (!name || !hotelLocation) return alert("Both fields are required!");

      let rooms = [];
      let addMoreRooms = true;

      while (addMoreRooms) {
        const capacity = prompt("Enter room capacity (number of guests):");
        const price = prompt("Enter price per day for this room:");

        if (capacity && price) {
          rooms.push({ capacity: parseInt(capacity), price: parseFloat(price) });
        }

        addMoreRooms = confirm("Would you like to add another room type?");
      }

      if (rooms.length === 0) {
        return alert("At least one room type is required!");
      }

      try {
        const response = await fetch("/hotels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, location: hotelLocation, rooms }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to add hotel.");
        }

        alert("Hotel and rooms added successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error adding hotel:", error);
        alert("Something went wrong: " + error.message);
      }
    });
  }
});
