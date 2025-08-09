// Notify that the script has been successfully loaded
alert("Script is running!");

// ===== DOM ELEMENT REFERENCES =====
// Input field where the user types their message
const inputField = document.getElementById("message-input");
// Button to send the message
const sendButton = document.getElementById("send-btn");
// Container that holds all the chat bubbles
const chatBox = document.querySelector(".chat-container");
// Button to clear the entire chat
const clearButton = document.getElementById("clear-chat-button");
// Button to stop bot typing mid-message
const stopButton = document.getElementById("stop-btn");

// ===== STATE VARIABLES =====
let isTyping = false;               // Indicates if the bot is currently "typing"
let isStopped = false;              // New flag for stopping during loading
let currentTypingTarget = null;     // The span element where the bot is typing
let currentTypingMessage = "";      // The full bot message being typed out
const userId = "user";              // Hardcoded for now, replace later if needed

/**
 * Renders a new message bubble in the chat box.
 * Differentiates between user and bot messages and applies the appropriate style.
 * If the message is from the bot, it types it out character-by-character.
 */
async function sendMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `bubble ${sender === "bot" ? "bot-message" : "user-message"}`;

    const span = document.createElement("span");
    messageDiv.appendChild(span);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (sender === "bot") {
        isTyping = true;
        currentTypingTarget = span;
        currentTypingMessage = text;

        await typewriterEffect(text, span);
    } else {
        span.innerHTML = formatMessage(text);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Simulates a typewriter effect for bot messages.
 * Adds each character one by one with a short delay.
 */
const typewriterEffect = async (message, spanElement) => {
    for (let i = 0; i < message.length; i++) {
        if (!isTyping) break;
        spanElement.innerHTML += message[i] === '\n' ? '<br>' : message[i];
        await new Promise(resolve => setTimeout(resolve, 1)); // 1ms delay between characters
    }

    // Ensure the full message is displayed at the end
    if (isTyping) {
        spanElement.innerHTML = formatMessage(message);
    }
    isTyping = false;
    currentTypingTarget = null;
    currentTypingMessage = "";
};

/**
 * Handles send button click event.
 * Sends user's message, shows loading animation, fetches response from server,
 * and then displays the bot's reply.
 */
sendButton.addEventListener("click", async () => {
  const message = inputField.value.trim();
  if (!message) return;

  sendButton.disabled = true;
  isStopped = false;

  stopButton.style.display = "block";
  sendButton.style.display = "none";

  sendMessage("user", message);
  inputField.value = "";

  const loadingMessageDiv = document.createElement("div");
  loadingMessageDiv.className = "bubble bot-message";
  loadingMessageDiv.innerHTML = `
    <div class="loading">
      <div class="line"></div><div class="line"></div><div class="line"></div>
    </div>`;
  chatBox.appendChild(loadingMessageDiv);

  chrome.runtime.sendMessage(
    { type: "ask-gemini", userId, question: message },
    async (response) => {
      chatBox.removeChild(loadingMessageDiv);
      if (!isStopped && response?.answer) {
        await sendMessage("bot", typeof response.answer === "string" ? response.answer : response.answer?.content ?? JSON.stringify(response.answer));
      } else if (!isStopped) {
        await sendMessage("bot", "Sorry, something went wrong.");
      }
      stopButton.style.display = "none";
      sendButton.style.display = "block";
      sendButton.disabled = false;
    }
  );
});


/**
 * Handles stop button click event.
 * Immediately halts the typing animation and appends a "[stopped]" note to the bot message.
 */
stopButton.addEventListener("click", () => {
    isTyping = false;
    isStopped = true;

    const lastMessage = chatBox.lastChild;
    if (lastMessage && lastMessage.classList.contains("bot-message")) {
        const span = lastMessage.querySelector("span");
        if (span && !span.innerHTML.includes("[stopped]")) {
            span.innerHTML += '<em> ...[stopped]</em>';
        }
    }

    // Hide the stop button and show the send button again
    stopButton.style.display = "none";
    sendButton.style.display = "block";
    sendButton.disabled = false;
});

/**
 * Sends message on Enter key press (without Shift).
 */
inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

/**
 * Clears the chat box and resets button visibility.
 */
clearButton.addEventListener("click", async () => {
    chatBox.innerHTML = "";             // Remove all chat messages
    stopButton.style.display = "none"; 
    sendButton.style.display = "block";
    chrome.runtime.sendMessage({ type: "reset-chat", userId });
});

/**
 * Escapes potentially unsafe HTML characters from the text to prevent XSS.
 */
function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Formats a message by escaping HTML and converting newlines to <br> tags.
 */
function formatMessage(text) {
    return escapeHTML(text).replace(/\n/g, "<br>");
}

/**
 * Fallback handler for when the user switches tabs.
 * If the bot was typing, it finishes the message immediately.
 */
document.addEventListener("visibilitychange", () => {
    if (!document.hidden && isTyping && currentTypingTarget) {
        currentTypingTarget.innerHTML = formatMessage(currentTypingMessage);
        isTyping = false;
        currentTypingTarget = null;
        currentTypingMessage = "";
    }
});
