import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LeaveService } from '../../core/services/leave.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatSnackBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Apply for Leave</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Leave Type</mat-label>
              <mat-select formControlName="leaveTypeId">
                <mat-option *ngFor="let type of leaveTypes" [value]="type.id">
                  {{ type.name }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="leaveForm.get('leaveTypeId')?.hasError('required')">Leave Type is required</mat-error>
            </mat-form-field>

            <div class="date-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Start Date</mat-label>
                <input matInput [matDatepicker]="startPicker" formControlName="startDate">
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                <mat-error *ngIf="leaveForm.get('startDate')?.hasError('required')">Start Date is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>End Date</mat-label>
                <input matInput [matDatepicker]="endPicker" formControlName="endDate">
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                <mat-error *ngIf="leaveForm.get('endDate')?.hasError('required')">End Date is required</mat-error>
              </mat-form-field>
            </div>
            
            <mat-error *ngIf="leaveForm.hasError('dateRange')">End Date must be after Start Date</mat-error>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Reason</mat-label>
              <textarea matInput formControlName="reason" rows="3"></textarea>
              <mat-error *ngIf="leaveForm.get('reason')?.hasError('required')">Reason is required</mat-error>
            </mat-form-field>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="leaveForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { padding: 20px; max-width: 600px; margin: 0 auto; }
    .full-width { width: 100%; margin-bottom: 1rem; }
    .date-row { display: flex; gap: 20px; }
    .half-width { flex: 1; }
    .actions { display: flex; justify-content: flex-end; }
  `]
})
export class ApplyLeaveComponent {
  leaveForm: FormGroup;
  isSubmitting = false;
  // TODO: Fetch from backend or hardcode for now based on seeded types
  leaveTypes = [
    { id: 1, name: 'Sick Leave' },
    { id: 2, name: 'Casual Leave' },
    { id: 3, name: 'Earned Leave' }
  ];

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.leaveForm = this.fb.group({
      leaveTypeId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && start > end ? { dateRange: true } : null;
  }

  onSubmit() {
    if (this.leaveForm.invalid) return;

    this.isSubmitting = true;
    const formVal = this.leaveForm.value;

    // Convert dates to YYYY-MM-DD
    const req = {
      ...formVal,
      startDate: this.formatDate(formVal.startDate),
      endDate: this.formatDate(formVal.endDate)
    };

    this.leaveService.applyLeave(req).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('Leave Applied Successfully!', 'OK', { duration: 3000 });
        this.router.navigate(['/employee/history']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err.error?.message || 'Failed to apply leave', 'Close', { duration: 3000 });
      }
    });
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
