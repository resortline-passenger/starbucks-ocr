const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

const TEST_MODE_PASSWORD = process.env.TEST_MODE_PASSWORD;

app.post('/api/check-password', (req, res) => {
  const { password } = req.body;
  res.json({ success: password === TEST_MODE_PASSWORD });
});

app.post('/api/ocr', async (req, res) => {
  try {
    const imageBase64 = req.body.image;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "日本のスターバックスレシートから、商品名、サイズ（Short, Tallなど）、数量、持ち帰りかどうかを抽出してください。JSON形式で返してください。"
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ]
      })
    });

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || "{}";
    const item = JSON.parse(content);
    res.json({ item });
  } catch (e) {
    res.status(500).json({ error: "OCR処理に失敗しました", detail: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ サーバー起動: http://localhost:${PORT}`));
