import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveRequest } from '../../core/models/leave.model';
import { RejectDialogComponent } from '../../shared/dialogs/reject-dialog.component';

@Component({
  selector: 'app-pending-requests',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule],
  template: `
    <div class="container">
      <div class="header">
        <h2 class="page-title">Pending Requests</h2>
        <span class="subtitle">Review and act on leave applications.</span>
      </div>
      
      <div class="table-container mat-elevation-z2">
        <table mat-table [dataSource]="pendingRequests">
          
          <ng-container matColumnDef="employee">
            <th mat-header-cell *matHeaderCellDef> Employee </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="employee-cell">
                <div class="avatar-placeholder">{{ (element.user?.firstName || 'U')[0] }}</div>
                <div class="employee-name">{{ element.user ? (element.user.firstName + ' ' + element.user.lastName) : 'Unknown' }}</div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="leaveType">
            <th mat-header-cell *matHeaderCellDef> Type </th>
            <td mat-cell *matCellDef="let element"> 
              <span class="type-pill" [ngClass]="element.leaveType?.name?.toLowerCase().split(' ')[0]">{{element.leaveType?.name}}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="dates">
            <th mat-header-cell *matHeaderCellDef> Duration </th>
            <td mat-cell *matCellDef="let element"> 
              <div class="date-range">
                <mat-icon class="mini-icon">date_range</mat-icon>
                {{element.startDate | date:'MMM d'}} - {{element.endDate | date:'MMM d, y'}} 
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="reason">
            <th mat-header-cell *matHeaderCellDef> Reason </th>
            <td mat-cell *matCellDef="let element" class="reason-cell"> {{element.reason}} </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef> Actions </th>
            <td mat-cell *matCellDef="let element">
              <div class="action-buttons">
                <button mat-icon-button class="approve-btn" (click)="approve(element)" title="Approve">
                  <mat-icon>check</mat-icon>
                </button>
                <button mat-icon-button class="reject-btn" (click)="reject(element)" title="Reject">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="pendingRequests.length === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>No pending requests at the moment.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { 
      padding: 32px; 
      max-width: 1200px; 
      margin: 0 auto; 
    }
    
    .header { margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 500; color: #172b4d; margin-bottom: 4px; }
    .subtitle { color: #6b778c; }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    table { width: 100%; }

    th.mat-header-cell {
      background: #f4f5f7;
      color: #5e6c84;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      padding: 16px 24px;
      border-bottom: 1px solid #dfe1e6;
    }

    td.mat-cell {
      padding: 16px 24px;
      color: #172b4d;
      border-bottom: 1px solid #ebecf0;
      font-size: 14px;
    }
    
    tr.mat-row:last-child td { border-bottom: none; }
    
    tr.mat-row:hover { background-color: #fafbfc; }

    /* Employee Cell */
    .employee-cell { display: flex; align-items: center; }
    .avatar-placeholder {
      width: 32px; height: 32px;
      border-radius: 50%;
      background-color: #3f51b5;
      color: white;
      display: flex; justify-content: center; align-items: center;
      font-weight: 600; font-size: 14px;
      margin-right: 12px;
    }
    .employee-name { font-weight: 500; }

    /* Type Pill */
    .type-pill {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      background: #ebecf0;
      color: #505f79;
    }
    .type-pill.sick { background: #ffebee; color: #c62828; }
    .type-pill.casual { background: #e0f2f1; color: #00695c; }
    .type-pill.earned { background: #e8eaf6; color: #283593; }

    /* Date Range */
    .date-range { display: flex; align-items: center; color: #5e6c84; }
    .mini-icon { font-size: 16px; width: 16px; height: 16px; margin-right: 8px; color: #97a0af; }

    /* Reason */
    .reason-cell { max-width: 300px; color: #5e6c84; }

    /* Actions */
    .action-buttons { display: flex; gap: 8px; }
    .approve-btn { color: #36b37e; background: rgba(54, 179, 126, 0.1); }
    .approve-btn:hover { background: rgba(54, 179, 126, 0.2); }
    .reject-btn { color: #ff5630; background: rgba(255, 86, 48, 0.1); }
    .reject-btn:hover { background: rgba(255, 86, 48, 0.2); }

    .no-data {
      padding: 48px;
      text-align: center;
      color: #6b778c;
    }
    .no-data mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; color: #dfe1e6; }
  `]
})
export class PendingRequestsComponent implements OnInit {
  displayedColumns: string[] = ['employee', 'leaveType', 'dates', 'reason', 'actions'];
  pendingRequests: LeaveRequest[] = [];

  constructor(
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.leaveService.getPendingRequests().subscribe(data => {
      this.pendingRequests = data;
    });
  }

  approve(request: LeaveRequest) {
    // Optimistic UI update
    this.removeRequestFromList(request.id);

    this.leaveService.approveLeave(request.id).subscribe({
      next: () => {
        this.snackBar.open('Leave Approved', 'Undo', { duration: 3000 });
      },
      error: () => {
        // Revert on error
        this.pendingRequests = [...this.pendingRequests, request];
        this.snackBar.open('Failed to approve leave', 'Close', { duration: 3000 });
      }
    });
  }

  reject(request: LeaveRequest) {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Optimistic UI update
        this.removeRequestFromList(request.id);

        this.leaveService.rejectLeave(request.id, result).subscribe({
          next: () => {
            this.snackBar.open('Leave Rejected', 'Undo', { duration: 3000 });
          },
          error: () => {
            // Revert on error
            this.pendingRequests = [...this.pendingRequests, request];
            this.snackBar.open('Failed to reject leave', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  private removeRequestFromList(id: number) {
    this.pendingRequests = this.pendingRequests.filter(r => r.id !== id);
  }
}
