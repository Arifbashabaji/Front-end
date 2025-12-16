export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: { productId: string; quantity: number; price: number }[];
}
