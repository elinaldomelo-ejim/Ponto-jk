
import { differenceInSeconds, format, isSameDay, parseISO } from 'date-fns';
import { DayRecord, PunchRecord, PunchType } from '../types';

export const DAILY_GOAL_SECONDS = 7 * 3600; // 7 horas

/**
 * Transforma a estrutura de DayRecord em uma lista linear e ordenada de batimentos.
 */
export const getFlattenedPunches = (records: DayRecord[]): PunchRecord[] => {
  return records
    .flatMap(r => r.punches)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

/**
 * Calcula o tempo trabalhado atribuído a uma data específica.
 * A lógica agora busca a "Entrada" daquela data e segue a sequência cronológica
 * mesmo que os próximos batimentos (intervalo, saída) estejam no dia seguinte.
 */
export const calculateWorkedSecondsForDay = (dateStr: string, allRecords: DayRecord[]): number => {
  const allPunches = getFlattenedPunches(allRecords);
  
  // Encontra a ENTRADA oficial deste dia
  const entryIdx = allPunches.findIndex(p => 
    p.type === 'ENTRY' && 
    format(new Date(p.timestamp), 'yyyy-MM-dd') === dateStr
  );

  if (entryIdx === -1) return 0;

  let totalSeconds = 0;
  const entry = allPunches[entryIdx];
  
  // Busca os próximos marcos cronológicos APÓS esta entrada específica
  let breakStart: PunchRecord | undefined;
  let breakEnd: PunchRecord | undefined;
  let exit: PunchRecord | undefined;

  for (let i = entryIdx + 1; i < allPunches.length; i++) {
    const p = allPunches[i];
    
    // Se encontrar outra ENTRY antes de terminar esta, encerra a busca (erro de processo ou novo turno)
    if (p.type === 'ENTRY') break;

    if (!breakStart && p.type === 'BREAK_START') breakStart = p;
    if (!breakEnd && p.type === 'BREAK_END') breakEnd = p;
    if (!exit && p.type === 'EXIT') {
      exit = p;
      break; // Turno concluído
    }
  }

  // Cálculo por segmentos
  if (entry && breakStart) {
    totalSeconds += differenceInSeconds(new Date(breakStart.timestamp), new Date(entry.timestamp));
  } else if (entry && !breakStart && exit) {
    // Caso sem intervalo
    totalSeconds += differenceInSeconds(new Date(exit.timestamp), new Date(entry.timestamp));
    return Math.max(0, totalSeconds);
  }

  if (breakEnd && exit) {
    totalSeconds += differenceInSeconds(new Date(exit.timestamp), new Date(breakEnd.timestamp));
  }

  return Math.max(0, totalSeconds);
};

export const formatSeconds = (seconds: number): string => {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const h = Math.floor(absSeconds / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = absSeconds % 60;
  return `${isNegative ? '-' : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const getPunchByTypeForDay = (punches: PunchRecord[], type: PunchType) => {
    return punches.find(p => p.type === type);
};
