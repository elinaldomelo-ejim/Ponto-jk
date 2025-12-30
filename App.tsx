
import React, { useState, useEffect } from 'react';
import { User, DayRecord, PunchType, PunchRecord } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Users from './components/Users';
import { LogIn, Lock, Mail, Clock } from 'lucide-react';
import { format } from 'date-fns';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'users'>('dashboard');
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Load users from LocalStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('pontoflow_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const initialUsers: User[] = [
        { id: 'admin-1', name: 'Administrador', email: 'admin@ponto.flow', role: 'ADMIN', shift: 'Geral', workPeriod: 'Manhã', password: 'admin' },
        { id: 'user-1', name: 'João Silva (Turno 01)', email: 'joao@empresa.com', role: 'EMPLOYEE', shift: 'Turno 01', workPeriod: 'Manhã', password: '123' },
        { id: 'user-2', name: 'Maria Souza (Turno 02)', email: 'maria@empresa.com', role: 'EMPLOYEE', shift: 'Turno 02', workPeriod: 'Tarde', password: '123' },
        { id: 'user-3', name: 'Carlos Santos (Turno 03)', email: 'carlos@empresa.com', role: 'EMPLOYEE', shift: 'Turno 03', workPeriod: 'Noite', password: '123' }
      ];
      setUsers(initialUsers);
      localStorage.setItem('pontoflow_users', JSON.stringify(initialUsers));
    }

    const savedUser = localStorage.getItem('pontoflow_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Load records whenever they change or user changes
  useEffect(() => {
    const savedRecords = localStorage.getItem('pontoflow_records');
    if (savedRecords) {
      const parsed = JSON.parse(savedRecords);
      const restored = parsed.map((r: any) => ({
        ...r,
        punches: r.punches.map((p: any) => ({ ...p, timestamp: new Date(p.timestamp) }))
      }));
      setRecords(restored);
    }
  }, [user]);

  // Save all records whenever they change
  useEffect(() => {
    if (records.length > 0) {
      localStorage.setItem('pontoflow_records', JSON.stringify(records));
    }
  }, [records]);

  // Save users whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('pontoflow_users', JSON.stringify(users));
    }
  }, [users]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.email === email && (u.password === password));
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('pontoflow_user', JSON.stringify(foundUser));
    } else {
      alert('Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pontoflow_user');
    setActiveTab('dashboard');
  };

  const addPunch = (type: PunchType, attachment?: string, manualTimestamp?: Date, observation?: string) => {
    if (!user) return;
    const punchDate = manualTimestamp || new Date();
    const dateStr = format(punchDate, 'yyyy-MM-dd');
    
    const newPunch: PunchRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: punchDate,
      type,
      attachment,
      observation
    };

    setRecords(prev => {
      const existing = prev.find(r => r.date === dateStr && r.userId === user.id);
      if (existing) {
        return prev.map(r => (r.date === dateStr && r.userId === user.id) ? { ...r, punches: [...r.punches, newPunch] } : r);
      } else {
        return [...prev, { userId: user.id, date: dateStr, punches: [newPunch] }];
      }
    });
  };

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'admin-1') return alert('Não é possível remover o administrador principal.');
    if (confirm('Deseja realmente remover este funcionário?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const userRecords = records.filter(r => r.userId === user?.id);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 p-4 rounded-2xl text-white mb-4 shadow-lg">
              <Clock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-blue-600 tracking-tighter">PontoFlow</h1>
            <p className="text-slate-500 font-medium text-center">Controle de Frequência e Banco de Horas</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              Acessar Sistema
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-slate-400 text-xs text-center space-y-1">
            <p className="font-bold text-slate-500 mb-2 uppercase tracking-widest">Acessos Rápidos (Teste)</p>
            <p>Admin: admin@ponto.flow / admin</p>
            <p>Turno 01: joao@empresa.com / 123</p>
            <p>Turno 02: maria@empresa.com / 123</p>
            <p>Turno 03: carlos@empresa.com / 123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard records={userRecords} onAddPunch={addPunch} user={user} />
      )}
      {activeTab === 'reports' && (
        <Reports user={user} records={userRecords} />
      )}
      {activeTab === 'users' && user.role === 'ADMIN' && (
        <Users users={users} onAddUser={handleAddUser} onDeleteUser={handleDeleteUser} />
      )}
    </Layout>
  );
};

export default App;
