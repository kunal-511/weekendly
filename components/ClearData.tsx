"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react"

interface ClearDataProps {
  onClearData: () => Promise<void>
  trigger?: React.ReactNode
}

export default function ClearData({ onClearData, trigger }: ClearDataProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  const handleClearData = async () => {
    try {
      setIsLoading(true)
      setStatus('Clearing all data...')

      await onClearData()
      setStatus('All data cleared successfully!')
      setShowConfirmClear(false)

      setTimeout(() => {
        setStatus('')
        setIsOpen(false)
      }, 2000)
    } catch (error) {
      console.error('Clear data failed:', error)
      setStatus('Failed to clear data. Please try again.')
      setTimeout(() => setStatus(''), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="destructive" className="gap-2 bg-red-600 text-white text-xl font-bold cursor-pointer">
              Reset
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Reset Plans
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {status && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${status.includes('successfully') ? 'bg-green-50 text-green-700' :
                status.includes('failed') || status.includes('Failed') ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                {status.includes('successfully') && <CheckCircle className="w-4 h-4" />}
                {(status.includes('failed') || status.includes('Failed')) && <X className="w-4 h-4" />}
                <span className="text-sm">{status}</span>
              </div>
            )}

            {!showConfirmClear ? (
              <div className="space-y-3">


                <Button
                  onClick={() => setShowConfirmClear(true)}
                  disabled={isLoading}
                  className="w-full justify-start gap-2 cursor-pointer hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset All
                  <span className="text-xs opacity-75 ml-auto">Reset everything</span>
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}

                  className="w-full justify-start gap-2 cursor-pointer bg-white text-black hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Clear All Data?</div>
                    <div className="text-sm opacity-90">
                      This will permanently delete all your weekend plans, preferences.
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowConfirmClear(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleClearData}
                    variant="destructive"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Reset...' : 'Yes, Reset All'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
