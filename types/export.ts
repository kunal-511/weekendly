export interface ExportTemplate {
  id: string
  name: string
  description: string
  type: 'instagram' | 'calendar' | 'print'
  aspectRatio: string
  backgroundColor: string
  textColor: string
  accentColor: string
  font: string
  layout: 'minimal' | 'vibrant' | 'elegant' | 'playful'
}

export interface ExportOptions {
  template: ExportTemplate
  format: 'png'  | 'pdf' | 'ics' | 'text'
  quality: number
  includeWeather: boolean
  customMessage?: string
  socialPlatform?: 'instagram' | 'twitter' | 'facebook' | 'whatsapp'
}

export interface SocialShareData {
  platform: 'instagram' | 'twitter' | 'facebook' | 'whatsapp' | 'linkedin'
  content: string
  hashtags: string[]
  url?: string
  imageUrl?: string
}

export interface WeatherData {
  location: string
  saturday: {
    temperature: number
    condition: string
    icon: string
    precipitation: number
  }
  sunday: {
    temperature: number
    condition: string
    icon: string
    precipitation: number
  }
}

export interface ExportAnalytics {
  exportId: string
  templateUsed: string
  format: string
  timestamp: Date
  socialShares: number
  views: number
}