const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/api/vision", async (req, res) => {
  const base64 = req.body.image;
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "日本のスターバックスレシートから、商品名、サイズ（Short, Tallなど）、価格（税込）、数量、持ち帰りかどうかを抽出してください。JSON形式で返してください。"
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const content = completion.data.choices[0].message.content;
    const parsed = JSON.parse(content.replace(/^```json\s*/, "").replace(/```\s*$/, "").trim());
    res.json({ result: parsed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
