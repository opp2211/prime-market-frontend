import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getMyOffers, updateOffer } from '../../api/offers'
import { useI18n } from '../../app/i18n'
import { getErrorMessage } from '../../shared/lib/errors'
import OfferList from './OfferList'
import { getOfferCopy } from './offerCopy'

export default function MyOffersPage() {
  const { language } = useI18n()
  const copy = getOfferCopy(language)
  const location = useLocation()
  const navigate = useNavigate()
  const [offers, setOffers] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionOfferId, setActionOfferId] = useState(null)
  const [notice, setNotice] = useState(location.state?.offerNotice || '')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (location.state?.offerNotice) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    let active = true

    const loadOffers = async () => {
      setStatus('loading')
      setError('')
      try {
        const res = await getMyOffers()
        if (!active) return
        setOffers(Array.isArray(res?.data) ? res.data : [])
        setStatus('ready')
      } catch (err) {
        if (!active) return
        setError(getErrorMessage(err, copy.common.listError))
        setStatus('error')
      }
    }

    loadOffers()

    return () => {
      active = false
    }
  }, [copy.common.listError, language, reloadKey])

  async function handleStatusAction(offer, nextStatus) {
    if (!offer?.id || actionOfferId) return

    setActionOfferId(offer.id)
    setActionError('')

    try {
      await updateOffer(offer.id, { status: nextStatus })
      setReloadKey((value) => value + 1)
      setNotice(nextStatus === 'active' ? copy.common.publishSuccess : copy.common.pauseSuccess)
    } catch (err) {
      setActionError(getErrorMessage(err, copy.common.publishError))
    } finally {
      setActionOfferId(null)
    }
  }

  return (
    <div className="offer-page">
      <div className="card offer-hero">
        <div className="offer-hero__content">
          <span className="offer-hero__eyebrow">{copy.navLabel}</span>
          <h1 className="h1 account-page__title">{copy.list.title}</h1>
          <p className="offer-hero__subtitle">{copy.list.subtitle}</p>
        </div>
        <div className="offer-hero__actions">
          <Link to="/my-offers/new" className="btn btn--primary">
            {copy.list.createCta}
          </Link>
        </div>
        <div className="offer-hero__glow" aria-hidden="true" />
      </div>

      <OfferList
        copy={copy}
        language={language}
        offers={offers}
        isLoading={status === 'loading'}
        error={error}
        actionError={actionError}
        notice={notice}
        onRetry={() => setReloadKey((value) => value + 1)}
        onStatusAction={handleStatusAction}
        actionOfferId={actionOfferId}
      />
    </div>
  )
}
