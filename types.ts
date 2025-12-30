
export type PunchType = 'ENTRY' | 'BREAK_START' | 'BREAK_END' | 'EXIT';

export interface PunchRecord {
  id: string;
  timestamp: Date;
  type: PunchType;
  attachment?: string; // Base64 or URL
  observation?: string; // Manual notes from the employee
}

export interface DayRecord {
  userId: string; // ID of the employee
  date: string; // ISO string (YYYY-MM-DD)
  punches: PunchRecord[];
}

export type WorkPeriod = 'Manhã' | 'Tarde' | 'Noite';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  birthDate?: string;
  role: 'EMPLOYEE' | 'ADMIN';
  shift: string; // The specific shift label
  workPeriod?: WorkPeriod;
}

export interface BalanceSummary {
  totalWorkedSeconds: number;
  totalTargetSeconds: number;
  balanceSeconds: number;
}

export enum ReportPeriod {
  DAY = 'Dia Específico',
  WEEK = 'Semana',
  FORTNIGHT = 'Quinzena',
  MONTH = 'Mês',
  BIMESTER = 'Bimestre',
  TRIMESTER = 'Trimestre',
  SEMESTER = 'Semestre',
  YEAR = 'Ano',
  CUSTOM = 'Personalizado'
}
