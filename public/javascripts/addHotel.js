document.addEventListener("DOMContentLoaded", () => {
  const addHotelButton = document.getElementById("add-hotel");

  if (!addHotelButton) return; // ✅ Exit script if button is missing

  addHotelButton.addEventListener("click", async () => {
    const name = prompt("Enter hotel name:");
    const hotelLocation = prompt("Enter hotel location:");
    if (!name || !hotelLocation) return alert("Both fields are required!");

    let rooms = [];
    let addMoreRooms = true;

    while (addMoreRooms) {
      const capacity = prompt("Enter room capacity:");
      const price = prompt("Enter price per night:");

      if (capacity && price) rooms.push({ capacity: parseInt(capacity), price: parseFloat(price) });

      addMoreRooms = confirm("Would you like to add another room?");
    }

    if (rooms.length === 0) return alert("At least one room type is required!");

    try {
      const response = await fetch("/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location: hotelLocation, rooms }),
      });

      if (!response.ok) throw new Error(await response.text());

      alert("✅ Hotel and rooms added successfully!");
      window.location.reload();
    } catch (error) {
      alert("❌ Something went wrong.");
    }
  });
});
