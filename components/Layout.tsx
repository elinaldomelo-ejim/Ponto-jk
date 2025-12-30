
import React from 'react';
import { User as UserIcon, LogOut, Clock, FileText, LayoutDashboard, Users as UsersIcon, Settings as SettingsIcon } from 'lucide-react';
import { SystemSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  settings: SystemSettings;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab, settings }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Mobile Header */}
      <header className="md:hidden bg-white text-blue-600 p-4 flex justify-between items-center shadow-sm border-b border-slate-100 no-print">
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
          ) : (
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Clock className="w-5 h-5" />
            </div>
          )}
          <h1 className="font-black text-lg tracking-tighter">{settings.systemName}</h1>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-400">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm no-print sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
          ) : (
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
              <Clock className="w-6 h-6" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-blue-600 leading-none">{settings.systemName}</span>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">v3.5 Cloud</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              activeTab === 'reports' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm">Relatórios</span>
          </button>
          {user.role === 'ADMIN' && (
            <>
              <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Administração</div>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'users' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <UsersIcon className="w-5 h-5" />
                <span className="text-sm">Funcionários</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeTab === 'settings' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <SettingsIcon className="w-5 h-5" />
                <span className="text-sm">Personalização</span>
              </button>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-black shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-slate-800 truncate uppercase tracking-tighter">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Desconectar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
        
        {/* Real Footer */}
        <footer className="p-6 text-center border-t border-slate-100 bg-white no-print">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} {settings.institutionName} &bull; {settings.slogan}
          </p>
        </footer>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-50 no-print pb-safe">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase mt-1">Início</span>
        </button>
        <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center p-2 ${activeTab === 'reports' ? 'text-blue-600' : 'text-slate-400'}`}>
          <FileText className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase mt-1">Ponto</span>
        </button>
        {user.role === 'ADMIN' && (
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center p-2 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}>
            <SettingsIcon className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase mt-1">Ajustes</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default Layout;
