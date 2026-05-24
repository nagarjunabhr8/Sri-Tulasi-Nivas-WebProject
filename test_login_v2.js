const { chromium } = require('playwright');

async function testLogin() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for all network requests
  const requests = [];
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      requests.push({ method: req.method(), url: req.url(), time: new Date() });
    }
  });

  try {
    console.log('=== Testing Frontend Login Flow ===\n');

    // Step 1: Navigate to login page
    console.log('1. Navigating to http://localhost:3000/auth');
    await page.goto('http://localhost:3000/auth', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    console.log('✓ Page loaded - Title: ' + title);

    // Check page content
    const pageContent = await page.content();
    if (pageContent.includes('Login') || pageContent.includes('login')) {
      console.log('✓ Login page detected');
    }

    // Step 2: Check form elements
    console.log('\n2. Checking form elements...');
    const hasEmailInput = await page.$('input[type="email"]') !== null;
    const hasPasswordInput = await page.$('input[type="password"]') !== null;
    const hasSubmitButton = await page.$('button[type="submit"]') !== null;
    
    console.log('  Email input: ' + (hasEmailInput ? '✓' : '✗'));
    console.log('  Password input: ' + (hasPasswordInput ? '✓' : '✗'));
    console.log('  Submit button: ' + (hasSubmitButton ? '✓' : '✗'));

    // Step 3: Test with valid credentials
    console.log('\n3. Testing login with valid credentials...');
    console.log('   Email: newuser@example.com');
    console.log('   Password: Test@12345');
    
    await page.fill('input[type="email"]', 'newuser@example.com');
    await page.fill('input[type="password"]', 'Test@12345');
    
    // Submit form
    await page.click('button[type="submit"]');
    console.log('   Form submitted');

    // Wait for navigation or check localStorage
    await page.waitForTimeout(2000);
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const url = page.url();
    
    console.log('\n   Results:');
    console.log('   URL after login: ' + url);
    console.log('   Token stored: ' + (token ? '✓ Yes' : '✗ No'));
    
    if (token) {
      console.log('   Token length: ' + token.length + ' chars');
      console.log('   Token start: ' + token.substring(0, 30) + '...');
    }

    // Step 4: Check for redirect
    await page.waitForTimeout(1000);
    const finalUrl = page.url();
    if (finalUrl.includes('/dashboard') || finalUrl.includes('/home')) {
      console.log('\n✓ Redirected to dashboard/home');
    } else {
      console.log('\n  Final URL: ' + finalUrl);
    }

    // Step 5: API calls made
    console.log('\n4. API Calls made:');
    const loginCalls = requests.filter(r => r.url.includes('/login'));
    loginCalls.forEach(call => {
      console.log('   ' + call.method + ' ' + call.url);
    });

    // Step 6: Test invalid credentials
    console.log('\n5. Testing with invalid credentials...');
    await page.goto('http://localhost:3000/auth', { waitUntil: 'domcontentloaded' });
    
    await page.fill('input[type="email"]', 'nonexistent@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    console.log('   Form submitted with invalid creds');
    await page.waitForTimeout(2000);
    
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    const urlAfter = page.url();
    const hasErrorText = await page.evaluate(() => {
      return document.body.innerText.toLowerCase().includes('invalid') ||
             document.body.innerText.toLowerCase().includes('failed');
    });
    
    console.log('   Still on login page: ' + (urlAfter.includes('/auth') ? '✓' : '✗'));
    console.log('   Error text shown: ' + (hasErrorText ? '✓' : '✗'));

    console.log('\n=== Frontend Login Test Complete ===');

  } catch (error) {
    console.error('✗ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin().catch(console.error);
