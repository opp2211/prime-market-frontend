import { Outlet } from 'react-router-dom'
import UserAreaLayout from '../account/UserAreaLayout'

export default function MoneyLayout() {
  return (
    <UserAreaLayout section="money">
      <Outlet />
    </UserAreaLayout>
  )
}
