import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const navigateTool = new DynamicStructuredTool({
  name: "navigate_to",
  description: "Navigates the current tab to a given URL or search term.",
  schema: z.object({
    destination: z.string().describe("The URL or search phrase to navigate to."),
  }),
  func: async ({ destination }) => {
    console.log("🌐 navigateTool invoked:", destination);

    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id) return "❌ No active tab found.";

    let finalUrl;
    try {
      finalUrl = new URL(destination).href;
    } catch {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(destination)}`;
    }

    // If we're on a restricted page, fallback to opening a new tab
    const isBlocked =
      tab.url?.startsWith("chrome://") || tab.url?.startsWith("chrome-extension://");

    if (isBlocked) {
      await chrome.tabs.create({ url: finalUrl });
      return `🧭 Opened ${finalUrl} in a new tab (restricted tab).`;
    }

    // Fallback method that works in fullscreen — inject code into the page
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => { window.location.href = url; },
        args: [finalUrl],
      });
      return `🧭 Injected navigation to: ${finalUrl}`;
    } catch (err) {
      console.error("❌ Script injection failed:", err);
      return `❌ Couldn't navigate to ${finalUrl}`;
    }
  }
});
