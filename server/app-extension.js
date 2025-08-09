import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

dotenv.config();

const app = express();
const port = 3000;

const chatHistories = {}; // In-memory history keyed by userId

app.use(cors());
app.use(express.json());

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
});

app.post('/ask-gemini', async (req, res) => {
  try {
    const { question, userId } = req.body;

    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }

    chatHistories[userId].push({ role: 'user', content: question });

    const response = await model.invoke(chatHistories[userId]);

    chatHistories[userId].push({ role: 'assistant', content: response.text });

    res.json({ answer: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gemini API failed.' });
  }
});

app.post('/reset-chat', (req, res) => {
  const { userId } = req.body;
  chatHistories[userId] = [];
  res.json({ success: true, message: 'Chat history cleared.' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
