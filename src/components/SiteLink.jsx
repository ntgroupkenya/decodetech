import { Link, useLocation } from 'react-router-dom'
import { hostKind, siteHref, targetHost } from '../siteHosts'

// A link that works across the main site and the shop subdomain: a normal in-page link when the
// target is on the same host, and a plain link to the other host's address when it is not.
export default function SiteLink({ to, state, children, ...props }) {
  const { pathname } = useLocation()
  const here = hostKind(pathname)
  const target = targetHost(to)

  if (here && target !== 'any' && target !== here) {
    return <a href={siteHref(target, to)} {...props}>{children}</a>
  }
  // The shop host's own "/" is the Shop page.
  const local = here === 'shop' && to === '/shop' ? '/' : to
  return <Link to={local} state={state} {...props}>{children}</Link>
}
