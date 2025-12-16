export interface SalesData {
  dailySales: { day: string; revenue: number }[];
  monthlySales: { month: string; revenue: number }[];
  quarterlySales: { quarter: string; revenue: number }[];
  yearlySales: { year: string; revenue: number }[];
  topProducts: { productId: string; name: string; unitsSold: number }[];
  keyMetrics: {
    totalRevenue: number;
    totalOrders: number;
    newCustomers: number;
  };
}