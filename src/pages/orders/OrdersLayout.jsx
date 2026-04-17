import { Outlet, useLocation } from 'react-router-dom'
import UserAreaLayout from '../account/UserAreaLayout'

export default function OrdersLayout() {
  const location = useLocation()
  const isWorkspace = location.pathname.startsWith('/orders/')

  return (
    <UserAreaLayout variant={isWorkspace ? 'workspace' : 'default'}>
      <Outlet />
    </UserAreaLayout>
  )
}
