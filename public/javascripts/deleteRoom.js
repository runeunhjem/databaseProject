document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".delete-room").forEach((button) => {
    button.addEventListener("click", async () => {
      const roomId = button.getAttribute("data-id");

      if (!confirm("Are you sure you want to delete this room?")) return;

      try {
        const response = await fetch("/rooms", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: roomId }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("✅ Room deleted successfully!");
          window.location.reload();
        } else {
          alert(`❌ Failed to delete room: ${data.message}`);
        }
      } catch (error) {
        alert("❌ Error deleting room.");
        console.error(error);
      }
    });
  });
});
