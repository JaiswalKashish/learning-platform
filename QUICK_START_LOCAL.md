# ⚡ QUICK START: Local AI Tutor in 5 Minutes

## **TL;DR - The 4 Steps**

1. **Download Ollama**: https://ollama.ai/download
2. **Run in terminal**: `ollama pull mistral`
3. **Run in another terminal**: `ollama serve`
4. **In project folder run**: `npm run dev`

Then go to: **http://localhost:3001/ai-tutor**

---

## **Step-by-Step (Actually Quick)**

### **1. Install Ollama (2 minutes)**
- Go to: https://ollama.ai/download
- Download for your OS
- Install it

### **2. Download Model (10 minutes)**
Open terminal and run:
```bash
ollama pull mistral
```
Wait for it to finish.

### **3. Start Ollama**
Keep this terminal open:
```bash
ollama serve
```

### **4. Start EduChat**
New terminal:
```bash
cd C:\Users\kashi\Downloads\eduverse-main\eduverse-main
npm run dev
```

### **5. Use It!**
Open: **http://localhost:3001/ai-tutor**

---

## **Test It Works**

Ask: "What is photosynthesis?"

You should get a detailed, dynamic answer! ✨

---

## **Key Points**

✅ NO API keys needed  
✅ Works completely offline  
✅ COMPLETELY FREE  
✅ Run ANY time, from ANY computer  
✅ Answers ANY science question  

---

## **If Something Goes Wrong**

| Problem | Solution |
|---------|----------|
| Connection refused | Run: `ollama serve` |
| Slow response | Normal on first use, wait 10-30s |
| Model didn't download | Run: `ollama pull mistral` again |
| Port in use | Close other apps or restart |

---

## **For Full Details**

See: **COMPLETE_LOCAL_SETUP.md**

---

**That's it!** Your AI tutor is ready! 🎉
