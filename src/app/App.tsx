import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { DepartmentDetailPage } from '../pages/departments/DepartmentDetailPage'
import { DepartmentsPage } from '../pages/departments/DepartmentsPage'
import { NotFoundPage } from '../pages/not-found/NotFoundPage'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="departamentos" element={<DepartmentsPage />} />
          <Route
            path="departamentos/:departmentId"
            element={<DepartmentDetailPage />}
          />
          <Route path="inicio" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
