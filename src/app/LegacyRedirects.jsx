import { Navigate, useParams } from 'react-router-dom'

export function LegacyOfferEditRedirect() {
  const { offerId } = useParams()
  return <Navigate to={`/dashboard/offers/${offerId}/edit`} replace />
}

export function LegacyDepositRequestRedirect() {
  const { publicId } = useParams()
  return <Navigate to={`/money/deposit-requests/${publicId}`} replace />
}
