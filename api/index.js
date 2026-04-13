const express = require("express");
const fetch = require("node-fetch");
const app = express();

// 💡 중요: app.get("/api/bus") 대신 "*"를 사용하여 모든 요청을 수용합니다.
// 이렇게 하면 vercel.json에서 넘겨주는 /bus 경로를 에러 없이 바로 받습니다.
app.get("*", async (req, res) => {
  try {
    // 프론트엔드(index.html)에서 보낸 쿼리스트링(mode, keyword 등)을 그대로 가져옵니다.
    const params = new URLSearchParams(req.query).toString();
    const url = `https://bus.gimhae.go.kr/ver5/map/ajax_get_data.php?${params}`;
    
    // 김해시 서버에 데이터 요청
    const response = await fetch(url, { 
      headers: { "User-Agent": "Mozilla/5.0" } 
    });

    if (!response.ok) throw new Error("Gimhae API 응답 오류");

    // v14 호환을 위해 버퍼로 받아서 EUC-KR로 디코딩
    const buffer = await response.buffer();
    const decoder = new (require('util').TextDecoder)("euc-kr");
    const text = decoder.decode(buffer);
    
    // 브라우저가 XML로 인식하도록 헤더 설정 후 전송
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Vercel 환경에서는 서버를 직접 띄우지 않고 app 객체만 내보냅니다.
module.exports = app;