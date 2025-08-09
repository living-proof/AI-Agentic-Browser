import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // Remove these if you find cloud server
import { fileURLToPath } from 'url'; // Remove these if you find cloud server
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

dotenv.config();

const app = express();
const port = 3000;

const chatHistories = {}; // In-memory history keyed by userId

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// 👇 Serve static files from the extension folder
const extensionPath = path.join(__dirname, '../extension');
app.use(express.static(extensionPath));

// 👇 Serve sidebar.html at root (/)
app.get('/', (req, res) => {
  res.sendFile(path.join(extensionPath, 'sidebar.html'));
});

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
