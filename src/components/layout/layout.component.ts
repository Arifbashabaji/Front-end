

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

type AdminView = 'dashboard' | 'products' | 'orders' | 'inventory';
type UserView = 'profile' | 'products' | 'cart';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAdmin = this.authService.isAdmin;

  isSidebarOpen = signal(false);
  isDesktopSidebarCollapsed = signal(false);
  
  private currentUrl = signal('');

  private adminNavItems: { id: AdminView; name: string; icon: string; path: string }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m-5-1.5l1 1.5m-5 0h3.375m0 0l1.125-1.687M15 9.75l1.125-1.688m0 0A1.125 1.125 0 1115 6.375v2.25m0 2.25h-7.5a1.125 1.125 0 01-1.125-1.125v-1.5A1.125 1.125 0 017.5 6.375h7.5m0 2.25v2.25m0 0A1.125 1.125 0 1015 12.375v-2.25" />', path: '/dashboard' },
    { id: 'products', name: 'Products', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15A2.25 2.25 0 0121.75 7.125v1.5A2.25 2.25 0 0119.5 10.875H4.5A2.25 2.25 0 012.25 8.625v-1.5ZM4.5 13.125h15A2.25 2.25 0 0121.75 15.375v1.5A2.25 2.25 0 0119.5 19.125H4.5A2.25 2.25 0 012.25 16.875v-1.5A2.25 2.25 0 014.5 13.125Z" />', path: '/products' },
    { id: 'orders', name: 'Orders', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />', path: '/orders' },
    { id: 'inventory', name: 'Inventory', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />', path: '/inventory' },
  ];
  
  private userNavItems: { id: UserView; name: string; icon: string; path: string }[] = [
    { id: 'profile', name: 'Profile', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />', path: '/profile' },
    { id: 'products', name: 'Products', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15A2.25 2.25 0 0121.75 7.125v1.5A2.25 2.25 0 0119.5 10.875H4.5A2.25 2.25 0 012.25 8.625v-1.5ZM4.5 13.125h15A2.25 2.25 0 0121.75 15.375v1.5A2.25 2.25 0 0119.5 19.125H4.5A2.25 2.25 0 012.25 16.875v-1.5A2.25 2.25 0 014.5 13.125Z" />', path: '/products' },
    { id: 'cart', name: 'Cart', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.84a1.125 1.125 0 00-.986-1.435H5.488L5.4 3m-3.75 0h16.5" />', path: '/cart' },
  ];

  navItems = computed(() => this.isAdmin() ? this.adminNavItems : this.userNavItems);

  currentViewName = computed(() => {
    const path = this.currentUrl();
    return this.navItems().find(item => item.path === path)?.name || 'Retail Edge';
  });

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.currentUrl.set(event.urlAfterRedirects.split('?')[0]);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen.update(open => !open);
  }

  toggleDesktopSidebar() {
    this.isDesktopSidebarCollapsed.update(collapsed => !collapsed);
  }
}
