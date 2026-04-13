const express = require("express");
const https = require("https"); // 더 안정적인 연결을 위해 기본 모듈 사용
const app = express();

app.get("*", async (req, res) => {
  try {
    const params = new URLSearchParams(req.query).toString();
    const url = `https://bus.gimhae.go.kr/ver5/map/ajax_get_data.php?${params}`;

    // 김해시 서버에 데이터 요청
    https.get(url, (apiRes) => {
      let data = [];

      apiRes.on('data', (chunk) => {
        data.push(chunk);
      });

      apiRes.on('end', () => {
        const buffer = Buffer.concat(data);
        const decoder = new (require('util').TextDecoder)("euc-kr");
        const text = decoder.decode(buffer);
        
        res.setHeader("Content-Type", "text/xml; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*"); // CORS 허용
        res.send(text);
      });

    }).on("error", (err) => {
      throw new Error("김해 서버 연결 실패: " + err.message);
    });

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "fetch failed", details: err.message });
  }
});

module.exports = app;