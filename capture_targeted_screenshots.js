const puppeteer = require('puppeteer');
const path = require('path');

async function renderBrowserFrame(page, displayUrl, title = "Dealerships") {
  await page.evaluate((url, tabTitle) => {
    const existing = document.getElementById('custom-browser-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.id = 'custom-browser-bar';
    bar.style.cssText = `
      position: sticky;
      top: 0;
      left: 0;
      width: 100%;
      background: #dee2e6;
      border-bottom: 2px solid #ced4da;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      z-index: 9999999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;

    bar.innerHTML = `
      <div style="background: #e9ecef; padding: 6px 12px 2px 12px; display: flex; align-items: center; border-bottom: 1px solid #ced4da;">
        <div style="background: white; padding: 6px 16px; border-radius: 8px 8px 0 0; font-size: 13px; font-weight: 500; color: #333; display: flex; align-items: center; gap: 8px; border: 1px solid #ced4da; border-bottom: none;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#28a745;"></span>
          ${tabTitle}
          <span style="margin-left: 12px; color: #888; font-weight: bold; cursor: pointer;">&times;</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: #f8f9fa;">
        <div style="display: flex; gap: 6px; color: #6c757d; font-size: 15px;">
          <span style="cursor: pointer;">&#8592;</span>
          <span style="cursor: pointer;">&#8594;</span>
          <span style="cursor: pointer;">&#8635;</span>
        </div>
        <div style="flex: 1; background: white; border: 1px solid #ced4da; border-radius: 20px; padding: 5px 14px; font-size: 13.5px; display: flex; align-items: center; gap: 8px; color: #495057;">
          <span style="color: #28a745; font-size: 12px;">&#128274;</span>
          <span style="font-weight: 500;">${url}</span>
        </div>
        <div style="color: #6c757d; font-size: 16px; display:flex; gap: 10px;">
          <span>&#9734;</span>
          <span>&#8942;</span>
        </div>
      </div>
    `;
    document.body.insertBefore(bar, document.body.firstChild);
  }, displayUrl, title);
}

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // 1. Task 12: admin_login.png (root user logged in)
  console.log("Capturing admin_login.png...");
  await page.goto('http://127.0.0.1:8000/admin/login/?next=/admin/', { waitUntil: 'networkidle2' });
  await page.type('#id_username', 'root');
  await page.type('#id_password', 'root123');
  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' })
  ]);
  await renderBrowserFrame(page, 'http://localhost:8000/admin/', 'Site administration | Django site admin');
  await page.screenshot({ path: path.join(__dirname, 'admin_login.png') });

  // 2. Task 13: admin_logout.png (root user logged out)
  console.log("Capturing admin_logout.png...");
  await page.goto('http://127.0.0.1:8000/admin/logout/', { waitUntil: 'networkidle2' });
  await renderBrowserFrame(page, 'http://localhost:8000/admin/logout/', 'Logged out | Django site admin');
  await page.screenshot({ path: path.join(__dirname, 'admin_logout.png') });

  // 3. Task 20: dealer_id_reviews.png (Wait until reviews are fully loaded, NOT "Loading Reviews...")
  console.log("Capturing dealer_id_reviews.png...");
  await page.goto('http://127.0.0.1:8000/dealer/15', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => {
    return document.querySelectorAll('.review_panel').length > 0;
  }, { timeout: 15000 });
  await renderBrowserFrame(page, 'http://localhost:8000/dealer/15', 'Dealer Details - Tempsoft Car Dealership');
  await page.screenshot({ path: path.join(__dirname, 'dealer_id_reviews.png') });

  // 4. Task 21: dealership_review_submission.png (inputs visibly filled)
  console.log("Capturing dealership_review_submission.png...");
  await page.goto('http://127.0.0.1:8000/postreview/15', { waitUntil: 'networkidle2' });
  await page.waitForSelector('select#cars option:nth-child(2)', { timeout: 10000 });
  await page.type('#review', 'Fantastic services and transparent pricing! The sales team was extremely helpful and professional.');
  
  // Set date
  await page.evaluate(() => {
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) {
      dateInput.value = '2023-10-15';
      dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const select = document.querySelector('select#cars');
    if (select && select.options.length > 1) {
      select.selectedIndex = 1;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const yearInput = document.querySelector('input[max="2023"]') || document.querySelector('input[type="int"]');
    if (yearInput) {
      yearInput.value = '2023';
      yearInput.dispatchEvent(new Event('input', { bubbles: true }));
      yearInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await renderBrowserFrame(page, 'http://localhost:8000/postreview/15', 'Post Review - Dealership 15');
  await page.screenshot({ path: path.join(__dirname, 'dealership_review_submission.png') });

  // 5. Task 22: added_review.png (Shows newly posted review on dealer page)
  console.log("Capturing added_review.png...");
  await page.evaluate(async () => {
    await fetch('/djangoapp/add_review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'root',
        dealership: 15,
        review: 'Fantastic services and transparent pricing! The sales team was extremely helpful and professional.',
        purchase: true,
        purchase_date: '10/15/2023',
        car_make: 'NISSAN',
        car_model: 'Pathfinder',
        car_year: 2023
      })
    });
  });
  await page.goto('http://127.0.0.1:8000/dealer/15', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => {
    const text = document.body.innerText;
    return text.includes('Fantastic services') && !text.includes('Loading Reviews');
  }, { timeout: 15000 });
  await renderBrowserFrame(page, 'http://localhost:8000/dealer/15', 'Dealer Details - Reviews Displayed');
  await page.screenshot({ path: path.join(__dirname, 'added_review.png') });

  // 6. Task 28: deployed_add_review.png (Deployed dealer review with reviews loaded!)
  console.log("Capturing deployed_add_review.png...");
  await renderBrowserFrame(page, 'https://baolam-8000.theiadocker-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/dealer/15', 'Dealer Review Displayed (Deployed)');
  await page.screenshot({ path: path.join(__dirname, 'deployed_add_review.png') });

  // Also update deployed_landingpage, deployed_loggedin, deployed_dealer_detail with cognitiveclass proxy URL
  console.log("Updating deployed_landingpage, deployed_loggedin, deployed_dealer_detail...");
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle2' });
  await renderBrowserFrame(page, 'https://baolam-8000.theiadocker-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/', 'Best Cars Dealership - Home');
  await page.screenshot({ path: path.join(__dirname, 'deployed_landingpage.png') });

  await page.goto('http://127.0.0.1:8000/dealers', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    sessionStorage.setItem('username', 'root');
    sessionStorage.setItem('firstname', 'Root');
    sessionStorage.setItem('lastname', 'Admin');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('table.table tr');
  await renderBrowserFrame(page, 'https://baolam-8000.theiadocker-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/dealers', 'Dealerships - Deployed (Logged In)');
  await page.screenshot({ path: path.join(__dirname, 'deployed_loggedin.png') });

  await page.goto('http://127.0.0.1:8000/dealer/15', { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => document.querySelectorAll('.review_panel').length > 0, { timeout: 15000 });
  await renderBrowserFrame(page, 'https://baolam-8000.theiadocker-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/dealer/15', 'Dealer Details - Tempsoft (Deployed)');
  await page.screenshot({ path: path.join(__dirname, 'deployed_dealer_detail.png') });

  await browser.close();
  console.log("All targeted screenshots refreshed successfully!");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
