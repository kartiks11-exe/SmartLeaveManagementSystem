export interface LeaveType {
    id: number;
    name: string;
    defaultDays: number;
}

export interface LeaveBalance {
    id: number;
    userId: number;
    leaveTypeId: number;
    leaveType?: LeaveType;
    totalDays: number;
    usedDays: number;
    remainingDays: number; // Computed locally or from backend if available
}

export interface CreateLeaveRequest {
    leaveTypeId: number;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    reason: string;
}

export interface LeaveRequest {
    id: number;
    userId: number;
    user?: User;
    leaveTypeId: number;
    leaveType?: LeaveType;
    startDate: string; // DateOnly from backend comes as string
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    appliedDate: string;
    managerComment?: string;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}
