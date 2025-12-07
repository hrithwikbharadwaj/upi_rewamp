export interface Transaction {
  date: string;
  description: string;
  amount: number;
}

export interface AnalysisResult {
  totalSpend: number;
  transactionCount: number;
  topMerchant: {
    name: string;
    count: number;
    amount: number;
  };
  mostExpensiveItem: Transaction;
  monthlySpend: { month: string; amount: number }[];
  aura: string;
}

export type AppState = 'IDLE' | 'ANALYZING' | 'READY';

// New Types for JSON Input
export interface CardStat {
  label: string;
  value: string;
  subtext?: string;
}

export interface CardItem {
  title: string;
  value: string;
  description: string;
}

export interface CardData {
  mainText?: string;
  subText?: string;
  stats?: CardStat[];
  items?: CardItem[];
}

export interface StoryCard {
  type: string;
  layout: 'hero' | 'stat-grid' | 'list';
  title: string;
  data: CardData;
  commentary: string;
}

export interface StoryData {
  metadata: {
    userName: string;
    period: string;
    currency: string;
    totalSpent: number;
    totalEarned: number;
    transactionCount: number;
    hideNumbers: boolean;
  };
  cards: StoryCard[];
}
