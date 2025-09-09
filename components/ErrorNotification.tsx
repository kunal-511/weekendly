'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserFriendlyError } from '@/utils/error-handler'

interface ErrorNotificationProps {
  error: UserFriendlyError | null
  onDismiss: () => void
  onRetry?: () => void
  autoHide?: boolean
  duration?: number
}

export default function ErrorNotification({ 
  error, 
  onDismiss, 
  onRetry,
  autoHide = false,
  duration = 5000 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) 
  }, [onDismiss])

  useEffect(() => {
    if (error) {
      setIsVisible(true)
      
      if (autoHide && error.type === 'network') {
        const timer = setTimeout(() => {
          handleDismiss()
        }, duration)
        
        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [error, autoHide, duration, handleDismiss])

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    }
    handleDismiss()
  }

  if (!error || !isVisible) return null

  const getColorClasses = () => {
    switch (error.type) {
      case 'network':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'storage':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'compatibility':
        return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'data':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  const getButtonColor = () => {
    switch (error.type) {
      case 'network':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'storage':
        return 'bg-orange-500 hover:bg-orange-600'
      case 'compatibility':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'data':
        return 'bg-green-500 hover:bg-green-600'
      default:
        return 'bg-red-500 hover:bg-red-600'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`
        rounded-xl border-2 p-4 shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getColorClasses()}
      `}>
        <div className="flex items-start gap-3">
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">
              {error.title}
            </h4>
            <p className="text-sm mb-3 opacity-90">
              {error.message}
            </p>
            
            {error.action && (
              <p className="text-xs opacity-75 mb-3">
                {error.action}
              </p>
            )}
            
            <div className="flex gap-2">
              {error.recoverable && onRetry && (
                <button
                  onClick={handleRetry}
                  className={`
                    px-3 py-1.5 text-xs font-medium text-white rounded-lg
                    transition-colors ${getButtonColor()}
                  `}
                >
                  Try Again
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-lg leading-none opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for managing error notifications
export function useErrorNotification() {
  const [error, setError] = useState<UserFriendlyError | null>(null)
  
  const showError = (error: UserFriendlyError) => {
    setError(error)
  }
  
  const clearError = () => {
    setError(null)
  }
  
  return {
    error,
    showError,
    clearError
  }
}
