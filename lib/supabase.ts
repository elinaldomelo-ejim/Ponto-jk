
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { User, DayRecord, SystemSettings } from '../types';

const supabaseUrl = 'https://pufxypqsqlhlyeoonyuw.supabase.co';
const supabaseAnonKey = 'sb_publishable_KUmb8klim_hnG8zZC1TbTQ_XMaChZqU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dbService = {
  // Configurações do Sistema
  async getSettings(): Promise<SystemSettings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'system_config')
      .single();
    if (error) {
      console.warn('Erro ao buscar configurações:', error.message);
      return null;
    }
    return data;
  },

  async saveSettings(settings: SystemSettings) {
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 'system_config', ...settings });
    if (error) console.error('Erro ao salvar configurações:', error.message);
  },

  // Usuários
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Erro ao buscar usuários:', error.message);
      return [];
    }
    return data || [];
  },

  async saveUser(user: User) {
    // Garante que o objeto user contenha todos os campos, incluindo sector
    const { error } = await supabase
      .from('users')
      .upsert(user);
    if (error) console.error('Erro ao salvar usuário:', error.message);
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) console.error('Erro ao deletar usuário:', error.message);
  },

  // Registros de Ponto
  async getRecords(userId: string): Promise<DayRecord[]> {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('userId', userId);
    if (error) {
      console.warn('Erro ao buscar registros:', error.message);
      return [];
    }
    // Conversão crucial: timestamps de string ISO para objetos Date
    return (data || []).map(record => ({
      ...record,
      punches: record.punches.map((p: any) => ({
        ...p,
        timestamp: new Date(p.timestamp)
      }))
    }));
  },

  async saveRecord(record: DayRecord) {
    // Serialização para JSON compatível com Supabase
    const payload = {
      userId: record.userId,
      date: record.date,
      punches: record.punches.map(p => ({
        ...p,
        timestamp: p.timestamp instanceof Date ? p.timestamp.toISOString() : p.timestamp
      }))
    };
    
    const { error } = await supabase
      .from('records')
      .upsert(payload, { onConflict: 'userId,date' });
    if (error) console.error('Erro ao salvar registro de ponto:', error.message);
  }
};
