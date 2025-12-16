import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class CartComponent {
  private cartService = inject(CartService);

  cart = this.cartService.cart;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;

  increaseQuantity(productId: string) {
    const item = this.cart().find(i => i.product.id === productId);
    if (item) {
      this.cartService.addToCart(item.product);
    }
  }

  decreaseQuantity(productId: string) {
    const item = this.cart().find(i => i.product.id === productId);
    if (item && item.quantity > 0) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
  }
}
