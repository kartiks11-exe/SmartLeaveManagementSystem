import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './shared/layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Employee Components
import { EmployeeDashboardComponent } from './employee/dashboard/dashboard.component';
import { ApplyLeaveComponent } from './employee/apply-leave/apply-leave.component';
import { LeaveHistoryComponent } from './employee/leave-history/leave-history.component';

// Manager Components
import { ManagerDashboardComponent } from './manager/dashboard/dashboard.component';
import { PendingRequestsComponent } from './manager/pending-requests/pending-requests.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },

    {
        path: 'employee',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        data: { role: 'Employee' }, // Used by RoleGuard if needed, but here we can also strict check
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                component: EmployeeDashboardComponent,
                canActivate: [roleGuard],
                data: { role: 'Employee' }
            },
            {
                path: 'apply-leave',
                component: ApplyLeaveComponent,
                canActivate: [roleGuard],
                data: { role: 'Employee' }
            },
            {
                path: 'history',
                component: LeaveHistoryComponent,
                canActivate: [roleGuard],
                data: { role: 'Employee' }
            }
        ]
    },

    {
        path: 'manager',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                component: ManagerDashboardComponent,
                canActivate: [roleGuard],
                data: { role: 'Manager' }
            },
            {
                path: 'pending-requests',
                component: PendingRequestsComponent,
                canActivate: [roleGuard],
                data: { role: 'Manager' }
            }
        ]
    },

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];
