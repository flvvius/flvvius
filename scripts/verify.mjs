import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const types = {'.html':'text/html','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server = createServer((req,res) => {
  const file = resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if (!file.startsWith(root + '/') || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404); res.end(); return;
  }
  const ext = file.slice(file.lastIndexOf('.'));
  res.setHeader('Content-Type',types[ext] || 'application/octet-stream');
  res.end(readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url = `http://127.0.0.1:${server.address().port}/.preview/index.html`;
const report = [];
const baselineFile = join(root,'.preview/baseline-heights.json');
const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile,'utf8')) : {};
process.title = 'flvvius-profile-verify';
const cached = join(process.env.HOME,'Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell');
let browser;
try {
  browser = await chromium.launch({headless:true,...(existsSync(cached) ? {executablePath:cached} : {})});
  for (const scheme of ['light','dark']) {
    for (const width of [320,390,1000]) {
      const context = await browser.newContext({viewport:{width,height:900},colorScheme:scheme,reducedMotion:'reduce'});
      const page = await context.newPage();
      await page.goto(url,{waitUntil:'networkidle'});
      await page.screenshot({path:join(root,'.preview',`${scheme}-${width}.png`),fullPage:true});
      const state = await page.evaluate(()=>({
        width:innerWidth, scroll:document.documentElement.scrollWidth,
        images:[...document.images].map(i=>({src:i.getAttribute('src'),alt:i.alt,loaded:i.complete && i.naturalWidth>0,width:i.getBoundingClientRect().width})),
        headings:[...document.querySelectorAll('h2,h3')].map(h=>h.textContent),
        links:[...document.querySelectorAll('a')].map(a=>a.getAttribute('href'))
      }));
      assert(state.scroll<=width,`Horizontal overflow at ${width}, ${scheme}`);
      assert.equal(state.images.length,5);
      assert(state.images.every(i=>i.loaded && i.alt && i.width<=width));
      assert(state.headings.includes('miez.news') && state.headings.includes('Flavius design taste'));
      assert(state.links.every(l=>/^https:\/\//.test(l) || /^mailto:/.test(l)));
      const collapsedHeight = await page.locator('article').evaluate(e=>Math.round(e.getBoundingClientRect().height));
      assert(collapsedHeight<900,`Profile exceeds a screen of content at ${width}px`);
      assert.equal(await page.locator('details').getAttribute('open'),null,'Previews start collapsed');
      assert.equal(await page.locator('article img:visible').count(),1,'Only the desk banner is visible initially');
      const first = page.locator('article a').first();
      await page.keyboard.press('Tab');
      assert(await first.evaluate(a=>a===document.activeElement),'First link is keyboard reachable');
      const summary = page.locator('summary');
      await summary.focus();
      for (const key of ['Enter','Space']) {
        await page.keyboard.press(key);
        assert.notEqual(await page.locator('details').getAttribute('open'),null,`${key} opens the previews`);
        assert.equal(await page.locator('article img:visible').count(),5);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Expanded previews overflow at ${width}px`);
        await page.keyboard.press(key);
        assert.equal(await page.locator('details').getAttribute('open'),null,`${key} closes the previews`);
      }
      await summary.click();
      await page.screenshot({path:join(root,'.preview',`${scheme}-${width}-expanded.png`),fullPage:true});
      if (width===320) {
        await page.evaluate(()=>{
          for (const el of document.querySelectorAll('article p, article h2, article h3, article li')) {
            el.style.fontSize=`${parseFloat(getComputedStyle(el).fontSize)*2}px`;
          }
        });
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Enlarged text overflow, ${scheme}`);
        await page.addStyleTag({content:'p,h2,h3{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}'});
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Text spacing overflow, ${scheme}`);
        await page.screenshot({path:join(root,'.preview',`${scheme}-320-enlarged.png`),fullPage:true});
      }
      const reduction = baseline[width] ? Math.round((1-collapsedHeight/baseline[width])*100) : undefined;
      report.push({scheme,width,collapsedHeight,previousHeight:baseline[width],heightReductionPercent:reduction,noOverflow:true,allImagesLoaded:true,keyboardLink:true,disclosureKeyboard:true});
      console.log(`Checked ${scheme} at ${width}px: ${collapsedHeight}px tall${reduction ? `, ${reduction}% shorter` : ''}.`);
      await context.close();
    }
    const noScript = await browser.newContext({viewport:{width:390,height:900},colorScheme:scheme,javaScriptEnabled:false});
    const noScriptPage = await noScript.newPage();
    await noScriptPage.goto(url,{waitUntil:'networkidle'});
    await noScriptPage.screenshot({path:join(root,'.preview',`${scheme}-390-no-script.png`),fullPage:true});
    await noScript.close();
  }
  writeFileSync(join(root,'.preview/verification.json'),JSON.stringify({verifiedAt:new Date().toISOString(),browser:await browser.version(),source:'Local GitHub Markdown CSS preview; GitHub production rendering is a separate check.',checks:report},null,2)+'\n');
  console.log('Passed: compact and expanded views in light/dark at 320px, 390px and desktop; disclosure keyboard controls, images, links, no JavaScript, enlarged text and spacing.');
} finally {
  if (browser) await browser.close();
  await new Promise(r=>server.close(r));
}
