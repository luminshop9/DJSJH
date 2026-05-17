import React, { useState } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, Package } from "lucide-react";
import { formatCurrency, cn } from "@/src/lib/utils.ts";
import { Product, SaleItem } from "@/src/types.ts";
import { useShop } from "@/src/context/ShopContext.tsx";

export default function Sales() {
  const { products, recordSale } = useShop();
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        price: product.price,
        cost: product.cost
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.productId !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalProfit = cart.reduce((acc, item) => acc + ((item.price - item.cost) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    
    setIsProcessing(true);
    try {
      await recordSale(cart);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCart([]);
        setIsProcessing(false);
      }, 2000);
    } catch (error) {
      console.error("Sale Error:", error);
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid h-[calc(100vh-160px)] gap-6 lg:grid-cols-3">
      {/* Product Selection */}
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar producto a vender..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-xl bg-white/5 pl-10 pr-4 text-sm border border-white/10 outline-none focus:border-brand-violet/50"
            />
          </div>
          <div className="flex gap-2 invisible sm:visible">
            {["Tazas", "Polos", "Todo"].map(cat => (
              <button key={cat} className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10 border border-white/5">
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 content-start gap-4 overflow-y-auto pr-2 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <button 
              key={p.id}
              onClick={() => addToCart(p)}
              className="group flex flex-col items-start gap-3 rounded-2xl bg-white/5 p-4 border border-white/10 transition-all hover:bg-brand-violet/10 hover:border-brand-violet/30 text-left"
            >
              <div className="aspect-square w-full rounded-xl bg-black/40 flex items-center justify-center p-4">
                 <Package className="text-white/20 group-hover:text-brand-violet/40 transition-colors" size={40} />
              </div>
              <div>
                <p className="text-sm font-semibold line-clamp-1">{p.name}</p>
                <p className="mt-1 text-xs text-gray-400">{p.category}</p>
                <div className="mt-2 flex items-center justify-between w-full">
                  <span className="font-bold text-brand-violet">{formatCurrency(p.price)}</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", p.stock < 5 ? "bg-brand-pink/20 text-brand-pink" : "bg-green-500/20 text-green-400")}>
                    Stock: {p.stock}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="flex flex-col rounded-3xl bg-white/[0.03] border border-white/10 p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <ShoppingCart className="text-brand-violet" size={20} />
          <h2 className="text-lg font-bold font-display">Carrito Actual</h2>
          <span className="ml-auto rounded-full bg-brand-violet/20 px-2 py-0.5 text-xs text-brand-violet font-bold">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
              <Package size={48} className="mb-2" />
              <p className="text-sm">El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 relative group">
                <div className="h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center">
                  <Package size={16} className="text-white/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-brand-violet font-bold">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.productId, -1)} className="p-1 rounded-md hover:bg-white/10"><Minus size={14} /></button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, 1)} className="p-1 rounded-md hover:bg-white/10"><Plus size={14} /></button>
                </div>
                <button 
                  onClick={() => removeItem(item.productId)}
                  className="absolute -right-1 -top-1 bg-brand-pink text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-400/80">
            <span>Ganancia Estimada</span>
            <span>{formatCurrency(totalProfit)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold font-display mt-2 border-t border-white/5 pt-3">
            <span>Total</span>
            <span className="text-brand-violet">{formatCurrency(subtotal)}</span>
          </div>
          
          <button 
            disabled={cart.length === 0 || isSuccess}
            onClick={handleCheckout}
            className={cn(
              "btn-primary w-full mt-4 flex items-center justify-center gap-2 h-12 text-base shadow-lg shadow-brand-violet/20 disabled:opacity-50 disabled:grayscale transition-all",
              isSuccess && "bg-green-500 shadow-green-500/20"
            )}
          >
            {isSuccess ? (
              <>
                <CheckCircle size={20} />
                <span>¡Venta Exitosa!</span>
              </>
            ) : (
              <span>Cobrar Venta</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
