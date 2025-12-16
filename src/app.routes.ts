import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductsComponent } from './components/products/products.component';
import { OrdersComponent } from './components/orders/orders.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutComponent } from './components/layout/layout.component';
import { PaymentComponent } from './components/payment/payment.component';

import { authGuard } from './auth.guard';
import { publicGuard } from './public.guard';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard] 
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [publicGuard] 
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
      { path: 'products', component: ProductsComponent },
      { path: 'orders', component: OrdersComponent, canActivate: [adminGuard] },
      { path: 'inventory', component: InventoryComponent, canActivate: [adminGuard] },
      { path: 'profile', component: ProfileComponent },
      { path: 'cart', component: CartComponent },
      { path: 'payment', component: PaymentComponent },
      { 
        path: '', 
        redirectTo: 'products', // A safe default for all roles
        pathMatch: 'full' 
      },
    ]
  },
  // Fallback route: redirects to login or the user's dashboard via the guards
  { path: '**', redirectTo: '', pathMatch: 'full' }
];