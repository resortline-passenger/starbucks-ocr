// backend/server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ .env に OPENAI_API_KEY が設定されていません");
  process.exit(1);
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/vision", async (req, res) => {
  const imageBase64 = req.body.image;

  if (!imageBase64) {
    return res.status(400).json({ error: "画像データが送信されていません" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "日本のスターバックスレシートから、商品名、サイズ（Short, Tallなど）、数量、金額、持ち帰りかどうかを抽出してください。JSON形式で次のように返してください: {\"name\":\"...\",\"size\":\"...\",\"quantity\":1,\"price\":637,\"to_go\":true}"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔴 OpenAI APIエラー:", data);
      return res.status(response.status).json({ error: data.error || "OpenAI Vision APIエラー" });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Vision API通信中にエラー:", error);
    res.status(500).json({ error: "Vision APIリクエストに失敗しました", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 サーバー起動中: http://localhost:${PORT}`);
});
