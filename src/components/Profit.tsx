import React, { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  PieChart as PieChartIcon, 
  BarChart3,
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { formatCurrency } from "@/src/lib/utils.ts";
import { useShop } from "@/src/context/ShopContext.tsx";

export default function Profit() {
  const { sales, products, expenses } = useShop();

  const metrics = useMemo(() => {
    const totalIncome = sales.reduce((acc, s) => acc + s.total, 0);
    const totalSalesProfit = sales.reduce((acc, s) => acc + s.profit, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    // Net profit = profit from sales - other expenses
    const netProfit = totalSalesProfit - totalExpenses;
    const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return { totalIncome, totalExpenses, netProfit, margin };
  }, [sales, expenses]);

  const monthData = useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const now = new Date();
    // Last 5 months
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
      const m = d.getMonth();
      const monthPrefix = `${d.getFullYear()}-${String(m + 1).padStart(2, '0')}`;
      
      const monthSales = sales.filter(s => s.createdAt.startsWith(monthPrefix));
      const monthExpenses = expenses.filter(e => e.date.startsWith(monthPrefix));

      return {
        month: months[m],
        income: monthSales.reduce((acc, s) => acc + s.total, 0),
        expenses: monthExpenses.reduce((acc, e) => acc + e.amount, 0)
      };
    });
  }, [sales, expenses]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        // Need to find category from products list since item only has productId
        const product = products.find(p => p.id === item.productId);
        const cat = product?.category || "Otros";
        cats[cat] = (cats[cat] || 0) + (item.price * item.quantity);
      });
    });

    const total = Object.values(cats).reduce((a, b) => a + b, 0);
    const colors = ["#7c3aed", "#f472b6", "#38bdf8", "#10b981", "#f59e0b"];
    
    return Object.entries(cats).map(([name, value], i) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      color: colors[i % colors.length]
    }));
  }, [sales, products]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Ganancias y Reportes</h1>
          <p className="text-gray-400">Análisis detallado de la rentabilidad de Lumin Shop.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors">
            <Calendar size={18} />
            <span>Últimos 30 días</span>
          </button>
        </div>
      </div>

      {/* High Level Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-panel p-6 bg-gradient-to-br from-brand-violet/10 to-transparent border-brand-violet/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-violet text-white mb-4">
            <DollarSign size={20} />
          </div>
          <p className="text-sm text-gray-400">Ganancia Real</p>
          <h3 className="text-3xl font-bold mt-1 font-display">{formatCurrency(metrics.netProfit)}</h3>
          <p className="text-xs text-green-400 mt-2 font-semibold flex items-center gap-1">
            <TrendingUp size={12} />
            +18% vs mes anterior
          </p>
        </div>

        <div className="glass-panel p-6 bg-gradient-to-br from-brand-blue/10 to-transparent border-brand-blue/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-sm text-gray-400">Margen de Ganancia</p>
          <h3 className="text-3xl font-bold mt-1 font-display">{metrics.margin.toFixed(1)}%</h3>
          <p className="text-xs text-gray-400 mt-2">Salud financiera: <span className="text-green-400 font-bold uppercase">Excelente</span></p>
        </div>

        <div className="glass-panel p-6 bg-gradient-to-br from-brand-pink/10 to-transparent border-brand-pink/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-pink text-white mb-4">
            <TrendingDown size={20} />
          </div>
          <p className="text-sm text-gray-400">Gasto Operativo</p>
          <h3 className="text-3xl font-bold mt-1 font-display">{formatCurrency(metrics.totalExpenses)}</h3>
          <p className="text-xs text-gray-400 mt-2">Incluye insumos y fletes</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income vs Expenses Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-brand-violet" size={18} />
              <h3 className="font-bold font-display leading-none">Ingresos vs Gastos</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                />
                <Bar dataKey="income" name="Ingresos" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="expenses" name="Gastos" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <PieChartIcon className="text-brand-blue" size={18} />
              <h3 className="font-bold font-display leading-none">Ventas por Categoría</h3>
            </div>
          </div>
          <div className="flex items-center">
            <div className="h-[300px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: "#171717", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 pr-6">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-xs font-bold text-gray-200">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.value}% del total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
