import type { WeekendSchedule } from "@/types/activity"
import type { MoodFilters } from "@/components/MoodFilters"

interface UserPreferences {
  selectedCategory: string
  moodFilters: MoodFilters
  searchQuery: string
  currentTheme: string
}

interface AppData {
  weekendSchedule: WeekendSchedule
  lastUpdated: Date
}

class IndexedDBService {
  private dbName = "WeekendlyApp"
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve()
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("weekendSchedule")) {
          const scheduleStore = db.createObjectStore("weekendSchedule", { keyPath: "id" })
          scheduleStore.createIndex("lastUpdated", "lastUpdated", { unique: false })
        }

        if (!db.objectStoreNames.contains("userPreferences")) {
          db.createObjectStore("userPreferences", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("gamificationData")) {
          db.createObjectStore("gamificationData", { keyPath: "id" })
        }
      }
    })
  }

  async saveWeekendSchedule(schedule: WeekendSchedule): Promise<void> {
    if (!this.db) {
      console.warn("IndexedDB not initialized")
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["weekendSchedule"], "readwrite")
      const store = transaction.objectStore("weekendSchedule")
      
      const data = {
        id: "current",
        schedule,
        lastUpdated: new Date()
      }

      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => {
        console.error("Failed to save weekend schedule:", request.error)
        reject(request.error)
      }
    })
  }

  async loadWeekendSchedule(): Promise<WeekendSchedule | null> {
    if (!this.db) {
      console.warn("IndexedDB not initialized")
      return null
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["weekendSchedule"], "readonly")
      const store = transaction.objectStore("weekendSchedule")
      const request = store.get("current")

      request.onsuccess = () => {
        const result = request.result
        if (result && result.schedule) {
          resolve(result.schedule)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        console.error("Failed to load weekend schedule:", request.error)
        reject(request.error)
      }
    })
  }


  async clearAllData(): Promise<void> {
    if (!this.db) {
      console.warn("IndexedDB not initialized")
      return
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["weekendSchedule", "userPreferences", "gamificationData"], 
        "readwrite"
      )
      
      const promises = [
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore("weekendSchedule").clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore("userPreferences").clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
        new Promise<void>((resolve, reject) => {
          const request = transaction.objectStore("gamificationData").clear()
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        })
      ]

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject)
    })
  }

}

// Create a singleton instance
const indexedDBService = new IndexedDBService()

export default indexedDBService
export type { UserPreferences, AppData }
