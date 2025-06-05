# WhatsApp Baileys OSINT Bot

## :open_book: Description

A simple WhatsApp bot using the `@whiskeysockets/baileys` library for OSINT (Open Source Intelligence) tasks.  
This bot listens for specific trigger keywords in messages and performs Google Custom Search queries to provide relevant information directly on WhatsApp.

Built with Node.js and designed to be easy to customize and extend.

---

## :hammer_and_wrench: Requirements

- Node.js v18+
- Google Custom Search API Key
- Google Custom Search Engine (CSE) ID

---

## :rocket: How to Install

1. **Create Google API Key**

   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create or select a project.
   - Navigate to **APIs & Services > Credentials**.
   - Click **Create Credentials > API Key**.
   - Copy your API key.

2. **Create Custom Search Engine (CSE)**

   - Go to [Google Custom Search Engine](https://cse.google.com/cse/all).
   - Click **Add**.
   - For "Sites to search," you can enter `www.google.com` or leave it blank to search the entire web (enable "Search the entire web" option).
   - Create the CSE and note the **Search Engine ID**.

3. **Clone this repository**

   ```bash
   git clone https://github.com/ferdyhape/whatsapp-baileys-osint-bot.git
   ```

4. **Go to the project directory and install dependencies**

   ```bash
   cd whatsapp-baileys-osint-bot
   npm install
   ```

5. **Copy `.env.example` to `.env` and add your credentials**

   ```bash
   cp .env.example .env
   ```

   Edit .env file:

   ```
   GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
   GOOGLE_CSE_ID=YOUR_CUSTOM_SEARCH_ENGINE_ID
   ```

6. **Run the bot**

   ```bash
   npm start
   ```

7. **Open your browser and go to `http://localhost:3000/scan` (or the port you configured)**

   - Scan the QR code with your WhatsApp mobile app to connect the bot.

8. **Send messages to your WhatsApp number**

   - Use trigger keywords like carikan, cari, or info followed by a query. (you can customize these keywords in the `config/triggers.js` file)
   - Example: `carikan data "John Doe"` (query in quotes)
   - The bot will reply with search results from Google Custom Search.

9. Enjoy!

## :man: About Creator

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ferdy-hahan-pradana)
[![instagram](https://img.shields.io/badge/instagram-833AB4?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/ferdyhape)
[![github](https://img.shields.io/badge/github-333?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ferdyhape)
