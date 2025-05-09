import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '@app/_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            console.log('API Error:', {
                url: request.url,
                method: request.method,
                status: err.status,
                error: err.error,
                message: err.message
            });
            
            if ([401, 403].includes(err.status) && this.accountService.accountValue) {
                // auto logout if 401 or 403 response returned from api
                this.accountService.logout();
            }

            // Extract the error message from the response
            let errorMessage = 'An unknown error occurred';
            
            if (err.error) {
                // Try to get the error message from various possible formats
                if (typeof err.error === 'string') {
                    errorMessage = err.error;
                } else if (err.error.message) {
                    errorMessage = err.error.message;
                } else if (err.error.error) {
                    errorMessage = err.error.error;
                } else if (err.statusText) {
                    errorMessage = err.statusText;
                }
            }
            
            console.error('Processed Error:', errorMessage);
            return throwError(errorMessage);
        }))
    }
}