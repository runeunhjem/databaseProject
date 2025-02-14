document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("hotel-search");
  const searchButton = document.getElementById("search-btn");
  const resultsContainer = document.getElementById("hotel-results");
  const searchForm = document.getElementById("search-form");

  let debounceTimer;

  if (!searchInput || !searchButton) return;

  function updateResults(hotels) {
    resultsContainer.innerHTML = hotels.length
      ? hotels.map(hotelTemplate).join("")
      : `<p class="text-warning mt-3">No hotels found.</p>`;
  }

  async function performSearch(query) {
    if (query.length === 0) {
      window.location.reload(); // ✅ Reset if empty
      return;
    }

    try {
      const response = await fetch(`/hotels?location=${query}`, { headers: { "X-Requested-With": "XMLHttpRequest" } });
      const hotels = await response.json();
      updateResults(hotels);
    } catch (error) {
      console.error("❌ Error fetching search results:", error);
    }
  }

  function debounceSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(searchInput.value.trim());
    }, 200);
  }

  // ✅ Live search as user types
  searchInput.addEventListener("input", debounceSearch);

  // ✅ Search button click
  searchButton.addEventListener("click", (e) => {
    e.preventDefault();
    performSearch(searchInput.value.trim());
    searchInput.value = ""; // ✅ Clear input after search
  });

  // ✅ Pressing Enter also triggers search
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    performSearch(searchInput.value.trim());
    searchInput.value = ""; // ✅ Clear input after search
  });

  function hotelTemplate(hotel) {
    // Ensure avgRating is a valid number
    let ratingDisplay =
      hotel.avgRating && parseFloat(hotel.avgRating) > 0
        ? `<p class="hotel-rating"><i class="bi bi-star-fill"></i> ${hotel.avgRating} / 5</p>`
        : `<p class="hotel-rating text-muted"><i class="bi bi-star"></i> No ratings yet</p>`;

    return `
    <div class="hotel-card">
      <div class="hotel-info">
        <p class="hotel-name">${hotel.name}</p>
        <p class="hotel-location"><i class="bi bi-geo-alt-fill"></i> ${hotel.location}</p>
        ${ratingDisplay} <!-- ✅ Properly formatted rating -->
      </div>
      <div class="hotel-actions">
        <a href="/hotels/${hotel.id}/rooms" class="btn btn-primary">
          <i class="bi bi-key"></i> Rent a Room
        </a>
        <a href="/hotels/${hotel.id}" class="btn btn-secondary">
          <i class="bi bi-eye"></i> Details
        </a>
      </div>
    </div>`;
  }
});
