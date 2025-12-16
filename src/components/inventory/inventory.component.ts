
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
// FIX: Corrected import path for models to explicitly point to the barrel file.
import { InventoryItem } from '../../models/index';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
})
export class InventoryComponent {
  private dataService = inject(DataService);
  inventoryItems = computed(() => this.dataService.getInventory());

  // Modal state
  showEditModal = signal(false);
  editingItem = signal<InventoryItem | null>(null);
  newThresholdValue = signal(0);

  isLowStock(item: InventoryItem): boolean {
    return item.stock < item.lowStockThreshold;
  }

  getStockStatusInfo(item: InventoryItem) {
    const isLow = this.isLowStock(item);
    // Use threshold * 2 as a reasonable "full" amount for visualization
    const maxStock = Math.max(item.lowStockThreshold * 2, item.stock);
    const stockPercentage = Math.min((item.stock / maxStock) * 100, 100);

    let colorClass = 'text-green-500';
    if (isLow) {
      colorClass = 'text-red-500';
    } else if (item.stock < item.lowStockThreshold * 1.25) {
      // If stock is less than 125% of threshold, show as amber
      colorClass = 'text-amber-500';
    }
    
    // SVG Donut Chart calculation
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const strokeDashoffset = circumference - (stockPercentage / 100) * circumference;

    return {
      isLow,
      stockPercentage,
      colorClass,
      circumference,
      strokeDashoffset
    };
  }

  openEditModal(item: InventoryItem) {
    this.editingItem.set(item);
    this.newThresholdValue.set(item.lowStockThreshold);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingItem.set(null);
  }

  saveThreshold() {
    const item = this.editingItem();
    if (item && this.newThresholdValue() >= 0) {
      this.dataService.updateLowStockThreshold(item.productId, this.newThresholdValue());
      this.closeEditModal();
    }
  }
}
