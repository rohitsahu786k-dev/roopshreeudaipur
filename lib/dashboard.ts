import { products } from "@/lib/catalog";

export const recentOrders = [
  {
    orderNumber: "RC-240192",
    customer: "Ananya Sharma",
    total: 8990,
    status: "processing",
    payment: "paid",
    date: "2026-04-27"
  },
  {
    orderNumber: "RC-240193",
    customer: "Meera Iyer",
    total: 3290,
    status: "packed",
    payment: "cod_pending",
    date: "2026-04-28"
  },
  {
    orderNumber: "RC-240194",
    customer: "Nisha Kapoor",
    total: 5780,
    status: "shipped",
    payment: "paid",
    date: "2026-04-29"
  }
];

export const supportTickets = [
  { id: "TK-1182", topic: "Size exchange request", owner: "Manager", priority: "High" },
  { id: "TK-1183", topic: "Payment confirmation", owner: "Support", priority: "Medium" },
  { id: "TK-1184", topic: "Delivery address update", owner: "Manager", priority: "Low" }
];

export function getDashboardMetrics() {
  const inventoryValue = products.reduce((sum, product) => sum + product.price * 8, 0);
  const orderRevenue = recentOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    revenue: orderRevenue,
    orders: recentOrders.length,
    products: products.length,
    inventoryValue,
    lowStock: products.slice(0, 2),
    bestSellers: products.filter((product) => product.featured)
  };
}
