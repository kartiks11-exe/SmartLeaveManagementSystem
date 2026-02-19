import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <mat-nav-list>
      <ng-container *ngIf="isEmployee">
        <a mat-list-item routerLink="/employee/dashboard" routerLinkActive="active-link">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        <a mat-list-item routerLink="/employee/apply-leave" routerLinkActive="active-link">
          <mat-icon matListItemIcon>add_circle</mat-icon>
          <span matListItemTitle>Apply Leave</span>
        </a>
        <a mat-list-item routerLink="/employee/history" routerLinkActive="active-link">
          <mat-icon matListItemIcon>history</mat-icon>
          <span matListItemTitle>My History</span>
        </a>
      </ng-container>

      <ng-container *ngIf="isManager">
        <a mat-list-item routerLink="/manager/dashboard" routerLinkActive="active-link">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        <a mat-list-item routerLink="/manager/pending-requests" routerLinkActive="active-link">
          <mat-icon matListItemIcon>pending_actions</mat-icon>
          <span matListItemTitle>Pending Requests</span>
        </a>
      </ng-container>
    </mat-nav-list>
  `,
  styles: [`
    mat-nav-list {
      padding-top: 24px;
    }

    a[mat-list-item] {
      margin: 8px 16px;
      border-radius: 8px;
      color: #3e5e80; /* Subtle blue-gray */
      transition: all 0.2s ease-in-out;
      height: 48px;
    }

    a[mat-list-item]:hover {
      background-color: rgba(63, 81, 181, 0.04);
      color: #3f51b5;
    }

    /* Active State */
    .active-link {
      background-color: rgba(63, 81, 181, 0.08) !important;
      color: #3f51b5 !important;
      font-weight: 500;
      position: relative;
    }

    .active-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10%;
      bottom: 10%;
      width: 4px;
      background-color: #3f51b5;
      border-radius: 0 4px 4px 0;
    }

    mat-icon {
      margin-right: 12px;
    }

    /* Typography */
    span[matListItemTitle] {
      font-size: 14px;
      letter-spacing: 0.2px;
    }
  `]
})
export class SidebarComponent {
  constructor(private authService: AuthService) { }

  get isEmployee(): boolean {
    return this.authService.userRole === 'Employee';
  }

  get isManager(): boolean {
    return this.authService.userRole === 'Manager';
  }
}
