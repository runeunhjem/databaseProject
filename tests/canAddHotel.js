const { By, Key, until, Builder } = require("selenium-webdriver");
require("chromedriver");

async function test() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    // ✅ Start timer to measure execution time
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

    // ✅ 5. Count existing hotels before adding a new one
    let hotelCardsBefore = await driver.findElements(By.className("hotel-card"));
    let countBefore = hotelCardsBefore.length;
    console.log(`✅ Number of hotels before: ${countBefore}`);

    // ✅ 6. Ensure "New Hotel" Button is Clickable
    let addHotelButton = await driver.wait(until.elementLocated(By.name("addHotel")), 5000);
    console.log("✅ addHotelButton is set!");

    // 🔹 Ensure no overlays (cookie banner, modals) are covering it
    try {
      let overlay = await driver.findElement(By.className("cookie-banner")); // Example class
      await driver.executeScript("arguments[0].remove();", overlay);
      console.log("🔹 Removed blocking element");
    } catch (e) {
      console.log("🔹 No blocking elements found.");
    }

    // 🔹 Scroll the button into view
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", addHotelButton);
    console.log("🔹 Scrolled 'New Hotel' button into view");

    // 🔹 Wait for button to be fully visible
    await driver.wait(until.elementIsVisible(addHotelButton), 5000);
    console.log("🔹 Button is fully visible");

    // 🔹 Wait for button to be interactable
    await driver.wait(until.elementIsEnabled(addHotelButton), 5000);
    console.log("🔹 Button is interactable");

    // 🔹 Give extra buffer time for page scripts to settle
    await driver.sleep(2000);

    // ✅ 7. Click "New Hotel" Button
    await driver.executeScript("arguments[0].click();", addHotelButton);
    console.log("✅ Clicked 'New Hotel' button");

    // ✅ 8. Handle Hotel Name Prompt
    await driver.wait(until.alertIsPresent(), 5000);
    let nameAlert = await driver.switchTo().alert();
    await nameAlert.sendKeys("Selenium Hotel");
    await nameAlert.accept();
    console.log("✅ Entered hotel name");

    // ✅ 9. Handle Hotel Location Prompt
    await driver.wait(until.alertIsPresent(), 5000);
    let locationAlert = await driver.switchTo().alert();
    await locationAlert.sendKeys("Test City");
    await locationAlert.accept();
    console.log("✅ Entered hotel location");

    // ✅ 10. Handle Room Capacity Prompt
    await driver.wait(until.alertIsPresent(), 5000);
    let capacityAlert = await driver.switchTo().alert();
    await capacityAlert.sendKeys("2");
    await capacityAlert.accept();
    console.log("✅ Entered room capacity");

    // ✅ 11. Handle Room Price Prompt
    await driver.wait(until.alertIsPresent(), 5000);
    let priceAlert = await driver.switchTo().alert();
    await priceAlert.sendKeys("150");
    await priceAlert.accept();
    console.log("✅ Entered room price");

    // ✅ 12. Confirm No More Rooms to Add
    await driver.wait(until.alertIsPresent(), 5000);
    let confirmAlert = await driver.switchTo().alert();
    await confirmAlert.dismiss(); // Clicking "Cancel" to stop adding more rooms
    console.log("✅ Declined to add more rooms");

    // ✅ 13. Handle Success Alert (New Fix!)
    await driver.wait(until.alertIsPresent(), 5000);
    let successAlert = await driver.switchTo().alert();
    console.log(`✅ Success message: ${await successAlert.getText()}`);
    await successAlert.accept(); // Click "OK" on the success message
    console.log("✅ Success alert dismissed");

    // ✅ 14. Refresh & Count Hotels After Adding
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.className("hotel-card")), 10000);
    let hotelCardsAfter = await driver.findElements(By.className("hotel-card"));
    let countAfter = hotelCardsAfter.length;
    console.log(`✅ Number of hotels after: ${countAfter}`);

    // ✅ 15. Verify Hotel Added
    if (countAfter > countBefore) {
      console.log("🎉 SUCCESS: Hotel was added!");
    } else {
      console.log("❌ ERROR: Hotel was NOT added!");
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
