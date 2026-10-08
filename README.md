# CodeAlpha AI Internship - Task 1: Language Translation Tool

A modern, responsive, and secure AI Language Translation Tool interface built with vanilla **HTML**, **CSS**, **JavaScript**, and a lightweight **Node.js/Express** proxy backend.

---

## 📁 Project Structure

```text
CodeAlpha_LanguageTranslationTool/
│
├── index.html        # Semantic HTML5 layout with AI-themed interface
├── style.css         # Modern dark AI glassmorphism & responsive styles
├── script.js         # Frontend UI events, API dispatch, & TTS logic
├── server.js         # Node.js Express backend proxy with validation & timeout
├── package.json      # Dependencies (express, dotenv)
├── .env.example      # Example environment configuration template
├── .gitignore        # Ignores .env and node_modules/
└── README.md         # Project documentation & setup instructions
```

---

## 🌐 Translation Service Architecture

This project connects to a **Google Translate web translation endpoint** through a secure local Express server backend (`server.js`):

- **Zero API Key Required**: Designed for straightforward development, testing, and demonstration without needing credit card registration or paid credentials.
- **Secure Architecture**: The frontend communicates only with the local proxy (`POST /api/translate`). No external API endpoints or credentials are exposed in client-side code (`index.html`, `style.css`, or `script.js`).
- **Endpoint Disclaimer**: This project uses a Google Translate web translation endpoint for demonstration and developmental purposes. It is **not** the official Google Cloud Translation API and does **not** carry guaranteed service quotas or contractual uptime limits. For enterprise production deployments, an official translation provider (such as the official Google Cloud Translation API or Azure Translator) can be substituted in `server.js` using `.env`.

---

## ✨ Features

- **Multi-Language Support**:
  - English (`en`)
  - Tamil (`ta`)
  - Hindi (`hi`)
  - Telugu (`te`)
  - Malayalam (`ml`)
  - Kannada (`kn`)
  - Spanish (`es`)
  - French (`fr`)
  - German (`de`)
  - Japanese (`ja`)
  - Chinese (`zh`)
  - Auto-detection (`auto`) for source language
- **Backend Protection & Resilience**:
  - Input validation (non-empty string check).
  - Maximum text limit of 5,000 characters.
  - Upstream request timeout (10 seconds) with user-friendly error messages.
  - Rate-limit (HTTP 429) and upstream error interception.
- **Dynamic Frontend Controls**:
  - Interactive "Translating..." button state with animated spinner and disabling to prevent duplicate submissions.
  - Dynamic status indicator (`Ready`, `Translating...`, `Error`).
  - Text-To-Speech (TTS) via the browser's native Web Speech API with BCP-47 tag mapping for accurate regional pronunciation.
  - One-click copy with clipboard fallback for local environments.
  - Language swap with 180° rotation micro-animation and content swapping.
  - Live character counter (`0 / 5000`) and quick Clear button.
- **Modern Responsive Design**:
  - Glassmorphic card styling with ambient background glow.
  - Fluid mobile layout (single-column stacking below 768px).

---

## 🚀 How to Run Locally

### 1. Install Dependencies
Ensure [Node.js](https://nodejs.org/) (v18+) is installed. Open PowerShell in the project directory and run:
```powershell
npm install
```

### 2. Start the Server
Start the Express server:
```powershell
npm start
```
or
```powershell
node server.js
```

### 3. Open in Browser
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 🧪 Testing Checklist

- [x] **English → Tamil**: "Good morning" → "காலை வணக்கம்"
- [x] **English → Hindi**: "Good morning" → "शुभ प्रभात"
- [x] **English → Telugu**: "Good morning" → "శుభోదయం"
- [x] **English → Malayalam**: "Good morning" → "സുപ്രഭാതം"
- [x] **English → Kannada**: "Good morning" → "ಶುಭೋದಯ"
- [x] **English → Spanish**: "Good morning" → "Buen día"
- [x] **English → French**: "Good morning" → "Bonjour"
- [x] **English → German**: "Good morning" → "Guten Morgen"
- [x] **English → Japanese**: "Good morning" → "おはよう"
- [x] **English → Chinese**: "Good morning" → "早上好"
- [x] **Empty Input**: Shows toast prompt "Please enter text to translate first."
- [x] **Length Limit**: Validates maximum length of 5000 characters.
- [x] **Buttons**: Listen, Copy, Swap, Clear, and Counter function seamlessly.

---

## ⚠️ Notes & Limitations

1. **Development Endpoint**: The underlying web translation gateway is intended for development and evaluation. Heavy continuous automated requests may trigger temporary IP rate limits.
2. **Text-To-Speech Voices**: Audio output relies on voices installed on the user's OS and browser. If a voice pack (e.g., Kannada or Telugu) is not installed in the browser's operating system speech engine, playback will fall back to the default system voice.
