import { Outlet } from 'react-router-dom'
import UserAreaLayout from './UserAreaLayout'

export default function AccountLayout() {
  return (
    <UserAreaLayout section="account">
      <Outlet />
    </UserAreaLayout>
  )
}
