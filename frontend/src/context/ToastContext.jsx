import { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast'

const ToastCtx = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type}
               onClose={() => removeToast(t.id)}/>
      ))}
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)