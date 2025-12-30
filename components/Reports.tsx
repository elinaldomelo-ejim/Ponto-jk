
import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer, Filter, Download, Clock, ImageIcon, X, MessageSquare, FileText, Calendar, Camera } from 'lucide-react';
import { DayRecord, ReportPeriod, User, PunchRecord, SystemSettings } from '../types';
import { calculateWorkedSecondsForDay, DAILY_GOAL_SECONDS, formatSeconds, getPunchByTypeForDay } from '../utils/calculations';

interface ReportsProps {
  user: User;
  records: DayRecord[];
  settings: SystemSettings;
}

const Reports: React.FC<ReportsProps> = ({ user, records, settings }) => {
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.DAY);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [singleDate, setSingleDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    const today = new Date();
    if (period === ReportPeriod.DAY) {
      setStartDate(singleDate);
      setEndDate(singleDate);
    } else if (period === ReportPeriod.WEEK) {
      const d = parseISO(singleDate || format(today, 'yyyy-MM-dd'));
      setStartDate(format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
      setEndDate(format(endOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    } else if (period === ReportPeriod.MONTH) {
      const d = parseISO(singleDate || format(today, 'yyyy-MM-dd'));
      setStartDate(format(startOfMonth(d), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(d), 'yyyy-MM-dd'));
    }
  }, [period, singleDate]);

  const filteredRecords = useMemo(() => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const interval = eachDayOfInterval({ start, end });

      return interval.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const record = records.find(r => r.date === dateStr && r.userId === user.id);
        const worked = calculateWorkedSecondsForDay(dateStr, records);

        return {
          date,
          punches: record?.punches || [],
          workedSeconds: worked
        };
      });
    } catch (e) {
      return [];
    }
  }, [startDate, endDate, records, user.id]);

  const stats = useMemo(() => {
    let totalWorked = 0;
    filteredRecords.forEach(rec => {
        totalWorked += rec.workedSeconds;
    });
    const activeDays = filteredRecords.filter(r => r.punches.some(p => p.type === 'ENTRY')).length;
    const target = activeDays * DAILY_GOAL_SECONDS;
    return { totalWorked, balance: totalWorked - target };
  }, [filteredRecords]);

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    setTimeout(() => { window.print(); }, 150);
  };

  const renderTimeCell = (punch: PunchRecord | undefined) => {
    if (!punch) return <span className="text-slate-300 font-mono">--:--</span>;
    return <span className="font-bold text-slate-800 font-mono">{format(new Date(punch.timestamp), 'HH:mm')}</span>;
  };

  // Coleta todos os anexos válidos dos registros filtrados
  const attachmentsToPrint = useMemo(() => {
    if (period !== ReportPeriod.DAY) return [];
    return filteredRecords[0]?.punches.filter(p => !!p.attachment) || [];
  }, [filteredRecords, period]);

  const punchTypeLabels: Record<string, string> = {
    'ENTRY': 'Entrada',
    'BREAK_START': 'Saída Intervalo',
    'BREAK_END': 'Volta Intervalo',
    'EXIT': 'Saída Expediente'
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Relatórios de Ponto</h2>
        <div className="flex flex-wrap gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                <Printer className="w-4 h-4" />
                Imprimir Relatório
            </button>
        </div>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Object.values(ReportPeriod).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Data de Referência</label>
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden print:border-0 print:shadow-none">
        <div className="hidden print-only p-8 border-b-4 border-slate-900 mb-6 bg-slate-50">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-blue-600 tracking-tighter uppercase">{settings.systemName}</h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{settings.institutionName}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Relatório de Frequência Individual</p>
                    <p className="text-[10px] text-blue-600 font-black uppercase mt-1">Setor: {user.sector || 'Geral'}</p>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 print:bg-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b">Data</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b text-center">Entrada</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b text-center">Saída Int.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b text-center">Volta Int.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b text-center">Saída Exp.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-black text-slate-700">
                    {format(rec.date, 'dd/MM/yyyy')}
                    <span className="block text-[10px] text-slate-400 font-normal capitalize">
                        {format(rec.date, 'EEEE', { locale: ptBR })}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">{renderTimeCell(getPunchByTypeForDay(rec.punches, 'ENTRY'))}</td>
                  <td className="px-6 py-4 text-sm text-center">{renderTimeCell(getPunchByTypeForDay(rec.punches, 'BREAK_START'))}</td>
                  <td className="px-6 py-4 text-sm text-center">{renderTimeCell(getPunchByTypeForDay(rec.punches, 'BREAK_END'))}</td>
                  <td className="px-6 py-4 text-sm text-center">{renderTimeCell(getPunchByTypeForDay(rec.punches, 'EXIT'))}</td>
                  <td className="px-6 py-4 text-sm font-black text-blue-600 text-right">
                    {formatSeconds(rec.workedSeconds)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 p-10 flex justify-end items-end gap-12 border-t border-slate-100 no-print">
            <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Saldo do Período</span>
                <span className={`text-4xl font-black ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatSeconds(stats.balance)}
                </span>
            </div>
        </div>

        {/* SEÇÃO DE ANEXOS NA IMPRESSÃO (Apenas para Dia Específico) */}
        {period === ReportPeriod.DAY && attachmentsToPrint.length > 0 && (
          <div className="hidden print-only p-10 border-t-2 border-slate-100 mt-6 page-break-before">
             <div className="flex items-center gap-3 mb-8 border-b-2 border-blue-600 pb-2 w-fit">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="font-black uppercase text-xs tracking-[0.3em] text-slate-800">Comprovantes e Anexos do Dia</h3>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
                {attachmentsToPrint.map((p, i) => (
                  <div key={i} className="space-y-3 border border-slate-200 p-4 rounded-3xl bg-white">
                     <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{punchTypeLabels[p.type]}</span>
                        <span className="text-xs font-black text-blue-600">{format(new Date(p.timestamp), 'HH:mm:ss')}</span>
                     </div>
                     <div className="flex justify-center bg-slate-50 p-2 rounded-2xl">
                        <img src={p.attachment} className="max-h-[300px] object-contain rounded-xl" />
                     </div>
                     {p.observation && (
                        <div className="p-3 bg-blue-50 rounded-2xl text-[10px] text-blue-900 font-medium italic leading-relaxed">
                           "{p.observation}"
                        </div>
                     )}
                  </div>
                ))}
             </div>
             
             <div className="mt-20 flex flex-col items-center">
                <div className="w-64 border-t-2 border-slate-800 mt-10"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{user.name}</p>
                <p className="text-[8px] text-slate-300 uppercase tracking-widest mt-1">Assinatura do Colaborador</p>
             </div>
          </div>
        )}
        
        {/* Rodapé da Impressão */}
        <div className="hidden print-only p-10 text-center text-slate-300 font-black uppercase text-[8px] tracking-[0.4em]">
           Gerado via {settings.systemName} em {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
        </div>
      </div>
    </div>
  );
};

export default Reports;
