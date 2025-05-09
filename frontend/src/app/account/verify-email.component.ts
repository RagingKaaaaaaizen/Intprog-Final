import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../_services';

@Component({ templateUrl: 'verify-email.component.html' })
export class VerifyEmailComponent implements OnInit {
    token: string;
    submitted = false;
    loading = false;
    tokenInProgress = false;
    verificationComplete = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        // Clear any previous alerts
        this.alertService.clear();
        
        // Get token from query params
        this.route.queryParams.subscribe(params => {
            this.token = params['token'] || '';
            
            // If token is provided in URL, verify automatically
            if (this.token) {
                this.onSubmit();
            }
        });
    }

    onSubmit() {
        this.alertService.clear();
        this.submitted = true;
        
        // Don't proceed if token is empty
        if (!this.token) {
            this.alertService.error('Please enter a verification token');
            return;
        }

        this.loading = true;
        this.tokenInProgress = true;
        
        this.accountService.verifyEmail(this.token)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Verification successful, you can now login', { keepAfterRouteChange: true });
                    this.verificationComplete = true;
                    this.loading = false;
                    this.tokenInProgress = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                    this.tokenInProgress = false;
                }
            });
    }
}