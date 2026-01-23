# 🚀 Fully Local AI Tutor Setup (NO API Keys Required!)

This guide will help you set up **EduChat** to work completely offline using Ollama (a local LLM server).

## **What You Need:**
- ✅ Windows/Mac/Linux computer
- ✅ 8GB+ RAM (recommended for better performance)
- ✅ ~5-10GB disk space (for the model)
- ✅ NO internet connection needed (after setup)
- ✅ NO paid services or API keys!

---

## **PART 1: Install Ollama**

### **Windows:**
1. Download Ollama: **https://ollama.ai/download/windows**
2. Run the installer and follow the prompts
3. Click "Install"
4. Restart your computer (if prompted)

### **Mac:**
1. Download Ollama: **https://ollama.ai/download/mac**
2. Open the DMG file
3. Drag Ollama to Applications
4. Launch Ollama from Applications

### **Linux:**
```bash
curl https://ollama.ai/install.sh | sh
```

---

## **PART 2: Download a Science-Optimized Model**

Open a **new terminal/command prompt** and run:

### **Option A: Mistral (Fastest & Best Quality) - RECOMMENDED**
```bash
ollama pull mistral
```

### **Option B: Neural Chat (Good for Education)**
```bash
ollama pull neural-chat
```

### **Option C: Llama 2 (More Capable)**
```bash
ollama pull llama2
```

**Choose Option A (Mistral) for best balance of speed and quality!**

This will download ~4GB model file. Takes 5-15 minutes depending on internet speed.

---

## **PART 3: Start Ollama Server**

After downloading, Ollama runs automatically in the background.

**To verify it's running:**
```bash
# Test in a new terminal
curl http://localhost:11434/api/tags
```

You should see JSON with the model name. If you see an error, start Ollama manually:

### **Windows:**
- Look for Ollama icon in system tray
- Click to ensure it's running
- Or run: `ollama serve`

### **Mac/Linux:**
```bash
ollama serve
```

**Keep this terminal open while using EduChat!**

---

## **PART 4: Update EduChat Configuration**

Edit `.env.local` in your EduChat project:

```
# Use local Ollama model instead of OpenAI
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
```

---

## **PART 5: Start EduChat**

```bash
npm run dev
```

Go to: **http://localhost:3001/ai-tutor**

---

## **HOW IT WORKS:**

1. **You ask a question** ➜ "What is photosynthesis?"
2. **EduChat sends to Ollama** ➜ Local LLM running on your computer
3. **Ollama generates answer** ➜ No internet, no API calls, fully offline!
4. **You get response** ➜ Fast, private, local!

---

## **TROUBLESHOOTING:**

### **"Connection refused" error**
- Make sure Ollama is running
- Check terminal shows `ollama serve` or Ollama appears in system tray
- Port 11434 must be available

### **Slow responses**
- Normal for first run of a model
- Your computer is running the AI locally
- More RAM = faster responses
- SSD = much faster than HDD

### **Model didn't download**
```bash
# Try again:
ollama pull mistral

# Check available models:
ollama list
```

### **Want to try a different model**
```bash
ollama pull llama2
ollama pull neural-chat
```

Then update `.env.local` with the new model name.

---

## **IMPORTANT: Keep Ollama Running!**

EduChat only works while Ollama server is running. So:
1. Start Ollama (`ollama serve` or click icon)
2. Start EduChat (`npm run dev`)
3. Keep both terminals/apps open
4. When done, you can close both

---

## **Performance Tips:**

| Setting | Fast Response | Better Quality |
|---------|--------------|----------------|
| Model | Mistral | Llama2 |
| RAM | 8GB+ | 16GB+ |
| Storage | SSD | SSD (much faster) |
| Temperature | 0.5 | 0.7 |

---

## **That's It!** 🎓

Your EduChat is now **completely local and private**:
- ✅ NO API keys needed
- ✅ NO internet required
- ✅ NO data sent anywhere
- ✅ Fully offline
- ✅ Completely free!

**Start asking science questions!** 🚀
