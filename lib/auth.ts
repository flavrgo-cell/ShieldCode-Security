import type { MockUser } from './types'
import { getUserByPhone, updateUserAntiphishingCode } from './mock-data'

const STORAGE_KEY = 'baridipay_current_user'

export function login(phone: string, password: string): MockUser | null {
  const user = getUserByPhone(phone)
  if (user && user.password === password) {
    saveCurrentUser(user)
    return user
  }
  return null
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function getCurrentUser(): MockUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MockUser
  } catch {
    return null
  }
}

export function saveCurrentUser(user: MockUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
}

export function updateCurrentUserCode(code: string, enabled: boolean): void {
  const user = getCurrentUser()
  if (!user) return
  user.antiphishingCode = code
  user.antiphishingEnabled = enabled
  saveCurrentUser(user)
  updateUserAntiphishingCode(user.id, code, enabled)
}
