import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api'

// Loads an admin endpoint and exposes a reload function.
export default function useLoad(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setData(await api(path))
      setError('')
    } catch (e) {
      setError(e.message)
      if (e.status === 401) window.dispatchEvent(new Event('decode-admin-logout'))
    } finally {
      setLoading(false)
    }
  }, [path])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
  }, [reload])

  return { data, error, loading, reload }
}
