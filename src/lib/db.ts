import { supabase } from './supabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface DBErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleDBError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: DBErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const createHealthProfile = async (userId: string, profileData: any) => {
  try {
    const { error } = await supabase.from('profiles').upsert({ id: userId, ...profileData });
    if (error) throw error;
  } catch (error) {
    handleDBError(error, OperationType.WRITE, 'profiles');
  }
};

export const getHealthProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    handleDBError(error, OperationType.GET, 'profiles');
  }
};

export const addMedicine = async (userId: string, medicine: any) => {
  try {
    const { data, error } = await supabase.from('medications').insert([{ user_id: userId, ...medicine }]).select();
    if (error) throw error;
    return data;
  } catch (error) {
    handleDBError(error, OperationType.WRITE, 'medications');
  }
};

export const getMedicines = (userId: string, callback: (meds: any[]) => void) => {
  // Use a standard fetch first, then subscribe (Supabase realtime alternative to onSnapshot)
  supabase.from('medications').select('*').eq('user_id', userId).then(({ data, error }) => {
    if (!error && data) callback(data);
  });

  const subscription = supabase
    .channel('medications_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'medications', filter: `user_id=eq.${userId}` }, async () => {
      const { data } = await supabase.from('medications').select('*').eq('user_id', userId);
      if (data) callback(data);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
