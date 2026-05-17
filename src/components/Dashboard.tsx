import React, { useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { formatCurrency } from "@/src/lib/utils.ts";
import { useShop } from "@/src/context/ShopContext.tsx";

export default function Dashboard({ setActiveView }: { setActiveView: (v: any) => void }) {
  const { products, sales } = useShop();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(s => s.createdAt.startsWith(today));
    
    const salesTotalToday = todaySales.reduce((acc, s) => acc + s.total, 0);
    const profitTotalMonth = sales.reduce((acc, s) => acc + s.profit, 0);
    const pendingOrders = 0; // Would need a status field in sales
    
    const totalMargin = sales.length > 0 
      ? (sales.reduce((acc, s) => acc + (s.profit / s.total), 0) / sales.length) * 100 
      : 0;

    return {
      salesTotalToday,
      profitTotalMonth,
      pendingOrders,
      totalMargin
    };
  }, [sales]);

  const chartData = useMemo(() => {
    const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const daySales = sales.filter(s => s.createdAt.startsWith(dateStr));
      return {
        name: days[d.getDay()],
        sales: daySales.reduce((acc, s) => acc + s.total, 0),
        profit: daySales.reduce((acc, s) => acc + s.profit, 0)
      };
    });
    return last7Days;
  }, [sales]);

  const topProducts = useMemo(() => {
    const productCounts: Record<string, { name: string, qty: number }> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = { name: item.name, qty: 0 };
        }
        productCounts[item.productId].qty += item.quantity;
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 4)
      .map((p, i) => ({
        name: p.name,
        sales: p.qty,
        color: ["#7c3aed", "#f472b6", "#38bdf8", "#10b981"][i]
      }));
  }, [sales]);

  const lowStock = products.filter(p => p.stock <= 5);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-display">¡Hola, Lumin Shop! 👋</h1>
        <p className="text-gray-400 mt-1">Inventario Real-Time y Análisis IA activos.</p>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Ventas de Hoy" 
          value={formatCurrency(stats.salesTotalToday)} 
          change="+Real-time" 
          isPositive={true} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="Ganancia Total" 
          value={formatCurrency(stats.profitTotalMonth)} 
          change="Acumulado" 
          isPositive={true} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Stock Total" 
          value={products.reduce((acc, p) => acc + p.stock, 0).toString()} 
          change="Unidades" 
          isPositive={true} 
          icon={Package} 
        />
        <StatCard 
          title="Margen Promedio" 
          value={`${stats.totalMargin.toFixed(1)}%`} 
          change="Basado en ventas" 
          isPositive={true} 
          icon={TrendingUp} 
        />
      </div>

      {/* Alerts / Smart Inventory */}
      {lowStock.length > 0 && (
        <div className="glass-panel p-6 border-brand-pink/20 bg-brand-pink/5">
          <div className="flex items-center gap-3 text-brand-pink">
            <AlertTriangle size={20} />
            <h3 className="font-semibold">Inventario Crítico ({lowStock.length})</h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-black/40 p-3 border border-white/5">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-xs font-bold text-brand-pink uppercase">Solo {item.stock}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="glass-panel p-6 lg:col-span-2">
          <h3 className="text-lg font-bold font-display mb-6">Desempeño de Ventas</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `S/${val}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  itemStyle={{ color: "#7c3aed" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#7c3aed" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold font-display mb-6">Más Vendidos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#6b7280" 
                  fontSize={10} 
                  width={100}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                />
                <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  className?: string;
}

function StatCard({ title, value, change, isPositive, icon: Icon, className }: StatCardProps) {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
          <Icon size={20} className="text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-400" : "text-brand-pink"}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 font-display">{value}</h3>
      </div>
    </div>
  );
}
