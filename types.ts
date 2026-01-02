export enum EventStatus {
  DRAFT = 'Taslak',
  PUBLISHED = 'Yayında',
  SOLD_OUT = 'Tükendi',
  ENDED = 'Tamamlandı',
  CANCELLED = 'İptal'
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quota: number;
  sold: number;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  status: EventStatus;
  ticketTypes: TicketType[];
  revenue: number;
  image?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  ticketsSold: number;
  activeEvents: number;
  avgTicketPrice: number;
}

export interface SalesDataPoint {
  date: string;
  amount: number;
  tickets: number;
}
