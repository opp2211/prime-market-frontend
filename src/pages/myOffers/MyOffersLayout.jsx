import { Outlet } from 'react-router-dom'
import UserAreaLayout from '../account/UserAreaLayout'

export default function MyOffersLayout() {
  return (
    <UserAreaLayout>
      <Outlet />
    </UserAreaLayout>
  )
}
