
import React, { useState } from 'react';
import { Plus, UserPlus, X, Trash2, Mail, Lock, Calendar, Clock, Briefcase, Building2 } from 'lucide-react';
import { User, WorkPeriod } from '../types';

interface UsersProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
}

const Users: React.FC<UsersProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    email: '',
    password: '',
    workPeriod: 'Manhã' as WorkPeriod,
    sector: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      ...formData,
      role: 'EMPLOYEE',
      shift: formData.workPeriod === 'Manhã' ? 'Turno 01' : formData.workPeriod === 'Tarde' ? 'Turno 02' : 'Turno 03'
    });
    setFormData({ name: '', birthDate: '', email: '', password: '', workPeriod: 'Manhã', sector: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Funcionários</h2>
          <p className="text-slate-500">Cadastre e gerencie o acesso dos colaboradores ao sistema.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </button>
      </header>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Funcionário</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Setor / Período</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Login/Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.birthDate || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{u.sector || 'Geral'}</span>
                      <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.workPeriod === 'Manhã' ? 'bg-green-100 text-green-700' :
                        u.workPeriod === 'Tarde' ? 'bg-orange-100 text-orange-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {u.workPeriod || u.shift}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{u.email}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onDeleteUser(u.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600" />
                Cadastrar Funcionário
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <Briefcase className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: João Silva"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Setor / Departamento</label>
                  <div className="relative">
                    <Building2 className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      placeholder="Ex: Recursos Humanos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Nascimento</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Período de Trabalho</label>
                  <div className="relative">
                    <Clock className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                    <select
                      value={formData.workPeriod}
                      onChange={(e) => setFormData({ ...formData, workPeriod: e.target.value as WorkPeriod })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all appearance-none"
                    >
                      <option value="Manhã">Manhã (Turno 01)</option>
                      <option value="Tarde">Tarde (Turno 02)</option>
                      <option value="Noite">Noite (Turno 03)</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Login (Email)</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@empresa.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Senha de Acesso</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
