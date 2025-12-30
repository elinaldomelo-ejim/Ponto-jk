
import { differenceInSeconds, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { DayRecord, PunchRecord, PunchType } from '../types';

export const DAILY_GOAL_SECONDS = 7 * 3600; // Alterado para 7 horas de trabalho efetivo

export const calculateWorkedSecondsForDay = (punches: PunchRecord[]): number => {
  if (punches.length < 2) return 0;

  // Sort punches by timestamp
  const sorted = [...punches].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  let totalSeconds = 0;
  let entry: Date | null = null;
  let breakStart: Date | null = null;
  let breakEnd: Date | null = null;
  let exit: Date | null = null;

  sorted.forEach(p => {
    if (p.type === 'ENTRY') entry = p.timestamp;
    if (p.type === 'BREAK_START') breakStart = p.timestamp;
    if (p.type === 'BREAK_END') breakEnd = p.timestamp;
    if (p.type === 'EXIT') exit = p.timestamp;
  });

  // Shift 1: Entry to Break Start
  if (entry && breakStart) {
    totalSeconds += differenceInSeconds(breakStart, entry);
  } else if (entry && !breakStart && exit) {
      // If no break was logged but an exit was, treat as continuous work
      totalSeconds += differenceInSeconds(exit, entry);
      return totalSeconds;
  }

  // Shift 2: Break End to Exit
  if (breakEnd && exit) {
    totalSeconds += differenceInSeconds(exit, breakEnd);
  } else if (!breakEnd && breakStart && exit) {
      // If they left for break and never returned but logged exit? Unusual.
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

export const getPunchByType = (punches: PunchRecord[], type: PunchType) => {
    return punches.find(p => p.type === type);
};
