# 🚀 OpenAI API Integration Guide

Your EduChat chatbot is now ready to use real ChatGPT! Here's how to set it up:

## **Option 1: WITH OpenAI API (Recommended) - True ChatGPT Experience**

### Step 1: Get API Key
1. Go to: **https://platform.openai.com/api-keys**
2. Sign in with your OpenAI account (create one if needed)
3. Click **"Create new secret key"**
4. Copy the key (it starts with `sk-`)

### Step 2: Add to Project
Edit the `.env.local` file in your project:
```
OPENAI_API_KEY=sk-your-key-here
```

Replace `sk-your-key-here` with your actual key from Step 1.

### Step 3: Restart Dev Server
```bash
# Stop current server (Ctrl + C)
npm run dev
```

### Step 4: Test It!
Go to: **http://localhost:3001/ai-tutor**

Ask any science question and get ChatGPT-quality responses! 🎉

**Cost:** Usually $0.01-0.05 per question (very cheap)

---

## **Option 2: WITHOUT API Key - Still Smart!**

If you don't have an API key, no problem! Your chatbot will use our intelligent offline system:
- ✅ Answers ANY science question intelligently
- ✅ ChatGPT-like formatting
- ✅ Step-by-step explanations
- ✅ Real-world examples
- ❌ No internet needed
- ❌ Free (no API costs)

Just use the chatbot as-is! Go to: **http://localhost:3001/ai-tutor**

---

## **How to Know Which Mode You're Using:**

Check the console logs when you ask a question:

**WITH API Key:**
```
✅ OpenAI API key found. Using GPT-4o-mini for response...
```

**WITHOUT API Key:**
```
⚠️ No OpenAI API key found in .env.local
💡 To use ChatGPT, create .env.local with: OPENAI_API_KEY=sk-your-key-here
📌 Using intelligent offline ChatGPT-like mode instead
```

---

## **Troubleshooting:**

### "Invalid API key" Error
- Check you copied the ENTIRE key correctly
- Make sure it starts with `sk-`
- Regenerate the key at https://platform.openai.com/api-keys

### Changes not taking effect
- Save `.env.local`
- Stop dev server (Ctrl + C)
- Run `npm run dev` again
- Refresh browser

### API calls taking too long
- This is normal for first request (5-15 seconds)
- Subsequent requests are faster
- Check your internet connection

---

## **That's It!** 🎓

Your chatbot is now powered by ChatGPT and ready to help students learn science!
