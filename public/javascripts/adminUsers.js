document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ adminUsers.js loaded");

  // Select all delete buttons
  const deleteButtons = document.querySelectorAll(".delete-user");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const userId = event.target.closest("button").getAttribute("data-id");

      if (!userId) {
        alert("❌ Error: User ID not found.");
        return;
      }

      const confirmDelete = confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) return;

      try {
        const response = await fetch(`/users/${userId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        alert("✅ User deleted successfully!");
        window.location.reload();
      } catch (error) {
        console.error("❌ Error deleting user:", error);
        alert("❌ Failed to delete user.");
      }
    });
  });
});
