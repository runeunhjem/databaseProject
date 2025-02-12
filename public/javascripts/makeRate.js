document.addEventListener("DOMContentLoaded", () => {
  window.makeRate = async function (userId, endpoint) {
    try {
      const rating = prompt("Enter your rating (1-5):");
      if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
        alert("❌ Please enter a number between 1 and 5.");
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: rating }),
      });

      if (!response.ok) throw new Error(await response.text());

      alert("✅ Thank you for your rating!");
      window.location.reload();
    } catch (error) {
      alert("❌ Something went wrong.");
    }
  };
});
