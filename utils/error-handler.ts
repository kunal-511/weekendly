export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  type: 'network' | 'storage' | 'compatibility' | 'data' | 'unknown'
  recoverable: boolean
}

export class ErrorHandler {
  static handleError(error: Error | unknown): UserFriendlyError {
    console.error('Error occurred:', error)

    if (error instanceof Error) {
      return this.categorizeError(error)
    }

    return {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      recoverable: true,
    }
  }

  private static categorizeError(error: Error): UserFriendlyError {


    // Network errors
    if (this.isNetworkError(error)) {
      return {
        title: 'Connection Issue',
        message: "Looks like you're offline. No worries, keep planning! Your changes will save locally.",
        action: 'Check your internet connection and try again',
        type: 'network',
        recoverable: true,
      }
    }

    // Storage errors
    if (this.isStorageError(error)) {
      return {
        title: 'Storage Full',
        message: "Your device is running low on space. Let's clean up some old plans to make room for new ones!",
        action: 'Clear some browser data or old weekend plans',
        type: 'storage',
        recoverable: true,
      }
    }

    // Browser compatibility errors
    if (this.isCompatibilityError(error)) {
      return {
        title: 'Browser Compatibility',
        message: "This feature works best in modern browsers. Here's an alternative approach!",
        action: 'Update your browser or try a different one',
        type: 'compatibility',
        recoverable: true,
      }
    }

    // Data corruption/loss errors
    if (this.isDataError(error)) {
      return {
        title: 'Data Recovery',
        message: "We couldn't save your changes, but don't worry - here's what we recovered!",
        action: 'Your recent changes have been restored from backup',
        type: 'data',
        recoverable: true,
      }
    }

    // Default fallback
    return {
      title: 'Unexpected Error',
      message: 'Something unexpected happened, but your weekend plans are safe!',
      action: 'Try refreshing the page or contact support if this continues',
      type: 'unknown',
      recoverable: true,
    }
  }

  private static isNetworkError(error: Error): boolean {
    const networkIndicators = [
      'network',
      'fetch',
      'connection',
      'offline',
      'timeout',
      'cors',
      'failed to fetch'
    ]
    
    return networkIndicators.some(indicator => 
      error.message.toLowerCase().includes(indicator) ||
      error.name.toLowerCase().includes(indicator)
    )
  }

  private static isStorageError(error: Error): boolean {
    const storageIndicators = [
      'quotaexceedederror',
      'storage',
      'quota',
      'disk',
      'space',
      'domexception'
    ]
    
    return storageIndicators.some(indicator => 
      error.message.toLowerCase().includes(indicator) ||
      error.name.toLowerCase().includes(indicator)
    ) || error.name === 'QuotaExceededError'
  }

  private static isCompatibilityError(error: Error): boolean {
    const compatibilityIndicators = [
      'not supported',
      'not a function',
      'undefined',
      'intersectionobserver',
      'indexeddb',
      'localstorage'
    ]
    
    return compatibilityIndicators.some(indicator => 
      error.message.toLowerCase().includes(indicator)
    )
  }

  private static isDataError(error: Error): boolean {
    const dataIndicators = [
      'json',
      'parse',
      'serialize',
      'corrupt',
      'invalid',
      'malformed'
    ]
    
    return dataIndicators.some(indicator => 
      error.message.toLowerCase().includes(indicator)
    )
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt === maxRetries) {
          throw lastError
        }

        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }

  static isRecoverable(error: UserFriendlyError): boolean {
    return error.recoverable && error.type !== 'compatibility'
  }
}
