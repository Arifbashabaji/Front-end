

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
// FIX: Corrected import path for models to explicitly point to the barrel file.
import { Order, OrderStatus } from '../../models/index';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class OrdersComponent {
  private dataService = inject(DataService);
  orders = this.dataService.orders;
  orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-cyan-100 text-cyan-800';
      case 'Processing': return 'bg-amber-100 text-amber-800';
      case 'Pending': return 'bg-slate-100 text-slate-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  updateStatus(order: Order, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (newStatus) {
      this.dataService.updateOrderStatus(order.id, newStatus as OrderStatus);
    }
  }
}