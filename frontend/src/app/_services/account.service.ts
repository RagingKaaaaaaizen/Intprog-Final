﻿import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Account } from '../_models';

const baseUrl = `${environment.apiUrl}/accounts`;
console.log('API URL:', baseUrl);

// Default HTTP options for API requests
const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    }),
    withCredentials: true
};

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account | null>;
    public account: Observable<Account | null>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account | null>(null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account | null {
        return this.accountSubject.value;
    }

    login(email: string, password: string) {
        console.log('Attempting login with:', { email });
        return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, httpOptions)
        .pipe(
            map(account => {
                console.log('Login successful:', account);
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            })
        );
    }

    logout() {
        this.http.post<any>(`${baseUrl}/revoke-token`, {}, httpOptions).subscribe();
        this.stopRefreshTokenTimer();
        this.accountSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    refreshToken() {
        return this.http.post<any>(`${baseUrl}/refresh-token`, {}, httpOptions)
            .pipe(map((account) => {
                this.accountSubject.next(account);
                this.startRefreshTokenTimer();
                return account;
            }));            
    }           

    register(account: any) {
        // Remove fields not expected by the backend
        const { confirmPassword, acceptTerms, ...accountToRegister } = account;
        console.log('Sending registration data:', accountToRegister);
        return this.http.post<any>(`${baseUrl}/register`, accountToRegister, httpOptions);
    }

    verifyEmail(token: string) {
        return this.http.post(`${baseUrl}/verify-email`, { token }, httpOptions);
    }
    
    forgotPassword(email: string) {
        return this.http.post(`${baseUrl}/forgot-password`, { email }, httpOptions);
    }
    
    validateResetToken(token: string) {
        return this.http.post(`${baseUrl}/validate-reset-token`, { token }, httpOptions);
    }
    
    resetPassword(token: string, password: string, confirmPassword: string) {
        return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword }, httpOptions);
    }

    getAll() {
        return this.http.get<Account[]>(baseUrl, httpOptions);
    }
    
    getById(id: string) {
        return this.http.get<Account>(`${baseUrl}/${id}`, httpOptions);
    }
    
    create(params) {
        return this.http.post(baseUrl, params, httpOptions);
    }
    
    update(id, params) {
        return this.http.put(`${baseUrl}/${id}`, params, httpOptions)
            .pipe(map((account: any) => {
                // update the current account if it was updated
                if (this.accountValue && account.id === this.accountValue.id) {
                    // publish updated account to subscribers
                    account = { ...this.accountValue, ...account };
                    this.accountSubject.next(account);
                }
                return account;
            }));
    }
    
    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`, httpOptions)
            .pipe(finalize(() => {
                // auto logout if the logged in account was deleted
                if (this.accountValue && id === this.accountValue.id)
                    this.logout();
            }));
    }

    // helper methods

    private refreshTokenTimeout;

    private startRefreshTokenTimer() {
        if (!this.accountValue?.jwtToken) return;
        
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

        // set a timeout to refresh the token a minute before it expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }
}