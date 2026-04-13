const puppeteer = require("puppeteer");

async function scrapeKyobo() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(
    "https://store.kyobobook.co.kr/bestseller/total/weekly?ymw=2026041",
    { waitUntil: "networkidle2" }
  );

  // 요소 렌더링 기다리기
  await page.waitForSelector(".prod_link");

  const books = await page.evaluate(() => {
    const items = document.querySelectorAll(".prod_item");
    return Array.from(items).slice(0, 10).map((el, i) => ({
      rank: i + 1,
      title: el.querySelector(".prod_name")?.innerText.trim(),
    }));
  });

  console.log(books);

  await browser.close();
}

scrapeKyobo();