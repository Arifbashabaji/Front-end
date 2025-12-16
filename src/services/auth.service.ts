

import { Injectable, signal, computed } from '@angular/core';
// FIX: Corrected import path for models to explicitly point to the barrel file.
import { User } from '../models/index';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private usersSignal = signal<User[]>([
    { "id": "admin1", "name": "Admin User", "email": "admin@example.com", "password": "password123", "role": "admin" },
    { "id": "user1", "name": "Jane Doe", "email": "user@example.com", "password": "password123", "role": "user" }
  ]);

  // Start with no user logged in.
  private currentUserSignal = signal<User | null>(null);

  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => !!this.currentUserSignal());
  isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  login(email: string, password: string):boolean {
    const user = this.usersSignal().find(u => u.email === email && u.password === password);
    if (user) {
      // Omit password from the user object stored in the state
      const { password, ...userWithoutPassword } = user;
      this.currentUserSignal.set(userWithoutPassword);
      return true;
    }
    return false;
  }

  // Mock register, always creates a 'user' role
  register(name: string, email: string, password: string): boolean {
    if (this.usersSignal().some(u => u.email === email)) {
      // In a real app, you would return a proper error. Here we just fail silently.
      return false; 
    }
    
    if (name && email && password) {
      const newUser: User = { id: `u${Date.now()}`, name, email, role: 'user' };
      
      // Persist the new user with password to our mock user list
      this.usersSignal.update(users => [...users, { ...newUser, password }]);
      
      // Do not log in the new user immediately
      return true;
    }
    return false;
  }

  logout() {
    this.currentUserSignal.set(null);
  }
}