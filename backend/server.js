require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "../frontend")));

app.post("/analyze", async (req, res) => {
  try {
    const { image } = req.body;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "日本のスタバレシートから商品名・サイズ・数量・持ち帰りかをJSONで抽出して下さい"
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${image}` }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[ERROR] OpenAI API response error:", data);
      return res.status(500).send(JSON.stringify({
        error: "OpenAI APIからの応答が不正です",
        raw: data
      }));
    }
    res.send(content);
  } catch (err) {
    res.status(500).send(JSON.stringify({ error: err.message }));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
