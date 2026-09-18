export interface AuthUser {
  id: string;
  uniqueId: string;
  name: string | null;
  email: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
  type: string;
  stock: number;
  avgRating?: number;
  reviewCount?: number;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export interface Wallet {
  id: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface SupportMessage {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender?: { id: string; name: string | null; role: string; uniqueId: string };
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  messages: SupportMessage[];
  _count?: { messages: number };
}

export interface CartItem {
  product: Product;
  quantity: number;
}
