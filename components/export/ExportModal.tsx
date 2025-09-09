"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { WeekendCardGenerator } from "./WeekendCardGenerator"
import { ExportService } from "@/utils/export-utils"
import { exportTemplates } from "@/data/export-templates"
import type { WeekendSchedule } from "@/types/activity"
import type { ExportTemplate, ExportOptions, WeatherData } from "@/types/export"
import {
  Download, Share2, Calendar, FileText, Loader2, Check, X, Eye, Palette, Settings, Zap, Heart, Sparkles
} from "lucide-react"
import { formatOptions } from "@/data/data"

interface ExportModalProps {
  schedule: WeekendSchedule
  weather?: WeatherData
  trigger?: React.ReactNode
}

export default function ExportModal({ schedule, weather, trigger }: ExportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate>(exportTemplates[0])
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'pdf' | 'ics' | 'text'>('png')
  const [customMessage, setCustomMessage] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string>('')
  const [exportSuccess, setExportSuccess] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  const handleExport = async () => {
    if (!cardRef.current) {
      setExportStatus('Export element not ready. Please try again.')
      return
    }

    setIsExporting(true)
    setExportSuccess(false)
    setExportStatus('Preparing your beautiful export...')

    try {
      const options: ExportOptions = {
        template: selectedTemplate,
        format: selectedFormat,
        quality: 95,
  
        includeWeather: !!weather,
        customMessage
      }

      if (selectedFormat === 'ics') {
        setExportStatus('Creating calendar events...')
        const calendarData = ExportService.generateCalendarFile(schedule, 'My Weekendly Plan')
        const blob = new Blob([calendarData], { type: 'text/calendar' })
        await ExportService.downloadFile(blob, 'weekend-plan.ics')
        setExportStatus('Calendar file ready!')
      } else if (selectedFormat === 'text') {
        setExportStatus('Generating text summary...')
        const textSummary = ExportService.generateTextSummary(schedule, weather)
        const success = await ExportService.copyToClipboard(textSummary)
        setExportStatus(success ? 'Text copied to clipboard!' : 'Failed to copy text')
      } else if (selectedFormat === 'pdf') {
        setExportStatus('Creating PDF document...')
        const pdfBlob = await ExportService.exportAsPDF(cardRef.current)
        await ExportService.downloadFile(pdfBlob, 'weekend-plan.pdf')
        setExportStatus('PDF document ready!')
      } else {
        setExportStatus(`Creating ${selectedFormat.toUpperCase()} image...`)

        const imageUrl = await ExportService.exportAsImage(cardRef.current, options)

        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const filename = `weekend-plan-${Date.now()}.${selectedFormat}`
        await ExportService.downloadFile(blob, filename)
        setExportStatus('Image downloaded successfully!')
      }

      setExportSuccess(true)
      setTimeout(() => {
        setExportStatus('')
        setIsExporting(false)
        setExportSuccess(false)
      }, 3000)
    } catch (error: unknown) {
      console.error('Export failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Export failed. Please try again.'
      setExportStatus(errorMessage)
      setIsExporting(false)
      setTimeout(() => setExportStatus(''), 5000)
    }
  }

  const handleSocialShare = (platform: string) => {
    const shareData = ExportService.generateSocialShareData(schedule, platform)

    if (platform === 'twitter') {
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.content)}`
      window.open(url, '_blank')
    } else if (platform === 'facebook') {
      const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareData.content)}`
      window.open(url, '_blank')
    } else if (platform === 'whatsapp') {
      const url = `https://wa.me/?text=${encodeURIComponent(shareData.content)}`
      window.open(url, '_blank')
    }
  }


  const getTemplateIcon = (template: ExportTemplate) => {
    switch (template.type) {
      case 'instagram': return Heart
      case 'calendar': return Calendar
      case 'print': return FileText
      default: return Palette
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-1 sm:gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5">
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Export & Share</span>
            <span className="sm:hidden">Export</span>
            <Sparkles className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:min-w-5xl max-w-6xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
        <DialogHeader className="border-b pb-3 sm:pb-4">
          <DialogTitle className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span className="hidden sm:inline">Export Your Weekend Plan</span>
            <span className="sm:hidden">Export & Share</span>
          </DialogTitle>
          <p className="text-gray-600 text-xs sm:text-sm">Create beautiful visuals to share your perfect weekend</p>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
          <div className="lg:w-1/2 space-y-2 sm:space-y-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-700">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Live Preview</span>
              <span className="sm:hidden">Preview</span>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 h-[250px] sm:h-[350px] lg:h-[450px] overflow-hidden relative border">
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="border rounded-lg shadow-sm overflow-hidden bg-white"
                  style={{
                    width: selectedTemplate.aspectRatio === '9:16' ? '180px' :
                      selectedTemplate.aspectRatio === '1:1' ? '280px' :
                        selectedTemplate.aspectRatio === '2:3' ? '240px' :
                          selectedTemplate.aspectRatio === '4:3' ? '320px' :
                            selectedTemplate.aspectRatio === '16:9' ? '360px' : '180px',
                    height: selectedTemplate.aspectRatio === '9:16' ? '320px' :
                      selectedTemplate.aspectRatio === '1:1' ? '280px' :
                        selectedTemplate.aspectRatio === '2:3' ? '360px' :
                          selectedTemplate.aspectRatio === '4:3' ? '240px' :
                            selectedTemplate.aspectRatio === '16:9' ? '202px' : '320px',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      transform: selectedTemplate.aspectRatio === '9:16' ? 'scale(0.167)' :
                        selectedTemplate.aspectRatio === '1:1' ? 'scale(0.259)' :
                          selectedTemplate.aspectRatio === '2:3' ? 'scale(0.24)' :
                            selectedTemplate.aspectRatio === '4:3' ? 'scale(0.267)' :
                              selectedTemplate.aspectRatio === '16:9' ? 'scale(0.187)' : 'scale(0.167)',
                      transformOrigin: 'top left',
                      width: selectedTemplate.aspectRatio === '9:16' ? '1080px' :
                        selectedTemplate.aspectRatio === '1:1' ? '1080px' :
                          selectedTemplate.aspectRatio === '2:3' ? '1000px' :
                            selectedTemplate.aspectRatio === '4:3' ? '1200px' :
                              selectedTemplate.aspectRatio === '16:9' ? '1920px' : '1080px',
                      height: selectedTemplate.aspectRatio === '9:16' ? '1920px' :
                        selectedTemplate.aspectRatio === '1:1' ? '1080px' :
                          selectedTemplate.aspectRatio === '2:3' ? '1500px' :
                            selectedTemplate.aspectRatio === '4:3' ? '900px' :
                              selectedTemplate.aspectRatio === '16:9' ? '1080px' : '1920px'
                    }}
                  >
                    <WeekendCardGenerator
                      ref={cardRef}
                      schedule={schedule}
                      template={selectedTemplate}
                      weather={weather}
                      customMessage={customMessage}
               
                    />
                  </div>
                </div>
              </div>

              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                <div className="flex items-center gap-1 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span className="font-medium hidden sm:inline">{selectedTemplate.name}</span>
                  <span className="font-medium sm:hidden">{selectedTemplate.name.split(' ')[0]}</span>
                  <span className="text-gray-500 hidden sm:inline">({selectedTemplate.aspectRatio})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 overflow-y-auto space-y-3 sm:space-y-4 flex-1 min-h-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-700">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Choose Template</span>
                <span className="sm:hidden">Template</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {exportTemplates.map((template) => {
                  const TemplateIcon = getTemplateIcon(template)
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-2 sm:p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-sm touch-manipulation ${selectedTemplate.id === template.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-1 sm:p-1.5 rounded-md ${selectedTemplate.id === template.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <TemplateIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedTemplate.id === template.id ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs sm:text-sm text-gray-900">{template.name}</div>
                          <div className="text-xs text-gray-600 truncate hidden sm:block">{template.description}</div>
                          <div className="text-xs text-gray-500">
                            {template.aspectRatio}
                          </div>
                        </div>
                        {selectedTemplate.id === template.id && (
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-700">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Export Format</span>
                <span className="sm:hidden">Format</span>
              </div>

              <div className="space-y-2">
                {formatOptions.map((option) => {
                  const OptionIcon = option.icon
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFormat(option.id as 'png' | 'pdf' | 'ics' | 'text')}
                      className={`w-full p-2 sm:p-3 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-sm touch-manipulation ${selectedFormat === option.id
                          ? `${option.bgColor} ${option.borderColor} shadow-sm`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <OptionIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${selectedFormat === option.id ? option.color : 'text-gray-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs sm:text-sm text-gray-900">{option.name}</div>
                          <div className="text-xs text-gray-600 truncate hidden sm:block">{option.description}</div>
                        </div>
                        {selectedFormat === option.id && (
                          <Check className={`w-4 h-4 ${option.color} flex-shrink-0`} />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm sm:text-base font-semibold text-gray-700">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Personal Message</span>
                <span className="sm:hidden">Message</span>
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal touch..."
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-sm touch-manipulation"
                rows={2}
              />
            </div>

          

            <div className="border-t pt-4 sm:pt-6">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full gap-2 sm:gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                size="lg"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Creating your export...</span>
                    <span className="sm:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Export as {selectedFormat.toUpperCase()}</span>
                    <span className="sm:hidden">Export {selectedFormat.toUpperCase()}</span>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </Button>

              {exportStatus && (
                <div className={`mt-3 sm:mt-4 text-center text-xs sm:text-sm p-3 sm:p-4 rounded-xl ${exportSuccess
                    ? 'text-green-700 bg-green-50 border border-green-200'
                    : exportStatus.includes('Failed') || exportStatus.includes('Error')
                      ? 'text-red-700 bg-red-50 border border-red-200'
                      : 'text-blue-700 bg-blue-50 border border-blue-200'
                  }`}>
                  <div className="flex items-center justify-center gap-2">
                    {exportSuccess ? (
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : exportStatus.includes('Failed') || exportStatus.includes('Error') ? (
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    )}
                    {exportStatus}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4 sm:pt-6">
              <div className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">Quick Share</div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialShare('twitter')}
                  className="text-blue-500 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 touch-manipulation text-xs sm:text-sm py-2"
                >
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialShare('facebook')}
                  className="text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 touch-manipulation text-xs sm:text-sm py-2"
                >
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSocialShare('whatsapp')}
                  className="text-green-600 hover:bg-green-50 hover:border-green-300 transition-colors duration-200 touch-manipulation text-xs sm:text-sm py-2"
                >
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}