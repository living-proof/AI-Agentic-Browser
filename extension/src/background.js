chrome.action.onClicked.addListener(async (tab) => {
  console.log("Extension clicked, opening side panel...");

  // Ensure the side panel opens for the active window
  if (chrome.sidePanel && chrome.sidePanel.open) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
  } else {
      console.error("Side Panel API not available.");
  }
});

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { navigateTool } from "./tools.js";

const systemPrompt = `You are Nova, an AI assistant with superpowers powered by tools.

If the user asks to go to a website, do NOT just say you're going — actually use the "navigate_to" tool. You must always use tools when interacting with the browser.

Don't try to summarize or imitate tool behavior — call the tool directly with the right arguments.

You only use natural responses when asked conversational or non-browser questions.`;

const systemPrompt2= `You are Nova, a helpful and intelligent AI assistant.

Your job is to support the user by providing clear, accurate, and friendly answers through conversation. You respond using your own reasoning and knowledge, without relying on any external systems or automation.

Always aim to be thoughtful, informative, and easy to understand. Focus on being genuinely useful and kind in every response.`;

const API_KEY = import.meta.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("[Nova] No API key found. Set VITE_GEMINI_API_KEY in your .env.local file.");
}


const chatHistories = {};
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: API_KEY,
}).bindTools([navigateTool])

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const { type, userId, question } = msg;

  if (type === "ask-gemini") {
    (async () => {
      try {
        if (!chatHistories[userId]) chatHistories[userId] = [new HumanMessage(systemPrompt2)];
        chatHistories[userId].push(new HumanMessage(question));

        const response = await model.invoke(chatHistories[userId]);

        // Destructure response to separate content and tool_calls
        const { content, tool_calls } = response;

        if (tool_calls && tool_calls.length > 0) {
          // Tool is being called
          for (const call of tool_calls) {
            if (call.name === "navigate_to") {
              const result = await navigateTool.func(call.args);
              console.log("Tool result:", result);
              chatHistories[userId].push(new AIMessage(result));
              sendResponse({ answer: result });
            }
          }
        } else {
          // No tool call — use response.content as the final answer
          chatHistories[userId].push(new AIMessage(content));
          sendResponse({ answer: response.content });
        } 
        
      } catch (e) {
        console.error("Gemini error:", e);
        sendResponse({ error: "Failed to generate response" });
      }
    })();

    return true; // ✅ Keeps the message channel open
  }

  if (type === "reset-chat") {
    chatHistories[userId] = [new HumanMessage(systemPrompt)];
    sendResponse({ success: true });
    return true;
  }
});

