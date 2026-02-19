import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar class="navbar">
      <button mat-icon-button (click)="toggleSidebar.emit()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="logo-text">Smart Leave</span>
      <span class="spacer"></span>
      <div class="user-pill" *ngIf="authService.currentUser$ | async as user">
        <mat-icon class="user-icon">account_circle</mat-icon>
        {{ user.firstName }} {{ user.lastName }}
      </div>
      <button mat-icon-button (click)="logout()" title="Logout">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      height: 64px;
      background: white;
      color: #172b4d;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08); /* Subtle shadow for depth */
      position: relative;
      z-index: 10;
      padding: 0 24px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.5px;
      margin-left: 12px;
      color: #3f51b5;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-pill {
      display: flex;
      align-items: center;
      background: #f0f2f5;
      padding: 6px 16px;
      border-radius: 20px;
      margin-right: 16px;
      font-size: 14px;
      font-weight: 500;
      color: #3e5e80;
    }

    .user-icon {
      margin-right: 8px;
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6b778c;
    }

    button[mat-icon-button] {
      color: #5e6c84;
    }
    
    button[mat-icon-button]:hover {
      background-color: rgba(0,0,0,0.04);
      color: #172b4d;
    }
  `]
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public authService: AuthService) { }

  logout() {
    this.authService.logout();
  }
}
