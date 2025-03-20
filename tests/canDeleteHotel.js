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

    // ✅ 5. Count existing hotels before deletion
    let hotelCards = await driver.findElements(By.className("hotel-card"));
    let countBefore = hotelCards.length;
    console.log(`✅ Number of hotels before deletion: ${countBefore}`);

    if (countBefore === 0) {
      console.log("⚠️ No hotels found. Skipping test.");
      return;
    }

    // ✅ 6. Find all hotel IDs & Locate Highest One
    let highestId = -1;
    let hotelToDelete = null;

    for (let hotel of hotelCards) {
      try {
        // ✅ Get hotel ID from data attribute or link inside the hotel card
        let hotelLink = await hotel.findElement(By.css("a[href^='/hotels/']"));
        let href = await hotelLink.getAttribute("href");
        let hotelId = parseInt(href.match(/\/hotels\/(\d+)/)[1]);

        if (hotelId > highestId) {
          highestId = hotelId;
          hotelToDelete = hotel;
        }
      } catch (e) {
        console.log("⚠️ Skipping hotel without a valid ID.");
      }
    }

    if (!hotelToDelete) {
      console.log("❌ No valid hotel ID found. Skipping deletion.");
      return;
    }

    console.log(`✅ Hotel with highest ID found: ${highestId}`);

    // ✅ 7. Locate the delete button inside the highest ID hotel card
    let deleteButton = await hotelToDelete.findElement(By.className("delete-hotel"));

    // 🔹 Ensure button is clickable
    await driver.executeScript("arguments[0].scrollIntoView({ behavior: 'smooth', block: 'center' });", deleteButton);
    await driver.wait(until.elementIsVisible(deleteButton), 5000);
    await driver.wait(until.elementIsEnabled(deleteButton), 5000);

    // ✅ 8. Click "Delete" button
    await deleteButton.click();
    console.log("✅ Clicked 'Delete' button");

    // ✅ 9. Handle Confirmation Alert
    await driver.wait(until.alertIsPresent(), 5000);
    let confirmAlert = await driver.switchTo().alert();
    console.log(`✅ Confirmation alert text: ${await confirmAlert.getText()}`);
    await confirmAlert.accept(); // Click "OK" to confirm deletion
    console.log("✅ Confirmed deletion");

    // ✅ 10. Handle Success Alert (NEW FIX!)
    await driver.wait(until.alertIsPresent(), 5000);
    let successAlert = await driver.switchTo().alert();
    console.log(`✅ Success message: ${await successAlert.getText()}`);
    await successAlert.accept(); // Click "OK" on the success message
    console.log("✅ Success alert dismissed");

    // ✅ 11. Refresh & Count Hotels After Deletion
    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.className("hotel-card")), 10000);
    let hotelCardsAfter = await driver.findElements(By.className("hotel-card"));
    let countAfter = hotelCardsAfter.length;
    console.log(`✅ Number of hotels after deletion: ${countAfter}`);

    // ✅ 12. Verify Hotel Deleted
    if (countAfter < countBefore) {
      console.log("🎉 SUCCESS: Hotel was deleted!");
    } else {
      console.log("❌ ERROR: Hotel was NOT deleted!");
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
