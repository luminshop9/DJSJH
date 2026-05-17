import React from "react";
import { Users, Receipt, Calendar, ExternalLink } from "lucide-react";
import { formatCurrency } from "@/src/lib/utils.ts";
import { useShop } from "@/src/context/ShopContext.tsx";

export default function Clients() {
  const { sales } = useShop();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Historial y Clientes</h1>
          <p className="text-gray-400">Registro detallado de transacciones (boletas).</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-brand-violet" size={24} />
            <h2 className="text-xl font-bold font-display">Clientes Recientes</h2>
          </div>
          <div className="space-y-4">
             {/* Dynamic clients could be added here if we had a clients collection */}
             <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-violet/20 flex items-center justify-center text-brand-violet font-bold">M</div>
                  <div>
                    <p className="text-sm font-bold">Venta Mostrador</p>
                    <p className="text-xs text-gray-400">Cliente recurrente</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold">{sales.length} Compras</p>
                </div>
             </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-6">
            <Receipt className="text-brand-pink" size={24} />
            <h2 className="text-xl font-bold font-display">Últimas Boletas</h2>
          </div>
          <div className="overflow-y-auto max-h-[500px] space-y-4 pr-2">
            {sales.map((sale) => (
              <div key={sale.id} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-brand-violet/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-400">{new Date(sale.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs font-mono text-gray-500">#{sale.id.slice(0, 8).toUpperCase()}</span>
                </div>
                
                <div className="space-y-1">
                   {sale.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-300">{item.quantity}x {item.name}</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                     </div>
                   ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Total Boleta</p>
                    <p className="text-lg font-bold text-brand-violet">{formatCurrency(sale.total)}</p>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
                    Ver PDF <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
            
            {sales.length === 0 && (
              <div className="p-10 text-center opacity-40">
                <Receipt size={48} className="mx-auto mb-2" />
                <p>No hay ventas registradas aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
