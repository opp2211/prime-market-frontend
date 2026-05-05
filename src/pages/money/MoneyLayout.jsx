import { Outlet } from 'react-router-dom'
import UserAreaLayout from '../account/UserAreaLayout'

export default function MoneyLayout({ sidebarVariant = '' }) {
  return (
    <UserAreaLayout section="money" sidebarVariant={sidebarVariant}>
      <Outlet />
    </UserAreaLayout>
  )
}
