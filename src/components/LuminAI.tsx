import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, Lightbulb } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "@/src/lib/utils.ts";
import { useShop } from "@/src/context/ShopContext.tsx";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function LuminAI() {
  const { products, sales, recordSale, updateStock, addProduct } = useShop();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola! Soy **Lumin AI**, tu asistente inteligente. Puedo ayudarte a analizar tus ventas, sugerir ideas de marketing para TikTok o decirte qué productos reponer. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare real-time context
      const today = new Date().toISOString().split('T')[0];
      const todaySales = sales.filter(s => s.createdAt.startsWith(today));
      
      const context = {
        inventory: products.map(p => ({
          nombre: p.name,
          sku: p.sku,
          stock: p.stock,
          costo: `S/ ${p.cost}`,
          precio: `S/ ${p.price}`,
          categoria: p.category
        })),
        recentStats: {
          ventasHoy: `S/ ${todaySales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}`,
          gananciaHoy: `S/ ${todaySales.reduce((acc, s) => acc + s.profit, 0).toFixed(2)}`,
          ventasTotalesAcumuladas: `S/ ${sales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}`,
          gananciaTotalAcumulada: `S/ ${sales.reduce((acc, s) => acc + s.profit, 0).toFixed(2)}`,
          unidadesTotalesEnStock: products.reduce((acc, p) => acc + p.stock, 0),
          alertasStockBajo: products.filter(p => p.stock <= 5).map(p => p.name)
        },
        historicoReciente: sales.slice(0, 5).map(s => ({
          id: s.id,
          total: `S/ ${s.total}`,
          fecha: s.createdAt,
          items: s.items.map(i => `${i.quantity}x ${i.name}`)
        }))
      };

      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, context }),
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor: ${resp.status}`);
      }

      const data = await resp.json();
      
      // Execute tool calls locally
      if (data.functionCalls) {
        for (const call of data.functionCalls) {
          if (call.name === "update_stock") {
            const product = products.find(p => p.name.toLowerCase() === call.args.productName.toLowerCase());
            if (product) await updateStock(product.id, call.args.quantity);
          } else if (call.name === "record_sale") {
            const saleItems = call.args.items.map((item: any) => {
              const prod = products.find(p => p.name.toLowerCase() === item.productName.toLowerCase());
              if (!prod) return null;
              return {
                productId: prod.id,
                name: prod.name,
                quantity: item.quantity,
                price: prod.price,
                cost: prod.cost
              };
            }).filter(Boolean);
            if (saleItems.length > 0) await recordSale(saleItems, "Venta IA");
          } else if (call.name === "add_product") {
            await addProduct(call.args);
          }
        }
      }

      if (data.text) {
        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${error.message || "No se pudo procesar la solicitud."}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "¿Qué producto me genera más ganancias?",
    "Escribe un copy para TikTok sobre tazas mágicas",
    "¿Qué debo reponer esta semana?",
    "Plan de ofertas para el Día del Padre"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-4xl mx-auto glass-panel overflow-hidden border-brand-violet/20 shadow-2xl shadow-brand-violet/5">
      {/* AI Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-brand-violet/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-violet text-white shadow-lg shadow-brand-violet/30">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold font-display">Lumin AI</h2>
            <p className="text-[10px] text-brand-violet font-bold uppercase tracking-wider">Business Intelligence Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          En línea
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={cn(
              "flex items-start gap-4 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
              msg.role === "assistant" ? "bg-brand-violet/10 border-brand-violet/20 text-brand-violet" : "bg-white/5 border-white/10 text-gray-400"
            )}>
              {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
              msg.role === "assistant" 
                ? "bg-white/5 border border-white/5 text-gray-200" 
                : "bg-brand-violet text-white font-medium"
            )}>
              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 animate-pulse items-center justify-center rounded-lg bg-brand-violet/10 border border-brand-violet/20 text-brand-violet">
              <Bot size={16} />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/5 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin text-brand-violet" />
              <span>Lumin AI está pensando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-6 py-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => {
                setInput(s);
              }}
              className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-brand-violet/10 hover:text-brand-violet transition-colors"
            >
              <Lightbulb size={12} />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/10 p-4 bg-brand-black">
        <div className="relative flex items-center gap-2 max-w-3xl mx-auto">
          <input 
            type="text" 
            placeholder="Pregunta a Lumin AI..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="h-12 flex-1 rounded-2xl bg-white/5 pl-4 pr-12 text-sm border border-white/10 outline-none focus:border-brand-violet/50 focus:bg-white/10 transition-all disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 h-8 w-8 flex items-center justify-center rounded-xl bg-brand-violet text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-brand-violet/20"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 mt-3 flex items-center justify-center gap-1 uppercase tracking-widest font-bold">
          <Sparkles size={10} className="text-brand-violet" />
          Powered by Gemini AI Business Intelligence
        </p>
      </div>
    </div>
  );
}
