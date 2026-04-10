import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CheckEmail from '../pages/CheckEmail'
import VerifyEmail from '../pages/VerifyEmail'
import AccountLayout from '../pages/account/AccountLayout'
import Profile from '../pages/account/Profile'
import Wallet from '../pages/account/Wallet'
import DepositBalance from '../pages/account/DepositBalance'
import DepositRequests from '../pages/account/DepositRequests'
import DepositRequest from '../pages/account/DepositRequest'
import BackofficeLayout from '../pages/backoffice/BackofficeLayout'
import BackofficeHome from '../pages/backoffice/BackofficeHome'
import BackofficeDepositRequests from '../pages/backoffice/DepositRequests'
import BackofficeDepositRequest from '../pages/backoffice/DepositRequest'
import MyOffersLayout from '../pages/myOffers/MyOffersLayout'
import MyOffersPage from '../pages/myOffers/MyOffersPage'
import OfferCreatePage from '../pages/myOffers/OfferCreatePage'
import OfferEditPage from '../pages/myOffers/OfferEditPage'
import MarketPage from '../pages/market/MarketPage'
import OrdersLayout from '../pages/orders/OrdersLayout'
import MyOrdersPage from '../pages/orders/MyOrdersPage'
import OrderDetailsPage from '../pages/orders/OrderDetailsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'market', element: <MarketPage /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'check-email', element: <CheckEmail /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      {
        path: 'account',
        element: <AccountLayout />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'profile', element: <Profile /> },
          { path: 'wallet', element: <Wallet /> },
          { path: 'deposit', element: <DepositBalance /> },
          { path: 'deposit-requests', element: <DepositRequests /> },
          { path: 'deposit-requests/:publicId', element: <DepositRequest /> },
        ],
      },
      {
        path: 'my-offers',
        element: <MyOffersLayout />,
        children: [
          { index: true, element: <MyOffersPage /> },
          { path: 'new', element: <OfferCreatePage /> },
          { path: ':offerId/edit', element: <OfferEditPage /> },
        ],
      },
      {
        path: 'my-orders',
        element: <OrdersLayout />,
        children: [{ index: true, element: <MyOrdersPage /> }],
      },
      {
        path: 'orders',
        element: <OrdersLayout />,
        children: [{ path: ':orderId', element: <OrderDetailsPage /> }],
      },
      {
        path: 'backoffice',
        element: <BackofficeLayout />,
        children: [
          { index: true, element: <BackofficeHome /> },
          { path: 'deposit-requests', element: <BackofficeDepositRequests /> },
          { path: 'deposit-requests/:publicId', element: <BackofficeDepositRequest /> },
        ],
      },
    ],
  },
])
