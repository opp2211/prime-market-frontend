import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Header from '../widgets/Header'
import { bootstrapAuth } from './auth'
import { I18nProvider } from './i18n'

export default function App() {
  useEffect(() => {
    bootstrapAuth()
  }, [])

  return (
    <I18nProvider>
      <div className="app">
        <Header />
        <main className="container">
          <Outlet />
        </main>
      </div>
    </I18nProvider>
  )
}
