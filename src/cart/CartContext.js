import { createContext } from 'react'

export const CartContext = createContext({
  items: [],
  count: 0,
  isOpen: false,
  notice: null,
  add: () => {},
  setQty: () => {},
  remove: () => {},
  clear: () => {},
  open: () => {},
  close: () => {},
})
