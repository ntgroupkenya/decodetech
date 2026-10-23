import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './CartContext'
import { CART_LIMITS, clampQty, readCart, writeCart } from './cartStorage'

export default function CartProvider({ children }) {
  // Starts empty so the pre-rendered page and the first browser render match; the saved cart loads right after.
  const [items, setItems] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [notice, setNotice] = useState(null)
  const [ready, setReady] = useState(false)

  // Load first, and only start saving once the saved cart is in state. Saving earlier would overwrite the
  // saved cart with the empty starting list.
  useEffect(() => {
    setItems(readCart()) // eslint-disable-line react-hooks/set-state-in-effect
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) writeCart(items)
  }, [items, ready])

  // The notice ("Added to cart") disappears on its own.
  useEffect(() => {
    if (!notice) return undefined
    const timer = setTimeout(() => setNotice(null), 3500)
    return () => clearTimeout(timer)
  }, [notice])

  const add = useCallback((product, qty = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) return current.map((item) => (item.id === product.id ? { ...item, qty: clampQty(item.qty + qty) } : item))
      if (current.length >= CART_LIMITS.maxLines) {
        setNotice({ text: `The cart holds up to ${CART_LIMITS.maxLines} different items. Send this order first.`, name: product.name, full: true })
        return current
      }
      return [...current, { id: product.id, qty: clampQty(qty) }]
    })
    setNotice((current) => (current?.full ? current : { text: 'Added to cart', name: product.name }))
  }, [])

  const setQty = useCallback((id, qty) => setItems((current) => current.map((item) => (item.id === id ? { ...item, qty: clampQty(qty) } : item))), [])
  const remove = useCallback((id) => setItems((current) => current.filter((item) => item.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])
  const open = useCallback(() => {
    setItems(readCart()) // pick up changes made on the other address
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ items, count: items.reduce((sum, item) => sum + item.qty, 0), isOpen, notice, add, setQty, remove, clear, open, close }),
    [items, isOpen, notice, add, setQty, remove, clear, open, close],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
