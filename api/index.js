const express = require("express");
const fetch = require("node-fetch");
const app = express();

// 🚌 김해 버스 API 프록시
app.get("/api/bus", async (req, res) => {
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

module.exports = app; // 👈 Vercel을 위해 필수!