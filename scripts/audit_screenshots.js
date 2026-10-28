import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Iniciando auditoría visual con Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Mobile 375x812
  console.log('Capturando Mobile 375x812...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-375x812.png') });

  // 2. Mobile 390x844
  console.log('Capturando Mobile 390x844...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-390x844.png') });

  // 3. Tablet 768x1024
  console.log('Capturando Tablet 768x1024...');
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'tablet-768x1024.png') });

  // 4. Desktop 1440x900
  console.log('Capturando Desktop 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-1440x900.png') });

  // 5. Pantallas internas (Pestaña Diario, Juegos, Hogar, Ajustes)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });

  // Diario
  const buttons = await page.$$('nav button');
  if (buttons.length >= 5) {
    console.log('Capturando pestaña Diario...');
    await buttons[2].click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, 'tab-journal.png') });

    // Juegos
    console.log('Capturando pestaña Juegos...');
    await buttons[3].click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, 'tab-games.png') });

    // Hogar / Despensa
    console.log('Capturando pestaña Hogar...');
    await buttons[4].click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, 'tab-shop.png') });
  }

  // Ajustes Modal
  console.log('Capturando Modal de Ajustes...');
  const settingsBtn = await page.$('header button:last-child');
  if (settingsBtn) {
    await settingsBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, 'modal-settings.png') });
  }

  await browser.close();
  console.log('¡Auditoría visual completada con éxito!');
}

run().catch((err) => {
  console.error('Error durante la auditoría:', err);
  process.exit(1);
});
