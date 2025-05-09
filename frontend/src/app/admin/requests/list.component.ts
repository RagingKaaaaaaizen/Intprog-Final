import { Component, OnInit } from "@angular/core";
import { RequestService } from "../../_services/request.service";
import { Request } from "../../_models";
import { first } from "rxjs/operators";
import { AlertService } from "../../_services/alert.service";

@Component({ templateUrl: 'list.component.html'})
export class ListComponent implements OnInit {
    requests: Request[] = [];
    loading = false;
    isDeleting = false;

    constructor(
        private requestService: RequestService,
        private alertService: AlertService
    ) {}

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.loading = true;
        this.requestService.getAll()
            .pipe(first())
            .subscribe({
                next: (requests) => {
                    this.requests = requests;
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error('Error loading requests');
                    this.loading = false;
                }
            });
    }

    deleteRequest(id: string) {
        if (!confirm('Are you sure you want to delete this request?')) return;
        this.isDeleting = true;
        this.requestService.delete(id)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.requests = this.requests.filter(x => x.id !== id);
                    this.alertService.success('Request deleted successfully');
                    this.isDeleting = false;
                },
                error: (error) => {
                    this.alertService.error('Error deleting request');
                    this.isDeleting = false;
                }
            });
    }
}