

import { Injectable, signal, inject, effect } from '@angular/core';
import { Product, Order, OrderStatus, InventoryItem, SalesData } from '../models/index';
import { CartService } from './cart.service';

export interface PlaceOrderResult {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private cartService = inject(CartService);

  private readonly PRODUCTS_KEY = 'retail_hub_products';
  private readonly ORDERS_KEY = 'retail_hub_orders';

  private initialProducts: Product[] = [
    { "id": "p1", "name": "Smartwatch Pro", "category": "Electronics", "price": 24999, "stock": 150, "imageUrl": "https://picsum.photos/seed/p1/200", "lowStockThreshold": 30 },
    { "id": "p2", "name": "Organic Coffee Beans", "category": "Groceries", "price": 1799, "stock": 300, "imageUrl": "https://picsum.photos/seed/p2/200", "lowStockThreshold": 100 },
    { "id": "p3", "name": "Designer Denim Jacket", "category": "Apparel", "price": 11999, "stock": 80, "imageUrl": "https://picsum.photos/seed/p3/200", "lowStockThreshold": 20 },
    { "id": "p4", "name": "Yoga Mat", "category": "Sports", "price": 3599, "stock": 40, "imageUrl": "https://picsum.photos/seed/p4/200", "lowStockThreshold": 50 },
    { "id": "p5", "name": "Wireless Earbuds", "category": "Electronics", "price": 15999, "stock": 120, "imageUrl": "https://picsum.photos/seed/p5/200", "lowStockThreshold": 25 }
  ];
  
  private initialOrders: Order[] = [
    { "id": "o1", "customerName": "Alice Johnson", "date": "2023-10-26", "status": "Delivered", "total": 28598, "items": [{ "productId": "p1", "quantity": 1, "price": 24999 }, { "productId": "p4", "quantity": 1, "price": 3599 }] },
    { "id": "o2", "customerName": "Bob Williams", "date": "2023-10-25", "status": "Shipped", "total": 11999, "items": [{ "productId": "p3", "quantity": 1, "price": 11999 }] },
    { "id": "o3", "customerName": "Charlie Brown", "date": "2023-10-25", "status": "Processing", "total": 3598, "items": [{ "productId": "p2", "quantity": 2, "price": 1799 }] },
    { "id": "o4", "customerName": "Diana Prince", "date": "2023-10-24", "status": "Pending", "total": 15999, "items": [{ "productId": "p5", "quantity": 1, "price": 15999 }] },
    { "id": "o5", "customerName": "Eve Adams", "date": "2023-10-22", "status": "Cancelled", "total": 1799, "items": [{ "productId": "p2", "quantity": 1, "price": 1799 }] }
  ];

