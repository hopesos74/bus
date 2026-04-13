
const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/api/bus", async (req, res) => { // Vercel 내부 경로는 /api/bus 권장
  try {
    const params = new URLSearchParams(req.query).toString();
    const url = `https://bus.gimhae.go.kr/ver5/map/ajax_get_data.php?${params}`;
    
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const buffer = await response.buffer();
    const decoder = new (require('util').TextDecoder)("euc-kr");
    const text = decoder.decode(buffer);
    
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.listen 코드는 삭제하거나 주석 처리하세요.
module.exports = app;