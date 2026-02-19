import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const requiredRole = route.data['role'] as string;

    if (!authService.isLoggedIn) {
        router.navigate(['/login']);
        return false;
    }

    if (authService.userRole !== requiredRole) {
        console.warn('Unauthorized role access attempt');
        // If user is logged in but unauthorized for this route, 
        // maybe redirect to their dashboard or access denied page.
        // For now, redirect to / which might redirect to their dashboard.
        router.navigate(['/']);
        return false;
    }

    return true;
};
