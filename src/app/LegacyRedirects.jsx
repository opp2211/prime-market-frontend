import { Navigate, useParams } from 'react-router-dom'

export function LegacyOfferEditRedirect() {
  const { offerCode } = useParams()
  return <Navigate to={`/dashboard/offers/${offerCode}/edit`} replace />
}

export function LegacyDepositRequestRedirect() {
  const { publicCode } = useParams()
  return <Navigate to={`/money/deposit-requests/${publicCode}`} replace />
}
