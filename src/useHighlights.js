import { useEffect, useState } from 'react'
import { api } from './api'

// Ids of hot products, best sellers and most clicked products. Empty until the API answers.
export default function useHighlights() {
  const [highlights, setHighlights] = useState({ hot: [], bestSellers: [], mostClicked: [] })

  useEffect(() => {
    let cancelled = false
    api('/products/highlights')
      .then((data) => !cancelled && setHighlights({ hot: data.hot || [], bestSellers: data.bestSellers || [], mostClicked: data.mostClicked || [] }))
      // No API (static preview): the pre-rendered product list still says which products are hot.
      .catch(() => {
        const list = typeof window !== 'undefined' && Array.isArray(window.__PRODUCTS__) ? window.__PRODUCTS__ : []
        if (!cancelled) setHighlights({ hot: list.filter((p) => p.hot).map((p) => p.id), bestSellers: [], mostClicked: [] })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return highlights
}
