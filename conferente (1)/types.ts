
export type TareMode = 'auto' | 'manual' | 'none';

export type AppView = 'weighing' | 'history' | 'ticket';

export interface WeightData {
  current: number;
  tare: number;
  net: number;
  isStable: boolean;
}

export interface IdentificationData {
  supplier: string;
  product: string;
  targetWeight: string;
}

export interface WeighingRecord {
  id: string;
  supplier: string;
  product: string;
  targetWeight: number; // Peso da Nota
  grossWeight: number;  // Peso Bruto
  tare: number;         // Tara usada (Total)
  boxQuantity?: number; // Quantidade de caixas
  netWeight: number;    // Peso Liquido
  timestamp: number;
  hasPhoto: boolean;
  photoData?: string;   // Base64 encoded image string
}