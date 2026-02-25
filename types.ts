export enum View {
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  WEALTH_ANALYTICS = 'WEALTH_ANALYTICS',
  CALENDAR = 'CALENDAR',
  CREATE_POST = 'CREATE_POST',
  MEDIA_LIBRARY = 'MEDIA_LIBRARY',
  INBOX = 'INBOX',
  SETTINGS = 'SETTINGS'
}

export interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

export interface ViewProps {
  onNavigate: (view: View) => void;
}

export interface Post {
  id: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'linkedin' | 'x';
  content: string;
  image?: string;
  date: Date;
  status: 'scheduled' | 'published' | 'draft';
  stats?: {
    likes: number;
    views: number;
  };
}

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  platform: 'instagram' | 'facebook' | 'x';
  user: string;
  avatar: string;
  lastMessage: string;
  unread: boolean;
  status: 'new' | 'pending' | 'resolved';
  messages: Message[];
}

export enum Platform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  FACEBOOK = 'facebook',
  YOUTUBE = 'youtube',
  LINKEDIN = 'linkedin',
  X = 'x'
}

export enum TransactionType {
  POST = 'post',
  SCHEDULE = 'schedule',
  UPDATE = 'update',
  DELETE = 'delete',
  REPLY = 'reply'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  platform: Platform;
  title: string;
  description?: string;
  scheduledTime?: Date;
  relatedTransactions?: string[];
  createdAt: Date;
  data?: any;
}

// Wealth Analytics Types
export interface WalletData {
  address: string;
  balance: number;
  tokens: TokenHolding[];
  firstSeen: Date;
  lastActive: Date;
  transactionCount: number;
  category: 'whale' | 'dolphin' | 'fish' | 'shrimp';
}

export interface TokenHolding {
  symbol: string;
  amount: number;
  value: number;
  percentOfPortfolio: number;
}

export interface WealthSnapshot {
  timestamp: Date;
  totalValue: number;
  walletCount: number;
  averageValue: number;
  medianValue: number;
  topHolders: WalletData[];
}

export interface WealthTrend {
  period: string;
  totalValue: number;
  change: number;
  changePercent: number;
  newWallets: number;
  activeWallets: number;
}

export interface WealthSegment {
  category: string;
  count: number;
  totalValue: number;
  averageValue: number;
  percentage: number;
}

export interface WealthMigration {
  from: string;
  to: string;
  value: number;
  walletCount: number;
  timestamp: Date;
}
