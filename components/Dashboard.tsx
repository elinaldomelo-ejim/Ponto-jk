
import React, { useState, useRef } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Image as ImageIcon, Plus, Clock, Eye, X, Printer, MessageSquare, Timer, FileText } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PunchType, DayRecord, PunchRecord } from '../types';
import { calculateWorkedSecondsForDay, DAILY_GOAL_SECONDS, formatSeconds, getPunchByType } from '../utils/calculations';

interface DashboardProps {
  records: DayRecord[];
  onAddPunch: (type: PunchType, attachment?: string, manualTimestamp?: Date, observation?: string) => void;
  user?: any; // Passado do App para o recibo
}

const Dashboard: React.FC<DashboardProps & { user: any }> = ({ records, onAddPunch, user }) => {
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [viewingPunch, setViewingPunch] = useState<PunchRecord | null>(null);
  const [manualTime, setManualTime] = useState(format(new Date(), 'HH:mm'));
  const [observation, setObservation] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayRecord = records.find(r => r.date === todayStr);
  const todayPunches = todayRecord?.punches || [];

  const workedSeconds = calculateWorkedSecondsForDay(todayPunches);

  const totalBalance = records.reduce((acc, rec) => {
    const ws = calculateWorkedSecondsForDay(rec.punches);
    const target = rec.punches.length >= 2 ? DAILY_GOAL_SECONDS : 0;
    return acc + (ws - target);
  }, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitPunch = (type: PunchType) => {
    const today = new Date();
    const manualDate = parse(manualTime, 'HH:mm', today);
    onAddPunch(type, attachment, manualDate, observation);
    
    // Reset inputs
    setAttachment(undefined);
    setObservation('');
    setManualTime(format(new Date(), 'HH:mm'));
  };

  const getStatus = (type: PunchType) => {
    const p = getPunchByType(todayPunches, type);
    return p ? { done: true, punch: p } : { done: false };
  };

  const punchButtons = [
    { type: 'ENTRY' as PunchType, label: 'Entrada', color: 'bg-green-600', hover: 'hover:bg-green-700' },
    { type: 'BREAK_START' as PunchType, label: 'Saída Intervalo', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
    { type: 'BREAK_END' as PunchType, label: 'Volta Intervalo', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
    { type: 'EXIT' as PunchType, label: 'Saída Expediente', color: 'bg-red-600', hover: 'hover:bg-red-700' },
  ];

  const printReceipt = (punch: PunchRecord) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const typeLabels: Record<string, string> = {
        ENTRY: 'Entrada',
        BREAK_START: 'Saída para Intervalo',
        BREAK_END: 'Volta do Intervalo',
        EXIT: 'Saída do Expediente'
      };

      printWindow.document.write(`
        <html>
          <head>
            <title>Comprovante de Ponto - PontoFlow</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1e293b; }
              .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
              .logo { color: #2563eb; font-weight: 900; font-size: 24px; }
              .receipt-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; }
              .info-grid { display: grid; grid-template-columns: 150px 1fr; gap: 10px; margin-bottom: 30px; }
              .label { font-weight: bold; color: #64748b; }
              .attachment-box { margin-top: 40px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; text-align: center; }
              .attachment-img { max-width: 100%; max-height: 500px; object-fit: contain; }
              .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; pt: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">PontoFlow</div>
              <div>Recibo de Registro</div>
            </div>
            <div class="receipt-title">Comprovante de Frequência</div>
            <div class="info-grid">
              <div class="label">Funcionário:</div><div>${user.name}</div>
              <div class="label">E-mail:</div><div>${user.email}</div>
              <div class="label">Tipo de Registro:</div><div>${typeLabels[punch.type]}</div>
              <div class="label">Data:</div><div>${format(punch.timestamp, 'dd/MM/yyyy')}</div>
              <div class="label">Horário:</div><div>${format(punch.timestamp, 'HH:mm:ss')}</div>
              <div class="label">Observação:</div><div>${punch.observation || 'Nenhuma'}</div>
            </div>
            ${punch.attachment ? `
              <div class="attachment-box">
                <p class="label" style="margin-bottom:15px">Anexo Comprobatório:</p>
                <img src="${punch.attachment}" class="attachment-img" />
              </div>
            ` : ''}
            <div class="footer">
              Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')} - Instituição de Ensino PontoFlow S.A.
            </div>
            <script>window.onload = () => { window.print(); window.close(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Olá, bem-vindo de volta!</h2>
          <p className="text-slate-500">{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Horas Hoje</p>
            <h3 className="text-3xl font-bold text-slate-800">{formatSeconds(workedSeconds)}</h3>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between`}>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Saldo do Banco</p>
            <h3 className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatSeconds(totalBalance)}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${totalBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            {totalBalance >= 0 ? (
              <Plus className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white md:col-span-2 lg:col-span-1">
          <p className="text-blue-100 text-sm mb-1">Meta Diária</p>
          <h3 className="text-3xl font-bold mb-4">07:00:00</h3>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (workedSeconds / DAILY_GOAL_SECONDS) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Punch Action Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h4 className="font-bold text-slate-800">Registrar Ponto</h4>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <MapPin className="w-4 h-4" />
            Localização Ativa
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group min-h-[200px]"
            >
              {attachment ? (
                <div className="relative w-full h-40 flex items-center justify-center">
                  <img src={attachment} alt="Anexo" className="h-full object-contain rounded-xl shadow-md" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setAttachment(undefined); }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-slate-100 p-4 rounded-full group-hover:bg-blue-100 transition-colors mb-3">
                    <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 text-center">Tirar foto ou anexar comprovante</p>
                  <p className="text-xs text-slate-400 mt-1 text-center">Anexe antes de registrar o ponto</p>
                </>
              )}
            </div>

            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5" />
                    Horário do Registro
                  </label>
                  <input 
                    type="time" 
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-lg text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Observação
                  </label>
                  <textarea 
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    placeholder="Algo a relatar?"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all min-h-[100px] resize-none"
                  />
               </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {punchButtons.map((btn) => {
              const status = getStatus(btn.type);
              return (
                <div key={btn.type} className="relative group">
                  <button
                    disabled={status.done}
                    onClick={() => submitPunch(btn.type)}
                    className={`w-full relative p-8 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md border-b-4 ${
                      status.done
                        ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
                        : `${btn.color} border-black/10 text-white ${btn.hover} hover:-translate-y-1`
                    }`}
                  >
                    {status.done ? (
                      <>
                        <div className="bg-slate-200 p-2 rounded-full mb-1">
                          <CheckCircle2 className="w-6 h-6 text-slate-400" />
                        </div>
                        <span className="font-bold text-lg text-slate-500">{btn.label} Realizado</span>
                        <span className="text-sm font-medium opacity-70">{format(status.punch.timestamp, 'HH:mm')}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-8 h-8" />
                        <span className="font-bold text-lg">{btn.label}</span>
                      </>
                    )}
                  </button>
                  {status.done && (
                    <button
                      onClick={() => setViewingPunch(status.punch)}
                      className="absolute top-4 right-4 p-2 bg-slate-200/80 hover:bg-slate-300 rounded-full text-slate-600 transition-colors flex items-center gap-1 shadow-sm"
                      title="Ver Comprovante"
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-[10px] font-bold">RECIBO</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Punch Viewer / Receipt Modal */}
      {viewingPunch && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl p-2 max-w-2xl w-full overflow-hidden animate-in zoom-in duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-700">Comprovante de Registro</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printReceipt(viewingPunch)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 font-bold text-xs"
                >
                  <Printer className="w-4 h-4" />
                  IMPRIMIR
                </button>
                <button
                  onClick={() => setViewingPunch(null)}
                  className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Tipo</p>
                  <p className="font-bold text-slate-700">
                    {punchButtons.find(b => b.type === viewingPunch.type)?.label}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Horário</p>
                  <p className="font-bold text-slate-700">{format(viewingPunch.timestamp, 'HH:mm:ss')}</p>
                </div>
                <div className="col-span-2 bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Observação</p>
                  <p className="text-sm text-slate-600 italic">"{viewingPunch.observation || 'Sem observações'}"</p>
                </div>
              </div>

              {viewingPunch.attachment ? (
                <div className="max-h-[50vh] overflow-auto flex items-center justify-center bg-slate-100 p-4 rounded-2xl border border-slate-200">
                  <img src={viewingPunch.attachment} alt="Anexo do Ponto" className="max-w-full h-auto rounded-xl shadow-lg" />
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 flex flex-col items-center">
                  <ImageIcon className="w-12 h-12 opacity-20 mb-2" />
                  <p className="text-sm">Nenhum anexo para este registro</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
