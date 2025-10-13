'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ResumeContextType {
  // Add resume context properties here
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const value = {}

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}