  private salesDataSignal = signal<SalesData | null>({
    "dailySales": Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return { 
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
        revenue: Math.floor(Math.random() * (150000 - 50000 + 1)) + 50000
      };
    }),
    "monthlySales": [
      { "month": "Jan", "revenue": 1200000 }, { "month": "Feb", "revenue": 1440000 }, { "month": "Mar", "revenue": 1760000 },
      { "month": "Apr", "revenue": 1520000 }, { "month": "May", "revenue": 2000000 }, { "month": "Jun", "revenue": 2240000 },
      { "month": "Jul", "revenue": 2480000 }, { "month": "Aug", "revenue": 2320000 }, { "month": "Sep", "revenue": 2800000 },
      { "month": "Oct", "revenue": 3200000 }
    ],
    "quarterlySales": [
      { "quarter": "Q1 23", "revenue": 4400000 }, { "quarter": "Q2 23", "revenue": 5760000 },
      { "quarter": "Q3 23", "revenue": 7600000 }, { "quarter": "Q4 23", "revenue": 8800000 },
      { "quarter": "Q1 24", "revenue": 5200000 }, { "quarter": "Q2 24", "revenue": 6560000 }
    ],
    "yearlySales": Array.from({ length: 5 }, (_, i) => {
      const year = new Date().getFullYear() - (4 - i);
      return { 
        year: year.toString(), 
        revenue: (Math.floor(Math.random() * (400000 - 150000 + 1)) + 150000) * 80
      };
    }),
    "topProducts": [
      { "productId": "p1", "name": "Smartwatch Pro", "unitsSold": 120 },
      { "productId": "p5", "name": "Wireless Earbuds", "unitsSold": 95 },
      { "productId": "p3", "name": "Designer Denim Jacket", "unitsSold": 70 }
    ],
    "keyMetrics": {
      "totalRevenue": 20960000,
      "totalOrders": 850,
      "newCustomers": 120
    }
  });

  // FIX: Declare missing signals for products and orders
  private productsSignal = signal<Product[]>([]);
  private ordersSignal = signal<Order[]>([]);

  products = this.productsSignal.asReadonly();
  orders = this.ordersSignal.asReadonly();
  salesData = this.salesDataSignal.asReadonly();
  
  constructor() {
    this.productsSignal.set(this._loadFromLocalStorage(this.PRODUCTS_KEY, this.initialProducts));
    this.ordersSignal.set(this._loadFromLocalStorage(this.ORDERS_KEY, this.initialOrders));

    effect(() => {
      this._saveToLocalStorage(this.PRODUCTS_KEY, this.productsSignal());
    });
    effect(() => {
      this._saveToLocalStorage(this.ORDERS_KEY, this.ordersSignal());
    });
  }

  private _loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      try {
        return JSON.parse(storedValue);
      } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        localStorage.removeItem(key);
      }
    }
    return defaultValue;
  }

  private _saveToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to localStorage key "${key}":`, e);
    }
  }

  addProduct(productData: Omit<Product, 'id' | 'imageUrl' | 'lowStockThreshold'> & { imageUrl?: string }) {
    const newProduct: Product = {
      ...productData,
      id: `p${Date.now()}`,
      imageUrl: productData.imageUrl || `https://picsum.photos/seed/p${Date.now()}/200`,
      lowStockThreshold: 50 // Default threshold
    };
    this.productsSignal.update(products => [...products, newProduct]);
  }

  updateProduct(updatedProduct: Product) {
    this.productsSignal.update(products => products.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p));
  }

  deleteProduct(productId: string) {
    this.productsSignal.update(products => products.filter(p => p.id !== productId));
    this.cartService.removeFromCart(productId);
  }
  
  updateOrderStatus(orderId: string, status: OrderStatus) {
    this.ordersSignal.update(orders => 
        orders.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }

  getInventory(): InventoryItem[] {
    return this.products().map(p => ({
        productId: p.id,
        productName: p.name,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold
    }));
  }

  updateLowStockThreshold(productId: string, newThreshold: number) {
    this.productsSignal.update(products =>
      products.map(p => (p.id === productId ? { ...p, lowStockThreshold: newThreshold } : p))
    );
  }

  placeOrder(customerName: string, cartItems: { product: Product; quantity: number }[]): PlaceOrderResult {
    if (cartItems.length === 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    const currentProducts = this.productsSignal();

    // 1. Validate stock for all items before proceeding
    for (const cartItem of cartItems) {
      const productInStock = currentProducts.find(p => p.id === cartItem.product.id);
      if (!productInStock || productInStock.stock < cartItem.quantity) {
        return {
          success: false,
          message: `Unable to place order. Only ${productInStock?.stock ?? 0} of ${cartItem.product.name} available in stock.`
        };
      }
    }

    // 2. If validation passes, create the order
    const newOrder: Order = {
      id: `o${Date.now()}`,
      customerName: customerName,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      status: 'Pending',
      total: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      items: cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    this.ordersSignal.update(orders => [newOrder, ...orders]);

    // 3. Decrement stock for all items
    this.productsSignal.update(products => {
      return products.map(p => {
        const cartItem = cartItems.find(item => item.product.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
      });
    });
    
    return { success: true, message: 'Order placed successfully!' };
  }
}