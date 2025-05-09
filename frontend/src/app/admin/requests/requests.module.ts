import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequestsRoutingModule } from './requests-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { ViewComponent } from './view.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RequestsRoutingModule
    ],
    declarations: [
        ListComponent,
        AddEditComponent,
        ViewComponent
    ]
})
export class RequestsModule { }

