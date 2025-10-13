'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { MagnifyingGlassIcon, DocumentTextIcon, SparklesIcon, ChartBarIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

const JobSearchSchema = z.object({
  keywords: z.string().min(3, 'Enter at least 3 characters'),
  location: z.string().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'any']).default('any'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive', 'any']).default('any'),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  remote: z.boolean().default(false),
  industry: z.string().optional(),
  company: z.string().optional()
})

type JobSearchData = z.infer<typeof JobSearchSchema>

interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description: string
  requirements: string[]
  postedDate: string
  source: string
  url: string
  matchScore: number
  keywordMatches: string[]
  missingSkills: string[]
  tailoredResume?: {
    id: string
    downloadUrl: string
    coverLetter: string
    applicationTips: string[]
  }
}

interface SearchFilters {
  sortBy: 'relevance' | 'date' | 'salary' | 'match-score'
  minMatchScore: number
  companies: string[]
  locations: string[]
}

export function JobMatchingEngine() {
  const [searchParams, setSearchParams] = useState<Partial<JobSearchData>>({
    jobType: 'any',
    experienceLevel: 'any',
    remote: false
  })
  const [uploadedResume, setUploadedResume] = useState<File | null>(null)
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    minMatchScore: 70,
    companies: [],
    locations: []
  })
  const [selectedJob, setSelectedJob] = useState<JobMatch | null>(null)

  const queryClient = useQueryClient()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedResume(acceptedFiles[0])
      toast.success('Resume uploaded successfully')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  // Search for jobs
  const jobSearchMutation = useMutation({
    mutationFn: async (data: JobSearchData) => {
      const formDataObj = new FormData()
      formDataObj.append('searchParams', JSON.stringify(data))
      formDataObj.append('filters', JSON.stringify(filters))

      if (uploadedResume) {
        formDataObj.append('resume', uploadedResume)
      }

      const response = await fetch('/api/ai/jobs/search', {
        method: 'POST',
        body: formDataObj
      })

      if (!response.ok) {
        throw new Error('Failed to search jobs')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success(`Found ${data.jobs.length} matching jobs`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to search jobs')
    }
  })

  // Tailor resume for specific job
  const tailorResumeMutation = useMutation({
    mutationFn: async (jobId: string) => {
      if (!uploadedResume) {
        throw new Error('Please upload your resume first')
      }

      const formData = new FormData()
      formData.append('jobId', jobId)
      formData.append('resume', uploadedResume)

      const response = await fetch('/api/ai/jobs/tailor-resume', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to tailor resume')
      }

      return response.json()
    },
    onSuccess: (data, jobId) => {
      toast.success('Resume tailored successfully!')

      // Update the job in cache with tailored resume data
      queryClient.setQueryData(['job-search'], (oldData: any) => {
        if (!oldData) return oldData

        const updatedJobs = oldData.jobs.map((job: JobMatch) =>
          job.id === jobId ? { ...job, tailoredResume: data.tailoredResume } : job
        )

        return { ...oldData, jobs: updatedJobs }
      })

      // Download the tailored resume
      const link = document.createElement('a')
      link.href = data.tailoredResume.downloadUrl
      link.download = `tailored-resume-${jobId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to tailor resume')
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const validatedData = JobSearchSchema.parse(searchParams)
      jobSearchMutation.mutate(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0]
        toast.error(firstError.message)
      } else {
        toast.error('Please check your search parameters')
      }
    }
  }

  const updateSearchParams = (field: string, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-green-400'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const jobs = jobSearchMutation.data?.jobs || []
  const searchStats = jobSearchMutation.data?.stats

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <MagnifyingGlassIcon className="h-8 w-8 text-indigo-600 mr-2" />
          <SparklesIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Intelligent Job Matching</h1>
        <p className="text-gray-600 mt-2">
          Find perfect job matches and get AI-tailored resumes for each opportunity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Upload your current resume for intelligent job matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                {uploadedResume ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedResume.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(uploadedResume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-indigo-600">Drop your resume here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-1">Drop resume here or click to select</p>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (max 10MB)</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle>Job Search Criteria</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords *</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., Senior Software Engineer, Machine Learning"
                    value={searchParams.keywords || ''}
                    onChange={(e) => updateSearchParams('keywords', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., San Francisco, CA or Remote"
                    value={searchParams.location || ''}
                    onChange={(e) => updateSearchParams('location', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select
                      value={searchParams.jobType || 'any'}
                      onValueChange={(value) => updateSearchParams('jobType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Select
                      value={searchParams.experienceLevel || 'any'}
                      onValueChange={(value) => updateSearchParams('experienceLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Level</SelectItem>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Min Salary</Label>
                    <Input
                      id="salaryMin"
                      placeholder="$100,000"
                      value={searchParams.salaryMin || ''}
                      onChange={(e) => updateSearchParams('salaryMin', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Max Salary</Label>
                    <Input
                      id="salaryMax"
                      placeholder="$200,000"
                      value={searchParams.salaryMax || ''}
                      onChange={(e) => updateSearchParams('salaryMax', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remote"
                    checked={searchParams.remote || false}
                    onChange={(e) => updateSearchParams('remote', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="remote">Include remote positions</Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={jobSearchMutation.isPending}
                >
                  {jobSearchMutation.isPending ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Find Matching Jobs
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Search Stats */}
          {searchStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Search Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Jobs Found:</span>
                  <span className="font-medium">{searchStats.totalJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">High Match (90%+):</span>
                  <span className="font-medium text-green-600">{searchStats.highMatch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Good Match (70-89%):</span>
                  <span className="font-medium text-yellow-600">{searchStats.goodMatch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Salary:</span>
                  <span className="font-medium">{searchStats.averageSalary}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filter Bar */}
          {jobs.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="sortBy" className="text-sm">Sort by:</Label>
                      <Select
                        value={filters.sortBy}
                        onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="match-score">Match Score</SelectItem>
                          <SelectItem value="date">Date Posted</SelectItem>
                          <SelectItem value="salary">Salary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Label className="text-sm">Min Match:</Label>
                      <Select
                        value={filters.minMatchScore.toString()}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, minMatchScore: parseInt(value) }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="60">60%</SelectItem>
                          <SelectItem value="70">70%</SelectItem>
                          <SelectItem value="80">80%</SelectItem>
                          <SelectItem value="90">90%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Showing {jobs.filter((job: JobMatch) => job.matchScore >= filters.minMatchScore).length} of {jobs.length} jobs
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Job Results */}
          {jobSearchMutation.isPending ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner className="mr-3" />
                  <span>Searching for jobs and analyzing matches...</span>
                </div>
              </CardContent>
            </Card>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs
                .filter((job: JobMatch) => job.matchScore >= filters.minMatchScore)
                .map((job: JobMatch) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {job.company} • {job.location}
                        </p>
                        {job.salary && (
                          <p className="text-sm text-green-600 font-medium mb-2">
                            {job.salary}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Posted {job.postedDate} via {job.source}
                        </p>
                      </div>

                      <div className="text-right ml-4">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`${getMatchScoreColor(job.matchScore)} h-2 rounded-full`}
                                style={{ width: `${job.matchScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{job.matchScore}%</span>
                          </div>
                        </div>
                        <Badge variant={job.matchScore >= 90 ? 'default' : job.matchScore >= 70 ? 'secondary' : 'outline'}>
                          {job.matchScore >= 90 ? 'Excellent Match' : job.matchScore >= 70 ? 'Good Match' : 'Fair Match'}
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Matching Skills:</h4>
                      <div className="flex flex-wrap gap-1">
                        {job.keywordMatches.slice(0, 8).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {job.keywordMatches.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.keywordMatches.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {job.missingSkills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills to Highlight:</h4>
                        <div className="flex flex-wrap gap-1">
                          {job.missingSkills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(job.url, '_blank')}
                      >
                        View Job
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => tailorResumeMutation.mutate(job.id)}
                        disabled={!uploadedResume || tailorResumeMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {tailorResumeMutation.isPending ? (
                          <>
                            <LoadingSpinner className="mr-2 h-3 w-3" />
                            Tailoring...
                          </>
                        ) : (
                          <>
                            <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
                            Tailor Resume
                          </>
                        )}
                      </Button>

                      {job.tailoredResume && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(job.tailoredResume!.downloadUrl, '_blank')}
                        >
                          Download Tailored
                        </Button>
                      )}
                    </div>

                    {job.tailoredResume && (
                      <Alert className="mt-4">
                        <SparklesIcon className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Resume tailored!</strong> This version is optimized for this specific job posting.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobSearchMutation.data ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or keywords
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Find Your Perfect Job?</h3>
                  <p className="text-gray-600 mb-4">
                    Upload your resume and start searching for AI-matched job opportunities
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}