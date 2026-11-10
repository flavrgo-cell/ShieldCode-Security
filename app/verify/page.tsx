import { Suspense } from 'react'
import { VerifyContent } from './verify-content'

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
