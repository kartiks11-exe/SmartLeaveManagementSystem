import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-reject-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
    template: `
    <h2 mat-dialog-title>Reject Leave Request</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Reason for Rejection</mat-label>
        <textarea matInput [(ngModel)]="reason" placeholder="Enter reason..."></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="reason" [disabled]="!reason">Reject</button>
    </mat-dialog-actions>
  `,
    styles: [`
    .full-width { width: 100%; min-width: 300px; }
  `]
})
export class RejectDialogComponent {
    reason: string = '';

    constructor(public dialogRef: MatDialogRef<RejectDialogComponent>) { }
}
