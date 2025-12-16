

import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { DataService } from '../../services/data.service';
// FIX: Corrected import path for models to explicitly point to the barrel file.
import { Product } from '../../models/index';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProductsComponent {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  isAdmin = this.authService.isAdmin;

  // Search, Filter, and Pagination State
  searchTerm = signal('');
  selectedCategory = signal<string>('all');
  currentPage = signal(1);
  pageSize = signal(10); // Show more items per page

  private allProducts = this.dataService.products;

  // Derived State for filtering and pagination
  categories = computed(() => {
    const products = this.allProducts();
    const categorySet = new Set(products.map(p => p.category));
    return Array.from(categorySet).sort();
  });

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();

    return this.allProducts().filter(product => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesSearch = !term || 
                            product.name.toLowerCase().includes(term) || 
                            product.category.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  });
  
  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize()));

  paginatedProducts = computed(() => {
    const products = this.filteredProducts();
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return products.slice(start, end);
  });
  
  // Modal State
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  isEditing = computed(() => !!this.editingProduct());
  imagePreviewUrl = signal<string | null>(null);
  
  productForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    category: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    price: new FormControl(0, { validators: [Validators.required, Validators.min(0)], nonNullable: true }),
    stock: new FormControl(0, { validators: [Validators.required, Validators.min(0)], nonNullable: true })
  });
  
  // Cart-related state
  private cartItems = this.cartService.cart;
  cartCount = this.cartService.cartCount;
  private cartMap = computed(() => {
    const map = new Map<string, number>();
    for (const item of this.cartItems()) {
      map.set(item.product.id, item.quantity);
    }
    return map;
  });

  constructor() {
    effect(() => {
      const product = this.editingProduct();
      if (product) {
        this.productForm.patchValue(product);
      } else {
        this.productForm.reset({ name: '', category: '', price: 0, stock: 0 });
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSearch(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1); // Reset to first page on new search
  }

  onCategoryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCategory.set(selectElement.value);
    this.currentPage.set(1); // Reset to first page on new filter
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  openAddModal() {
    this.editingProduct.set(null);
    this.imagePreviewUrl.set(null);
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.editingProduct.set(product);
    this.imagePreviewUrl.set(product.imageUrl);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct.set(null);
    this.imagePreviewUrl.set(null);
  }

  saveProduct() {
    if (this.productForm.invalid) {
      return;
    }

    const formValue = this.productForm.getRawValue();
    if (this.isEditing()) {
      const productToEdit = this.editingProduct()!;
      const updatedProduct: Product = {
        ...productToEdit,
        ...formValue,
        imageUrl: this.imagePreviewUrl() || productToEdit.imageUrl
      };
      this.dataService.updateProduct(updatedProduct);
    } else {
      this.dataService.addProduct({
        ...formValue,
        imageUrl: this.imagePreviewUrl() || undefined
      });
    }
    
    this.closeModal();
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.dataService.deleteProduct(productId);
      if (this.currentPage() > this.totalPages() && this.totalPages() > 0) {
        this.currentPage.set(this.totalPages());
      }
    }
  }

  // Methods for user cart interaction
  getQuantityInCart(productId: string): number {
    return this.cartMap().get(productId) || 0;
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  increaseQuantity(product: Product) {
    this.cartService.addToCart(product);
  }

  decreaseQuantity(product: Product) {
    const currentQuantity = this.getQuantityInCart(product.id);
    if (currentQuantity > 0) {
      this.cartService.updateQuantity(product.id, currentQuantity - 1);
    }
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}