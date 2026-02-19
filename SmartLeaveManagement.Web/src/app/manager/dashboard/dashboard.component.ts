import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { LeaveService } from '../../core/services/leave.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h2 class="page-title">Manager Dashboard</h2>
        <span class="welcome-text">Overview of your team's leave activities.</span>
      </div>
      
      <div class="stats-grid">
        <mat-card class="stat-card" routerLink="/manager/pending-requests">
          <mat-card-content class="stat-content">
            <div class="icon-circle pending">
              <mat-icon>hourglass_empty</mat-icon>
            </div>
            <div class="stat-info">
              <div class="count">{{ pendingCount }}</div>
              <div class="label">Pending Requests</div>
            </div>
            <mat-icon class="arrow-icon">arrow_forward</mat-icon>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card disabled-card">
          <mat-card-content class="stat-content">
            <div class="icon-circle team">
              <mat-icon>groups</mat-icon>
            </div>
            <div class="stat-info">
              <div class="count">--</div>
              <div class="label">Team Members</div>
            </div>
          </mat-card-content>
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
    
    .header { margin-bottom: 32px; }
    .page-title { font-size: 28px; font-weight: 500; color: #172b4d; margin-bottom: 8px; }
    .welcome-text { color: #6b778c; font-size: 16px; }

    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
      gap: 24px; 
    }

    .stat-card {
      border-radius: 12px;
      box-shadow: var(--card-shadow);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: pointer;
      background: white;
      padding: 0;
    }

    .stat-card:not(.disabled-card):hover {
      transform: translateY(-4px);
      box-shadow: var(--card-shadow-hover);
    }

    .stat-content {
      padding: 24px;
      display: flex;
      align-items: center;
      position: relative;
    }

    .icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20px;
    }

    .icon-circle mat-icon { font-size: 28px; width: 28px; height: 28px; }

    .icon-circle.pending { background: #fff3e0; color: #ff9800; }
    .icon-circle.team { background: #e3f2fd; color: #1976d2; }

    .stat-info { flex: 1; }

    .count {
      font-size: 2.5rem;
      font-weight: 700;
      color: #172b4d;
      line-height: 1;
      margin-bottom: 4px;
    }

    .label {
      font-size: 1rem;
      font-weight: 500;
      color: #6b778c;
    }

    .arrow-icon {
      color: #dfe1e6;
      transition: color 0.2s;
    }

    .stat-card:hover .arrow-icon { color: #3f51b5; }

    .disabled-card { cursor: default; opacity: 0.8; }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  pendingCount = 0;

  constructor(private leaveService: LeaveService) { }

  ngOnInit() {
    this.leaveService.getPendingRequests().subscribe(data => {
      this.pendingCount = data.length;
    });
  }
}
