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

  // Function to format date with current time
  function formatDateWithTime(dateValue) {
    const now = new Date();
    const selectedDate = new Date(dateValue);

    // Set selected date to the current time
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    return selectedDate.toISOString().slice(0, 19).replace("T", " "); // Format as 'YYYY-MM-DD HH:MM:SS'
  }

  // Confirm reservation
  confirmButton.addEventListener("click", async () => {
    const startDateInput = document.getElementById("start-date").value;
    const endDateInput = document.getElementById("end-date").value;

    if (!startDateInput || !endDateInput) {
      alert("❌ Please select both start and end dates.");
      return;
    }

    const startDate = formatDateWithTime(startDateInput);
    const endDate = formatDateWithTime(endDateInput);

    try {
      const response = await fetch("/rooms/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // Static user ID
          roomId: selectedRoomId,
          startDate,
          endDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Reservation successful!");
        window.location.reload();
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Something went wrong.");
    }
  });
});
