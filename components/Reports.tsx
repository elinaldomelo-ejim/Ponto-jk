
import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Printer, Filter, Download, Clock, ImageIcon, X, MessageSquare, FileText, Calendar } from 'lucide-react';
import { DayRecord, ReportPeriod, User, PunchRecord } from '../types';
import { calculateWorkedSecondsForDay, DAILY_GOAL_SECONDS, formatSeconds, getPunchByType } from '../utils/calculations';

interface ReportsProps {
  user: User;
  records: DayRecord[];
}

const Reports: React.FC<ReportsProps> = ({ user, records }) => {
  const [period, setPeriod] = useState<ReportPeriod>(ReportPeriod.DAY);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [singleDate, setSingleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewingPunch, setViewingPunch] = useState<PunchRecord | null>(null);

  // Fixed error: Move isSingleDayReport declaration before hooks that use it
  const isSingleDayReport = period === ReportPeriod.DAY;

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
        return {
          date,
          punches: record?.punches || []
        };
      });
    } catch (e) {
      return [];
    }
  }, [startDate, endDate, records, user.id]);

  const attachmentsByDate = useMemo(() => {
    const map = new Map<string, { punch: PunchRecord, date: Date }[]>();
    filteredRecords.forEach(rec => {
      const dateKey = format(rec.date, 'yyyy-MM-dd');
      rec.punches.forEach(p => {
        if (p.attachment) {
          const list = map.get(dateKey) || [];
          list.push({ punch: p, date: rec.date });
          map.set(dateKey, list);
        }
      });
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredRecords]);

  const stats = useMemo(() => {
    let totalWorked = 0;
    filteredRecords.forEach(rec => {
        if (rec.punches.length > 0) {
            totalWorked += calculateWorkedSecondsForDay(rec.punches);
        }
    });
    const target = filteredRecords.some(r => r.punches.length > 0) ? DAILY_GOAL_SECONDS : 0;
    return { totalWorked, balance: totalWorked - (isSingleDayReport ? target : (filteredRecords.filter(r => r.punches.length > 0).length * DAILY_GOAL_SECONDS)) };
  }, [filteredRecords, isSingleDayReport]);

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    // Pequeno atraso para garantir que qualquer clique ou hover de UI seja processado
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const typeLabels: Record<string, string> = {
    ENTRY: 'Entrada',
    BREAK_START: 'S. Intervalo',
    BREAK_END: 'V. Intervalo',
    EXIT: 'Saída'
  };

  const renderTimeCell = (punch: PunchRecord | undefined) => {
    if (!punch) return <span className="text-slate-300 font-mono">--:--</span>;
    return <span className="font-bold text-slate-800 font-mono">{format(punch.timestamp, 'HH:mm')}</span>;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Relatórios de Ponto</h2>
        <div className="flex flex-wrap gap-2">
            <button 
              onClick={handlePrint} 
              type="button"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 cursor-pointer z-50"
            >
                <Printer className="w-4 h-4" />
                Imprimir Relatório
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl font-black uppercase tracking-widest text-xs border border-slate-200 hover:bg-slate-50 transition-all">
                <Download className="w-4 h-4" />
                Exportar CSV
            </button>
        </div>
      </header>

      {/* Filters (Hides on print) */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 no-print">
        <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
          <Filter className="w-5 h-5" />
          Filtros de Período
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold text-slate-700"
            >
              {Object.values(ReportPeriod).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          <div className="md:col-span-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {isSingleDayReport ? 'Selecionar o Dia' : 'Data de Referência'}
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-bold text-slate-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container for Table & Attachments */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:border-0 print:shadow-none">
        
        {/* Printable Header */}
        <div className="hidden print-only p-6 border-b-2 border-slate-800 mb-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">PontoFlow</h1>
                        <p className="text-slate-500 font-black uppercase tracking-widest text-[8px]">Relatório de Frequência</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{user.name}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">{user.email}</p>
                    <div className="mt-1 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                        Data: {format(parseISO(startDate), 'dd/MM/yyyy')}
                    </div>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 print:bg-slate-100">
                <th className="px-6 py-4 print:py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Data</th>
                <th className="px-6 py-4 print:py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">Dia</th>
                <th className="px-6 py-4 print:py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Entrada</th>
                <th className="px-6 py-4 print:py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Intervalo</th>
                <th className="px-6 py-4 print:py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Retorno</th>
                <th className="px-6 py-4 print:py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-center">Saída</th>
                <th className="px-6 py-4 print:py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((rec, idx) => {
                const worked = calculateWorkedSecondsForDay(rec.punches);
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 print:py-2 text-sm text-slate-700 font-black">{format(rec.date, 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 print:py-2 text-sm text-slate-500 capitalize">{format(rec.date, 'EEEE', { locale: ptBR })}</td>
                    <td className="px-6 py-4 print:py-2 text-sm text-center">{renderTimeCell(getPunchByType(rec.punches, 'ENTRY'))}</td>
                    <td className="px-6 py-4 print:py-2 text-sm text-center">{renderTimeCell(getPunchByType(rec.punches, 'BREAK_START'))}</td>
                    <td className="px-6 py-4 print:py-2 text-sm text-center">{renderTimeCell(getPunchByType(rec.punches, 'BREAK_END'))}</td>
                    <td className="px-6 py-4 print:py-2 text-sm text-center">{renderTimeCell(getPunchByType(rec.punches, 'EXIT'))}</td>
                    <td className="px-6 py-4 print:py-2 text-sm font-black text-blue-600 text-right">
                      {formatSeconds(worked)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Anexos (Somente Impressão) */}
        {attachmentsByDate.length > 0 && (
          <div className={`hidden print-only p-6 border-t border-slate-200 mt-2 ${!isSingleDayReport ? 'break-before-page' : 'break-inside-avoid'}`}>
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-1">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Registro Fotográfico (Comprovantes)</h3>
            </div>
            <div className="space-y-4">
              {attachmentsByDate.map(([dateKey, items], idx) => (
                <div key={idx} className="space-y-4 break-inside-avoid">
                  {!isSingleDayReport && (
                    <div className="bg-slate-50 p-1.5 rounded-lg border-l-4 border-blue-600 inline-block mb-1">
                      <span className="font-black text-slate-800 text-[9px] uppercase">Data: {format(new Date(dateKey + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {items.slice(0, 4).map((item, pIdx) => (
                      <div key={pIdx} className="border border-slate-200 p-2 rounded-2xl flex flex-col items-center bg-white shadow-sm break-inside-avoid">
                        <div className="w-full flex justify-between items-center mb-1.5 px-1">
                          <span className="text-[7px] font-black text-blue-600 uppercase bg-blue-50 px-1.5 py-0.5 rounded-md">
                            {typeLabels[item.punch.type]}
                          </span>
                          <span className="text-[9px] font-black text-slate-800 font-mono">
                            {format(item.punch.timestamp, 'HH:mm:ss')}
                          </span>
                        </div>
                        <div className="w-full h-[180px] overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center border border-slate-50">
                          <img 
                            src={item.punch.attachment} 
                            className="max-w-full max-h-full object-contain p-1" 
                            alt="Anexo"
                          />
                        </div>
                        {item.punch.observation && (
                          <div className="w-full mt-1.5 p-1.5 bg-slate-50 rounded-lg text-[7px] text-slate-500 italic border-l-2 border-slate-200">
                            "{item.punch.observation}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer (Somente Impressão) */}
        <div className="hidden print-only p-6 border-t border-slate-100 mt-4 break-inside-avoid">
            <div className="flex justify-between items-end text-[7px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <div>
                    <p className="text-slate-900 text-[8px] mb-1">PontoFlow Enterprise Cloud</p>
                    <p>Relatório emitido em: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-[180px] border-t border-slate-300"></div>
                    <p>Assinatura Digital / Reconhecimento</p>
                </div>
                <div className="text-right">
                    <p>PontoFlow Authenticated System</p>
                </div>
            </div>
        </div>

        {/* Resumo (Apenas Web) */}
        <div className="bg-slate-50 p-8 flex flex-col md:flex-row justify-end items-end gap-12 border-t border-slate-100 no-print">
            <div className="text-right">
                <span className="block text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Saldo Acumulado</span>
                <span className={`text-4xl font-black ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatSeconds(stats.balance)}
                </span>
            </div>
        </div>
      </div>

      {/* Modal Visualizador (Apenas Web) */}
      {viewingPunch && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 no-print">
          <div className="relative bg-white rounded-[2rem] p-2 max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-black text-slate-800 tracking-tight text-lg">Detalhes do Registro</span>
              </div>
              <button
                onClick={() => setViewingPunch(null)}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tipo</p>
                     <p className="font-black text-blue-600 text-lg uppercase">{typeLabels[viewingPunch.type]}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Horário</p>
                     <p className="font-black text-slate-800 text-lg font-mono">{format(viewingPunch.timestamp, 'HH:mm:ss')}</p>
                  </div>
               </div>
               {viewingPunch.attachment ? (
                 <div className="bg-slate-50 rounded-3xl p-3 border border-slate-100 overflow-hidden shadow-xl">
                    <img src={viewingPunch.attachment} alt="Anexo" className="w-full h-auto max-h-[400px] object-contain rounded-2xl mx-auto" />
                 </div>
               ) : (
                 <div className="py-12 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-sm font-bold uppercase tracking-widest">Nenhuma foto disponível</p>
                 </div>
               )}
            </div>
            <div className="p-6 bg-slate-50 flex justify-center border-t border-slate-100">
              <button 
                onClick={() => setViewingPunch(null)}
                className="w-full max-w-xs py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
