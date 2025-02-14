document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ deleteHotel.js loaded");

  document.querySelectorAll(".delete-hotel").forEach((button) => {
    button.addEventListener("click", async function () {
      const hotelId = this.getAttribute("data-id");

      if (!hotelId) {
        alert("❌ Hotel ID missing.");
        return;
      }

      const confirmDelete = confirm("Are you sure you want to delete this hotel?");
      if (!confirmDelete) return;

      try {
        const response = await fetch("/hotels", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: hotelId }),
        });

        const result = await response.text();
        if (!response.ok) throw new Error(result);

        alert("✅ Hotel deleted successfully!");
        window.location.reload();
      } catch (error) {
        console.error("❌ Error deleting hotel:", error);
        alert("❌ Failed to delete hotel.");
      }
    });
  });
});
