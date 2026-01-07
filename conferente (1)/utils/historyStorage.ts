import { WeighingRecord } from '../types';

const HISTORY_KEY = 'conferente_history';

export const saveRecord = (record: WeighingRecord) => {
  try {
    const existing = getHistory();
    // Add new record to the beginning of the array
    const updated = [record, ...existing]; 
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving history", e);
  }
};

export const getHistory = (): WeighingRecord[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};