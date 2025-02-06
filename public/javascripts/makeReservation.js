document.addEventListener("DOMContentLoaded", () => {
  const rentButtons = document.querySelectorAll(".rent-room");
  const modal = document.getElementById("reservationModal");
  const closeModal = document.querySelector(".close");
  const confirmButton = document.getElementById("confirm-reservation");
  let selectedRoomId = null;

  // Hide modal on page load (prevents auto-opening)
  modal.style.display = "none";

  // Open modal when "Rent a Room" is clicked
  rentButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      selectedRoomId = event.target.getAttribute("data-id");
      modal.style.display = "flex";
    });
  });

  // Close modal when "X" is clicked or outside the modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // Confirm reservation
  confirmButton.addEventListener("click", async () => {
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
      alert("❌ Please select both start and end dates.");
      return;
    }

    try {
      const response = await fetch("/rooms/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // Static user ID
          roomId: selectedRoomId,
          startDate: startDate,
          endDate: endDate,
        }),
      });

      const data = await response.json(); // Convert response to JSON

      if (response.ok) {
        alert("✅ Reservation successful!");
        window.location.reload();
      } else {
        alert("❌ " + data.message); // Show error message from the backend
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Something went wrong.");
    }

    // ❌ REMOVE THIS: modal.style.display = "none"; ❌
    // Modal will only close if reservation is successful.
  });
});
