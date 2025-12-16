
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  error = signal<string | null>(null);

  registerForm = new FormGroup({
    name: new FormControl('', { validators: [Validators.required, Validators.pattern('^[^0-9]*$')], nonNullable: true }),
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required, Validators.pattern('^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$')], nonNullable: true }),
  });

  register() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      return;
    }

    this.error.set(null);
    const { name, email, password } = this.registerForm.getRawValue();
    const success = this.authService.register(name, email, password);
    if (!success) {
      this.error.set('An account with this email already exists.');
    } else {
      this.notificationService.setMessage('Registration successful! Please log in.');
      this.router.navigate(['/login']);
    }
  }
}
