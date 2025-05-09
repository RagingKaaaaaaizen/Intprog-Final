import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../_services';

@Component({ templateUrl: 'email-preview.component.html' })
export class EmailPreviewComponent implements OnInit {
    loading = false;
    verificationToken = '';
    etherealUrl = '';
    email = '';
    
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        // Get parameters from route
        this.route.queryParams.subscribe(params => {
            this.verificationToken = params['token'] || '';
            this.etherealUrl = params['etherealUrl'] || '';
            this.email = params['email'] || '';
            
            if (!this.verificationToken || !this.etherealUrl) {
                this.alertService.error('Missing verification information. Please go back and register again.');
            }
        });
    }
    
    verifyNow() {
        this.loading = true;
        
        this.accountService.verifyEmail(this.verificationToken)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Email verified successfully! You can now login.', { keepAfterRouteChange: true });
                    this.router.navigate(['/account/login']);
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
    
    openEtherealMail() {
        window.open(this.etherealUrl, '_blank');
    }
} 