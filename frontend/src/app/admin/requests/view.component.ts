import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { RequestService } from '../../_services/request.service';
import { AlertService } from '../../_services/alert.service';
import { Request } from '../../_models';

@Component({ templateUrl: 'view.component.html' })
export class ViewComponent implements OnInit {
    id?: string;
    request?: Request;
    loading = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.loadRequest();
    }

    loadRequest() {
        this.loading = true;
        this.requestService.getById(this.id!)
            .pipe(first())
            .subscribe({
                next: (request) => {
                    this.request = request;
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error('Error loading request details');
                    this.loading = false;
                    this.router.navigate(['/admin/requests']);
                }
            });
    }

    editRequest() {
        this.router.navigate(['/admin/requests/edit', this.id]);
    }

    deleteRequest() {
        if (!confirm('Are you sure you want to delete this request?')) return;
        
        this.loading = true;
        this.requestService.delete(this.id!)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request deleted successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['/admin/requests']);
                },
                error: (error) => {
                    this.alertService.error('Error deleting request');
                    this.loading = false;
                }
            });
    }
} 