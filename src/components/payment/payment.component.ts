import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class PaymentComponent {
  private cartService = inject(CartService);
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  cart = this.cartService.cart;
  cartTotal = this.cartService.cartTotal;
  cartCount = this.cartService.cartCount;

  isProcessing = signal(false);
  paymentError = signal<string | null>(null);
  
  // Dummy tax calculation for display
  taxes = computed(() => this.cartTotal() * 0.08); // 8% tax
  totalWithTaxes = computed(() => this.cartTotal() + this.taxes());

  paymentForm = new FormGroup({
    cardholderName: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    cardNumber: new FormControl('', { validators: [Validators.required, Validators.pattern('^[0-9]{16}$')], nonNullable: true }),
    expiryDate: new FormControl('', { validators: [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')], nonNullable: true }),
    cvc: new FormControl('', { validators: [Validators.required, Validators.pattern('^[0-9]{3,4}$')], nonNullable: true }),
  });

  constructor() {
    if (this.cartCount() === 0) {
      this.router.navigate(['/products']);
    }
  }

  async processPayment() {
    this.paymentForm.markAllAsTouched();
    if (this.paymentForm.invalid) {
      this.paymentError.set('Please fill in all payment details correctly.');
      return;
    }

    this.paymentError.set(null);
    this.isProcessing.set(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = this.authService.currentUser();
    if (!user) {
      this.paymentError.set('You must be logged in to place an order.');
      this.isProcessing.set(false);
      return;
    }

    const result = this.dataService.placeOrder(user.name, this.cart());

    if (result.success) {
      this.cartService.clearCart();
      this.notificationService.setMessage('Order placed successfully!');
      this.router.navigate(['/profile']);
    } else {
      this.paymentError.set(result.message);
      this.isProcessing.set(false);
    }
  }
}
