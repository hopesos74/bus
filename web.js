
const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
// node-fetch가 내장되지 않은 구버전 노드일 경우 설치가 필요할 수 있습니다.
// 최신 Node 환경이라면 전역 fetch를 지원합니다.

const app = express();

// 정적 파일 제공 (public 폴더 안의 index.html을 읽음)
app.use(express.static(path.join(__dirname, "public")));

// 🚌 김해 버스 API 프록시
app.get("/bus", async (req, res) => {
  try {
    const url = "https://bus.gimhae.go.kr/ver5/map/ajax_get_data.php?" + new URLSearchParams(req.query);
    const response = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      }
    });
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("euc-kr");
    const text = decoder.decode(buffer);
    
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(500).send("API ERROR");
  }
});

// 메인 페이지 라우팅
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Cafe24는 process.env.PORT를 통해 포트를 할당할 수 있습니다.
const PORT = process.env.PORT || 8001; 
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: 포트 ${PORT}`);
});