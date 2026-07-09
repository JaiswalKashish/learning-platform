# 🚀 How to Deploy Eduverse on Vercel

Eduverse is a modern Next.js 15 application. It is optimized to run seamlessly in Vercel's serverless and edge environments.

Follow this guide to deploy your project to Vercel and configure your **Groq API Key** for high-speed Llama 3.3 science tutoring!

---

## 📅 Prerequisites
- A **Vercel account** (sign up at [vercel.com](https://vercel.com) for a free Hobby account)
- A **GitHub, GitLab, or Bitbucket account** where your project code is pushed
- Your **Groq API Key**: `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`

---

## 🛠️ Step-by-Step Deployment

### Option A: Import from GitHub (Recommended - Setup Continuous Deployment)

1. **Push your code to GitHub:**
   Make sure all your changes (including the new Groq API integration in `/src/app/api/educhat/route.ts`) are committed and pushed to your GitHub repository.
   
2. **Log into Vercel:**
   Go to [vercel.com/dashboard](https://vercel.com/dashboard).

3. **Create a New Project:**
   - Click the **"Add New..."** button and select **"Project"**.
   - Under **"Import Git Repository"**, select the repository containing your Eduverse code. Click **"Import"**.

4. **Configure Project Settings:**
   - **Framework Preset:** Vercel will automatically detect **Next.js** and configure build settings.
   - **Root Directory:** If your Next.js project is nested under `eduverse-main`, change the root directory setting to `eduverse-main`. If it is in the root of the repo, leave it as `./`.

5. **Set Environment Variables:**
   Expand the **"Environment Variables"** section and add the following keys:
   
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `GROQ_API_KEY` | `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` | **Required.** Authenticates with Groq's high-speed inference API. |
   | `GROQ_MODEL` | `llama-3.3-70b-versatile` | *Optional.* Overrides the default model to Llama 3.3. |

6. **Deploy:**
   Click the **"Deploy"** button. Vercel will build your Next.js app and assign a live, public URL (e.g. `https://eduverse-three.vercel.app`) in under a minute!

---

### Option B: Deploy Using Vercel CLI (Command Line Interface)

If you prefer to deploy directly from your terminal, you can use the Vercel CLI:

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Log in from terminal:**
   ```bash
   vercel login
   ```

3. **Initialize and link project:**
   Run this inside your project folder (`eduverse-main`):
   ```bash
   vercel
   ```
   Follow the prompts to link the project to your Vercel account.

4. **Add environment variables using CLI:**
   ```bash
   vercel env add GROQ_API_KEY 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
   vercel env add GROQ_MODEL llama-3.3-70b-versatile
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

---

## ⚡ Verifying Your Deployment
Once deployed, open your live Vercel URL and navigate to `/ai-tutor` (e.g., `https://your-project.vercel.app/ai-tutor`).
1. Type a science question in the tutor chat.
2. The tutor will fetch responses from Groq's Llama 3.3 and stream them instantly word-by-word onto your page.
3. Check the Vercel Function logs to see the confirmation:
   `✅ Using Groq (llama-3.3-70b-versatile)`

---

## ⚠️ A Note on Security
> [!WARNING]
> Your Groq API key is private and should **never** be exposed in client-side code. Our integration runs in a secure Next.js edge route (`/api/educhat`), meaning your key remains safely on Vercel's server-side and is never sent to the user's browser.
