import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect logged-in users away from login/register pages
  const destination = authService.isAdmin() ? '/dashboard' : '/profile';
  return router.parseUrl(destination);
};
