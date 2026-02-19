import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <div class="login-background"></div>
      <mat-card class="login-card">
        <div class="card-accent"></div>
        <mat-card-header>
          <div class="header-content">
            <mat-icon class="app-logo" color="primary">event_available</mat-icon>
            <mat-card-title>Smart Leave</mat-card-title>
            <mat-card-subtitle>Sign in to your account</mat-card-subtitle>
          </div>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput formControlName="email" type="email" placeholder="name@company.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Please enter a valid email</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-flat-button color="primary" class="login-btn" type="submit" [disabled]="loginForm.invalid || isLoading">
                <span *ngIf="!isLoading">Sign In</span>
                <mat-progress-spinner *ngIf="isLoading" mode="indeterminate" diameter="20" color="accent"></mat-progress-spinner>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      position: relative;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      overflow: hidden;
    }
    
    .login-card {
      width: 100%;
      max-width: 380px;
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05), 0 5px 10px rgba(0,0,0,0.02);
      position: relative;
      overflow: hidden;
    }

    .card-accent {
      height: 6px;
      background: #3f51b5; /* Primary */
      width: 100%;
    }

    mat-card-header {
      padding-top: 2rem;
      padding-bottom: 1rem;
      display: flex;
      justify-content: center;
    }

    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .app-logo {
      transform: scale(2);
      margin-bottom: 1rem;
      color: #3f51b5;
    }

    mat-card-title {
      font-size: 1.75rem;
      font-weight: 500;
      color: #172b4d;
      margin-bottom: 0.5rem;
    }

    mat-card-subtitle {
      font-size: 0.95rem;
      color: #6b778c;
    }

    mat-card-content {
      padding: 1rem 2.5rem 2.5rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .actions {
      margin-top: 1rem;
    }

    .login-btn {
      width: 100%;
      height: 48px;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Redirect based on role unless returnUrl is set
        if (this.returnUrl !== '/') {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          const role = res.role;
          if (role === 'Employee') this.router.navigate(['/employee/dashboard']);
          else if (role === 'Manager') this.router.navigate(['/manager/dashboard']);
          else this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || 'Login failed. Please check your credentials.';
        this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
