import { useParams } from 'react-router-dom'
import OfferForm from './OfferForm'

export default function OfferEditPage() {
  const { offerCode } = useParams()
  return <OfferForm mode="edit" offerCode={offerCode} />
}
