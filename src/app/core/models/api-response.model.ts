export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'agent' | 'master';
  balance: number;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expiresIn: number;
}

export interface Lottery {
  id: string;
  name: string;
  type: 'government' | 'yeekee' | 'foreign';
  drawDate: string;
  status: 'open' | 'closed' | 'resulted';
  reward: number;
}

export interface BetSlip {
  id: string;
  lotteryId: string;
  numbers: string;
  betType: 'top3' | 'bottom3' | 'top2' | 'bottom2' | 'run';
  amount: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalBets: number;
  totalRevenue: number;
  todayBets: number;
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'payout';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
