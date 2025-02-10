document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-reservation");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const reservationId = event.target.getAttribute("data-id");

      if (!reservationId) {
        console.error("❌ Error: No reservation ID found.");
        alert("❌ Could not find reservation ID. Try refreshing the page.");
        return;
      }

      const confirmDelete = confirm("Are you sure you want to cancel this reservation?");
      if (!confirmDelete) return;

      try {
        console.log(`🟢 Sending DELETE request for reservation ID: ${reservationId}`);

        // ✅ Fix: Ensure the correct API route is used
        const response = await fetch(`/reservations/${reservationId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to cancel reservation.");
        }

        alert("✅ Reservation canceled successfully!");
        window.location.reload();
      } catch (error) {
        console.error("❌ Error canceling reservation:", error);
        alert("❌ Something went wrong. Please try again.");
      }
    });
  });
});
