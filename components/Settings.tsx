
import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Image as ImageIcon, Globe, Type, School } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onSave: (settings: SystemSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<SystemSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Personalização do Sistema</h2>
        <p className="text-slate-500">Ajuste a identidade visual e informações da instituição.</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Type className="w-4 h-4" />
                Textos e Identidade
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do Sistema</label>
                  <input
                    type="text"
                    value={formData.systemName}
                    onChange={(e) => setFormData({...formData, systemName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instituição de Ensino</label>
                  <div className="relative">
                    <School className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={formData.institutionName}
                      onChange={(e) => setFormData({...formData, institutionName: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Slogan / Descrição</label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => setFormData({...formData, slogan: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Imagens e Ícones
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">URL da Logo (PNG/SVG)</label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                        placeholder="https://exemplo.com/logo.png"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                      {formData.logoUrl ? <img src={formData.logoUrl} className="max-w-full max-h-full object-contain" /> : <ImageIcon className="text-slate-300" />}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">URL do Favicon (.ico)</label>
                  <div className="flex gap-4 items-start">
                    <div className="flex-1 relative">
                      <Globe className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={formData.faviconUrl}
                        onChange={(e) => setFormData({...formData, faviconUrl: e.target.value})}
                        placeholder="https://exemplo.com/favicon.ico"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      />
                    </div>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
                      {formData.faviconUrl ? <img src={formData.faviconUrl} className="w-6 h-6 object-contain" /> : <Globe className="text-slate-300 w-4 h-4" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
