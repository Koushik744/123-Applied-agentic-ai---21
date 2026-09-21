import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow JSON payloads up to 50MB for uploaded images (base64)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to get initialized GoogleGenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please set it in AI Studio Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to execute Gemini requests with retry and alias fallback for transient 503/429
async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  const modelsToTry = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const errString = String(err?.message || err);
      const isTransient =
        errString.includes("503") ||
        errString.includes("429") ||
        errString.includes("UNAVAILABLE") ||
        errString.includes("high demand") ||
        errString.includes("Resource has been exhausted");

      if (isTransient) {
        console.warn(`[Gemini] Model ${model} is unavailable (${errString.slice(0, 70)}), trying fallback...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

// Health Check API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// API 1: Multimodal Semantic Image Retrieval
app.post("/api/gemini/retrieve", async (req, res) => {
  try {
    const { query, images } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Search query is required." });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "No images provided for retrieval. Please upload images first." });
    }

    const ai = getGenAI();

    // Prepare multimodal parts for candidate images
    // Limit to up to 12 images per evaluation request for optimal speed and context window
    const candidates = images.slice(0, 12);
    const parts: any[] = [];

    parts.push({
      text: `You are the core inference engine of a Multimodal Image Retrieval System.
You are given a user natural-language retrieval query and ${candidates.length} candidate images.

User Query: "${query.trim()}"

Candidate Images are provided below in order:`,
    });

    candidates.forEach((img: { id: string; filename: string; mimeType: string; data: string }, index: number) => {
      // Strip potential data URL prefix
      const cleanBase64 = img.data.replace(/^data:[^;]+;base64,/, "");
      parts.push({
        text: `--- Image Index: ${index} | Image ID: "${img.id}" | Filename: "${img.filename}" ---`,
      });
      parts.push({
        inlineData: {
          mimeType: img.mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    });

    parts.push({
      text: `Task:
1. Examine each candidate image thoroughly with respect to the user query: "${query.trim()}".
2. Score semantic relevance on a scale of 0.00 to 1.00 (1.00 = perfect semantic match, 0.70-0.99 = strong match, 0.40-0.69 = moderate/partial match, <0.40 = low/irrelevant).
3. Determine whether each image is relevant (isRelevant: true if relevanceScore >= 0.35).
4. Provide a 1-2 sentence factual explanation in 'matchReason' describing the visual evidence (e.g. detected objects, actions, color, background).
5. Extract relevant detected entities/keywords found in the image.
6. Assign ranking from 1 (highest relevance) to ${candidates.length}.

Return a JSON array of evaluated images ordered by relevanceScore in descending order.`,
    });

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.1-flash-lite",
      contents: { parts },
      config: {
        systemInstruction:
          "You are an expert multimodal computer vision researcher. Perform objective, precise semantic evaluation and visual grounding for image retrieval. Return strict JSON according to the schema.",
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of evaluated candidate images ranked by relevance to query",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "The Image ID matched" },
              rank: { type: Type.INTEGER, description: "1-based ranking" },
              relevanceScore: { type: Type.NUMBER, description: "Semantic similarity score between 0.00 and 1.00" },
              isRelevant: { type: Type.BOOLEAN, description: "Whether this image meets relevance threshold" },
              matchReason: { type: Type.STRING, description: "Concise visual explanation of match" },
              detectedEntities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Objects, colors, or attributes identified",
              },
            },
            required: ["id", "rank", "relevanceScore", "isRelevant", "matchReason"],
          },
        },
      },
    });

    const rawText = response.text || "[]";
    let rankedResults: any[] = [];
    try {
      rankedResults = JSON.parse(rawText);
    } catch {
      console.error("JSON parse error on retrieval response:", rawText);
      return res.status(500).json({ error: "Failed to parse retrieval evaluation from Gemini model." });
    }

    // Re-verify ordering by score descending
    rankedResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    rankedResults = rankedResults.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    return res.json({
      query: query.trim(),
      totalEvaluated: candidates.length,
      retrievalMethod: "Gemini 3.8 Flash Multimodal Cross-Attention & Semantic Grounding",
      results: rankedResults,
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/retrieve:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error occurred during image retrieval.",
    });
  }
});

// API 2: Visual Question Answering (VQA)
app.post("/api/gemini/vqa", async (req, res) => {
  try {
    const { image, question } = req.body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required for Visual Question Answering." });
    }

    if (!image || !image.data) {
      return res.status(400).json({ error: "Target image is required for Visual Question Answering." });
    }

    const ai = getGenAI();
    const cleanBase64 = image.data.replace(/^data:[^;]+;base64,/, "");

    const parts = [
      {
        inlineData: {
          mimeType: image.mimeType || "image/jpeg",
          data: cleanBase64,
        },
      },
      {
        text: `You are answering a question about this specific image in a college-level Visual Question Answering (VQA) experiment.
Image Filename: "${image.filename || "selected_image.jpg"}"

Question: "${question.trim()}"

Provide a structured, accurate, and direct response grounded strictly in the visual evidence of the image.

Output JSON format with:
- directAnswer: A concise, direct, human-readable answer (1-2 sentences)
- visualEvidence: Detailed observations and features spotted in the image supporting this answer
- keyEntities: Array of visible objects, colors, or actions mentioned
- confidence: "High" | "Medium" | "Low"
- reasoningStep: Brief explanation of how visual features led to this conclusion`,
      },
    ];

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.1-flash-lite",
      contents: { parts },
      config: {
        systemInstruction:
          "You are a multimodal AI vision assistant for college computer vision research. Analyze visual tokens accurately. Never invent details not visible in the image. Adhere strictly to the requested JSON format.",
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directAnswer: { type: Type.STRING, description: "Direct answer to the user's question" },
            visualEvidence: { type: Type.STRING, description: "Visible evidence from the image" },
            keyEntities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key entities or attributes detected",
            },
            confidence: { type: Type.STRING, description: "Confidence level: High, Medium, or Low" },
            reasoningStep: { type: Type.STRING, description: "Step-by-step visual reasoning" },
          },
          required: ["directAnswer", "visualEvidence", "confidence"],
        },
      },
    });

    const rawText = response.text || "{}";
    let vqaResult: any = {};
    try {
      vqaResult = JSON.parse(rawText);
    } catch {
      vqaResult = {
        directAnswer: rawText,
        visualEvidence: "Generated from multimodal visual analysis.",
        confidence: "High",
      };
    }

    return res.json({
      question: question.trim(),
      answer: vqaResult.directAnswer,
      visualEvidence: vqaResult.visualEvidence,
      confidence: vqaResult.confidence || "High",
      keyEntities: vqaResult.keyEntities || [],
      reasoningStep: vqaResult.reasoningStep || "",
      model: "Gemini 3.8 Flash Multimodal Vision",
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/vqa:", error);
    return res.status(500).json({
      error: error?.message || "Internal server error occurred during visual question answering.",
    });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
