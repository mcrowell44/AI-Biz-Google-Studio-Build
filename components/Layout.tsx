
import React from 'react';
import { View } from '../types';
import { 
  LayoutDashboard, 
  Bot, 
  Search, 
  Calendar, 
  Settings, 
  LogOut,
  Workflow,
  BrainCircuit
} from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  children: React.ReactNode;
}

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col select-none ${className}`}>
    <div className="relative border border-yellow-500/20 bg-slate-950 px-3 py-2 rounded-sm inline-block">
      <div className="flex items-center gap-1.5 leading-none">
        <span className="font-black text-yellow-400 text-lg">Ai</span>
        <div className="relative">
          <BrainCircuit className="text-yellow-100/80 relative z-10" size={20} strokeWidth={2} />
        </div>
        <span className="font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-lg">Biz Pro</span>
      </div>
      <div className="mt-1 font-bold tracking-[0.1em] text-slate-200 uppercase text-[5px] whitespace-nowrap">
        YOUR AI BUSINESS PARTNER | INTELLIGENT BUSINESS SOLUTIONS
      </div>
    </div>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children }) => {
  const navItems = [
    { view: View.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { view: View.AGENT_BUILDER, label: 'Agent Deployment', icon: <Bot size={20} /> },
    { view: View.BUSINESS_SEARCH, label: 'Business Search', icon: <Search size={20} /> },
    { view: View.CALENDAR, label: 'Calendar', icon: <Calendar size={20} /> },
    { view: View.INTEGRATIONS, label: 'Integrations', icon: <Workflow size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <Logo />
          <p className="text-[9px] text-slate-500 font-bold tracking-widest mt-4 uppercase border-t border-slate-800 pt-4">Admin Backoffice</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentView === item.view 
                  ? 'bg-yellow-500/10 text-yellow-500 shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button 
            onClick={() => setCurrentView(View.LANDING)}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
