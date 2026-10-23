import { useEffect, useState } from 'react'
import { api } from './api'

let cache = null

// Published news posts. Pre-rendered pages carry the list they were built from (window.__POSTS__) so the
// browser's first render matches the HTML; the live list then replaces it.
function preloadedPosts() {
  const list = typeof window !== 'undefined' ? window.__POSTS__ : globalThis.__SSR_POSTS__
  return Array.isArray(list) ? list : []
}

// `loaded` is false until the live list has arrived (or failed), so a page can tell "not found" from "still loading".
export default function usePosts() {
  const [state, setState] = useState(() => ({ posts: cache || preloadedPosts(), loaded: Boolean(cache) }))

  useEffect(() => {
    let cancelled = false
    api('/posts')
      .then((data) => {
        if (cancelled) return
        cache = Array.isArray(data?.posts) ? data.posts : []
        setState({ posts: cache, loaded: true })
      })
      .catch(() => !cancelled && setState((s) => ({ ...s, loaded: true })))
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
