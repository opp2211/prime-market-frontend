import { Outlet } from 'react-router-dom'
import UserAreaLayout from '../account/UserAreaLayout'

export default function OrdersLayout() {
  return (
    <UserAreaLayout>
      <Outlet />
    </UserAreaLayout>
  )
}
