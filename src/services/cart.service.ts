import { Injectable, signal, computed } from '@angular/core';
// FIX: Corrected import path for models to explicitly point to the barrel file.
import { Product } from '../models/index';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  cart = signal<CartItem[]>([]);

  cartTotal = computed(() => {
    return this.cart().reduce((total, item) => total + item.product.price * item.quantity, 0);
  });

  cartCount = computed(() => {
    return this.cart().reduce((count, item) => count + item.quantity, 0);
  });

  addToCart(product: Product) {
    this.cart.update(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);
      if (existingItem) {
        // Increment quantity only if it doesn't exceed stock
        const newQuantity = existingItem.quantity + 1;
        if (newQuantity > product.stock) return currentCart;
        
        return currentCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      // Add new item if stock is available
      if (product.stock > 0) {
        return [...currentCart, { product, quantity: 1 }];
      }
      return currentCart;
    });
  }

  updateQuantity(productId: string, newQuantity: number) {
    this.cart.update(currentCart => {
      const itemToUpdate = currentCart.find(item => item.product.id === productId);
      if (!itemToUpdate) return currentCart;

      // Clamp quantity between 0 and available stock
      const quantity = Math.max(0, Math.min(newQuantity, itemToUpdate.product.stock));

      if (quantity === 0) {
        return currentCart.filter(item => item.product.id !== productId);
      }
      
      return currentCart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    });
  }

  removeFromCart(productId: string) {
    this.cart.update(currentCart => 
      currentCart.filter(item => item.product.id !== productId)
    );
  }
  
  clearCart() {
      this.cart.set([]);
  }
}