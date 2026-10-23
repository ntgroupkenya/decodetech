import { createContext } from 'react'

export const AuthContext = createContext({
  user: null,
  ready: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  setUser: () => {},
})
