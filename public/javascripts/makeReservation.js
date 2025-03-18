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

  if (!confirmButton || !startDateInput || !endDateInput) return; // ✅ Exit if any required input is missing

  let selectedRoomId = null;

  // ✅ Function to prevent past dates selection
  function setMinDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];

    startDateInput.setAttribute("min", formattedDate);
    endDateInput.setAttribute("min", formattedDate);
  }

  // ✅ Update min date every time the modal opens
  document.querySelectorAll(".rent-room").forEach((button) => {
    button.addEventListener("click", (event) => {
      selectedRoomId = event.target.getAttribute("data-id");

      if (!selectedRoomId) {
        alert("❌ Error: Room ID is missing.");
        return;
      }

      setMinDate(); // ✅ Ensure date restrictions are applied before opening modal
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

  // ✅ Format date correctly for backend storage
  function formatDateWithTime(dateValue) {
    if (!dateValue) return null;
    const selectedDate = new Date(dateValue);
    selectedDate.setHours(12, 0, 0); // ✅ Normalize time to avoid timezone issues
    return selectedDate.toISOString().slice(0, 19).replace("T", " ");
  }

  confirmButton.addEventListener("click", async () => {
    if (!selectedRoomId) {
      alert("❌ No room selected for reservation.");
      return;
    }

    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const today = new Date().toISOString().split("T")[0];

    if (!startDate || !endDate) {
      alert("❌ Please select both start and end dates.");
      return;
    }

    if (startDate < today) {
      alert("❌ Start date cannot be in the past.");
      return;
    }

    if (endDate <= startDate) {
      alert("❌ End date must be at least one day after the start date.");
      return;
    }

    const formattedStartDate = formatDateWithTime(startDate);
    const formattedEndDate = formatDateWithTime(endDate);

    // ✅ Get userId dynamically from the page (if stored in a hidden field)
    const userId = document.getElementById("user-id")?.value;
    if (!userId) {
      alert("❌ Error: User ID not found. Please log in.");
      return;
    }

    try {
      const response = await fetch("/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roomId: selectedRoomId, startDate: formattedStartDate, endDate: formattedEndDate }),
      });

      const responseData = await response.json(); // ✅ Parse the JSON response

      if (!response.ok) {
        if (responseData.errors && responseData.errors.length > 0) {
          // ✅ Show all validation errors in an alert or other UI element
          alert("❌ Validation Failed:\n" + responseData.errors.join("\n"));
        } else {
          alert("❌ Error: " + (responseData.message || "Something went wrong."));
        }
        return;
      }

      alert("✅ Reservation successful!");
      window.location.reload();
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("❌ Network error. Please try again later.");
    }
  });
}
