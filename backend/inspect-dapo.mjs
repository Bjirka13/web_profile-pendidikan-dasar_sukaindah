import puppeteer from 'puppeteer';

const url = 'https://dapo.kemdikbud.go.id/sekolah/20217401';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForFunction(() => document.readyState === 'complete', { timeout: 60000 });
await new Promise((resolve) => setTimeout(resolve, 4000));

console.log('TITLE', await page.title());
console.log('HAS NAV TABS', await page.$('.nav.nav-tabs') ? 'yes' : 'no');
console.log('HAS MYTABCONTENT', await page.$('#myTabContent') ? 'yes' : 'no');
for (const selector of ['.nav', '.nav-tabs', '.nav-item', '.tab-pane', '.active', '#myTabContent', 'ul', 'li']) {
  const count = await page.$$eval(selector, (els) => els.length);
  console.log(selector, count);
}

const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 5000));
console.log('BODY SNIPPET');
console.log(bodyText);

const tabHtml = await page.evaluate(() => {
  const nav = document.querySelector('.nav.nav-tabs');
  return nav ? nav.outerHTML.slice(0, 4000) : 'NO_NAV';
});
console.log('NAV HTML');
console.log(tabHtml);

const contentHtml = await page.evaluate(() => {
  const content = document.querySelector('#myTabContent');
  return content ? content.outerHTML.slice(0, 6000) : 'NO_CONTENT';
});
console.log('CONTENT HTML');
console.log(contentHtml);

await browser.close();
