const { By, Key, Builder, until } = require("selenium-webdriver");

async function test() {
  // ✅ Start measuring time
  const startTime = new Date();

  let driver = await new Builder().forBrowser("chrome").build();

  // ✅ 1. Maximize the browser window to test both cases
  await driver.manage().window().maximize();

  // ✅ 2. Clear cookies and go to the starting page (http://localhost:3000/start)
  await driver.get("http://localhost:3000/start");
  console.log("✅ Landed on start page");

  // ✅ 3. Check if the "Login" button is already visible (handles maximized window case)
  let loginButton;
  try {
    loginButton = await driver.findElement(By.xpath("//a[contains(text(),'Login')]"));
    if (!(await loginButton.isDisplayed())) {
      throw new Error("Login button is not visible");
    }
  } catch (error) {
    console.log("🔹 Navbar is collapsed, opening the menu...");

    // ✅ Click the burger menu to expand navbar (if needed)
    let menuButton = await driver.findElement(By.className("navbar-toggler"));
    await menuButton.click();

    // ✅ Now, find and click the "Login" button
    loginButton = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Login')]")), 5000);
    await driver.wait(until.elementIsVisible(loginButton), 5000);
  }

  // ✅ Click "Login"
  await loginButton.click();
  console.log("✅ Clicked 'Login' button");

  // ✅ 4. Wait for the login page to fully load
  await driver.wait(until.urlContains("/login"), 10000);
  console.log("✅ Navigated to login page");

  // ✅ 5. Enter username
  let usernameField = await driver.wait(until.elementLocated(By.id("username")), 5000);
  await usernameField.sendKeys("runeunhjem");
  console.log("✅ Username entered");

  // ✅ 6. Enter password
  let passwordField = await driver.wait(until.elementLocated(By.id("password")), 5000);
  await passwordField.sendKeys("runhjem4");
  console.log("✅ Password entered");

  // ✅ 7. Click the correct **login button inside the form**
  let submitButton = await driver.wait(until.elementLocated(By.xpath("//form[@action='/auth/login']//button")), 5000);
  await submitButton.click();
  console.log("✅ Correct login button clicked");

  // ✅ 8. Wait for landing page (`/start`) to load after login
  await driver.wait(until.urlContains("/start"), 10000);
  console.log("✅ Landed on start page after login");

  // ✅ 9. Manually navigate to `/users/2`
  await driver.get("http://localhost:3000/users/2");
  console.log("✅ Manually navigated to /users/2");

  // ✅ 10. Wait for user details page (`/users/2`) to load
  await driver.wait(until.urlContains("/users/2"), 10000);
  console.log("✅ User details page loaded");

  // ✅ 11. Wait for user name element
  let nameElement = await driver.wait(until.elementLocated(By.name("user")), 5000);
  let name = await nameElement.getText();
  console.log("User name is:", name);

  await driver.quit();

  // ✅ End measuring time and log the duration
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000; // Convert ms to seconds
  console.log(`🚀 Test completed in ${duration.toFixed(2)} seconds`);
}

test();
