export interface User {
  id: string;
  email: string;
  balance: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: 'mtn' | 'orange' | 'paypal' | 'bitcoin';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  transactionId?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  dailyReturn: number;
  category: string;
  duration: number;
}

export interface Allocation {
  id: string;
  userId: string;
  serviceId: string;
  service: Service;
  amount: number;
  dailyReturn: number;
  totalEarned: number;
  createdAt: Date;
  lastPayoutAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredUser: User;
  bonus: number;
  createdAt: Date;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'mtn' | 'orange' | 'paypal' | 'bitcoin';
  accountInfo: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}