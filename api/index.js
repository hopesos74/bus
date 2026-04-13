const express = require("express");
const https = require("https");
const app = express();

app.get("*", async (req, res) => {
  // 1. 요청 파라미터 구성
  const params = new URLSearchParams(req.query).toString();
  const url = `https://bus.gimhae.go.kr/ver5/map/ajax_get_data.php?${params}`;

  try {
    // 2. Promise를 사용하여 데이터가 다 올 때까지 기다림 (Timeout 방지)
    const fetchData = () => {
      return new Promise((resolve, reject) => {
        const request = https.get(url, { timeout: 5000 }, (apiRes) => {
          let data = [];
          apiRes.on('data', (chunk) => data.push(chunk));
          apiRes.on('end', () => resolve(Buffer.concat(data)));
        });

        request.on('error', (err) => reject(err));
        request.on('timeout', () => {
          request.destroy();
          reject(new Error("Gimhae Server Timeout"));
        });
      });
    };

    const buffer = await fetchData();
    const decoder = new (require('util').TextDecoder)("euc-kr");
    const text = decoder.decode(buffer);

    // 3. 응답 전송
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(text);

  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(504).json({ error: "Gateway Timeout", details: err.message });
  }
});

module.exports = app;