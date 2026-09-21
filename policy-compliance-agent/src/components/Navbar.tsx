import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  ListChecks,
  CheckCircle2,
  Database,
  BarChart3,
  FileText,
  History,
  Cpu,
  Sparkles,
} from 'lucide-react';

export type NavigationPage =
  | 'dashboard'
  | 'policies'
  | 'rules'
  | 'checker'
  | 'synthetic'
  | 'evaluation'
  | 'reports'
  | 'logs';

interface NavbarProps {
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  geminiActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, onNavigate, geminiActive }) => {
  const navItems: Array<{ id: NavigationPage; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'checker', label: 'Compliance Checker', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'policies', label: 'Policies', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'rules', label: 'Rules', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'synthetic', label: 'Synthetic Data', icon: <Database className="w-4 h-4" /> },
    { id: 'evaluation', label: 'Evaluation', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'logs', label: 'Audit Logs', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base tracking-tight text-white">Policy Compliance Agent</span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-slate-800 border border-slate-700 text-slate-300 rounded">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic Engine &middot; AI Reasoner</p>
            </div>
          </div>

          {/* Engine Status Indicators */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rule Engine:</span>
              <span className="text-emerald-400 font-medium">Deterministic Active</span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <Sparkles className={`w-3.5 h-3.5 ${geminiActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>AI Agent:</span>
              <span className={geminiActive ? 'text-amber-400 font-medium' : 'text-slate-400'}>
                {geminiActive ? 'Gemini Flash' : 'Deterministic Fallback'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
