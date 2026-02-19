import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveBalance } from '../../core/models/leave.model';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatGridListModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2 class="page-title">Dashboard</h2>
        <span class="welcome-text">Welcome back! Here's your leave overview.</span>
      </div>
      
      <div class="balance-grid">
        <mat-card *ngFor="let balance of balances" class="balance-card">
          <mat-card-content>
            <div class="card-icon" [ngClass]="getIconClass(balance.leaveType?.name)">
              <mat-icon>{{ getIconName(balance.leaveType?.name) }}</mat-icon>
            </div>
            <div class="balance-info">
              <div class="days">{{ balance.remainingDays }}</div>
              <div class="label">Days Available</div>
              <div class="type-name">{{ balance.leaveType?.name }}</div>
            </div>
          </mat-card-content>
          <mat-card-footer>
            <div class="details">
              <div class="detail-item">
                <span class="detail-label">Total</span>
                <span class="detail-value">{{ balance.totalDays }}</span>
              </div>
              <div class="divider"></div>
              <div class="detail-item">
                <span class="detail-label">Used</span>
                <span class="detail-value">{{ balance.usedDays }}</span>
              </div>
            </div>
          </mat-card-footer>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { 
      padding: 32px; 
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 500;
      color: #172b4d;
      margin-bottom: 8px;
    }

    .welcome-text {
      color: #6b778c;
      font-size: 16px;
    }

    .balance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }

    .balance-card {
      border-radius: 12px;
      box-shadow: var(--card-shadow);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: default;
      overflow: visible;
      background: white;
    }

    .balance-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--card-shadow-hover);
    }

    mat-card-content {
      padding: 24px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 16px;
      background: #e3f2fd;
      color: #1976d2;
    }

    .card-icon.sick { background: #ffebee; color: #e53935; } /* Red */
    .card-icon.casual { background: #e0f2f1; color: #00897b; } /* Teal */
    .card-icon.earned { background: #e8eaf6; color: #3949ab; } /* Indigo */

    .balance-info {
      text-align: center;
    }

    .days {
      font-size: 3.5rem;
      font-weight: 700;
      line-height: 1;
      color: #172b4d;
      margin-bottom: 8px;
    }

    .label {
      font-size: 0.875rem;
      color: #6b778c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .type-name {
      margin-top: 4px;
      font-size: 1.1rem;
      font-weight: 500;
      color: #3f51b5;
    }

    mat-card-footer {
      background: #f9fafb;
      border-top: 1px solid #dfe1e6;
      border-radius: 0 0 12px 12px;
    }

    .details {
      display: flex;
      justify-content: space-evenly;
      align-items: center;
      padding: 12px 0;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .detail-label {
      font-size: 0.75rem;
      color: #6b778c;
    }

    .detail-value {
      font-weight: 600;
      color: #172b4d;
    }

    .divider {
      width: 1px;
      height: 24px;
      background: #dfe1e6;
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  balances: LeaveBalance[] = [];

  constructor(private leaveService: LeaveService) { }

  ngOnInit() {
    this.loadBalance();
  }

  loadBalance() {
    this.leaveService.getMyBalance().subscribe(data => {
      this.balances = data;
    });
  }

  getIconName(leaveName: string | undefined): string {
    if (!leaveName) return 'event_note';
    const lower = leaveName.toLowerCase();
    if (lower.includes('sick')) return 'sick';
    if (lower.includes('casual')) return 'beach_access';
    if (lower.includes('earned') || lower.includes('privileged')) return 'work';
    return 'event_note';
  }

  getIconClass(leaveName: string | undefined): string {
    if (!leaveName) return '';
    const lower = leaveName.toLowerCase();
    if (lower.includes('sick')) return 'sick';
    if (lower.includes('casual')) return 'casual';
    if (lower.includes('earned') || lower.includes('privileged')) return 'earned';
    return '';
  }
}
