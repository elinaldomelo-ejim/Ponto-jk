
import React from 'react';
import { User as UserIcon, LogOut, Clock, FileText, LayoutDashboard, Users as UsersIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: 'dashboard' | 'reports' | 'users';
  setActiveTab: (tab: 'dashboard' | 'reports' | 'users') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <header className="md:hidden bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg no-print">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6" />
          <h1 className="font-bold text-xl">PontoFlow</h1>
        </div>
        <button onClick={onLogout} className="p-2 bg-blue-700 rounded-full">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm no-print">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Clock className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-600">PontoFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'reports' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            Relatórios
          </button>
          {user.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'users' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <UsersIcon className="w-5 h-5" />
              Usuários
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 no-print">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px]">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'reports' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-[10px]">Relatórios</span>
        </button>
        {user.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'users' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <UsersIcon className="w-6 h-6" />
            <span className="text-[10px]">Usuários</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default Layout;
