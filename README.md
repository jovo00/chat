# AI Chat App

A simple and modern AI chatbot interface with **Bring Your Own Key (BYOK)**. Chat with multiple LLMs, attach files and search the web. It's using Convex as its realtime database, and OpenRouter for LLM access.


## 🚧 Work in Progress 🚧

**Please note: This project is currently under active development. Features may be incomplete, and breaking changes are possible.**


## ✨ Features

- **Google Authentication**: Secure sign-in with your Google account.
- **Realtime Database**: All chats and data are synced instantly using [Convex](https://convex.dev).
- **Multi-LLM Support**: Chat with multiple large language models via [OpenRouter](https://openrouter.ai).
- **File Attachments**: Attach images or pdfs directly in your conversations.
- **Web Search**: Enrich your chats with live web search results.
- **Persistent Conversations**: Messages are generated in the background and persist even after a page refresh.

Check out the [Demo](https://chat.jovo.dev)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jovo00/chat.git
cd chat
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Development Server

```bash
pnpm dev
```

### 4. Set Up Convex

- Follow the instructions from Convex in your terminal.
- Visit your [Convex dashboard](https://dashboard.convex.dev/) for your app.

### 5. Configure Convex HTTP Actions

- Go to **Settings > URL & Deploy key** in your Convex dashboard.
- Copy the **HTTP Actions URL** and add it to your `.env.local`:

  ```
  NEXT_PUBLIC_CONVEX_ACTIONS_URL=your_http_actions_url
  ```

### 6. Set Environment Variables

- Review `.env.convex.example` for required variables.
- Set these in your Convex dashboard under **Settings > Environment Variables**.

  **You will need:**
  - Google OAuth ID and Secret
  - JWKS and JWT Private Key (generate with `pnpm generate-keys`; keys will be in the `keys` folder)
  - Site URL: `http://localhost:3000`
  - OpenRouter API URL: `https://openrouter.ai/api/v1`
  - Secret Key and Secret IV (32-character random strings for API key encryption)

### 7. Deploy Backend

- Convex will automatically push the code and set up the backend after configuration.

### 8. Sign In and Set Admin Role

- Visit [http://localhost:3000](http://localhost:3000) and sign in with Google.
- In your Convex dashboard, go to **Data > users** table.
- Set your user’s role to `"admin"`.

### 9. Configure Available LLMs

- Go to [http://localhost:3000/settings/admin](http://localhost:3000/settings/admin).
- Select from all available OpenRouter models and add them to the **Selected Models List**.
- These models will be available to your users.


## 💬 Start Chatting!

You’re all set! Start chatting with your favorite LLMs!


## 🛠️ Tech Stack

- **Next.js** (Frontend)
- **Convex** (Realtime Database & Backend)
- **OpenRouter** (LLM API)
- **Google OAuth** (Authentication)
- **Tailwind & Shadcn** (Styling)


## 📝 License

MIT