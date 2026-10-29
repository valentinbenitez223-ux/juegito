import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function startServer(port = 8181) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let file = req.url === '/' ? 'index.html' : req.url.slice(1).split('?')[0];
      let filePath = path.resolve(file);
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
      };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(port, () => resolve(server));
  });
}

async function run() {
  console.log('Iniciando servidor de auditoría visual...');
  const server = await startServer(8181);

  console.log('Iniciando navegador Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const BASE_URL = 'http://localhost:8181/';

  // 1. Mobile 375x812 (iPhone Mini / SE)
  console.log('Capturando Mobile 375x812...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-375x812.png') });

  // 2. Mobile 390x844 (iPhone 13/14/15)
  console.log('Capturando Mobile 390x844...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile-390x844.png') });

  // 3. Tablet 768x1024 (iPad)
  console.log('Capturando Tablet 768x1024...');
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'tablet-768x1024.png') });

  // 4. Desktop 1440x900 (Dos columnas)
  console.log('Capturando Desktop 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(OUT_DIR, 'desktop-1440x900.png') });

  // 5. Pestañas funcionales
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });

  console.log('Capturando pestaña Diario...');
  await page.click('button[data-tab="journal"]');
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, 'tab-journal.png') });

  console.log('Capturando pestaña Juegos...');
  await page.click('button[data-tab="games"]');
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, 'tab-games.png') });

  console.log('Capturando pestaña Hogar/Tienda...');
  await page.click('button[data-tab="home"]');
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, 'tab-shop.png') });

  console.log('Capturando pestaña Ajustes...');
  await page.click('button[data-tab="settings"]');
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(OUT_DIR, 'modal-settings.png') });

  await browser.close();
  server.close();
  console.log('¡Auditoría visual completada con éxito!');
}

run().catch((err) => {
  console.error('Error durante la auditoría:', err);
  process.exit(1);
});
