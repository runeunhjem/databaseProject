document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ makeReservation.js loaded");

  const rentButtons = document.querySelectorAll(".rent-room");
  const modal = document.getElementById("reservationModal");
  const closeModal = document.querySelector(".close");
  const confirmButton = document.getElementById("confirm-reservation");

  let selectedRoomId = null;

  // ✅ Check if modal exists before interacting with it
  if (!modal) {
    console.error("❌ Modal not found in DOM!");
    return;
  }

  // Hide modal on page load (prevents auto-opening)
  modal.style.display = "none";

  // ✅ Open modal when "Rent a Room" is clicked
  rentButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      selectedRoomId = event.target.getAttribute("data-id");
      console.log(`🟢 Rent button clicked, room ID: ${selectedRoomId}`);
      modal.style.display = "flex";
    });
  });

  // ✅ Close modal when "X" is clicked
  if (closeModal) {
    closeModal.addEventListener("click", () => {
      console.log("🔴 Closing modal");
      modal.style.display = "none";
    });
  }

  // ✅ Close modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      console.log("🔴 Closing modal (outside click)");
      modal.style.display = "none";
    }
  });

  // ✅ Check if confirm button exists before adding event listener
  if (!confirmButton) {
    console.error("❌ Confirm reservation button not found!");
    return;
  }

  // Function to format date with current time
  function formatDateWithTime(dateValue) {
    const now = new Date();
    const selectedDate = new Date(dateValue);
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    return selectedDate.toISOString().slice(0, 19).replace("T", " ");
  }

  // ✅ Confirm reservation
  confirmButton.addEventListener("click", async () => {
    const startDateInput = document.getElementById("start-date")?.value;
    const endDateInput = document.getElementById("end-date")?.value;

    if (!startDateInput || !endDateInput) {
      alert("❌ Please select both start and end dates.");
      return;
    }

    const startDate = formatDateWithTime(startDateInput);
    const endDate = formatDateWithTime(endDateInput);

    console.log("🟢 Sending reservation request...", { selectedRoomId, startDate, endDate });

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
