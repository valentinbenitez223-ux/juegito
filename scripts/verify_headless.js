import http from 'http';
import fs from 'fs';
import path from 'path';

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

server.listen(8080, async () => {
  console.log('Servidor estático corriendo en http://localhost:8080/');
  try {
    const puppeteer = (await import('puppeteer-core')).default;
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });
    const page = await browser.newPage();
    const consoleLogs = [];
    page.on('console', (msg) => consoleLogs.push(msg.text()));
    page.on('pageerror', (err) => consoleLogs.push('PAGE_ERROR: ' + (err.stack || err.message)));

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
    await page.goto('http://localhost:8080/?test=true', { waitUntil: 'networkidle0' });
    console.log('Página cargada exitosamente.');

    await new Promise((r) => setTimeout(r, 800));

    const qaText = await page.$eval('#qa-results-container', (el) => el.innerText);
    console.log('Resultados de QA en navegador:\n', qaText.split('\n').slice(0, 8).join('\n'));

    console.log('Console logs del navegador:');
    consoleLogs.forEach((l) => console.log('  ->', l));

    await page.screenshot({ path: 'docs/screenshots/mobile-verification.png' });
    console.log('Captura tomada en docs/screenshots/mobile-verification.png');

    await browser.close();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Fallo en test:', err);
    server.close();
    process.exit(1);
  }
});
