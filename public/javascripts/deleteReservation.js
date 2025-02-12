document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-reservation");

  if (!deleteButtons.length) return; // ✅ Exit script if no delete buttons exist

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const reservationId = event.target.getAttribute("data-id");

      if (!reservationId) {
        alert("❌ Could not find reservation ID. Try refreshing the page.");
        return;
      }

      if (!confirm("Are you sure you want to cancel this reservation?")) return;

      try {
        const response = await fetch(`/reservations/${reservationId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(await response.text());

        alert("✅ Reservation canceled successfully!");
        window.location.reload();
      } catch (error) {
        alert("❌ Something went wrong.");
      }
    });
  });
});
