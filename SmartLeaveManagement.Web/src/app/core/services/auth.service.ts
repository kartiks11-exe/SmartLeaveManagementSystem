import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { LoginRequest, LoginResponse } from '../models/login.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenKey = 'auth_token';
    private userKey = 'auth_user';

    private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private api: ApiService, private router: Router) { }

    public get currentUserValue(): LoginResponse | null {
        return this.currentUserSubject.value;
    }

    public get isLoggedIn(): boolean {
        return !!this.getToken();
    }

    public get userRole(): string | null {
        return this.currentUserValue?.role || null;
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
            tap(response => {
                if (response && response.token) {
                    this.setSession(response);
                    this.currentUserSubject.next(response);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private setSession(authResult: LoginResponse) {
        localStorage.setItem(this.tokenKey, authResult.token);
        localStorage.setItem(this.userKey, JSON.stringify(authResult));
    }

    private getUserFromStorage(): LoginResponse | null {
        const userJson = localStorage.getItem(this.userKey);
        return userJson ? JSON.parse(userJson) : null;
    }
}
