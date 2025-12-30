
import React, { useState, useRef, useMemo } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Image as ImageIcon, Plus, Clock, Eye, X, MessageSquare, Timer, FileText, Calendar, Edit3, ShieldAlert, Save, RotateCcw, ChevronRight, Search, Camera } from 'lucide-react';
import { format, parse, set } from 'date-fns';
import { PunchType, DayRecord, PunchRecord } from '../types';
import { calculateWorkedSecondsForDay, DAILY_GOAL_SECONDS, formatSeconds, getPunchByTypeForDay } from '../utils/calculations';

interface DashboardProps {
  records: DayRecord[];
  onAddPunch: (type: PunchType, attachment?: string, manualTimestamp?: Date, observation?: string, punchId?: string) => void;
  user: any;
}

const Dashboard: React.FC<DashboardProps> = ({ records, onAddPunch, user }) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [viewingPunch, setViewingPunch] = useState<PunchRecord | null>(null);
  const [manualTime, setManualTime] = useState(format(new Date(), 'HH:mm'));
  const [observation, setObservation] = useState('');
  
  // Novo sistema de Gerenciamento de Registros
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [managementDate, setManagementDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingMode, setEditingMode] = useState<{ active: boolean; punchId: string | null; type: PunchType | null }>({
    active: false,
    punchId: null,
    type: null
  });
  
  const [confirmModal, setConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mgmtFileInputRef = useRef<HTMLInputElement>(null);
  
  const activeRecord = useMemo(() => 
    records.find(r => r.date === selectedDate && r.userId === user.id)
  , [records, selectedDate, user.id]);

  const mgmtRecord = useMemo(() => 
    records.find(r => r.date === managementDate && r.userId === user.id)
  , [records, managementDate, user.id]);

  const activePunches = activeRecord?.punches || [];
  const workedSeconds = calculateWorkedSecondsForDay(selectedDate, records);

  const totalBalance = useMemo(() => records.reduce((acc, rec) => {
    const ws = calculateWorkedSecondsForDay(rec.date, records);
    const target = rec.punches.some(p => p.type === 'ENTRY') ? DAILY_GOAL_SECONDS : 0;
    return acc + (ws - target);
  }, 0), [records]);

  // Função para abrir edição de um ponto específico na tela de gerenciamento
  const startEditingPunch = (punch: PunchRecord) => {
    setEditingMode({ active: true, punchId: punch.id, type: punch.type });
    setManualTime(format(new Date(punch.timestamp), 'HH:mm'));
    setObservation(punch.observation || '');
    setAttachment(punch.attachment);
  };

  const cancelEdit = () => {
    setEditingMode({ active: false, punchId: null, type: null });
    setAttachment(undefined);
    setObservation('');
    setManualTime(format(new Date(), 'HH:mm'));
  };

  const openConfirmation = () => {
    setConfirmModal(true);
  };

  const executeSubmit = () => {
    const [hours, minutes] = manualTime.split(':').map(Number);
    const baseDate = parse(isManagementOpen ? managementDate : selectedDate, 'yyyy-MM-dd', new Date());
    const finalDate = set(baseDate, { hours, minutes, seconds: 0 });
    
    onAddPunch(
      editingMode.type!, 
      attachment, 
      finalDate, 
      observation, 
      editingMode.punchId || undefined
    );
    
    setConfirmModal(false);
    cancelEdit();
    if (isManagementOpen) {
       // Mantém a tela de gestão aberta para conferência
    }
  };

  const handlePunchClick = (type: PunchType) => {
     const existing = getPunchByTypeForDay(activePunches, type);
     if (existing) {
        startEditingPunch(existing);
        setConfirmModal(true); // Abre direto se clicou no dashboard
     } else {
        setEditingMode({ active: false, punchId: null, type });
        setConfirmModal(true);
     }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getStatus = (type: PunchType, punchesList: PunchRecord[]) => {
    const p = punchesList.find(p => p.type === type);
    return p ? { done: true, punch: p } : { done: false };
  };

  const punchButtons = [
    { type: 'ENTRY' as PunchType, label: 'Entrada', color: 'bg-green-600', hover: 'hover:bg-green-700' },
    { type: 'BREAK_START' as PunchType, label: 'Saída Intervalo', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    { type: 'BREAK_END' as PunchType, label: 'Volta Intervalo', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { type: 'EXIT' as PunchType, label: 'Saída Expediente', color: 'bg-red-600', hover: 'hover:bg-red-700' },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-0 pt-safe">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Painel de Ponto</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">{user.sector || 'Colaborador'}</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setIsManagementOpen(true)}
              className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              Editar Registro
            </button>
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-black text-slate-700 focus:outline-none text-[11px]"
              />
            </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trabalhado no Dia</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{formatSeconds(workedSeconds)}</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saldo Acumulado</p>
            <h3 className={`text-4xl font-black tracking-tighter ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatSeconds(totalBalance)}
            </h3>
          </div>
          <div className={`p-4 rounded-2xl ${totalBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            {totalBalance >= 0 ? <Plus className="w-8 h-8 text-green-600" /> : <AlertCircle className="w-8 h-8 text-red-600" />}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] shadow-xl text-white md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <div>
               <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Status Meta</p>
               <h3 className="text-4xl font-black tracking-tighter">07:00:00</h3>
            </div>
            <Timer className="w-10 h-10 text-white/30" />
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden p-1">
            <div
              className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${Math.min(100, (workedSeconds / DAILY_GOAL_SECONDS) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Registro Buttons Section */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-50 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h4 className="font-black uppercase text-xs tracking-widest text-slate-700">
               Bater Ponto: {format(parse(selectedDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5" />
            Localização ON
          </div>
        </div>

        <div className="p-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {punchButtons.map((btn) => {
              const status = getStatus(btn.type, activePunches);
              return (
                <div key={btn.type} className="relative">
                  <button
                    onClick={() => handlePunchClick(btn.type)}
                    className={`w-full relative p-10 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all shadow-xl border-b-[6px] active:scale-95 ${
                      status.done
                        ? 'bg-white border-blue-100 text-blue-600 ring-2 ring-blue-50'
                        : `${btn.color} border-black/10 text-white ${btn.hover}`
                    }`}
                  >
                    {status.done ? (
                      <>
                        <CheckCircle2 className="w-10 h-10 text-blue-600 mb-1" />
                        <span className="font-black text-xl uppercase tracking-tighter">{btn.label}</span>
                        <div className="bg-blue-50 px-4 py-1.5 rounded-full font-black text-sm">
                           {format(new Date(status.punch.timestamp), 'HH:mm')}
                        </div>
                      </>
                    ) : (
                      <>
                        <Plus className="w-10 h-10" />
                        <span className="font-black text-2xl uppercase tracking-tighter">{btn.label}</span>
                      </>
                    )}
                  </button>
                  {status.done && (
                    <button
                      onClick={() => setViewingPunch(status.punch)}
                      className="absolute top-5 right-5 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-500 shadow-sm transition-all"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TELA DE GERENCIAMENTO / EDIÇÃO DE REGISTROS (MODAL FULL SCREEN) */}
      {isManagementOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[400] overflow-y-auto pt-safe pb-20">
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom duration-500">
            {/* Header Gestão */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4 text-white">
                  <div className="bg-blue-600 p-4 rounded-[1.5rem] shadow-xl shadow-blue-900/40">
                    <Edit3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">Gerenciar Registros</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Ajuste de batimentos retroativos</p>
                  </div>
               </div>
               <button 
                onClick={() => { setIsManagementOpen(false); cancelEdit(); }}
                className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-[1.5rem] transition-all"
               >
                 <X className="w-7 h-7" />
               </button>
            </div>

            {/* Seleção de Data na Gestão */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Escolha a Data para Editar</label>
                  <div className="relative">
                    <Search className="w-7 h-7 absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="date"
                      value={managementDate}
                      onChange={(e) => { setManagementDate(e.target.value); cancelEdit(); }}
                      className="w-full bg-white/10 border border-white/10 rounded-[2rem] px-16 py-6 font-black text-2xl text-white focus:ring-4 focus:ring-blue-500/30 outline-none transition-all"
                    />
                  </div>
               </div>

               {/* Listagem de Batimentos da Data Selecionada */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {punchButtons.map(btn => {
                    const status = getStatus(btn.type, mgmtRecord?.punches || []);
                    const isEditing = editingMode.active && editingMode.type === btn.type;
                    
                    return (
                      <button
                        key={btn.type}
                        disabled={!status.done}
                        onClick={() => status.done && startEditingPunch(status.punch)}
                        className={`group relative p-6 rounded-[2rem] border-2 text-left transition-all ${
                          isEditing 
                            ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-500/20 shadow-2xl' 
                            : status.done 
                            ? 'bg-white/10 border-white/10 hover:bg-white/15' 
                            : 'bg-white/5 border-white/5 opacity-40 grayscale pointer-events-none'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isEditing ? 'text-blue-100' : 'text-slate-400'}`}>{btn.label}</span>
                           {status.done && !isEditing && <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />}
                        </div>
                        <div className="flex items-center gap-3">
                           <Clock className={`w-6 h-6 ${isEditing ? 'text-white' : 'text-blue-500'}`} />
                           <span className={`text-3xl font-black tracking-tighter ${isEditing ? 'text-white' : 'text-slate-200'}`}>
                             {status.done ? format(new Date(status.punch.timestamp), 'HH:mm') : '--:--'}
                           </span>
                        </div>
                        {isEditing && (
                          <div className="absolute -top-3 -right-3 bg-white text-blue-600 p-2 rounded-xl shadow-xl animate-bounce">
                             <RotateCcw className="w-5 h-5" />
                          </div>
                        )}
                      </button>
                    )
                  })}
               </div>
            </div>

            {/* Form de Edição (Só aparece se algo for selecionado) */}
            {editingMode.active && (
              <div className="bg-white rounded-[3.5rem] p-10 space-y-8 animate-in zoom-in duration-300">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                      <RotateCcw className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tighter">Editando Registro</h3>
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Alterando {punchButtons.find(b => b.type === editingMode.type)?.label}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Novo Horário</label>
                        <input 
                          type="time"
                          value={manualTime}
                          onChange={(e) => setManualTime(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-5 text-4xl font-black text-slate-700 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observação da Correção</label>
                        <textarea 
                          value={observation}
                          onChange={(e) => setObservation(e.target.value)}
                          placeholder="Por que está corrigindo este horário?"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-8 py-5 text-sm font-bold min-h-[140px] focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                   </div>

                   <div className="space-y-6">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Documento / Foto Comprobatória</label>
                      <div 
                        onClick={() => mgmtFileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-[3rem] p-8 min-h-[250px] flex flex-col items-center justify-center cursor-pointer transition-all ${attachment ? 'bg-blue-50 border-blue-400' : 'bg-slate-50 border-slate-200 hover:border-blue-400'}`}
                      >
                         {attachment ? (
                            <div className="relative group">
                               <img src={attachment} className="max-h-52 rounded-2xl shadow-xl" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-all">
                                  <Camera className="w-8 h-8 text-white" />
                               </div>
                            </div>
                         ) : (
                            <>
                               <ImageIcon className="w-12 h-12 text-slate-300 mb-4" />
                               <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Clique para subir <br/>novo anexo</p>
                            </>
                         )}
                         <input type="file" ref={mgmtFileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                      </div>
                   </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                   <button 
                    onClick={openConfirmation}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-blue-100 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                   >
                     <Save className="w-5 h-5" /> Salvar Alteração
                   </button>
                   <button 
                    onClick={cancelEdit}
                    className="sm:px-12 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-6 rounded-[2rem] transition-all uppercase tracking-widest text-xs"
                   >
                     Descartar
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmação Estilizada Premium */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-[600] flex items-center justify-center p-6">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 glass-modal border border-white/40">
              <div className="p-12 text-center space-y-8">
                 <div className={`w-28 h-28 rounded-[2.8rem] flex items-center justify-center mx-auto shadow-2xl ${editingMode.active ? 'bg-orange-100 text-orange-600 shadow-orange-100' : 'bg-blue-100 text-blue-600 shadow-blue-100'}`}>
                    {editingMode.active ? <ShieldAlert className="w-14 h-14" /> : <CheckCircle2 className="w-14 h-14" />}
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">
                       {editingMode.active ? 'Deseja Salvar a Edição?' : 'Confirmar Batimento?'}
                    </h3>
                    <p className="text-slate-500 font-bold leading-relaxed px-2">
                       {editingMode.active 
                          ? `Você está alterando o horário para as ${manualTime}. Esta ação será registrada no histórico.` 
                          : `Confirmar registro de ${punchButtons.find(b => b.type === editingMode.type)?.label} para as ${manualTime}?`}
                    </p>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    <button 
                      onClick={executeSubmit}
                      className={`w-full text-white font-black py-7 rounded-[2.2rem] shadow-2xl transition-all uppercase tracking-widest text-xs active:scale-95 ${editingMode.active ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
                    >
                       {editingMode.active ? 'Sim, Salvar Alteração' : 'Confirmar Agora'}
                    </button>
                    <button 
                      onClick={() => setConfirmModal(false)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-6 rounded-[2.2rem] transition-all uppercase tracking-widest text-[10px]"
                    >
                       Voltar e Revisar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Comprovante Viewer */}
      {viewingPunch && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-4 max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-6 bg-slate-50 border-b flex items-center justify-between rounded-t-[2.5rem]">
              <div className="flex items-center gap-3 text-slate-700 font-black uppercase text-xs tracking-widest">
                 <FileText className="w-5 h-5 text-blue-600" />
                 Visualizar Batimento
              </div>
              <button onClick={() => setViewingPunch(null)} className="p-3 bg-slate-200 text-slate-600 rounded-2xl hover:bg-slate-300 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tipo</p>
                  <p className="font-black text-slate-700 text-2xl uppercase tracking-tighter">{punchButtons.find(b => b.type === viewingPunch.type)?.label}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Horário</p>
                  <p className="font-black text-slate-700 text-2xl tracking-tighter">{format(new Date(viewingPunch.timestamp), 'HH:mm:ss')}</p>
                </div>
              </div>
              {viewingPunch.observation && (
                 <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Nota</p>
                    <p className="font-bold text-blue-900 text-lg leading-relaxed italic">"{viewingPunch.observation}"</p>
                 </div>
              )}
              {viewingPunch.attachment && (
                <div className="max-h-[40vh] overflow-auto flex items-center justify-center bg-slate-100 p-6 rounded-[2rem] border-2 border-slate-200 border-dashed">
                  <img src={viewingPunch.attachment} className="max-w-full h-auto rounded-2xl shadow-2xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden hidden inputs for dashboard actions */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
    </div>
  );
};

export default Dashboard;
