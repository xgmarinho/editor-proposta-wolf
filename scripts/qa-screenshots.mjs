import puppeteer from "puppeteer-core";

const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const outDir = "C:/Users/Windows 10/Documents/Codex/2026-06-22/o-qu/work/proposta-wolf";

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: "new",
  args: ["--disable-gpu", "--hide-scrollbars", "--no-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle0" });
await new Promise((resolve) => setTimeout(resolve, 3200));

const metrics = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  scrollWidth: document.documentElement.scrollWidth,
  viewport: { width: innerWidth, height: innerHeight },
  sections: [...document.querySelectorAll("section, footer, .marquee")].map((el) => ({
    className: el.className || el.tagName.toLowerCase(),
    top: Math.round(el.getBoundingClientRect().top + scrollY),
    height: Math.round(el.getBoundingClientRect().height),
  })),
}));

const stops = [0, 760, 1500, 2350, 3300, 4150, 5000, 5950, 6850, 7600, 8450, 9250];
for (const [index, y] of stops.entries()) {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  await new Promise((resolve) => setTimeout(resolve, 2200));
  await page.screenshot({ path: `${outDir}/qa-${String(index).padStart(2, "0")}.png` });
}

console.log(JSON.stringify(metrics, null, 2));
await browser.close();
