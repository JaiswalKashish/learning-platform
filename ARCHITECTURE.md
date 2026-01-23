# 🏗️ EduChat Architecture & Technical Design

## **System Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  http://localhost:3001/ai-tutor                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Chat Component                                    │   │
│  │  - Message input                                         │   │
│  │  - Message history                                       │   │
│  │  - Class level selector                                 │   │
│  │  - Real-time streaming display                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ HTTPS POST to /api/educhat
                 │ Payload: { messages, classLevel }
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTE (Edge Runtime)                   │
│  src/app/api/educhat/route.ts                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ POST Handler:                                            │   │
│  │ 1. Parse request { messages, classLevel }               │   │
│  │ 2. Build system prompt (with class level)               │   │
│  │ 3. Convert messages to Ollama format                    │   │
│  │ 4. Call Ollama API (http://localhost:11434)             │   │
│  │ 5. Stream response via Server-Sent Events               │   │
│  │ 6. Error handling + fallback messaging                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ HTTP POST to http://localhost:11434/api/chat
                 │ Payload: { model, system, messages, stream, options }
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  OLLAMA SERVER (Local Machine)                  │
│  ollama serve (listening on port 11434)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Request Handler:                                         │   │
│  │ 1. Receive { model, system, messages, stream, options }  │   │
│  │ 2. Load model into memory (Mistral)                      │   │
│  │ 3. Apply system prompt + temperature settings            │   │
│  │ 4. Generate response token by token                      │   │
│  │ 5. Stream tokens back as SSE format                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────┬─────────────────────────────────────────────────┘
                 │ Streaming Server-Sent Events
                 │ Token by token: { response: "The..." }
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│         LOCAL LANGUAGE MODEL (Mistral ~4GB in RAM)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Mistral Language Model (7B parameters)                   │   │
│  │ - Processes query with system prompt                     │   │
│  │ - Generates response tokens using:                       │   │
│  │   * Temperature (creativity control)                     │   │
│  │   * Top-K sampling (diversity)                           │   │
│  │   * Top-P sampling (nucleus sampling)                    │   │
│  │ - Outputs stream of tokens                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                 │ Tokens streamed back
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Browser renders tokens in real-time as they arrive              │
│  Complete response displayed to user                             │
│  NO Internet calls, NO API keys, COMPLETE PRIVACY                │
└─────────────────────────────────────────────────────────────────┘
```

---

## **Data Flow Sequence**

```
User
  │
  │ "Explain photosynthesis" (Class 8)
  ▼
React Component
  │
  │ POST /api/educhat
  │ { messages: [...], classLevel: "8" }
  ▼
Next.js Route Handler
  │
  │ 1. Parse classLevel = "8"
  │ 2. Build system prompt with class level instruction
  │ 3. Format messages for Ollama
  │ 4. Set temperature = 0.7 (balanced)
  │ 5. Set max_tokens = 2048
  │
  ▼
Fetch to Ollama API
  │
  │ POST http://localhost:11434/api/chat
  │ {
  │   model: "mistral",
  │   system: "You are EduChat... Class 8...",
  │   messages: [{ role: "user", content: "..." }],
  │   stream: true,
  │   options: { temperature: 0.7, num_predict: 2048 }
  │ }
  ▼
Ollama Server
  │
  │ 1. Check if Mistral model loaded in memory
  │ 2. If not, load from disk (~4GB)
  │ 3. Run inference with system prompt
  │ 4. Generate tokens using LLM
  │ 5. Stream each token in JSON format
  │
  ▼
Token Stream (Server-Sent Events)
  │
  │ data: {"response":"The"}
  │ data: {"response":" process"}
  │ data: {"response":" of"}
  │ ... (one per token)
  │
  ▼
Browser Receives Stream
  │
  │ React component parses each token
  │ Appends to message in real-time
  │ User sees response building live
  │
  ▼
User sees complete answer
  │
  │ "The process of photosynthesis is..."
  │ [Full detailed answer displayed]
```

---

## **Component Details**

### **Frontend Component**
```
Location: src/components/ChatInterface.tsx (or similar)
- Input field for questions
- Class level selector (6-12)
- Message history display
- Real-time streaming display
- Send button
```

### **API Route**
```
Location: src/app/api/educhat/route.ts
Lines: ~120
Dependencies: fetch (native)
Responsibilities:
  - Parse incoming POST request
  - Validate messages array
  - Build system prompt
  - Make Ollama API call
  - Handle errors
  - Stream response
```

### **System Prompt**
```
Contains:
- Role definition (expert AI tutor)
- Behavior rules (direct answers, dynamic generation)
- Format instructions (markdown, structure)
- Subject restrictions (science/space only)
- Class level adaptation
- Off-topic response template
```

### **Ollama Integration**
```
Connection: HTTP to http://localhost:11434
Method: POST /api/chat
Format: Streaming JSON
Authentication: None
Error handling: Connection timeout, model not found, etc.
```

---

## **Configuration Flow**

```
.env.local
  │
  ├─ OLLAMA_MODEL = "mistral"
  │    └─ Used to select which model to query
  │
  ├─ OLLAMA_BASE_URL = "http://localhost:11434"
  │    └─ Used to connect to Ollama server
  │
  ├─ OLLAMA_TEMPERATURE = "0.7"
  │    └─ Controls response creativity
  │       0.0 = Deterministic (same every time)
  │       0.7 = Balanced (good for education)
  │       1.0+ = Very creative
  │
  └─ OLLAMA_MAX_TOKENS = "2048"
       └─ Maximum response length in tokens
          (~1500 words max)
```

---

## **Error Handling Flow**

```
API Request
  │
  ├─ Valid request? YES ─────────────────┐
  │  NO ─→ Return 400 Bad Request        │
  │                                      │
  │                                      ▼
  │                      Call Ollama API
  │                            │
  │                            ├─ Success ────────┐
  │                            │                  │
  │                            │  Error           │
  │                            ├─ Connection error
  │                            │  └─→ Return 503
  │                            │      (Service unavailable)
  │                            │      Message: "Ollama not running"
  │                            │
  │                            └─ Model not found
  │                               └─→ Return 503
  │                                   Message: "Model loading issue"
  │
  └─ All other errors ──────→ Return 500 (Internal error)
```

---

## **Performance Characteristics**

### **Response Times**

**First Query of Session:**
- Time: 15-30 seconds
- Reason: Model loads from disk to RAM
- Optimization: More RAM = faster loading

**Subsequent Queries:**
- Time: 2-10 seconds
- Reason: Model already in memory
- Optimization: Faster with better hardware

**Token Generation:**
- Speed: ~20 tokens/second (on average hardware)
- Longer answers: Proportionally longer wait
- Longer response: Higher quality

### **Memory Usage**

**Without Model Loaded:**
- Ollama: ~100 MB
- Browser: ~200 MB
- Total: ~300 MB

**With Mistral Model Loaded:**
- Model: 4 GB
- Ollama overhead: 500 MB
- Browser: 200 MB
- Total: ~4.7 GB

### **Disk Usage**

- Ollama app: 50 MB
- Mistral model: 4 GB
- EduChat project: 500 MB
- Total minimum: ~5 GB

---

## **Security & Privacy**

### **Data Flow - SECURE**
```
User Input
  ↓
Stored locally in browser (only)
  ↓
Sent via HTTP (local network only) to http://localhost:11434
  ↓
Processed by Ollama (on same machine)
  ↓
Response sent back via HTTP (local)
  ↓
Displayed in browser
  ↓
NEVER leaves your computer
```

### **No External Connections**
- ✅ No OpenAI
- ✅ No cloud services
- ✅ No third-party APIs
- ✅ No telemetry
- ✅ No tracking

### **Authentication**
- Not needed - all local
- No API keys
- No passwords
- No accounts

---

## **Scaling & Optimization**

### **Single User (Current)**
- Works perfectly as-is
- 8GB RAM minimum sufficient
- Response time: 2-10s

### **Multiple Users (Same Machine)**
- Additional browser windows/tabs
- Ollama handles multiple connections
- May queue requests or slow down
- Recommend: 16GB+ RAM

### **Deployment Options**

**Option 1: Single User (Current)**
- Ollama server on one machine
- EduChat on same machine
- Access via localhost:3001

**Option 2: Network Sharing**
- Ollama on server machine
- EduChat on same or different machine
- Access via network IP
- Requires: `OLLAMA_BASE_URL=http://server-ip:11434`

**Option 3: Multiple Users**
- Ollama server (possibly dedicated)
- Multiple EduChat instances
- Load balancing optional
- Requires: Configured network setup

---

## **Model Selection Impact**

| Aspect | Mistral | Neural Chat | Llama2 |
|--------|---------|-------------|--------|
| **Load Time** | Fast (4GB) | Fast (4GB) | Fast (4GB) |
| **Response Time** | 2-5s | 3-8s | 5-15s |
| **Answer Quality** | Good | Good | Excellent |
| **Consistency** | ★★★★☆ | ★★★★☆ | ★★★★★ |
| **For Education** | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **Recommended For** | Speed focus | Education | Quality focus |

---

## **Future Enhancements**

**Possible additions:**
1. Multiple model support (dropdown selector)
2. Conversation history saving
3. Student progress tracking
4. Subject-specific model optimization
5. Advanced LLM parameter tuning UI
6. Response rating/feedback system
7. Fallback to cloud API (optional)
8. Offline knowledge base as secondary fallback

---

## **Conclusion**

Your EduChat architecture is:
- ✅ **Simple**: ~120 lines of code
- ✅ **Fast**: 2-10 second responses
- ✅ **Private**: 100% local
- ✅ **Free**: No costs
- ✅ **Offline**: Works without internet
- ✅ **Scalable**: Can handle multiple users
- ✅ **Maintainable**: Clean, focused code

This is a **production-ready** system! 🚀
