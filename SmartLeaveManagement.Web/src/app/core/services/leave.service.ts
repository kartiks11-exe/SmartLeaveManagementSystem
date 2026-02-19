import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LeaveBalance, LeaveRequest, CreateLeaveRequest } from '../models/leave.model';

@Injectable({
    providedIn: 'root'
})
export class LeaveService {

    constructor(private api: ApiService) { }

    // Employee
    getMyBalance(): Observable<LeaveBalance[]> {
        return this.api.get<LeaveBalance[]>('/leaves/my-balance');
    }

    getLeaveHistory(): Observable<LeaveRequest[]> {
        return this.api.get<LeaveRequest[]>('/leaves/my-history');
    }

    applyLeave(request: CreateLeaveRequest): Observable<any> {
        return this.api.post('/leaves', request);
    }

    // Manager
    getPendingRequests(): Observable<LeaveRequest[]> {
        return this.api.get<LeaveRequest[]>('/leaves/pending');
    }

    approveLeave(id: number): Observable<any> {
        return this.api.put(`/leaves/${id}/approve`, {});
    }

    rejectLeave(id: number, comment?: string): Observable<any> {
        return this.api.put(`/leaves/${id}/reject`, { status: 'Rejected', comment: comment });
    }
}
