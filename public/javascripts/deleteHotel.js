document.addEventListener("DOMContentLoaded", () => {
  const deleteButtons = document.querySelectorAll(".delete-hotel");

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

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(errorMessage || "Failed to delete hotel.");
        }

        alert("Hotel deleted successfully!");
        window.location.reload();
      } catch (error) {
        console.error("Error deleting hotel:", error);
        alert("Something went wrong: " + error.message);
      }
    });
  });
});
