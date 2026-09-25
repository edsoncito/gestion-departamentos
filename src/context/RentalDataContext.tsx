import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { loadRentalDatabase, updatePaymentRow } from '../services/google/sheetsClient'
import type {
  DepartmentView,
  Payment,
  PaymentUpdate,
  RentalDatabase,
} from '../types/database'
import { useGoogleSession } from './GoogleSessionContext'

interface RentalDataValue {
  data: RentalDatabase | null
  departmentViews: DepartmentView[]
  error: string | null
  loading: boolean
  refresh: () => Promise<void>
  savePayment: (payment: Payment, update: PaymentUpdate) => Promise<void>
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
    () => ({ data, departmentViews, error, loading, refresh, savePayment }),
    [data, departmentViews, error, loading, refresh, savePayment],
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
