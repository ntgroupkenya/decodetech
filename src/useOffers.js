import { useEffect, useState } from 'react'
import { api } from './api'
import useAuth from './auth/useAuth'

// Member offers (discounts, coupons, delivery deals). Empty for visitors who are not signed in.
export default function useOffers() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const memberId = user?.role === 'customer' || user?.role === 'admin' ? user.id : null

  useEffect(() => {
    let cancelled = false
    if (!memberId) return undefined
    api('/offers')
      .then((data) => !cancelled && setOffers(data.offers || []))
      .catch(() => !cancelled && setOffers([]))
    return () => {
      cancelled = true
    }
  }, [memberId])

  return memberId ? offers : []
}
