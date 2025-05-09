import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Request } from '../_models';

@Injectable({ providedIn: 'root' })
export class RequestService {
    private baseUrl = `${environment.apiUrl}/requests`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Request[]> {
        return this.http.get<Request[]>(this.baseUrl);
    }

    getById(id: string): Observable<Request> {
        return this.http.get<Request>(`${this.baseUrl}/${id}`);
    }

    create(params: any): Observable<Request> {
        return this.http.post<Request>(this.baseUrl, params);
    }

    update(id: string, params: any): Observable<Request> {
        return this.http.put<Request>(`${this.baseUrl}/${id}`, params);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
} 