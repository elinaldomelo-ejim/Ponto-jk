
import React, { useState, useEffect } from 'react';
import { User, DayRecord, PunchType, PunchRecord, SystemSettings } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Users from './components/Users';
import Settings from './components/Settings';
import { LogIn, Lock, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { dbService } from './lib/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'users' | 'settings'>('dashboard');
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState<SystemSettings>({
    systemName: 'PontoFlow',
    institutionName: 'Minha Empresa S.A.',
    slogan: 'Gestão Inteligente de Frequência',
    logoUrl: '',
    faviconUrl: ''
  });

  // Inicialização Completa
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      try {
        const cloudSettings = await dbService.getSettings();
        if (cloudSettings) setSettings(cloudSettings);

        const cloudUsers = await dbService.getUsers();
        setUsers(cloudUsers);

        const savedUser = localStorage.getItem('pontoflow_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          const cloudRecords = await dbService.getRecords(parsedUser.id);
          setRecords(cloudRecords);
        }
      } catch (err) {
        console.error("Falha na conexão com Supabase:", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
    localStorage.setItem('pontoflow_settings', JSON.stringify(settings));
    document.title = settings.systemName;
  }, [settings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailInput = (form.elements.namedItem('email') as HTMLInputElement).value;
    const passwordInput = (form.elements.namedItem('password') as HTMLInputElement).value;

    const foundUser = users.find(u => u.email === emailInput && u.password === passwordInput);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('pontoflow_user', JSON.stringify(foundUser));
      setLoading(true);
      const userRecords = await dbService.getRecords(foundUser.id);
      setRecords(userRecords);
      setLoading(false);
    } else {
      alert('Usuário ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setRecords([]);
    localStorage.removeItem('pontoflow_user');
    setActiveTab('dashboard');
  };

  const addPunch = async (type: PunchType, attachment?: string, timestamp?: Date, observation?: string, punchId?: string) => {
    if (!user) return;
    const punchDate = timestamp || new Date();
    const dateStr = format(punchDate, 'yyyy-MM-dd');
    
    setRecords(prev => {
      const existingRecord = prev.find(r => r.date === dateStr && r.userId === user.id);
      let updatedRecord: DayRecord;
      
      const newPunch: PunchRecord = {
        id: punchId || Math.random().toString(36).substr(2, 9),
        timestamp: punchDate,
        type,
        attachment,
        observation
      };

      if (existingRecord) {
        let updatedPunches;
        if (punchId) {
          // Editando um existente (mantém a posição original se quiser, ou apenas substitui)
          updatedPunches = existingRecord.punches.map(p => p.id === punchId ? newPunch : p);
        } else {
          // Novo punch para o mesmo dia (remove duplicatas do mesmo tipo se houver)
          updatedPunches = [...existingRecord.punches.filter(p => p.type !== type), newPunch];
        }
        updatedRecord = { ...existingRecord, punches: updatedPunches };
      } else {
        updatedRecord = { userId: user.id, date: dateStr, punches: [newPunch] };
      }
      
      const newRecords = prev.some(r => r.date === dateStr && r.userId === user.id)
        ? prev.map(r => (r.date === dateStr && r.userId === user.id) ? updatedRecord : r)
        : [...prev, updatedRecord];

      // Salva no Supabase
      dbService.saveRecord(updatedRecord);
      return newRecords;
    });
  };

  const handleAddUser = async (u: Omit<User, 'id'>) => {
    const newUser = { ...u, id: Math.random().toString(36).substr(2, 9) } as User;
    await dbService.saveUser(newUser);
    const updatedUsers = await dbService.getUsers();
    setUsers(updatedUsers);
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Deseja realmente excluir este funcionário?')) {
      await dbService.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleSaveSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    await dbService.saveSettings(newSettings);
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-2xl"></div>
        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">PontoFlow Sincronizando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-slate-100">
          <div className="flex flex-col items-center mb-12 text-center">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 object-contain mb-6" />
            ) : (
              <div className="bg-blue-600 p-6 rounded-[2rem] text-white mb-6 shadow-2xl shadow-blue-100 ring-8 ring-blue-50">
                <Clock className="w-14 h-14" />
              </div>
            )}
            <h1 className="text-5xl font-black text-blue-600 tracking-tighter mb-2">{settings.systemName}</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">
              {settings.institutionName}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative">
                <Mail className="w-6 h-6 absolute left-4 top-4 text-slate-300" />
                <input name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="w-6 h-6 absolute left-4 top-4 text-slate-300" />
                <input name="password" type="password" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-14 py-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700" required />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all uppercase tracking-[0.2em] text-xs active:scale-95">
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} settings={settings}>
      {activeTab === 'dashboard' && <Dashboard records={records} onAddPunch={addPunch} user={user} />}
      {activeTab === 'reports' && <Reports user={user} records={records} settings={settings} />}
      {activeTab === 'users' && user.role === 'ADMIN' && <Users users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />}
      {activeTab === 'settings' && user.role === 'ADMIN' && <Settings settings={settings} onSave={handleSaveSettings} />}
    </Layout>
  );
};

export default App;
