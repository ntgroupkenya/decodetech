import { useEffect, useState } from 'react'
import { api } from './api'
import newProducts from './data/newProducts'

let cache = null

// Pages pre-rendered at build time carry the product list they were built from (window.__PRODUCTS__),
// so the browser's first render matches the pre-rendered HTML exactly. While rendering on the server
// the same list is passed in as globalThis.__SSR_PRODUCTS__.
function preloadedProducts() {
  const list = typeof window !== 'undefined' ? window.__PRODUCTS__ : globalThis.__SSR_PRODUCTS__
  return Array.isArray(list) && list.length > 0 ? list : null
}

// Products come from the admin-managed database. If the API is unreachable or still empty,
// fall back to the bundled catalogue so the public site never goes blank.
export default function useProducts() {
  const [products, setProducts] = useState(() => cache || preloadedProducts() || newProducts)

  useEffect(() => {
    let cancelled = false
    api('/products')
      .then((data) => {
        if (cancelled || !Array.isArray(data?.products) || data.products.length === 0) return
        cache = data.products
        setProducts(data.products)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return products
}
