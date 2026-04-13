const express = require("express");
const path = require("path");
const app = express();

const cheerio = require("cheerio"); 

app.use(express.static(path.join(__dirname, "public")));

// 🚌 기존 버스 API (유지)
app.get("/bus", async (req, res) => {
  try {
    const url = "https://bus.gimhae.go.kr/ver5/map/ajax_get_data.php?" + new URLSearchParams(req.query);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", "ngrok-skip-browser-warning": "true" }
    });
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("euc-kr");
    const text = decoder.decode(buffer);
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.send(text);
  } catch (err) {
    res.status(500).send("API ERROR");
  }
});

// 🎬 새로운 랭킹 API 추가
app.get("/api/rankings", async (req, res) => {
  const { type } = req.query;
  const KOBIS_HOST = "https://www.kobis.or.kr";

  //if (type === "movie") {

  try {
    if (type === "movie") {
      const response = await fetch("https://www.kobis.or.kr/kobis/mobile/main/searchMainBoxOffice.do", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const data = await response.json();
      const processed = data.map(m => ({
        rank: m.rank,
        title: m.movieNm,
        img: KOBIS_HOST + m.thumbUrl,
        info1: `개봉일: ${m.openDt}`,
        info2: `일일관객: ${parseInt(m.audiCnt).toLocaleString()}`,
        info3: `누적관객: ${parseInt(m.totalAudiCnt).toLocaleString()}`
      }));
      return res.json(processed);
    }


    if (type === "book") {
      const targetUrl = "https://store.kyobobook.co.kr/bestseller/total/weekly?ymw=2026041";
      const response = await fetch(targetUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      let books = [];
      
      // 교보문고 리스트 아이템 선택자 (사이트 구조에 따라 변경될 수 있음)
      $(".prod_item").each((i, el) => {
        if (i >= 10) return; // TOP 10만 추출

        const rank = i + 1;
        const title = $(el).find(".prod_name").text().trim();
        const img = $(el).find(".img_box img").attr("src");
        const author = $(el).find(".author").text().trim();
        const price = $(el).find(".val").text().trim();
        const pub = $(el).find(".pub").text().trim();

        books.push({
          rank: rank,
          title: title,
          img: img,
          // 스크린샷 UI에 맞게 데이터 매핑
          audiCnt: 0, // 도서는 관객수가 없으므로 0 또는 다른 데이터로 활용
          totalAudiCnt: 0,
          salesAmt: price.replace(/[^0-9]/g, ""), // 숫자만 추출하여 매출액 칸에 표시
          totalSalesAmt: 0,
          showCnt: pub, // 상영횟수 자리에 출판사 표시
          info1: `저자: ${author}`,
          info2: `출판: ${pub}`,
          info3: `가격: ${price}원`,
          isNew: false 
        });
      });
      
      return res.json(books);
    }


    res.json([]);
  } catch (err) {
    res.status(500).json({ error: "데이터 실패" });
  }
});


app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 서버 실행 중: http://localhost:3000");
});