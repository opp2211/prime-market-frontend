import { useParams } from 'react-router-dom'
import OfferForm from './OfferForm'

export default function OfferEditPage() {
  const { offerId } = useParams()
  return <OfferForm mode="edit" offerId={offerId} />
}
