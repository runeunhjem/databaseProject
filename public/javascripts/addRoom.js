document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ addRoom.js loaded");

  const addRoomButton = document.getElementById("add-room");

  if (!addRoomButton) return; // ✅ Exit script if button is missing

  addRoomButton.addEventListener("click", async () => {
    const hotelId = window.location.pathname.split("/").pop();
    const capacity = prompt("Enter room capacity:");
    const price = prompt("Enter price per night:");

    if (!capacity || !price) {
      alert("❌ Room capacity and price are required!");
      return;
    }

    try {
      const response = await fetch(`/rooms/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hotelId, capacity, price }),
      });

      if (!response.ok) throw new Error(await response.text());

      alert("✅ Room added successfully!");
      window.location.reload();
    } catch (error) {
      alert("❌ Failed to add room.");
    }
  });
});
