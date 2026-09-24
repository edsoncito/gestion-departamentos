import { GOOGLE_SHEET_ID } from '../../config/google'
import type {
  Contract,
  Department,
  Payment,
  RentalDatabase,
  Tenant,
} from '../../types/database'

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets'
const DAY_IN_MS = 86_400_000
const EXCEL_EPOCH = Date.UTC(1899, 11, 30)

interface BatchGetResponse {
  valueRanges?: Array<{ range: string; values?: unknown[][] }>
}

function serialToIso(value: unknown) {
  if (typeof value !== 'number') return ''
  return new Date(EXCEL_EPOCH + value * DAY_IN_MS).toISOString().slice(0, 10)
}

function isoToSerial(value: Date) {
  const utc = Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())
  return Math.round((utc - EXCEL_EPOCH) / DAY_IN_MS)
}

function text(value: unknown) {
  return value == null ? '' : String(value)
}

function number(value: unknown) {
  return typeof value === 'number' ? value : Number(value || 0)
}

async function googleFetch<T>(accessToken: string, url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(
      response.status === 401
        ? 'La sesión de Google venció. Volvé a ingresar.'
        : `Google Sheets respondió ${response.status}: ${details}`,
    )
  }

  return (await response.json()) as T
}

export async function loadRentalDatabase(accessToken: string): Promise<RentalDatabase> {
  const ranges = [
    'Departamentos!A2:E1000',
    'Inquilinos!A2:E1000',
    'Contratos!A2:J1000',
    'Pagos!A2:I1000',
  ]
  const query = new URLSearchParams({
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
  })
  ranges.forEach((range) => query.append('ranges', range))

  const result = await googleFetch<BatchGetResponse>(
    accessToken,
    `${SHEETS_API}/${GOOGLE_SHEET_ID}/values:batchGet?${query.toString()}`,
  )
  const [departmentRows = [], tenantRows = [], contractRows = [], paymentRows = []] =
    result.valueRanges?.map((item) => item.values ?? []) ?? []

  const departments = departmentRows
    .filter((row) => row[0])
    .map<Department>((row) => ({
      id: text(row[0]),
      name: text(row[1]),
      address: text(row[2]),
      description: text(row[3]),
      status: text(row[4]) as Department['status'],
    }))

  const tenants = tenantRows
    .filter((row) => row[0])
    .map<Tenant>((row) => ({
      id: text(row[0]),
      fullName: text(row[1]),
      documentId: text(row[2]),
      phone: text(row[3]),
      status: text(row[4]) as Tenant['status'],
    }))

  const contracts = contractRows
    .filter((row) => row[0])
    .map<Contract>((row) => ({
      id: text(row[0]),
      departmentId: text(row[1]),
      tenantId: text(row[2]),
      startDate: serialToIso(row[3]),
      endDate: serialToIso(row[4]),
      monthlyAmount: number(row[5]),
      currency: 'BOB',
      dueRule: text(row[7]) as Contract['dueRule'],
      status: text(row[8]) as Contract['status'],
      notes: text(row[9]),
    }))

  const payments = paymentRows
    .filter((row) => row[0])
    .map<Payment>((row, index) => ({
      id: text(row[0]),
      contractId: text(row[1]),
      period: serialToIso(row[2]),
      expectedAmount: number(row[3]),
      paidAmount: row[4] == null || row[4] === '' ? null : number(row[4]),
      paidAt: row[5] == null || row[5] === '' ? null : serialToIso(row[5]),
      method: text(row[6]) as Payment['method'],
      status: text(row[7]) as Payment['status'],
      notes: text(row[8]),
      rowNumber: index + 2,
    }))

  return { departments, tenants, contracts, payments }
}

export async function markPaymentAsPaid(
  accessToken: string,
  payment: Payment,
  paymentDate: Date,
  method: Exclude<Payment['method'], ''> = 'QR',
) {
  const range = `Pagos!E${payment.rowNumber}:H${payment.rowNumber}`
  const query = new URLSearchParams({ valueInputOption: 'USER_ENTERED' })
  await googleFetch(
    accessToken,
    `${SHEETS_API}/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?${query}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [[payment.expectedAmount, isoToSerial(paymentDate), method, 'PAGADO']],
      }),
    },
  )
}
