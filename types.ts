
export type PunchType = 'ENTRY' | 'BREAK_START' | 'BREAK_END' | 'EXIT';

export interface PunchRecord {
  id: string;
  timestamp: Date;
  type: PunchType;
  attachment?: string;
  observation?: string;
}

export interface DayRecord {
  userId: string;
  date: string;
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
  shift: string;
  workPeriod?: WorkPeriod;
  sector?: string; // Novo campo de setor
}

export interface SystemSettings {
  systemName: string;
  institutionName: string;
  slogan: string;
  logoUrl: string;
  faviconUrl: string;
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
