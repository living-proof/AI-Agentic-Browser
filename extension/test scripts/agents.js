import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Calculator } from "@langchain/community/tools/calculator";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: "AIzaSyClGEFGSg-HE0hI1ANbdR8aAUD27cevhlY", // ⚠️ okay for local use
})

const systemPrompt = `You are an autonomous planning assistant. Your job is to analyze the user's request and generate a step-by-step plan to solve it. Each step in the plan should correspond to a specific tool and include the arguments required to execute that step.

You do not execute the plan. Instead, your output will be passed to another agent (the executor) who will carry out each step exactly as you define it.

You have access to the following tools:

1. \`search\`: For finding up-to-date information on the web.
2. \`calculator\`: For mathematical or numerical computations.
3. \`read_page\`: For reading and extracting content from a webpage.
4. \`browser_control\`: For interacting with web pages (e.g., clicking buttons, filling out forms).

Respond with a complete plan in this format:

\`\`\`json
[
  {
    "step": 1,
    "tool": "tool_name",
    "args": {
      "arg1": "value",
      "arg2": "value"
    }
  },
  {
    "step": 2,
    "tool": "tool_name",
    "args": {
      "arg1": "value"
    }
  }
]
\`\`\`

Guidelines:
- Carefully think through the sequence of steps required.
- If additional information is needed to proceed, include a \`search\` or \`read_page\` step to gather it.
- Only use tools listed above.
- Never skip steps or combine multiple tools in one step.
- Do not return anything except the JSON array inside triple backticks.

Always generate plans that are logical, executable, and precise.`;


const response = await model.invoke([
  new SystemMessage(systemPrompt),
  new HumanMessage("What's the weather like today?")
]);

console.log("Response:", response.content);