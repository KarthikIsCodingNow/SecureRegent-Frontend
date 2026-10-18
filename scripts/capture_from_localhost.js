import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(process.cwd(), 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function capture() {
  console.log(`Connecting to Chrome at: ${CHROME_PATH}`);
  console.log(`Targeting local host: ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1050, deviceScaleFactor: 2 });

  const routes = [
    { name: '01_landing_hero.png', path: '/' },
    { name: '02_overview_dashboard.png', path: '/app' },
    { name: '03_lead_analytics.png', path: '/app/leads' },
    { name: '04_quotation_analytics.png', path: '/app/quotations' },
    { name: '05_deals_revenue.png', path: '/app/deals' },
    { name: '06_orders_fulfillment.png', path: '/app/orders' },
    { name: '08_admin_theme_customizer.png', path: '/app/admin' }
  ];

  for (const r of routes) {
    const url = `${BASE_URL}${r.path}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    // Allow animations and ECharts rendering to stabilize
    await new Promise((res) => setTimeout(res, 2000));
    const outPath = path.join(OUTPUT_DIR, r.name);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`✓ Captured: ${r.name}`);
  }

  // Now capture the drilldown popup with genie animation & popped up glass elevation
  console.log('Navigating to /app to capture drilldown popup...');
  await page.goto(`${BASE_URL}/app`, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise((res) => setTimeout(res, 2000));

  // Find a KPI card with role="button"
  const kpiCards = await page.$$('[role="button"]');
  console.log(`Found ${kpiCards.length} clickable elements`);
  if (kpiCards.length > 0) {
    // Click the first KPI card
    await kpiCards[0].click();
    console.log('Clicked KPI card, waiting for genie animation...');
    await new Promise((res) => setTimeout(res, 1200));
    const drilldownPath = path.join(OUTPUT_DIR, '07_drilldown_genie_popup.png');
    await page.screenshot({ path: drilldownPath, fullPage: false });
    console.log(`✓ Captured drilldown popup: 07_drilldown_genie_popup.png`);
  } else {
    console.warn('Could not find KPI card');
  }

  await browser.close();
  console.log('All local host screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
