export type ActiveStatus = 'ACTIVO' | 'INACTIVO'
export type ContractStatus = 'ACTIVO' | 'FINALIZADO' | 'CANCELADO'
export type PaymentStatus = 'PAGADO' | 'PENDIENTE'
export type PaymentMethod = 'QR' | 'EFECTIVO' | 'TRANSFERENCIA' | 'OTRO' | ''

export interface Department {
  id: string
  name: string
  address: string
  description: string
  status: ActiveStatus | 'MANTENIMIENTO'
}

export interface Tenant {
  id: string
  fullName: string
  documentId: string
  phone: string
  status: ActiveStatus
}

export interface Contract {
  id: string
  departmentId: string
  tenantId: string
  startDate: string
  endDate: string
  monthlyAmount: number
  currency: 'BOB'
  dueRule: 'ULTIMO_DIA_MES'
  status: ContractStatus
  notes: string
}

export interface Payment {
  id: string
  contractId: string
  period: string
  expectedAmount: number
  paidAmount: number | null
  paidAt: string | null
  method: PaymentMethod
  status: PaymentStatus
  notes: string
  rowNumber: number
}

export interface RentalDatabase {
  departments: Department[]
  tenants: Tenant[]
  contracts: Contract[]
  payments: Payment[]
}

export interface DepartmentView extends Department {
  contract: Contract | null
  tenant: Tenant | null
  payments: Payment[]
}
