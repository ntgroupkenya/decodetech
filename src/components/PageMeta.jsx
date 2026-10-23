import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PAGE_META, applyPageMeta } from '../pageMeta'
import { logicalPath } from '../siteHosts'

// Keeps the tab title and search/social descriptions in step with the current page.
export default function PageMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Product, category and news pages set their own title, description and canonical link.
    if (pathname.startsWith('/product/') || pathname.startsWith('/category/') || pathname.startsWith('/news/')) return
    // On the shop address the home page is the Shop.
    const path = logicalPath(pathname)
    const key = path.length > 1 ? path.replace(/\/+$/, '') : path
    applyPageMeta({ ...(PAGE_META[key] || PAGE_META['/']), path: key })
  }, [pathname])

  return null
}
