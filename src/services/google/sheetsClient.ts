import { GOOGLE_SHEET_ID } from '../../config/google'
import type {
  Contract,
  ContractInput,
  Department,
  Payment,
  PaymentUpdate,
  RentalDatabase,
  Tenant,
  TenantInput,
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

function isoToSerial(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const utc = Date.UTC(year, month - 1, day)
  return Math.round((utc - EXCEL_EPOCH) / DAY_IN_MS)
}

function nextId(prefix: string, ids: string[]) {
  const nextNumber = ids.reduce((highest, id) => {
    const match = id.match(/(\d+)$/)
    return Math.max(highest, match ? Number(match[1]) : 0)
  }, 0) + 1
  return `${prefix}-${String(nextNumber).padStart(3, '0')}`
}

function monthlyPeriods(startDate: string, endDate: string) {
  const [startYear, startMonth] = startDate.split('-').map(Number)
  const [endYear, endMonth] = endDate.split('-').map(Number)
  const periods: string[] = []
  let year = startYear
  let month = startMonth

  while (year < endYear || (year === endYear && month <= endMonth)) {
    periods.push(`${year}-${String(month).padStart(2, '0')}-01`)
    month += 1
    if (month === 13) {
      month = 1
      year += 1
    }
  }

  return periods
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
    'Contratos!A2:K1000',
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
    .map<Tenant>((row, index) => ({
      id: text(row[0]),
      fullName: text(row[1]),
      documentId: text(row[2]),
      phone: text(row[3]),
      status: text(row[4]) as Tenant['status'],
      rowNumber: index + 2,
    }))

  const contracts = contractRows
    .filter((row) => row[0])
    .map<Contract>((row, index) => ({
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
      actualExitDate: row[10] == null || row[10] === '' ? null : serialToIso(row[10]),
      rowNumber: index + 2,
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

async function batchUpdateValues(
  accessToken: string,
  data: Array<{ range: string; values: unknown[][] }>,
) {
  await googleFetch(
    accessToken,
    `${SHEETS_API}/${GOOGLE_SHEET_ID}/values:batchUpdate`,
    {
      method: 'POST',
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: data.map((item) => ({ ...item, majorDimension: 'ROWS' })),
      }),
    },
  )
}

export async function createTenantRow(
  accessToken: string,
  database: RentalDatabase,
  input: TenantInput,
) {
  if (database.tenants.some((item) => item.documentId === input.documentId)) {
    throw new Error('Ya existe un inquilino con ese carné de identidad.')
  }
  const tenant: Tenant = {
    id: nextId('INQ', database.tenants.map((item) => item.id)),
    ...input,
    status: 'INACTIVO',
    rowNumber: Math.max(1, ...database.tenants.map((item) => item.rowNumber)) + 1,
  }

  await batchUpdateValues(accessToken, [{
    range: `Inquilinos!A${tenant.rowNumber}:E${tenant.rowNumber}`,
    values: [[tenant.id, tenant.fullName, tenant.documentId, tenant.phone, tenant.status]],
  }])

  return tenant.id
}

export async function updateTenantRow(
  accessToken: string,
  tenant: Tenant,
  input: TenantInput,
) {
  await batchUpdateValues(accessToken, [{
    range: `Inquilinos!B${tenant.rowNumber}:D${tenant.rowNumber}`,
    values: [[input.fullName, input.documentId, input.phone]],
  }])
}

export async function createContractRows(
  accessToken: string,
  database: RentalDatabase,
  input: ContractInput,
) {
  const tenant = database.tenants.find((item) => item.id === input.tenantId)
  if (!tenant) throw new Error('El inquilino seleccionado ya no existe.')
  if (database.contracts.some((item) => item.tenantId === input.tenantId && item.status === 'ACTIVO')) {
    throw new Error('El inquilino ya tiene un contrato activo.')
  }
  if (database.contracts.some((item) => item.departmentId === input.departmentId && item.status === 'ACTIVO')) {
    throw new Error('El departamento ya tiene un contrato activo.')
  }

  const contractId = nextId('CON', database.contracts.map((item) => item.id))
  const contractRow = Math.max(1, ...database.contracts.map((item) => item.rowNumber)) + 1
  const firstPaymentRow = Math.max(1, ...database.payments.map((item) => item.rowNumber)) + 1
  const firstPaymentNumber = Number(nextId('PAG', database.payments.map((item) => item.id)).split('-')[1])
  const periods = monthlyPeriods(input.startDate, input.endDate)
  if (!periods.length) throw new Error('La fecha prevista de fin debe ser posterior al ingreso.')

  const paymentRows = periods.map((period, index) => [
    `PAG-${String(firstPaymentNumber + index).padStart(3, '0')}`,
    contractId,
    isoToSerial(period),
    input.monthlyAmount,
    '',
    '',
    '',
    'PENDIENTE',
    '',
  ])

  await batchUpdateValues(accessToken, [
    {
      range: `Contratos!A${contractRow}:K${contractRow}`,
      values: [[
        contractId,
        input.departmentId,
        input.tenantId,
        isoToSerial(input.startDate),
        isoToSerial(input.endDate),
        input.monthlyAmount,
        'BOB',
        'ULTIMO_DIA_MES',
        'ACTIVO',
        input.notes,
        '',
      ]],
    },
    {
      range: `Inquilinos!E${tenant.rowNumber}`,
      values: [['ACTIVO']],
    },
    {
      range: `Pagos!A${firstPaymentRow}:I${firstPaymentRow + paymentRows.length - 1}`,
      values: paymentRows,
    },
  ])
}

function periodDueDate(period: string) {
  const [year, month] = period.split('-').map(Number)
  return new Date(year, month, 0)
}

function isoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export async function finalizeContractRows(
  accessToken: string,
  database: RentalDatabase,
  contract: Contract,
  actualExitDate: string,
) {
  const tenant = database.tenants.find((item) => item.id === contract.tenantId)
  if (!tenant) throw new Error('No se encontró el inquilino del contrato.')
  const exitDate = isoDate(actualExitDate)
  const futurePayments = database.payments.filter(
    (payment) => payment.contractId === contract.id
      && payment.status === 'PENDIENTE'
      && periodDueDate(payment.period) > exitDate,
  )
  const cancellationNote = `Cancelado por salida el ${actualExitDate}`

  await batchUpdateValues(accessToken, [
    { range: `Contratos!I${contract.rowNumber}`, values: [['FINALIZADO']] },
    { range: `Contratos!K${contract.rowNumber}`, values: [[isoToSerial(actualExitDate)]] },
    { range: `Inquilinos!E${tenant.rowNumber}`, values: [['INACTIVO']] },
    ...futurePayments.flatMap((payment) => [
      { range: `Pagos!H${payment.rowNumber}`, values: [['CANCELADO']] },
      { range: `Pagos!I${payment.rowNumber}`, values: [[cancellationNote]] },
    ]),
  ])

  return futurePayments.length
}

export async function updatePaymentRow(
  accessToken: string,
  payment: Payment,
  update: PaymentUpdate,
) {
  const range = `Pagos!E${payment.rowNumber}:I${payment.rowNumber}`
  const query = new URLSearchParams({ valueInputOption: 'USER_ENTERED' })
  await googleFetch(
    accessToken,
    `${SHEETS_API}/${GOOGLE_SHEET_ID}/values/${encodeURIComponent(range)}?${query}`,
    {
      method: 'PUT',
      body: JSON.stringify({
        range,
        majorDimension: 'ROWS',
        values: [[
          update.paidAmount ?? '',
          update.paidAt ? isoToSerial(update.paidAt) : '',
          update.method,
          update.status,
          update.notes,
        ]],
      }),
    },
  )
}
