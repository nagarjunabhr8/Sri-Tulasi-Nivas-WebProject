const { chromium } = require('playwright');

async function testLogin() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('=== Testing Frontend Login ===\n');

    // Step 1: Navigate to login page
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded');

    // Check for login form elements
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const submitBtn = await page.$('button[type="submit"]');
    
    if (emailInput && passwordInput && submitBtn) {
      console.log('✓ Login form elements found');
    } else {
      console.log('✗ Login form elements NOT found');
      console.log('  Email input:', emailInput ? '✓' : '✗');
      console.log('  Password input:', passwordInput ? '✓' : '✗');
      console.log('  Submit button:', submitBtn ? '✓' : '✗');
    }

    // Step 2: Test with invalid credentials first
    console.log('\n2. Testing with invalid credentials...');
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await page.waitForTimeout(2000);
    const errorMsg = await page.textContent('.error-message');
    if (errorMsg && errorMsg.includes('Invalid')) {
      console.log('✓ Invalid credentials error shown: "' + errorMsg + '"');
    } else {
      console.log('? Error message state:', errorMsg ? 'found' : 'not found');
    }

    // Step 3: Clear and test with valid credentials
    console.log('\n3. Testing with valid credentials...');
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'Test@12345');
    
    console.log('   Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for navigation or token storage
    await page.waitForTimeout(3000);
    
    // Check if redirected (successful login)
    const currentUrl = page.url();
    const token = await page.evaluate(() => localStorage.getItem('token'));
    
    console.log('   Current URL: ' + currentUrl);
    console.log('   Token in localStorage: ' + (token ? 'Yes' : 'No'));

    if (currentUrl.includes('/dashboard') || token) {
      console.log('✓ Login successful!');
      if (token) {
        console.log('  Token: ' + token.substring(0, 50) + '...');
      }
    } else {
      // Check if still on login page
      const loginPage = await page.$('input[type="email"]');
      if (loginPage) {
        console.log('✗ Still on login page - login may have failed');
        // Get any error message
        const error = await page.textContent('.error-message');
        if (error) {
          console.log('  Error: ' + error);
        }
      }
    }

    // Step 4: Test form validation
    console.log('\n4. Testing form validation...');
    
    // Clear fields
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', '');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    const emailError = await page.textContent('input[type="email"]+span');
    const passwordError = await page.textContent('input[type="password"]+span');
    
    console.log('  Email validation error: ' + (emailError ? '✓ ' + emailError : '✗'));
    console.log('  Password validation error: ' + (passwordError ? '✓ ' + passwordError : '✗'));

    // Step 5: Test invalid email format
    console.log('\n5. Testing invalid email format...');
    await page.fill('input[type="email"]', 'not-an-email');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    const invalidEmailError = await page.textContent('input[type="email"]+span');
    console.log('  Invalid email error: ' + (invalidEmailError ? '✓ ' + invalidEmailError : '✗'));

    // Step 6: Check Register link
    console.log('\n6. Checking Register link...');
    const registerLink = await page.$('a[href="/register"]');
    console.log('  Register link present: ' + (registerLink ? '✓' : '✗'));

    console.log('\n=== Login Testing Complete ===');

  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin().catch(console.error);
