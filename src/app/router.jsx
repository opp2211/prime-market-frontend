import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import CheckEmail from '../pages/CheckEmail'
import VerifyEmail from '../pages/VerifyEmail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'check-email', element: <CheckEmail /> },
      { path: 'verify-email', element: <VerifyEmail /> },
    ],
  },
])
