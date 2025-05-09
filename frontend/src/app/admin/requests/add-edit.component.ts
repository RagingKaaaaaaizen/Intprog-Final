import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { RequestService } from '../../_services/request.service';
import { AlertService } from '../../_services/alert.service';
import { EmployeeService } from '../../_services/employee.service';
import { Employee } from '../../_models';

@Component({ templateUrl: 'add-edit.component.html' })
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id?: string;
    isAddMode!: boolean;
    loading = false;
    submitted = false;
    employees: Employee[] = [];
    
    requestTypes = [
        'Equipment Request', 
        'Leave Request', 
        'Training Request', 
        'Expense Claim',
        'Other'
    ];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private requestService: RequestService,
        private alertService: AlertService,
        private employeeService: EmployeeService
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;
        
        // Get the employee ID from query params if it's in add mode
        let selectedEmployeeId = this.route.snapshot.queryParams['employeeId'];
        
        // Load employees for dropdown
        this.loadEmployees(selectedEmployeeId);
        
        // Initialize the form
        this.form = this.formBuilder.group({
            type: ['Equipment Request', Validators.required],
            employeeId: [selectedEmployeeId || '', Validators.required],
            notes: [''],
            status: ['Pending'],
            items: this.formBuilder.array([
                this.createItem()
            ])
        });

        if (!this.isAddMode) {
            this.requestService.getById(this.id!)
                .pipe(first())
                .subscribe({
                    next: (request) => {
                        // Clear the items array
                        this.itemsArray.clear();
                        
                        // Add items from the request
                        if (request.items && request.items.length > 0) {
                            request.items.forEach(item => {
                                this.itemsArray.push(this.formBuilder.group({
                                    id: [item.id],
                                    name: [item.name, Validators.required],
                                    quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                                    notes: [item.notes || ''],
                                    status: [item.status || 'Pending']
                                }));
                            });
                        } else {
                            // Add a default item if none exists
                            this.itemsArray.push(this.createItem());
                        }
                        
                        // Update the rest of the form
                        this.form.patchValue({
                            type: request.type,
                            employeeId: request.employeeId,
                            notes: request.notes,
                            status: request.status
                        });
                    },
                    error: (error) => {
                        this.alertService.error('Error loading request details');
                        this.loading = false;
                    }
                });
        }
    }

    // Convenience getter for form fields
    get f() { return this.form.controls; }
    
    // Getter for the items form array
    get itemsArray() {
        return this.form.get('items') as FormArray;
    }
    
    // Method to create a new item FormGroup
    createItem(): FormGroup {
        return this.formBuilder.group({
            name: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            notes: [''],
            status: ['Pending']
        });
    }
    
    // Method to add a new item
    addItem(): void {
        this.itemsArray.push(this.createItem());
    }
    
    // Method to remove an item
    removeItem(index: number): void {
        if (this.itemsArray.length > 1) {
            this.itemsArray.removeAt(index);
        } else {
            this.alertService.error('At least one item is required');
        }
    }
    
    // Load employees for the dropdown
    loadEmployees(selectedEmployeeId?: string) {
        this.employeeService.getAll()
            .pipe(first())
            .subscribe(employees => {
                this.employees = employees;
                
                // If we have a selected employee ID, make sure the form is updated
                if (selectedEmployeeId && this.form) {
                    this.form.patchValue({ employeeId: selectedEmployeeId });
                }
            });
    }

    onSubmit() {
        this.submitted = true;

        // Reset alerts on submit
        this.alertService.clear();

        // Stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        if (this.isAddMode) {
            this.createRequest();
        } else {
            this.updateRequest();
        }
    }

    private createRequest() {
        this.requestService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    private updateRequest() {
        this.requestService.update(this.id!, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Request updated successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
} 