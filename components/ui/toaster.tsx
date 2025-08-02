'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastCount = 0
let toasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

function genId() {
  toastCount += 1
  return toastCount.toString()
}

export function useToast() {
  const [, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = genId()
    const newToast = { id, title, description, variant }
    toasts = [...toasts, newToast]
    listeners.forEach((listener) => listener(toasts))

    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      listeners.forEach((listener) => listener(toasts))
    }, 5000)
  }

  return { toast }
}

export function Toaster() {
  const [toastList, setToastList] = useState<Toast[]>([])

  useEffect(() => {
    listeners.push(setToastList)
    return () => {
      const index = listeners.indexOf(setToastList)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'rounded-lg p-4 shadow-lg max-w-sm',
            toast.variant === 'destructive'
              ? 'bg-red-600 text-white'
              : 'bg-white border'
          )}
        >
          {toast.title && (
            <div className="font-semibold">{toast.title}</div>
          )}
          {toast.description && (
            <div className="mt-1 text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}
