import { Outlet } from 'react-router-dom'
import UserAreaLayout from '../account/UserAreaLayout'

export default function DashboardLayout() {
  return (
    <UserAreaLayout section="trading">
      <Outlet />
    </UserAreaLayout>
  )
}
