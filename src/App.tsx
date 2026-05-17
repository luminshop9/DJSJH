import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Settings, 
  Bot, 
  Users,
  LogOut,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils.ts";

// Sub-components
import Dashboard from "./components/Dashboard.tsx";
import Inventory from "./components/Inventory.tsx";
import Sales from "./components/Sales.tsx";
import Profit from "./components/Profit.tsx";
import LuminAI from "./components/LuminAI.tsx";
import Clients from "./components/Clients.tsx";

type View = "dashboard" | "inventory" | "sales" | "profit" | "ai" | "clients" | "settings";

export default function App() {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { id: "inventory", label: "Inventario", icon: Package },
    { id: "sales", label: "Ventas", icon: ShoppingCart },
    { id: "profit", label: "Reportes", icon: TrendingUp },
    { id: "ai", label: "Lumin AI", icon: Bot },
    { id: "clients", label: "Clientes", icon: Users },
    { id: "settings", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-brand-black text-white selection:bg-brand-violet selection:text-white">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobile && !isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-brand-black border-r border-white/5 transition-all lg:relative",
          isSidebarOpen ? "w-64" : "w-20",
          isMobile && isSidebarOpen && "-translate-x-full"
        )}
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 80 }}
      >
        <div className="flex items-center gap-3 p-6">
          <div className="flex aspect-square h-10 items-center justify-center rounded-xl bg-brand-violet text-white shadow-lg shadow-brand-violet/20">
            <Bot size={24} />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tight font-display"
            >
              Lumin <span className="text-brand-violet">Shop</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all hover:bg-white/5",
                activeView === item.id ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/20" : "text-gray-400"
              )}
            >
              <item.icon size={20} className={activeView === item.id ? "" : "text-gray-500"} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:bg-white/5">
            <LogOut size={20} />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/5 px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="rounded-lg p-2 hover:bg-white/5 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Buscar productos, ventas..." 
                className="h-10 w-64 rounded-xl bg-white/5 pl-10 pr-4 text-sm outline-none border border-white/5 focus:border-brand-violet/50 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded-xl p-2 hover:bg-white/5">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-pink" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-violet to-brand-blue" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === "dashboard" && <Dashboard setActiveView={setActiveView} />}
              {activeView === "inventory" && <Inventory />}
              {activeView === "sales" && <Sales />}
              {activeView === "profit" && <Profit />}
              {activeView === "ai" && <LuminAI />}
              {activeView === "clients" && <Clients />}
              {activeView === "settings" && (
                <div className="flex flex-col items-center justify-center p-20 text-center">
                  <Settings size={64} className="text-white/10 mb-4" />
                  <h2 className="text-2xl font-bold">Configuración</h2>
                  <p className="text-gray-400">Personaliza tu experiencia en Lumin Shop.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
