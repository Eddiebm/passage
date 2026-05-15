import { Suspense } from 'react'
import { CreateWizard } from './create-wizard'

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-full bg-[#FAFAF8] px-4 py-16 text-center text-sm text-[#1A1A1A]/70">
          Loading…
        </div>
      }
    >
      <CreateWizard />
    </Suspense>
  )
}
