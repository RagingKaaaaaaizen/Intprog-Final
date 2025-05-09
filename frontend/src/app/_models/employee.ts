import { Account, Department } from './index'

export class Employee {
  id: string
  employeeId: string
  position: string
  userId: string        // one to one relationship between this id and id sa account table
  departmentId: string    // one to many relationship sa department id adtu sa department table
  departmentName?: string  // Added to match backend response
  hireDate: string
  status: string        // Changed from isActive: boolean to match backend
  isActive?: boolean    // Keep for backward compatibility
  account?: any
  department?: any
} 