'use client'

import { createContext, useContext, ReactNode } from 'react'

interface JobSearchContextType {
  // Add job search context properties here
}

const JobSearchContext = createContext<JobSearchContextType | undefined>(undefined)

export function JobSearchProvider({ children }: { children: ReactNode }) {
  const value = {}

  return (
    <JobSearchContext.Provider value={value}>
      {children}
    </JobSearchContext.Provider>
  )
}

export function useJobSearch() {
  const context = useContext(JobSearchContext)
  if (context === undefined) {
    throw new Error('useJobSearch must be used within a JobSearchProvider')
  }
  return context
}