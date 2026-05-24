const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to the application
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot
    await page.screenshot({ path: 'app_screenshot.png', fullPage: true });
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for main content
    const bodyContent = await page.content();
    if (bodyContent.includes('root')) {
      console.log('React app root element found');
    }
    
    // Check for key navigation elements
    const buttons = await page.$$('button');
    console.log('Number of buttons found:', buttons.length);
    
    const links = await page.$$('a');
    console.log('Number of links found:', links.length);
    
    await browser.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
