import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../_services';
import { MustMatch } from '../_helpers';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    form: UntypedFormGroup;
    loading = false;
    submitted = false;
    registeredEmail = '';
    verificationToken = '';
    verificationLinkCreated = false;
    
    constructor(
        private formBuilder: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            acceptTerms: [false, Validators.requiredTrue]
        }, {
            validator: MustMatch('password', 'confirmPassword')
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }
            
        this.loading = true;
        console.log('Form data before sending to API:', this.form.value);
        
        // Store email for reference
        this.registeredEmail = this.form.value.email;
        
        this.accountService.register(this.form.value)
            .pipe(first())
            .subscribe({
                next: (response) => {
                    console.log('Registration successful, response:', response);
                    
                    // Extract verification token from the response
                    this.verificationToken = response.verificationToken || '';
                    
                    // Check if we have ethereal preview URL from the backend
                    if (response.etherealPreviewUrl) {
                        // Redirect to the email preview page with all verification info
                        this.router.navigate(['/account/email-preview'], {
                            queryParams: {
                                token: this.verificationToken,
                                etherealUrl: response.etherealPreviewUrl,
                                email: this.registeredEmail
                            }
                        });
                    } else {
                        // Display standard success message
                        this.alertService.success('Registration successful! Please check your email for verification instructions.', { keepAfterRouteChange: true });
                        
                        // Display enhanced information about verification
                        this.alertService.emailPreview(`
                            <h4>Email Verification Required</h4>
                            <p>Verification token: <strong>${this.verificationToken}</strong></p>
                            <p>You can use this token to verify your account:</p>
                            <div class="mt-3">
                                <a href="/account/verify-email?token=${this.verificationToken}" class="btn btn-primary">
                                    Verify My Email
                                </a>
                            </div>
                        `);
                    }
                },
                error: error => {
                    console.error('Registration error:', error);
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
    
    createVerificationLink() {
        if (!this.verificationToken) {
            this.alertService.error('Please enter the verification token from the console');
            return;
        }
        
        this.verificationLinkCreated = true;
        
        // Add the verification link element dynamically
        setTimeout(() => {
            const alertContainer = document.querySelector('.alert-info');
            if (alertContainer) {
                const linkContainer = document.createElement('div');
                linkContainer.className = 'mt-3 alert alert-success';
                linkContainer.innerHTML = `
                    <p>Click this link to verify your email:</p>
                    <a href="/account/verify-email?token=${this.verificationToken}" class="btn btn-success">
                        Verify My Email
                    </a>
                `;
                alertContainer.appendChild(linkContainer);
            }
        }, 100);
    }
}   