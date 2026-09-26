import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createContractRows,
  createDepartmentRow,
  createTenantRow,
  finalizeContractRows,
  loadRentalDatabase,
  updatePaymentRow,
  updateDepartmentRow,
  updateTenantRow,
} from '../services/google/sheetsClient'
import type {
  Contract,
  ContractInput,
  DepartmentView,
  Department,
  DepartmentInput,
  Payment,
  PaymentUpdate,
  RentalDatabase,
  Tenant,
  TenantInput,
} from '../types/database'
import { useGoogleSession } from './GoogleSessionContext'

interface RentalDataValue {
  data: RentalDatabase | null
  departmentViews: DepartmentView[]
  error: string | null
  loading: boolean
  assignTenant: (input: ContractInput) => Promise<void>
  createDepartment: (input: DepartmentInput) => Promise<string>
  createTenant: (input: TenantInput) => Promise<string>
  finalizeContract: (contract: Contract, actualExitDate: string) => Promise<number>
  refresh: () => Promise<void>
  savePayment: (payment: Payment, update: PaymentUpdate) => Promise<void>
  updateTenant: (tenant: Tenant, input: TenantInput) => Promise<void>
  updateDepartment: (department: Department, input: DepartmentInput) => Promise<void>
}

const RentalDataContext = createContext<RentalDataValue | null>(null)

export function RentalDataProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useGoogleSession()
  const [data, setData] = useState<RentalDatabase | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!accessToken) {
      setData(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setData(await loadRentalDatabase(accessToken))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos.')
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const savePayment = useCallback(
    async (payment: Payment, update: PaymentUpdate) => {
      if (!accessToken) throw new Error('La sesión de Google no está activa.')
      await updatePaymentRow(accessToken, payment, update)
      await refresh()
    },
    [accessToken, refresh],
  )

  const createTenant = useCallback(
    async (input: TenantInput) => {
      if (!accessToken || !data) throw new Error('Los datos todavía no están disponibles.')
      const tenantId = await createTenantRow(accessToken, data, input)
      await refresh()
      return tenantId
    },
    [accessToken, data, refresh],
  )

  const createDepartment = useCallback(
    async (input: DepartmentInput) => {
      if (!accessToken || !data) throw new Error('Los datos todavía no están disponibles.')
      const departmentId = await createDepartmentRow(accessToken, data, input)
      await refresh()
      return departmentId
    },
    [accessToken, data, refresh],
  )

  const updateDepartment = useCallback(
    async (department: Department, input: DepartmentInput) => {
      if (!accessToken || !data) throw new Error('Los datos todavía no están disponibles.')
      if (data.departments.some(
        (item) => item.id !== department.id
          && item.name.trim().toLowerCase() === input.name.trim().toLowerCase(),
      )) {
        throw new Error('Ya existe otro departamento con ese nombre.')
      }
      const hasActiveContract = data.contracts.some(
        (contract) => contract.departmentId === department.id && contract.status === 'ACTIVO',
      )
      if (hasActiveContract && input.status !== 'ACTIVO') {
        throw new Error('Finalizá el alquiler activo antes de cambiar el estado del departamento.')
      }
      await updateDepartmentRow(accessToken, department, input)
      await refresh()
    },
    [accessToken, data, refresh],
  )

  const updateTenant = useCallback(
    async (tenant: Tenant, input: TenantInput) => {
      if (!accessToken || !data) throw new Error('Los datos todavía no están disponibles.')
      if (data.tenants.some(
        (item) => item.id !== tenant.id && item.documentId === input.documentId,
      )) {
        throw new Error('Ya existe otro inquilino con ese carné de identidad.')
      }
      await updateTenantRow(accessToken, tenant, input)
      await refresh()
    },
    [accessToken, data, refresh],
  )

  const assignTenant = useCallback(
    async (input: ContractInput) => {
      if (!accessToken || !data) throw new Error('Los datos todavía no están disponibles.')
      await createContractRows(accessToken, data, input)
      await refresh()
    },
    [accessToken, data, refresh],
  )

  const finalizeContract = useCallback(
    async (contract: Contract, actualExitDate: string) => {
      if (!accessToken || !data) throw new Error('Los datos todavía no están disponibles.')
      const cancelledPayments = await finalizeContractRows(
        accessToken,
        data,
        contract,
        actualExitDate,
      )
      await refresh()
      return cancelledPayments
    },
    [accessToken, data, refresh],
  )

  const departmentViews = useMemo<DepartmentView[]>(() => {
    if (!data) return []
    return data.departments.map((department) => {
      const contract =
        data.contracts.find(
          (item) => item.departmentId === department.id && item.status === 'ACTIVO',
        ) ?? null
      const tenant = contract
        ? data.tenants.find((item) => item.id === contract.tenantId) ?? null
        : null
      const payments = contract
        ? data.payments.filter((item) => item.contractId === contract.id)
        : []
      return { ...department, contract, tenant, payments }
    })
  }, [data])

  const value = useMemo<RentalDataValue>(
    () => ({
      assignTenant,
      createDepartment,
      createTenant,
      data,
      departmentViews,
      error,
      finalizeContract,
      loading,
      refresh,
      savePayment,
      updateTenant,
      updateDepartment,
    }),
    [
      assignTenant,
      createDepartment,
      createTenant,
      data,
      departmentViews,
      error,
      finalizeContract,
      loading,
      refresh,
      savePayment,
      updateTenant,
      updateDepartment,
    ],
  )

  return (
    <RentalDataContext.Provider value={value}>{children}</RentalDataContext.Provider>
  )
}

export function useRentalData() {
  const value = useContext(RentalDataContext)
  if (!value) throw new Error('useRentalData debe usarse dentro de RentalDataProvider')
  return value
}
