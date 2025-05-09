import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Alert, AlertType } from '../_models/alert';

@Injectable({ providedIn: 'root' })
export class AlertService {
    private subject = new Subject<Alert>();
    private defaultId = 'default-alert';

    // enable subscribing to alerts observable
    onAlert(id = this.defaultId): Observable<Alert> {
        return this.subject.asObservable().pipe(filter(x => x && x.id === id));
    }

    // convenience methods
    success(message: string, options?: any) {
        this.alert(new Alert({ 
            ...options, 
            type: AlertType.Success, 
            message,
            autoClose: false // Always set autoClose to false
        }));
    }

    error(message: string, options?: any) {
        this.alert(new Alert({ 
            ...options, 
            type: AlertType.Error, 
            message,
            autoClose: false // Always set autoClose to false
        }));
    }

    info(message: string, options?: any) {
        this.alert(new Alert({ 
            ...options, 
            type: AlertType.Info, 
            message,
            autoClose: false // Always set autoClose to false
        }));
    }

    warn(message: string, options?: any) {
        this.alert(new Alert({ 
            ...options, 
            type: AlertType.Warning, 
            message,
            autoClose: false // Always set autoClose to false
        }));
    }

    // Method specifically for Ethereal email previews
    emailPreview(message: string, options?: any) {
        this.alert(new Alert({ 
            ...options, 
            type: AlertType.Info, 
            message,
            autoClose: false, // Don't auto-close email previews
            keepAfterRouteChange: true // Keep visible after navigation
        }));
    }

    // core alert method
    alert(alert: Alert) {
        alert.id = alert.id || this.defaultId;
        // Force autoClose to be false unless explicitly overridden
        alert.autoClose = (alert.autoClose === undefined ? false : alert.autoClose);
        this.subject.next(alert);
    }

    // clear alerts
    clear(id = this.defaultId) {
        this.subject.next(new Alert({ id }));
    }
}