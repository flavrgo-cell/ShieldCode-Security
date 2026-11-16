import type { MockUser, Transaction } from './types'

export const MOCK_USERS: MockUser[] = [
  {
    id: 'u1',
    name: 'أيوب بن علي',
    phone: '0555123456',
    email: 'ayoub@example.com',
    password: '1234',
    balance: 150000,
    cardNumber: '4532 1234 5678 9012',
    cardExpiry: '12/27',
    cardCVV: '123',
    antiphishingCode: 'AYOUB2026',
    antiphishingEnabled: true,
    accountNumber: 'CCP-123456789',
  },
  {
    id: 'u2',
    name: 'سارة حمدي',
    phone: '0666789012',
    email: 'sara@example.com',
    password: '1234',
    balance: 85000,
    cardNumber: '4532 9876 5432 1098',
    cardExpiry: '08/26',
    cardCVV: '456',
    antiphishingCode: 'SARA2026',
    antiphishingEnabled: true,
    accountNumber: 'CCP-987654321',
  },
  {
    id: 'u3',
    name: 'كريم دريدي',
    phone: '0777456789',
    email: 'karim@example.com',
    password: '1234',
    balance: 220000,
    cardNumber: '4532 1111 2222 3333',
    cardExpiry: '03/28',
    cardCVV: '789',
    antiphishingCode: '',
    antiphishingEnabled: false,
    accountNumber: 'CCP-555666777',
  },
]

export let MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    fromUserId: 'u1',
    toUserId: 'u2',
    amount: 5000,
    type: 'transfer',
    description: 'تحويل إلى سارة حمدي',
    date: '2026-11-10T10:30:00Z',
    status: 'completed',
    antiphishingCodeIncluded: true,
  },
  {
    id: 'tx2',
    fromUserId: 'u2',
    toUserId: 'u1',
    amount: 2500,
    type: 'payment',
    description: 'دفع فاتورة كهرباء',
    date: '2026-11-09T14:15:00Z',
    status: 'completed',
    antiphishingCodeIncluded: true,
  },
  {
    id: 'tx3',
    fromUserId: 'u3',
    toUserId: 'u1',
    amount: 10000,
    type: 'transfer',
    description: 'تحويل من كريم دريدي',
    date: '2026-11-08T09:00:00Z',
    status: 'completed',
    antiphishingCodeIncluded: false,
  },
  {
    id: 'tx4',
    fromUserId: 'u1',
    toUserId: 'u3',
    amount: 1500,
    type: 'flexi',
    description: 'شحن رصيد فليكسي - 0777456789',
    date: '2026-11-07T16:45:00Z',
    status: 'completed',
    antiphishingCodeIncluded: true,
  },
  {
    id: 'tx5',
    fromUserId: 'u2',
    toUserId: 'u2',
    amount: 3200,
    type: 'purchase',
    description: 'شراء من متجر الإلكترونيات',
    date: '2026-11-06T11:20:00Z',
    status: 'completed',
    antiphishingCodeIncluded: true,
  },
]

export function getUserByPhone(phone: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.phone === phone)
}

export function getUserByCard(cardNumber: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.cardNumber === cardNumber)
}

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id)
}

export function addTransaction(tx: Transaction): void {
  MOCK_TRANSACTIONS = [tx, ...MOCK_TRANSACTIONS]
}

export function updateUserBalance(userId: string, newBalance: number): void {
  const user = MOCK_USERS.find((u) => u.id === userId)
  if (user) {
    user.balance = newBalance
  }
}

export function updateUserAntiphishingCode(
  userId: string,
  code: string,
  enabled: boolean
): void {
  const user = MOCK_USERS.find((u) => u.id === userId)
  if (user) {
    user.antiphishingCode = code
    user.antiphishingEnabled = enabled
  }
}
