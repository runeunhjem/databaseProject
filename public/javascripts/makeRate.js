async function makeRate(userId, url) {
  const rating = prompt("Please enter a rating from 1 to 5:");

  if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
    alert("❌ Invalid rating. Please enter a number between 1 and 5.");
    return;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    alert("✅ Thank you for your rating!");
    window.location.reload(); // Refresh to update hotel rating
  } catch (error) {
    console.error("❌ Error submitting rating:", error);
    alert("❌ Failed to submit rating.");
  }
}
