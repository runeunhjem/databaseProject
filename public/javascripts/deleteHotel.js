document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-hotel");

  if (!deleteButtons.length) return; // ✅ Exit script if no delete buttons exist

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const hotelId = event.target.getAttribute("data-id");
      if (!confirm("Are you sure you want to delete this hotel?")) return;

      try {
        const response = await fetch("/hotels", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: hotelId }),
        });

        if (!response.ok) throw new Error(await response.text());

        alert("✅ Hotel deleted successfully!");
        window.location.reload();
      } catch (error) {
        alert("❌ Something went wrong.");
      }
    });
  });
});
