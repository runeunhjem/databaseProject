const { By, Key, until, Builder } = require("selenium-webdriver");
require("chromedriver");

async function test() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    // ✅ Start timer
    const startTime = new Date();

    // ✅ 1. Maximize window & Navigate to Start Page
    await driver.manage().window().maximize();
    await driver.get("http://localhost:3000/start");
    console.log("✅ Landed on start page");

    // ✅ 2. Click "Login" (Handle Navbar if Collapsed)
    let loginButton;
    try {
      loginButton = await driver.findElement(By.xpath("//a[contains(text(),'Login')]"));
      if (!(await loginButton.isDisplayed())) {
        throw new Error("Login button not visible");
      }
    } catch (error) {
      console.log("🔹 Navbar is collapsed, opening menu...");
      let menuButton = await driver.findElement(By.className("navbar-toggler"));
      await menuButton.click();
      loginButton = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Login')]")), 5000);
      await driver.wait(until.elementIsVisible(loginButton), 5000);
    }
    await loginButton.click();
    console.log("✅ Clicked 'Login' button");

    // ✅ 3. Log in as Rune Unhjem (Admin)
    await driver.wait(until.urlContains("/login"), 10000);
    console.log("✅ Navigated to login page");
    await driver.findElement(By.id("username")).sendKeys("runeunhjem");
    await driver.findElement(By.id("password")).sendKeys("runhjem4");
    await driver.findElement(By.xpath("//form[@action='/auth/login']//button")).click();
    console.log("✅ Logged in as runeunhjem");

    // ✅ 4. Navigate to Hotels Page
    await driver.wait(until.urlContains("/start"), 10000);
    await driver.get("http://localhost:3000/hotels");
    console.log("✅ Navigated to Hotels page");

    // ✅ 5. Find the **latest** hotel by highest ID and navigate to its details page
    let hotelCards = await driver.findElements(By.className("hotel-card"));
    let highestId = -1;
    let latestHotelUrl = "";

    for (let hotel of hotelCards) {
      try {
        let hotelLink = await hotel.findElement(By.css("a[href^='/hotels/']"));
        let href = await hotelLink.getAttribute("href");
        let hotelId = parseInt(href.match(/\/hotels\/(\d+)/)[1]);

        if (hotelId > highestId) {
          highestId = hotelId;
          latestHotelUrl = `/hotels/${hotelId}`; // ✅ Ensure correct URL
        }
      } catch (e) {
        console.log("⚠️ Skipping hotel without a valid ID.");
      }
    }

    if (!latestHotelUrl) {
      console.log("❌ No valid hotel ID found. Skipping test.");
      return;
    }

    console.log(`✅ Latest hotel found with ID: ${highestId}`);

    // ✅ 6. Navigate to `/hotels/:hotelId` (Ensure we are NOT on `/hotels/:hotelId/rooms`)
    await driver.get(`http://localhost:3000${latestHotelUrl}`);
    console.log(`✅ Navigated to hotel details page: http://localhost:3000${latestHotelUrl}`);

    // ✅ 7. Ensure the page fully loads
    await driver.wait(until.elementLocated(By.css(".room-section")), 10000);
    console.log("✅ Hotel details page fully loaded");

    // ✅ 8. Count existing room types before adding
    let existingRoomTypes = new Set();
    let roomElements = await driver.findElements(By.css(".room-card .room-title"));

    for (let room of roomElements) {
      let roomType = await room.getText();
      existingRoomTypes.add(roomType);
    }

    console.log("✅ Existing room types:", [...existingRoomTypes]);

    // ✅ 9. Determine which room type to add
    let availableRoomTypes = ["Double Room", "Family Room", "Junior Suite", "Suite"];
    let roomToAdd = availableRoomTypes.find((type) => !existingRoomTypes.has(type));

    if (!roomToAdd) {
      console.log("⚠️ All room types already exist. Skipping test.");
      return;
    }

    console.log(`✅ Adding room type: ${roomToAdd}`);

    // ✅ 10. Locate "Add Room" button and ensure visibility
    let addRoomButton = await driver.wait(until.elementLocated(By.id("add-room")), 5000);
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", addRoomButton);
    await driver.wait(until.elementIsVisible(addRoomButton), 5000);
    await driver.wait(until.elementIsEnabled(addRoomButton), 5000);
    console.log("✅ Add Room button found and visible");

    // ✅ 11. Click "Add Room" button
    await addRoomButton.click();
    console.log("✅ Clicked 'Add Room' button");

    // ✅ 12. Handle Room Capacity Prompt
    await driver.wait(until.alertIsPresent(), 5000);
    let capacityAlert = await driver.switchTo().alert();
    let capacityValue =
      roomToAdd === "Double Room" ? "2" : roomToAdd === "Family Room" ? "4" : roomToAdd === "Junior Suite" ? "5" : "6";
    await capacityAlert.sendKeys(capacityValue);
    await capacityAlert.accept();
    console.log(`✅ Entered room capacity: ${capacityValue}`);

    // ✅ 13. Handle Room Price Prompt
    await driver.wait(until.alertIsPresent(), 5000);
    let priceAlert = await driver.switchTo().alert();
    await priceAlert.sendKeys("200");
    await priceAlert.accept();
    console.log("✅ Entered room price");

    // ✅ 14. Handle Success Alert
    await driver.wait(until.alertIsPresent(), 5000);
    let successAlert = await driver.switchTo().alert();
    console.log(`✅ Success message: ${await successAlert.getText()}`);
    await successAlert.accept();
    console.log("✅ Success alert dismissed");

    // ✅ 15. Refresh & Verify Room Added
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.css(".room-card .room-title")), 10000);
    let roomElementsAfter = await driver.findElements(By.css(".room-card .room-title"));
    let newRoomTypes = new Set();

    for (let room of roomElementsAfter) {
      let roomType = await room.getText();
      newRoomTypes.add(roomType);
    }

    console.log("✅ Room types after addition:", [...newRoomTypes]);

    if (newRoomTypes.has(roomToAdd)) {
      console.log("🎉 SUCCESS: Room was added!");
    } else {
      console.log("❌ ERROR: Room was NOT added!");
    }

    // ✅ End measuring time and log execution time
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000;
    console.log(`🚀 Test completed in ${duration.toFixed(2)} seconds`);
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await driver.quit();
  }
}

test();
