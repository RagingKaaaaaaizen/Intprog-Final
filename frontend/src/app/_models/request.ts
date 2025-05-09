export interface RequestItem {
    id?: string;
    name: string;
    quantity: number;
    status: string;
    notes?: string;
    created?: string;
    updated?: string;
}

export interface Request {
    id?: string;
    type: string;
    status: string;
    notes?: string;
    employeeId?: string;
    items?: RequestItem[];
    created?: string;
    updated?: string;
} 