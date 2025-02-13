document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ makeReservation.js loaded");

  let modal = document.getElementById("reservationModal");

  if (!modal) return; // ✅ Exit if modal is missing

  const rentButtons = document.querySelectorAll(".rent-room");

  if (!rentButtons.length) return; // ✅ Exit if no rent buttons exist

  setupReservationModal(modal);
});

function setupReservationModal(modal) {
  const closeModal = modal.querySelector(".close");
  const confirmButton = document.getElementById("confirm-reservation");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  if (!confirmButton) return; // ✅ Exit if confirm button is missing

  let selectedRoomId = null;

  // ✅ Prevent selecting past dates
  function setMinDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    startDateInput.setAttribute("min", formattedDate);
    endDateInput.setAttribute("min", formattedDate);
  }

  setMinDate(); // ✅ Set min date on page load

  document.querySelectorAll(".rent-room").forEach((button) => {
    button.addEventListener("click", (event) => {
      selectedRoomId = event.target.getAttribute("data-id");

      if (!selectedRoomId) {
        alert("❌ Error: Room ID is missing.");
        return;
      }

      modal.style.display = "flex";
    });
  });

  if (closeModal) {
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  function formatDateWithTime(dateValue) {
    if (!dateValue) return null;
    const now = new Date();
    const selectedDate = new Date(dateValue);
    selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    return selectedDate.toISOString().slice(0, 19).replace("T", " ");
  }

  confirmButton.addEventListener("click", async () => {
    if (!selectedRoomId) {
      alert("❌ No room selected for reservation.");
      return;
    }

    const startDate = formatDateWithTime(startDateInput.value);
    const endDate = formatDateWithTime(endDateInput.value);
    const today = new Date().toISOString().slice(0, 10);

    if (!startDate || !endDate) {
      alert("❌ Please select both start and end dates.");
      return;
    }

    if (startDate < today) {
      alert("❌ Start date cannot be in the past.");
      return;
    }

    if (endDate <= startDate) {
      alert("❌ End date must be after the start date.");
      return;
    }

    try {
      const response = await fetch("/rooms/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, roomId: selectedRoomId, startDate, endDate }),
      });

      if (!response.ok) throw new Error(await response.text());

      alert("✅ Reservation successful!");
      window.location.reload();
    } catch (error) {
      alert("❌ Something went wrong.");
    }
  });
}
