# AI-Browser Extension (Work in Progress)

This is the **extension** portion of the AI-Browser project. It’s essentially **AI assistant in a Chrome extension**, built with **Vite** for fast development and packaging. The server-side code is currently unused, and this README focuses solely on the extension. The long-term goal is to evolve it with **agentic behavior** and **integrated tooling** for more autonomous and context-aware AI assistance.

---

## 🚀 Features (Current & Planned)

### ✅ Current Capabilities
- **AI-Powered Sidebar**: Chat with AI directly in your browser.
- **Background Script**: Handles messaging, events, and logic for the extension.
- **Multiple Tool Scripts**: Includes example automation and AI utilities.
- **Public Assets**: HTML, CSS, and icons for UI.
- **Vite Build System**: Efficient hot-reloading for development and optimized builds for production.

### 🔜 Planned Features
- Agentic behavior for autonomous multi-step tasks.
- Tool integration for browsing, searching, and data manipulation.
- Support for multiple AI models.
- UI/UX enhancements.
- Integration with external APIs.
- Configurable user settings stored locally.
- Additional tool modules.

---

## 📚 Libraries & APIs Used
- **Vite** – Next generation frontend tooling for fast builds and hot module replacement.
- **Chrome Extension APIs** – For background scripts, messaging, and UI integration.
- **JavaScript (ES6+)** – Core language for extension logic.
- **Node.js & npm** – For dependency management and build scripts.
- **dotenv** – For managing environment variables.
- **Google Gemini API** – For powering conversational AI features.

---

## 📂 Structure
```
extension/
├── src/                   # Core extension logic
│   ├── background.js       # Background service worker
│   ├── sidebar.js          # Sidebar interface
│   ├── tools.js            # Tool functionality
│
├── public/                 # Static assets
│   ├── icon.png
│   ├── manifest.json
│   ├── sidebar.html
│   ├── sidebar.css
│
├── dist/                   # Production build output
├── .env.example            # Example environment variables
├── .env.local              # Local environment variables (not committed)
├── vite.config.js          # Vite configuration
├── package.json
└── package-lock.json
```

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/jorelaustin/AI-Agentic-Browser.git
cd AI-Browser/extension
```

### 2. Set Environment Variables
- Copy `.env.example` to `.env.local`
- Fill in your API keys and configuration values

Example `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run in Development Mode
```bash
npm run dev
```
This will start Vite in development mode with hot reload.

### 5. Load the Extension in Chrome
1. Build the project:
```bash
npm run build
```
2. Go to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder

---

## 📦 Building for Production
```bash
npm run build
```
The production build will be placed in `dist/`.

---

## 🤝 Contributing
This extension is in early development. Bug reports and feature requests are welcome.

---

## 📜 License
No license is currently applied. All rights reserved.

---

## ⚠️ Status
This is a **work in progress**. Features, structure, and documentation may change frequently.
