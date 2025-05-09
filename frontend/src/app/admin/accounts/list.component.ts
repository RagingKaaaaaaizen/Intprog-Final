import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';
import { Account } from '@app/_models';

@Component({ templateUrl: 'list.component.html' })
export class ListComponent implements OnInit {
    accounts: any[];

    constructor(
        private accountService: AccountService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe(accounts => this.accounts = accounts);
    }

    deleteAccount(id: string) {
        if (confirm('Are you sure you want to delete this user account?')) {
            const account = this.accounts.find(x => x.id === id);
            account.isDeleting = true;
            this.accountService.delete(id)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.accounts = this.accounts.filter(x => x.id !== id);
                        this.alertService.success('Account deleted successfully');
                    },
                    error: (error) => {
                        this.alertService.error('Error deleting account');
                        console.error('Error deleting account:', error);
                        account.isDeleting = false;
                    }
                });
        }
    }
}