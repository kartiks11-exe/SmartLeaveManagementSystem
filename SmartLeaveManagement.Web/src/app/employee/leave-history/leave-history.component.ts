import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { LeaveService } from '../../core/services/leave.service';
import { LeaveRequest } from '../../core/models/leave.model';

@Component({
  selector: 'app-leave-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatChipsModule],
  template: `
    <div class="container">
      <h2>My Leave History</h2>
      
      <table mat-table [dataSource]="leaves" class="mat-elevation-z8">
        
        <ng-container matColumnDef="leaveType">
          <th mat-header-cell *matHeaderCellDef> Leave Type </th>
          <td mat-cell *matCellDef="let element"> {{element.leaveType?.name}} </td>
        </ng-container>

        <ng-container matColumnDef="fromDate">
          <th mat-header-cell *matHeaderCellDef> From </th>
          <td mat-cell *matCellDef="let element"> {{element.startDate | date}} </td>
        </ng-container>

        <ng-container matColumnDef="toDate">
          <th mat-header-cell *matHeaderCellDef> To </th>
          <td mat-cell *matCellDef="let element"> {{element.endDate | date}} </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef> Status </th>
          <td mat-cell *matCellDef="let element">
            <mat-chip [color]="getStatusColor(element.status)" selected>
              {{element.status}}
            </mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="comment">
          <th mat-header-cell *matHeaderCellDef> Manager Comment </th>
          <td mat-cell *matCellDef="let element"> {{element.managerComment || '-'}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
      
      <div *ngIf="leaves.length === 0" class="no-data">
        No leave history found.
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 20px; }
    table { width: 100%; margin-top: 20px; }
    .no-data { margin-top: 20px; text-align: center; color: #666; }
  `]
})
export class LeaveHistoryComponent implements OnInit {
  displayedColumns: string[] = ['leaveType', 'fromDate', 'toDate', 'status', 'comment'];
  leaves: LeaveRequest[] = [];

  constructor(private leaveService: LeaveService) { }

  ngOnInit() {
    this.leaveService.getLeaveHistory().subscribe(data => {
      this.leaves = data;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Approved': return 'accent'; // Greenish in some themes, or customize
      case 'Rejected': return 'warn';
      default: return 'primary'; // Pending
    }
  }
}
