import { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from './App'
import {
  LegacyDepositRequestRedirect,
  LegacyOfferEditRedirect,
} from './LegacyRedirects'
import RouteFallback from './RouteFallback'
import UserAreaPlaceholder from '../pages/account/UserAreaPlaceholder'

const Home = lazy(() => import('../pages/Home'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const CheckEmail = lazy(() => import('../pages/CheckEmail'))
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'))
const AccountLayout = lazy(() => import('../pages/account/AccountLayout'))
const Profile = lazy(() => import('../pages/account/Profile'))
const Wallet = lazy(() => import('../pages/account/Wallet'))
const DepositBalance = lazy(() => import('../pages/account/DepositBalance'))
const DepositRequests = lazy(() => import('../pages/account/DepositRequests'))
const DepositRequest = lazy(() => import('../pages/account/DepositRequest'))
const BackofficeLayout = lazy(() => import('../pages/backoffice/BackofficeLayout'))
const BackofficeHome = lazy(() => import('../pages/backoffice/BackofficeHome'))
const BackofficeDepositRequests = lazy(() => import('../pages/backoffice/DepositRequests'))
const BackofficeDepositRequest = lazy(() => import('../pages/backoffice/DepositRequest'))
const BackofficeDisputesQueue = lazy(() => import('../pages/backoffice/DisputesQueue'))
const BackofficeDisputeReview = lazy(() => import('../pages/backoffice/DisputeReview'))
const MyOffersPage = lazy(() => import('../pages/myOffers/MyOffersPage'))
const OfferCreatePage = lazy(() => import('../pages/myOffers/OfferCreatePage'))
const OfferEditPage = lazy(() => import('../pages/myOffers/OfferEditPage'))
const MarketPage = lazy(() => import('../pages/market/MarketPage'))
const OrdersLayout = lazy(() => import('../pages/orders/OrdersLayout'))
const MyOrdersPage = lazy(() => import('../pages/orders/MyOrdersPage'))
const OrderDetailsPage = lazy(() => import('../pages/orders/OrderDetailsPage'))
const DashboardLayout = lazy(() => import('../pages/dashboard/DashboardLayout'))
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome'))
const MoneyLayout = lazy(() => import('../pages/money/MoneyLayout'))

function lazyElement(LazyComponent, props = {}) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: lazyElement(Home) },
      { path: 'market', element: lazyElement(MarketPage) },
      { path: 'login', element: lazyElement(Login) },
      { path: 'register', element: lazyElement(Register) },
      { path: 'check-email', element: lazyElement(CheckEmail) },
      { path: 'verify-email', element: lazyElement(VerifyEmail) },
      {
        path: 'dashboard',
        element: lazyElement(DashboardLayout),
        children: [
          { index: true, element: lazyElement(DashboardHome) },
          { path: 'offers', element: lazyElement(MyOffersPage) },
          { path: 'offers/new', element: lazyElement(OfferCreatePage) },
          { path: 'offers/:offerId/edit', element: lazyElement(OfferEditPage) },
          { path: 'orders', element: lazyElement(MyOrdersPage) },
        ],
      },
      {
        path: 'money',
        element: lazyElement(MoneyLayout),
        children: [
          { index: true, element: <Navigate to="wallet" replace /> },
          { path: 'wallet', element: lazyElement(Wallet) },
          { path: 'deposit', element: lazyElement(DepositBalance) },
          { path: 'deposit-requests', element: lazyElement(DepositRequests) },
          { path: 'deposit-requests/:publicId', element: lazyElement(DepositRequest) },
          {
            path: 'withdrawal-requests',
            element: <UserAreaPlaceholder kind="withdrawalRequests" />,
          },
        ],
      },
      {
        path: 'account',
        element: lazyElement(AccountLayout),
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'profile', element: lazyElement(Profile) },
          { path: 'email', element: <UserAreaPlaceholder kind="accountEmail" /> },
          { path: 'password', element: <UserAreaPlaceholder kind="accountPassword" /> },
          {
            path: 'integrations',
            element: <UserAreaPlaceholder kind="accountIntegrations" />,
          },
          { path: 'wallet', element: <Navigate to="/money/wallet" replace /> },
          { path: 'deposit', element: <Navigate to="/money/deposit" replace /> },
          {
            path: 'deposit-requests',
            element: <Navigate to="/money/deposit-requests" replace />,
          },
          {
            path: 'deposit-requests/:publicId',
            element: <LegacyDepositRequestRedirect />,
          },
        ],
      },
      { path: 'my-offers', element: <Navigate to="/dashboard/offers" replace /> },
      { path: 'my-offers/new', element: <Navigate to="/dashboard/offers/new" replace /> },
      { path: 'my-offers/:offerId/edit', element: <LegacyOfferEditRedirect /> },
      {
        path: 'my-orders',
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: 'orders',
        element: lazyElement(OrdersLayout),
        children: [{ path: ':orderId', element: lazyElement(OrderDetailsPage) }],
      },
      {
        path: 'backoffice',
        element: lazyElement(BackofficeLayout),
        children: [
          { index: true, element: lazyElement(BackofficeHome) },
          {
            path: 'deposit-requests',
            element: lazyElement(BackofficeDepositRequests),
          },
          {
            path: 'deposit-requests/:publicId',
            element: lazyElement(BackofficeDepositRequest),
          },
          {
            path: 'disputes',
            element: lazyElement(BackofficeDisputesQueue),
          },
          {
            path: 'disputes/:disputeId',
            element: lazyElement(BackofficeDisputeReview),
          },
        ],
      },
    ],
  },
])
