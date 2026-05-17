import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: ´AIzaSyAVHdMJXrtN8YzPfqJLgxR0EvJpb8kVgh4´ 
});

// Tools for Lumin AI
const updateStockTool: FunctionDeclaration = {
  name: "update_stock",
  description: "Actualiza el stock de un producto (suma o resta unidades).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      productName: { type: Type.STRING, description: "Nombre del producto exacto" },
      quantity: { type: Type.NUMBER, description: "Cantidad a sumar (positivo) o restar (negativo)" },
    },
    required: ["productName", "quantity"],
  },
};

const recordSaleTool: FunctionDeclaration = {
  name: "record_sale",
  description: "Registra una venta de uno o más productos.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
          },
          required: ["productName", "quantity"],
        },
      },
    },
    required: ["items"],
  },
};

const addProductTool: FunctionDeclaration = {
  name: "add_product",
  description: "Agrega un nuevo producto al inventario.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      sku: { type: Type.STRING },
      price: { type: Type.NUMBER },
      cost: { type: Type.NUMBER },
      stock: { type: Type.NUMBER },
      category: { type: Type.STRING },
    },
    required: ["name", "sku", "price", "cost", "stock"],
  },
};

const tools = [{ functionDeclarations: [updateStockTool, recordSaleTool, addProductTool] }];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Logging middleware to catch all requests
  app.use((req, res, next) => {
    console.log(`[REQ] ${req.method} ${req.url}`);
    next();
  });

  // API route for Lumin AI Business Assistant
  app.post("/api/ai/chat", async (req, res) => {
    console.log(`[POST] /api/ai/chat - Request received`);
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "No message provided" });
      }
      
      const systemPrompt = `Eres "Lumin AI", el cerebro inteligente de Lumin Shop. 
      Tienes acceso TOTAL al inventario, SKU, costos, precios, estadísticas de ventas y margen de ganancia.
      
      CONTEXTO DEL NEGOCIO (TIEMPO REAL): ${JSON.stringify(context || {})}
      
      CAPACIDADES:
      1. Vender productos: Usa record_sale si el usuario informa una venta.
      2. Actualizar stock: Usa update_stock si llegan nuevos productos o hay mermas.
      3. Analizar: Puedes decir exactamente cuánto se ha ganado, qué productos tienen poco stock y sugerir estrategias de precios o marketing basadas en los datos proporcionados.
      4. Agregar productos: Usa add_product para nuevos artículos.
      
      REGLA DE ORO: Responde de forma CORTA, CLARA Y DIRECTA. 
      - No inventes datos. Usa el CONTEXTO proporcionado para responder preguntas sobre el stock o dinero.
      - Si te preguntan "¿Cómo va el negocio?", resume ventas hoy y stock crítico.
      - Ve al grano. Usa Markdown. Idioma: Español.`;

      const modelName = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: systemPrompt,
          tools,
        }
      });

      if (!response) {
        throw new Error("No se recibió respuesta del modelo Gemini.");
      }

      console.log(`[AI Response] Character count: ${response.text?.length || 0}`);

      res.json({ 
        text: response.text,
        functionCalls: response.functionCalls 
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
