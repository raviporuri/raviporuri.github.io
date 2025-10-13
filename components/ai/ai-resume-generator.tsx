'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { DocumentTextIcon, CloudArrowUpIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'react-hot-toast'
import { z } from 'zod'

const RESUME_TEMPLATES = [
  { id: 'professional', name: 'Professional', description: 'Clean, corporate-friendly design' },
  { id: 'modern', name: 'Modern', description: 'Contemporary layout with color accents' },
  { id: 'executive', name: 'Executive', description: 'Senior-level leadership focused' },
  { id: 'technical', name: 'Technical', description: 'Developer and engineer optimized' },
  { id: 'creative', name: 'Creative', description: 'Design and marketing roles' },
  { id: 'academic', name: 'Academic', description: 'Research and education focused' },
  { id: 'international', name: 'International', description: 'Global format compliance' }
]

const COUNTRY_FORMATS = [
  { code: 'US', name: 'United States', format: 'US Standard' },
  { code: 'UK', name: 'United Kingdom', format: 'UK CV Format' },
  { code: 'DE', name: 'Germany', format: 'German Lebenslauf' },
  { code: 'FR', name: 'France', format: 'French CV Format' },
  { code: 'CA', name: 'Canada', format: 'Canadian Resume' },
  { code: 'AU', name: 'Australia', format: 'Australian CV' },
  { code: 'SG', name: 'Singapore', format: 'Singapore Format' },
  { code: 'IN', name: 'India', format: 'Indian Resume' }
]

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Marketing', 'Sales', 'Operations',
  'Consulting', 'Education', 'Manufacturing', 'Retail', 'Real Estate', 'Legal'
]

const ResumeGenerationSchema = z.object({
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  template: z.string().min(1, 'Please select a template'),
  country: z.string().min(1, 'Please select a country format'),
  industry: z.string().min(1, 'Please select an industry'),
  targetRole: z.string().min(1, 'Please specify the target role'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  customizations: z.object({
    includePhoto: z.boolean().default(false),
    colorScheme: z.string().default('blue'),
    fontStyle: z.string().default('modern'),
    sections: z.array(z.string()).default(['experience', 'education', 'skills'])
  }).optional()
})

type ResumeGenerationData = z.infer<typeof ResumeGenerationSchema>

export function AIResumeGenerator() {
  const [formData, setFormData] = useState<Partial<ResumeGenerationData>>({
    template: 'professional',
    country: 'US',
    industry: 'Technology',
    experienceLevel: 'senior',
    customizations: {
      includePhoto: false,
      colorScheme: 'blue',
      fontStyle: 'modern',
      sections: ['experience', 'education', 'skills']
    }
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
    toast.success(`Uploaded ${acceptedFiles.length} file(s)`)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const generateResumeMutation = useMutation({
    mutationFn: async (data: ResumeGenerationData) => {
      const formDataObj = new FormData()

      // Add form data
      formDataObj.append('data', JSON.stringify(data))

      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        formDataObj.append(`file_${index}`, file)
      })

      const response = await fetch('/api/ai/resume/generate', {
        method: 'POST',
        body: formDataObj
      })

      if (!response.ok) {
        throw new Error('Failed to generate resume')
      }

      return response.json()
    },
    onSuccess: (data) => {
      toast.success('Resume generated successfully!')
      // Download the PDF
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.download = `resume_${data.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate resume')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const validatedData = ResumeGenerationSchema.parse(formData)
      generateResumeMutation.mutate(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0]
        toast.error(firstError.message)
      } else {
        toast.error('Please check your inputs and try again')
      }
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <SparklesIcon className="h-8 w-8 text-indigo-600 mr-2" />
          <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AI Resume Generator</h1>
        <p className="text-gray-600 mt-2">
          Generate ATS-optimized resumes tailored to any job posting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide the job posting details for AI-powered optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description *</Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the complete job description here..."
                value={formData.jobDescription || ''}
                onChange={(e) => updateFormData('jobDescription', e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role *</Label>
                <Input
                  id="targetRole"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.targetRole || ''}
                  onChange={(e) => updateFormData('targetRole', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={formData.industry || ''}
                  onValueChange={(value) => updateFormData('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select
                value={formData.experienceLevel || ''}
                onValueChange={(value) => updateFormData('experienceLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid Level (3-7 years)</SelectItem>
                  <SelectItem value="senior">Senior Level (8-15 years)</SelectItem>
                  <SelectItem value="executive">Executive (15+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Template & Format</CardTitle>
            <CardDescription>
              Choose your preferred template and country-specific formatting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {RESUME_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.template === template.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => updateFormData('template', template.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    {formData.template === template.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country Format *</Label>
              <Select
                value={formData.country || ''}
                onValueChange={(value) => updateFormData('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country format" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_FORMATS.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} - {country.format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Existing Resume (Optional)</CardTitle>
            <CardDescription>
              Upload your current resume to extract information and improve accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-indigo-600">Drop your files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop resume files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX, TXT (max 10MB each)
                  </p>
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Uploaded Files:</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={generateResumeMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {generateResumeMutation.isPending ? (
              <>
                <LoadingSpinner className="mr-2" />
                Generating Resume...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Generate AI Resume
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>What You Get</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">ATS Optimization</h4>
                <p className="text-sm text-gray-600">Passes through applicant tracking systems</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Keyword Matching</h4>
                <p className="text-sm text-gray-600">Tailored to job description keywords</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Professional Templates</h4>
                <p className="text-sm text-gray-600">Industry-specific formatting</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium">Country Compliance</h4>
                <p className="text-sm text-gray-600">Follows local resume standards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}