import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGE_META, applyPageMeta } from '../pageMeta'

// Keeps the tab title and search/social descriptions in step with the current page.
export default function PageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Product pages set their own title, description and canonical link.
    if (pathname.startsWith('/product/')) return
    const key = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
    applyPageMeta({ ...(PAGE_META[key] || PAGE_META['/']), path: key in PAGE_META ? key : '/' })
  }, [pathname])

  return null
}
