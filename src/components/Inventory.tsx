import React, { useState } from "react";
import { Plus, Search, Filter, Edit2, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { formatCurrency, cn } from "@/src/lib/utils.ts";
import { Product } from "@/src/types.ts";
import { useShop } from "@/src/context/ShopContext.tsx";

export default function Inventory() {
  const { products, updateStock, addProduct } = useShop();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickStock = async (id: string, delta: number) => {
    await updateStock(id, delta);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Inventario</h1>
          <p className="text-gray-400">Gestiona tus productos y niveles de stock.</p>
        </div>
        <button 
          onClick={() => {
            // Simple direct add for demo, usually would open a modal
            const name = prompt("Nombre del producto:");
            const sku = prompt("SKU:");
            const price = Number(prompt("Precio de venta:"));
            const cost = Number(prompt("Costo:"));
            const stock = Number(prompt("Stock inicial:"));
            
            if (name && sku && price && cost) {
              addProduct({
                name,
                sku,
                price,
                cost,
                stock,
                category: 'Magic Mug' // Default for now
              });
            }
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-xl bg-white/5 pl-10 pr-4 text-sm border border-white/10 outline-none focus:border-brand-violet/50"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/10">
          <Filter size={18} />
          <span>Filtros</span>
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Producto</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">SKU</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400">Categoría</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400 text-center">Stock</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400 text-right">Costo</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400 text-right">Precio</th>
              <th className="p-4 text-xs font-semibold uppercase text-gray-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10">
                      <span className="text-[10px] opacity-20"><Package size={16}/></span>
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-400">{p.sku}</td>
                <td className="p-4">
                  <span className="inline-flex rounded-full bg-brand-violet/10 px-2.5 py-0.5 text-xs font-medium text-brand-violet ring-1 ring-inset ring-brand-violet/20">
                    {p.category}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleQuickStock(p.id, -1)}
                      className="p-1 rounded bg-white/5 hover:bg-brand-pink/20 hover:text-brand-pink transition-colors"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <span className={cn("text-sm font-bold min-w-[20px] text-center", p.stock <= 5 ? "text-brand-pink" : "text-white")}>
                      {p.stock}
                    </span>
                    <button 
                      onClick={() => handleQuickStock(p.id, 1)}
                      className="p-1 rounded bg-white/5 hover:bg-green-500/20 hover:text-green-400 transition-colors"
                    >
                      <ChevronUp size={14} />
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right text-sm text-gray-400">{formatCurrency(p.cost)}</td>
                <td className="p-4 text-right font-medium">{formatCurrency(p.price)}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:text-white"><Edit2 size={16} /></button>
                    <button className="p-1 hover:text-brand-pink"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const Package = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16.5 9.4 7.5 4.21"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" y1="22" x2="12" y2="12"/>
  </svg>
);
