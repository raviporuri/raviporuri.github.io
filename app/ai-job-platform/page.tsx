'use client'

import { useState, useEffect } from 'react'
import { jsPDF } from 'jspdf'
// Resume generation imports
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Stack,
  Badge,
  Box,
  TextInput,
  Select,
  Loader,
  Alert,
  Stepper,
  Divider,
  Progress,
  ActionIcon,
  Tooltip,
  MultiSelect,
  Switch,
  Paper,
  Anchor,
  ThemeIcon,
  Tabs,
  Grid,
  Modal,
  Textarea,
  ScrollArea
} from '@mantine/core'
import {
  IconSearch,
  IconFilter,
  IconStar,
  IconMapPin,
  IconCurrencyDollar,
  IconCalendar,
  IconExternalLink,
  IconFileText,
  IconBrain,
  IconTarget,
  IconTrendingUp,
  IconBuilding,
  IconSettings,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
  IconDownload,
  IconCopy,
  IconRocket,
  IconEye,
  IconChevronRight,
  IconUsers,
  IconTrophy,
  IconBrandLinkedin,
  IconArrowLeft,
  IconFileTypePdf,
  IconProgress,
  IconCheckCircle,
  IconX
} from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  remote: boolean
  salary?: string
  description: string
  url: string
  source: string
  postedDate: string
  relevanceScore?: number
  matchReasons?: string[]
}

interface ApplicationPackage {
  jobAnalysis: {
    relevanceScore: number
    matchStrengths: string[]
    potentialConcerns: string[]
    positioningStrategy: string
  }
  companyResearch: {
    overview: string
    recentNews: string[]
    cultureAndValues: string
    glassdoorEstimate: {
      rating: string
      pros: string[]
      cons: string[]
      salaryRange: string
    }
    hiringManager: {
      potentialTitles: string[]
      researchTips: string
      connectionStrategy: string
    }
    competitiveLandscape: string
  }
  resume: {
    formattedResume: string
    professionalSummary: string
    keyAchievements: string[]
    technicalSkills: string[]
    workExperience: string[]
    downloadUrl?: string
  }
  coverLetter: {
    fullText: string
    keyPoints: string[]
    customization: string
  }
  interviewPrep: {
    starStories: Array<{
      situation: string
      task: string
      action: string
      result: string
      relevance: string
    }>
    technicalDiscussion: string[]
    questionsToAsk: string[]
    externalReadingLinks: Array<{
      title: string
      url: string
      description: string
      skillArea: string
    }>
    behavioralQuestions: Array<{
      question: string
      suggestedResponse: string
      tips: string
    }>
    salaryNegotiation: {
      marketData: string
      valueProposition: string
      negotiationApproach: string
    }
  }
  applicationStrategy: {
    preferredChannel: string
    linkedinStrategy: string
    followUpPlan: string
    additionalResearch: string
    timeline: string[]
    roleAttributes: Array<{
      attribute: string
      description: string
      importance: string
    }>
    interviewTips: string[]
    industryInsights: string[]
    networkingContacts: Array<{
      name: string
      title: string
      department: string
      linkedinProfile: string
      connectionReason: string
      outreachStrategy: string
      roleRelevance: string
    }>
  }
}

export default function AIJobPlatformPage() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessKey, setAccessKey] = useState('')

  // Application state
  const [currentStep, setCurrentStep] = useState(0)
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null)
  const [applicationPackage, setApplicationPackage] = useState<ApplicationPackage | null>(null)

  // Search state
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState(25)
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [companies, setCompanies] = useState<string[]>([])
  const [excludeCompanies, setExcludeCompanies] = useState<string[]>([])
  const [timePeriod, setTimePeriod] = useState('7d')

  // UI state
  const [loading, setLoading] = useState(false)
  const [packageLoading, setPackageLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [resumeModalOpen, setResumeModalOpen] = useState(false)
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false)

  // New state for enhancements
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')
  const [analysisError, setAnalysisError] = useState('')
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState('pdf')

  // Check authentication
  useEffect(() => {
    const stored = sessionStorage.getItem('ai-job-platform-auth')
    if (stored === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthentication = () => {
    if (accessKey === 'ravi2025jobs' || accessKey === 'demo') {
      setIsAuthenticated(true)
      sessionStorage.setItem('ai-job-platform-auth', 'authenticated')
      setError('')
    } else {
      setError('Invalid access key. Please contact Ravi for access.')
    }
  }

  const searchJobs = async () => {
    setLoading(true)
    setError('')

    try {
      // Use LinkedIn Job Search API
      const response = await fetch('/api/linkedin-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          location,
          radius,
          remoteOnly,
          companies,
          excludeCompanies,
          timePeriod
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search LinkedIn jobs')
      }

      const sortedJobs = (data.jobs || []).sort((a: JobListing, b: JobListing) =>
        (b.relevanceScore || 0) - (a.relevanceScore || 0)
      )

      setJobs(sortedJobs)
      setCurrentStep(1)
    } catch (error) {
      console.error('LinkedIn job search error:', error)
      setError('Failed to search jobs from LinkedIn. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateApplicationPackage = async (job: JobListing) => {
    setSelectedJob(job)
    setPackageLoading(true)
    setCurrentStep(2)
    setAnalysisProgress(0)
    setAnalysisStage('Initializing AI analysis...')
    setAnalysisError('')

    try {
      // Simulate progress stages
      setAnalysisProgress(20)
      setAnalysisStage('Analyzing job requirements...')

      // Enhanced API call with dynamic prompt generation
      const response = await fetch('/api/ai-application-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          jobDescription: job.description,
          jobUrl: job.url,
          location: job.location,
          salary: job.salary,
          source: job.source,
          candidateProfile: {
            name: 'Ravi Poruri',
            currentRole: 'Founder & AI Product Leader at Equiti Ventures',
            experience: '25+ years technology leadership',
            expertise: ['AI/ML Platforms', 'Data Engineering', 'Cloud Architecture', 'Leadership'],
            achievements: [
              'Grew Cisco CX Cloud from MVP to $500M+ ARR',
              'Led Dropbox pre-IPO to IPO, doubled revenue $850M→$1.8B',
              'Generated $2B+ annual revenue at Yahoo'
            ]
          }
        })
      })

      setAnalysisProgress(50)
      setAnalysisStage('Researching company information...')

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate application package')
      }

      setAnalysisProgress(80)
      setAnalysisStage('Generating resume and cover letter...')

      // Simulate final processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      setAnalysisProgress(100)
      setAnalysisStage('Analysis complete!')

      setApplicationPackage(data)
      setCurrentStep(3)
    } catch (error) {
      console.error('Package generation error:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Failed to generate application package.')
      setError('Failed to generate application package.')
    } finally {
      setPackageLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!applicationPackage || !selectedJob) return

    setPdfGenerating(true)

    try {
      // Create PDF content
      const pdfContent = `
APPLICATION PACKAGE
${selectedJob.title} at ${selectedJob.company}
Generated on ${new Date().toLocaleDateString()}

====================================

JOB ANALYSIS
Relevance Score: ${applicationPackage.jobAnalysis.relevanceScore}%

Match Strengths:
${applicationPackage.jobAnalysis.matchStrengths.map(strength => `• ${strength}`).join('\n')}

Potential Concerns:
${applicationPackage.jobAnalysis.potentialConcerns.map(concern => `• ${concern}`).join('\n')}

Positioning Strategy:
${applicationPackage.jobAnalysis.positioningStrategy}

====================================

COMPANY RESEARCH
${applicationPackage.companyResearch.overview}

Recent Developments:
${applicationPackage.companyResearch.recentNews.map(news => `• ${news}`).join('\n')}

Culture & Values:
${applicationPackage.companyResearch.cultureAndValues}

Glassdoor Insights:
Rating: ${applicationPackage.companyResearch.glassdoorEstimate.rating}
Pros: ${applicationPackage.companyResearch.glassdoorEstimate.pros.join(', ')}
Cons: ${applicationPackage.companyResearch.glassdoorEstimate.cons.join(', ')}
Salary Range: ${applicationPackage.companyResearch.glassdoorEstimate.salaryRange}

====================================

RESUME
${applicationPackage.resume.formattedResume}

====================================

COVER LETTER
${applicationPackage.coverLetter.fullText}

====================================

INTERVIEW PREPARATION

STAR Stories:
${applicationPackage.interviewPrep.starStories.map((story, index) => `
Story ${index + 1}:
Situation: ${story.situation}
Task: ${story.task}
Action: ${story.action}
Result: ${story.result}
Relevance: ${story.relevance}
`).join('\n')}

Questions to Ask:
${applicationPackage.interviewPrep.questionsToAsk.map(q => `• ${q}`).join('\n')}

====================================

APPLICATION STRATEGY
${applicationPackage.applicationStrategy.preferredChannel}

LinkedIn Strategy:
${applicationPackage.applicationStrategy.linkedinStrategy}

Follow-up Plan:
${applicationPackage.applicationStrategy.followUpPlan}

Timeline:
${applicationPackage.applicationStrategy.timeline.map(item => `• ${item}`).join('\n')}
      `.trim()

      // Create actual PDF using jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Configure text styling
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)

      // Split content into lines that fit the page width
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const lineHeight = 6
      const maxLineWidth = pageWidth - (margin * 2)

      const lines = doc.splitTextToSize(pdfContent, maxLineWidth)
      const pageHeight = doc.internal.pageSize.getHeight()
      const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight)

      let currentLine = 0
      let currentPage = 1

      // Add content page by page
      while (currentLine < lines.length) {
        if (currentPage > 1) {
          doc.addPage()
        }

        const endLine = Math.min(currentLine + maxLinesPerPage, lines.length)
        const pageLines = lines.slice(currentLine, endLine)

        doc.text(pageLines, margin, margin + lineHeight)

        currentLine = endLine
        currentPage++
      }

      // Download the PDF
      const filename = `application_package_${selectedJob.company.toLowerCase().replace(/\s+/g, '_')}.pdf`
      doc.save(filename)

    } catch (error) {
      console.error('PDF generation error:', error)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setPdfGenerating(false)
    }
  }

  const generateResumePDF = (applicationPackage: ApplicationPackage, selectedJob: JobListing | null) => {
    if (!applicationPackage || !selectedJob) return

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      // Helper function to check if we need a new page
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
      }

      // Header - Name and Contact Info
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.text('Ravi Poruri', margin, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Founder & AI Product Leader | Technology Executive', margin, yPosition)
      yPosition += 6
      doc.text('Email: ravi@equitiventures.com | LinkedIn: linkedin.com/in/raviporuri', margin, yPosition)
      yPosition += 10

      // Professional Summary
      checkNewPage(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('PROFESSIONAL SUMMARY', margin, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const summaryText = applicationPackage.resume?.professionalSummary || applicationPackage.resume?.formattedResume || 'Strategic technology executive with proven track record of scaling enterprise platforms and driving innovation.'
      const summaryLines = doc.splitTextToSize(summaryText, pageWidth - (margin * 2))
      doc.text(summaryLines, margin, yPosition)
      yPosition += summaryLines.length * 4 + 8

      // Key Achievements
      checkNewPage(30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('KEY ACHIEVEMENTS', margin, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const achievements = applicationPackage.resume?.keyAchievements || [
        'Led technology scaling initiatives generating $3.2B+ revenue impact',
        'Grew Cisco CX Cloud from MVP to $500M+ ARR in 4 years',
        'Led Dropbox from pre-IPO to successful IPO, doubling revenue',
        'Building next-generation AI-powered technology platforms'
      ]
      achievements.forEach((achievement) => {
        checkNewPage(6)
        doc.text(`• ${achievement}`, margin, yPosition)
        yPosition += 5
      })
      yPosition += 5

      // Technical Skills
      checkNewPage(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('TECHNICAL SKILLS', margin, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const skills = applicationPackage.resume?.technicalSkills || ['AI/ML Platforms', 'Data Engineering', 'Cloud Architecture', 'Leadership', 'Digital Transformation']
      const skillsText = skills.join(' • ')
      const skillsLines = doc.splitTextToSize(skillsText, pageWidth - (margin * 2))
      doc.text(skillsLines, margin, yPosition)
      yPosition += skillsLines.length * 4 + 8

      // Work Experience
      checkNewPage(30)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const workExperience = applicationPackage.resume?.workExperience || [
        'Founder & AI Product Leader, Equitive Ventures (2024-Present)\n• Leading development of AI-powered applications and next-generation technology platforms\n• Building innovative solutions leveraging cutting-edge technology\n• Creating strategic partnerships in the AI and technology ecosystem',
        'Vice President Engineering, Cisco Systems (2019-2024)\n• Led Cisco CX Cloud from MVP to $500M+ ARR in 4 years\n• Managed 100+ person global engineering team across multiple products\n• Drove digital transformation and platform scaling initiatives',
        'Senior Engineering Manager, Dropbox (2015-2019)\n• Led engineering teams during critical pre-IPO to post-IPO transition\n• Contributed to revenue growth from $850M to $1.8B\n• Built scalable systems supporting millions of users globally'
      ]
      workExperience.forEach((experience) => {
        checkNewPage(15)
        const expLines = doc.splitTextToSize(experience, pageWidth - (margin * 2))
        doc.text(expLines, margin, yPosition)
        yPosition += expLines.length * 4 + 6
      })

      // Download the PDF
      const filename = `${selectedJob.company}_${selectedJob.title}_Resume.pdf`
      doc.save(filename)

    } catch (error) {
      console.error('Resume PDF generation error:', error)
      // Fallback to text download if PDF generation fails
      const blob = new Blob([applicationPackage.resume.formattedResume], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedJob?.company}_${selectedJob?.title}_Resume.txt`
      a.click()
    }
  }

  // Professional resume download with format selection
  const downloadResumeWithFormat = async (format: string) => {
    if (!applicationPackage || !selectedJob) return

    const filename = `${selectedJob.company}_${selectedJob.title}_Resume`

    switch (format) {
      case 'txt':
        downloadResumeAsTxt(filename)
        break
      case 'pdf':
        downloadResumeAsPDF(filename)
        break
      case 'doc':
        await downloadResumeAsDocx(filename)
        break
      default:
        downloadResumeAsTxt(filename)
    }
  }

  const downloadResumeAsTxt = (filename: string) => {
    if (!applicationPackage) return
    const blob = new Blob([applicationPackage.resume.formattedResume], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadResumeAsPDF = (filename: string) => {
    if (!applicationPackage || !selectedJob) return

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let yPosition = margin

      // Helper function to check if we need a new page
      const checkNewPage = (neededHeight: number) => {
        if (yPosition + neededHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          yPosition = margin
        }
      }

      // Header with name and contact info
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.text('Ravi Poruri', margin, yPosition)
      yPosition += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('raviporuri@gmail.com | LinkedIn: /in/raviporuri | San Francisco Bay Area', margin, yPosition)
      yPosition += 15

      // Professional Summary
      checkNewPage(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('PROFESSIONAL SUMMARY', margin, yPosition)
      yPosition += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const summaryLines = doc.splitTextToSize(applicationPackage.resume.professionalSummary, pageWidth - (margin * 2))
      doc.text(summaryLines, margin, yPosition)
      yPosition += summaryLines.length * 4 + 10

      // Key Achievements
      if (applicationPackage.resume.keyAchievements && applicationPackage.resume.keyAchievements.length > 0) {
        checkNewPage(20)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text('KEY ACHIEVEMENTS', margin, yPosition)
        yPosition += 8

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        applicationPackage.resume.keyAchievements.forEach((achievement) => {
          checkNewPage(8)
          const achievementLines = doc.splitTextToSize(`• ${achievement}`, pageWidth - (margin * 2))
          doc.text(achievementLines, margin, yPosition)
          yPosition += achievementLines.length * 4 + 2
        })
        yPosition += 8
      }

      // Work Experience
      checkNewPage(20)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition)
      yPosition += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const workExperience = [
        'Founder & AI Product Leader, Equitive Ventures (2024-Present)\n• Leading development of AI-powered applications and next-generation technology platforms\n• Building innovative solutions leveraging cutting-edge technology\n• Creating strategic partnerships in the AI and technology ecosystem',
        'Vice President Engineering, Cisco Systems (2019-2024)\n• Led Cisco CX Cloud from MVP to $500M+ ARR in 4 years\n• Managed 100+ person global engineering team across multiple products\n• Drove digital transformation and platform scaling initiatives',
        'Senior Engineering Manager, Dropbox (2015-2019)\n• Led engineering teams during critical pre-IPO to post-IPO transition\n• Contributed to revenue growth from $850M to $1.8B\n• Built scalable systems supporting millions of users globally'
      ]
      workExperience.forEach((experience) => {
        checkNewPage(15)
        const expLines = doc.splitTextToSize(experience, pageWidth - (margin * 2))
        doc.text(expLines, margin, yPosition)
        yPosition += expLines.length * 4 + 8
      })

      doc.save(`${filename}.pdf`)
    } catch (error) {
      console.error('Resume PDF generation error:', error)
      // Fallback to text
      downloadResumeAsTxt(filename)
    }
  }

  const downloadResumeAsDocx = async (filename: string) => {
    if (!applicationPackage) return

    try {
      // Generate HTML content for the resume
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .contact { font-size: 14px; color: #666; margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; text-decoration: underline; margin: 20px 0 10px 0; }
            .content { margin-bottom: 15px; }
            .achievement { margin-bottom: 8px; }
            .job-title { font-weight: bold; }
            .company { margin-bottom: 10px; }
            p { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">Ravi Poruri</div>
            <div class="contact">raviporuri@gmail.com | LinkedIn: /in/raviporuri | San Francisco Bay Area</div>
          </div>

          <div class="section-title">PROFESSIONAL SUMMARY</div>
          <div class="content">
            <p>${applicationPackage.resume.professionalSummary}</p>
          </div>

          ${applicationPackage.resume.keyAchievements && applicationPackage.resume.keyAchievements.length > 0 ? `
          <div class="section-title">KEY ACHIEVEMENTS</div>
          <div class="content">
            ${applicationPackage.resume.keyAchievements.map(achievement =>
              `<div class="achievement">• ${achievement}</div>`
            ).join('')}
          </div>
          ` : ''}

          <div class="section-title">PROFESSIONAL EXPERIENCE</div>
          <div class="content">
            <div class="company">
              <div class="job-title">Founder & AI Product Leader, Equitive Ventures (2024-Present)</div>
              <p>• Leading development of AI-powered applications and next-generation technology platforms</p>
              <p>• Building innovative solutions leveraging cutting-edge technology</p>
              <p>• Creating strategic partnerships in the AI and technology ecosystem</p>
            </div>

            <div class="company">
              <div class="job-title">Vice President Engineering, Cisco Systems (2020-2024)</div>
              <p>• Led Cisco CX Cloud from MVP to $500M+ ARR in 4 years</p>
              <p>• Managed 100+ person global engineering team across multiple products</p>
              <p>• Drove digital transformation and platform scaling initiatives</p>
            </div>

            <div class="company">
              <div class="job-title">Senior Engineering Manager, Dropbox (2017-2020)</div>
              <p>• Led engineering teams during critical pre-IPO to post-IPO transition</p>
              <p>• Contributed to revenue growth from $850M to $1.8B</p>
              <p>• Built scalable systems supporting millions of users globally</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Create a Word document using HTML format that Word can read
      const fullHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>90</w:Zoom>
              <w:DoNotPromptForConvert/>
              <w:DoNotShowInsertionsAndDeletions/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body { font-family: Arial, sans-serif; margin: 1in; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; }
            .name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .contact { font-size: 14px; color: #666; margin-bottom: 20px; }
            .section-title { font-size: 16px; font-weight: bold; text-decoration: underline; margin: 20px 0 10px 0; }
            .content { margin-bottom: 15px; }
            .achievement { margin-bottom: 8px; }
            .job-title { font-weight: bold; }
            .company { margin-bottom: 15px; }
            p { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">Ravi Poruri</div>
            <div class="contact">raviporuri@gmail.com | LinkedIn: /in/raviporuri | San Francisco Bay Area</div>
          </div>

          <div class="section-title">PROFESSIONAL SUMMARY</div>
          <div class="content">
            <p>${applicationPackage.resume.professionalSummary}</p>
          </div>

          ${applicationPackage.resume.keyAchievements && applicationPackage.resume.keyAchievements.length > 0 ? `
          <div class="section-title">KEY ACHIEVEMENTS</div>
          <div class="content">
            ${applicationPackage.resume.keyAchievements.map(achievement =>
              `<div class="achievement">• ${achievement}</div>`
            ).join('')}
          </div>
          ` : ''}

          <div class="section-title">PROFESSIONAL EXPERIENCE</div>
          <div class="content">
            <div class="company">
              <div class="job-title">Founder & AI Product Leader, Equitive Ventures (2024-Present)</div>
              <p>• Leading development of AI-powered applications and next-generation technology platforms</p>
              <p>• Building innovative solutions leveraging cutting-edge technology</p>
              <p>• Creating strategic partnerships in the AI and technology ecosystem</p>
            </div>

            <div class="company">
              <div class="job-title">Vice President Engineering, Cisco Systems (2020-2024)</div>
              <p>• Led Cisco CX Cloud from MVP to $500M+ ARR in 4 years</p>
              <p>• Managed 100+ person global engineering team across multiple products</p>
              <p>• Drove digital transformation and platform scaling initiatives</p>
            </div>

            <div class="company">
              <div class="job-title">Senior Engineering Manager, Dropbox (2017-2020)</div>
              <p>• Led engineering teams during critical pre-IPO to post-IPO transition</p>
              <p>• Contributed to revenue growth from $850M to $1.8B</p>
              <p>• Built scalable systems supporting millions of users globally</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Create blob with proper Word document MIME type
      const blob = new Blob([fullHtml], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.doc`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Resume DOC generation error:', error)
      // Fallback to text
      downloadResumeAsTxt(filename)
    }
  }

  const backToJobListings = () => {
    setCurrentStep(1)
    setSelectedJob(null)
    setApplicationPackage(null)
    setError('')
    setAnalysisError('')
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'gray'
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    return 'red'
  }

  const companyOptions = [
    'OpenAI', 'Anthropic', 'Databricks', 'Snowflake', 'Stripe', 'Airbnb',
    'Netflix', 'Uber', 'Meta', 'Google', 'Microsoft', 'Amazon', 'Apple'
  ]

  // Authentication gate
  if (!isAuthenticated) {
    return (
      <Container size="sm" py="4rem">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card shadow="lg" padding="xl" radius="md" style={{ maxWidth: 500, margin: '0 auto' }}>
            <Stack gap="lg" ta="center">
              <ThemeIcon size={60} radius={30} mx="auto" gradient={{ from: 'blue', to: 'purple' }}>
                <IconRocket size={30} />
              </ThemeIcon>

              <div>
                <Title order={2} mb="md">
                  AI Job Application Platform
                </Title>
                <Text c="dimmed" size="sm">
                  Complete AI-powered job search, analysis, and application package generation.
                  Enter your access key to continue.
                </Text>
              </div>

              <TextInput
                placeholder="Enter access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthentication()}
                size="md"
              />

              {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Button
                onClick={handleAuthentication}
                size="md"
                fullWidth
                disabled={!accessKey.trim()}
                gradient={{ from: 'blue', to: 'purple' }}
              >
                Access Platform
              </Button>

              <Text size="xs" c="dimmed">
                Need access? Contact Ravi through LinkedIn or the website contact form.
              </Text>
            </Stack>
          </Card>
        </motion.div>
      </Container>
    )
  }

  return (
    <Container size="xl" py="2rem">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center">
            <Title order={1} size="2.5rem" fw={700} mb="md" gradient={{ from: 'blue', to: 'purple' }} variant="gradient">
              AI Job Application Platform
            </Title>
            <Text size="lg" c="dimmed" maw={700} mx="auto">
              Complete AI-powered workflow from job discovery to application strategy with industry-standard resume generation.
            </Text>
          </Box>

          {/* Progress Stepper */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stepper active={currentStep} onStepClick={setCurrentStep} allowNextStepsSelect={false}>
              <Stepper.Step
                label="Job Search"
                description="Find relevant opportunities"
                icon={<IconSearch size={18} />}
              />
              <Stepper.Step
                label="Select Position"
                description="Choose target role"
                icon={<IconTarget size={18} />}
              />
              <Stepper.Step
                label="AI Analysis"
                description="Generate application package"
                icon={<IconBrain size={18} />}
              />
              <Stepper.Step
                label="Application Package"
                description="Complete strategy & documents"
                icon={<IconRocket size={18} />}
              />
            </Stepper>
          </Card>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card shadow="sm" padding="xl" radius="md">
                  <Stack gap="md">
                    <Group>
                      <IconFilter size={20} />
                      <Title order={3}>Job Search Criteria</Title>
                    </Group>

                    <Box>
                      <Text size="sm" fw={500} mb="sm" c="dimmed">🎯 Essential Search Criteria</Text>
                      <Grid>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                          <TextInput
                            label="Keywords *"
                            placeholder="CTO, VP Engineering, Chief Technology Officer"
                            value={keywords}
                            onChange={(e) => setKeywords(e.currentTarget.value)}
                            leftSection={<IconSearch size={16} />}
                            required
                            error={!keywords.trim() ? "Keywords are required" : ""}
                            description="Job titles, skills, or company names"
                            size="md"
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <TextInput
                            label="Location *"
                            placeholder="San Francisco Bay Area"
                            value={location}
                            onChange={(e) => setLocation(e.currentTarget.value)}
                            leftSection={<IconMapPin size={16} />}
                            required
                            error={!location.trim() ? "Location is required" : ""}
                            description="City, state, or region"
                            size="md"
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                          <Select
                            label="Search Radius"
                            placeholder="Select radius"
                            value={radius.toString()}
                            onChange={(value) => setRadius(parseInt(value || '25'))}
                            data={[
                              { value: '10', label: '10 miles' },
                              { value: '25', label: '25 miles' },
                              { value: '50', label: '50 miles' },
                              { value: '75', label: '75 miles' },
                              { value: '100', label: '100 miles' }
                            ]}
                            description="Distance from location"
                            size="md"
                          />
                        </Grid.Col>
                      </Grid>
                    </Box>

                    <Divider my="lg" />

                    <Box>
                      <Text size="sm" fw={500} mb="sm" c="dimmed">⚙️ Advanced Filters</Text>
                      <Grid>
                        <Grid.Col span={{ base: 12, md: 3 }}>
                          <Select
                            label="Time Period"
                            placeholder="Select posting period"
                            value={timePeriod}
                            onChange={(value) => setTimePeriod(value || '7d')}
                            data={[
                              { value: '1h', label: 'Last Hour' },
                              { value: '24h', label: 'Last 24 Hours' },
                              { value: '7d', label: 'Last 7 Days (Recommended)' }
                            ]}
                            description="How recent the postings are"
                            size="md"
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <MultiSelect
                            label="Target Companies (optional)"
                            placeholder="Select companies to focus on"
                            data={companyOptions}
                            value={companies}
                            onChange={setCompanies}
                            searchable
                            clearable
                            description="Focus search on specific companies"
                            size="md"
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                          <MultiSelect
                            label="Exclude Companies (optional)"
                            placeholder="Companies to exclude"
                            data={companyOptions}
                            value={excludeCompanies}
                            onChange={setExcludeCompanies}
                            searchable
                            clearable
                            description="Avoid specific companies"
                            size="md"
                          />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 1 }}>
                          <Box pt="lg">
                            <Switch
                              label="Remote only"
                              checked={remoteOnly}
                              onChange={(e) => setRemoteOnly(e.currentTarget.checked)}
                              size="md"
                              color="blue"
                            />
                          </Box>
                        </Grid.Col>
                      </Grid>
                    </Box>


                    {error && (
                      <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                        {error}
                      </Alert>
                    )}

                    <Group justify="center">
                      <Button
                        size="lg"
                        onClick={searchJobs}
                        disabled={loading || !keywords.trim() || !location.trim()}
                        leftSection={loading ? <Loader size="sm" /> : <IconSearch size={20} />}
                        gradient={{ from: 'blue', to: 'purple' }}
                      >
                        {loading ? 'Searching Jobs...' : 'Search Jobs'}
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </motion.div>
            )}

            {currentStep === 1 && jobs.length > 0 && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card shadow="sm" padding="xl" radius="md">
                  <Group justify="space-between" mb="lg">
                    <Title order={2}>Found {jobs.length} Opportunities</Title>
                    <Button
                      variant="light"
                      leftSection={<IconRefresh size={16} />}
                      onClick={() => setCurrentStep(0)}
                      size="sm"
                    >
                      New Search
                    </Button>
                  </Group>

                  <Stack gap="md">
                    {jobs.length === 0 ? (
                      <Card shadow="xs" padding="xl" radius="md" withBorder ta="center">
                        <Stack gap="md" align="center">
                          <Text size="lg" fw={500} c="dimmed">No jobs found</Text>
                          <Text size="sm" c="dimmed">
                            Executive roles like CTO/VP are rare. Try broader terms like "Software Engineer", "Engineering Manager", or extend the time period to 24 hours.
                          </Text>
                          <Button
                            variant="light"
                            onClick={() => setCurrentStep(0)}
                            leftSection={<IconRefresh size={16} />}
                          >
                            Try New Search
                          </Button>
                        </Stack>
                      </Card>
                    ) : (
                      jobs.map((job) => (
                      <Card key={job.id} shadow="xs" padding="lg" radius="md" withBorder>
                        <Stack gap="sm">
                          <Group justify="space-between" align="start">
                            <div style={{ flex: 1 }}>
                              <Group gap="sm" mb="xs">
                                <Title order={4}>{job.title}</Title>
                                {job.relevanceScore && (
                                  <Badge color={getScoreColor(job.relevanceScore)} size="sm">
                                    {job.relevanceScore}% match
                                  </Badge>
                                )}
                                {job.remote && (
                                  <Badge color="blue" variant="light" size="sm">
                                    Remote
                                  </Badge>
                                )}
                              </Group>

                              <Group gap="md" mb="sm">
                                <Group gap="xs">
                                  <IconBuilding size={16} />
                                  <Text size="sm" fw={500}>{job.company}</Text>
                                </Group>
                                <Group gap="xs">
                                  <IconMapPin size={16} />
                                  <Text size="sm">{job.location}</Text>
                                </Group>
                                {job.salary && (
                                  <Group gap="xs">
                                    <IconCurrencyDollar size={16} />
                                    <Text size="sm">{job.salary}</Text>
                                  </Group>
                                )}
                                <Group gap="xs">
                                  <IconCalendar size={16} />
                                  <Text size="sm">{formatDate(job.postedDate)}</Text>
                                </Group>
                              </Group>

                              {job.matchReasons && job.matchReasons.length > 0 && (
                                <Group gap="xs" mb="sm">
                                  {job.matchReasons.slice(0, 3).map((reason, index) => (
                                    <Badge key={index} variant="light" color="green" size="xs">
                                      {reason}
                                    </Badge>
                                  ))}
                                </Group>
                              )}

                              <div className="job-description" style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)', marginBottom: '1rem', lineHeight: '1.5' }}>
                                {job.description.split('\n').map((line, index) => {
                                  // Handle headers
                                  if (line.startsWith('## ')) {
                                    return <h3 key={index} style={{ fontSize: '1rem', fontWeight: 600, margin: '1rem 0 0.5rem 0', color: 'var(--mantine-color-text)' }}>{line.replace('## ', '')}</h3>
                                  }
                                  if (line.startsWith('### ')) {
                                    return <h4 key={index} style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0.8rem 0 0.4rem 0', color: 'var(--mantine-color-text)' }}>{line.replace('### ', '')}</h4>
                                  }
                                  // Handle bold text
                                  if (line.includes('**')) {
                                    const parts = line.split(/(\*\*[^*]+\*\*)/g)
                                    return (
                                      <p key={index} style={{ margin: '0.5rem 0' }}>
                                        {parts.map((part, partIndex) =>
                                          part.startsWith('**') && part.endsWith('**') ?
                                            <strong key={partIndex}>{part.slice(2, -2)}</strong> :
                                            part
                                        )}
                                      </p>
                                    )
                                  }
                                  // Handle empty lines
                                  if (line.trim() === '') {
                                    return <br key={index} />
                                  }
                                  // Regular text
                                  return <p key={index} style={{ margin: '0.5rem 0' }}>{line}</p>
                                })}
                              </div>

                              <Group gap="xs">
                                <Badge variant="outline" size="xs">{job.source}</Badge>
                              </Group>
                            </div>

                            <Stack gap="xs">
                              <Tooltip label="View job details">
                                <ActionIcon
                                  component="a"
                                  href={job.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="light"
                                  color="blue"
                                >
                                  <IconExternalLink size={16} />
                                </ActionIcon>
                              </Tooltip>

                              <Tooltip label="Generate AI Application Package">
                                <Button
                                  onClick={() => generateApplicationPackage(job)}
                                  variant="gradient"
                                  gradient={{ from: 'blue', to: 'purple' }}
                                  size="sm"
                                  leftSection={<IconRocket size={16} />}
                                >
                                  Generate Package
                                </Button>
                              </Tooltip>
                            </Stack>
                          </Group>
                        </Stack>
                      </Card>
                      ))
                    )}
                  </Stack>
                </Card>
              </motion.div>
            )}

            {currentStep === 2 && packageLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card shadow="lg" padding="xl" radius="md" ta="center">
                  <Stack gap="xl" align="center">
                    <ThemeIcon size={80} radius={40} gradient={{ from: 'blue', to: 'purple' }}>
                      <IconBrain size={40} />
                    </ThemeIcon>

                    <div>
                      <Title order={2} mb="md">AI Generating Your Application Package</Title>
                      {analysisError ? (
                        <Alert
                          icon={<IconX size={16} />}
                          title="Analysis Failed"
                          color="red"
                          mb="lg"
                        >
                          {analysisError}
                          <Group justify="center" mt="md">
                            <Button
                              variant="light"
                              color="red"
                              onClick={() => setCurrentStep(1)}
                              leftSection={<IconArrowLeft size={16} />}
                            >
                              Back to Job Listings
                            </Button>
                          </Group>
                        </Alert>
                      ) : (
                        <>
                          <Text c="dimmed" mb="lg">
                            {analysisStage}
                          </Text>
                          <Progress
                            value={analysisProgress}
                            size="lg"
                            radius="xl"
                            striped
                            animated
                            color={analysisProgress === 100 ? 'green' : 'blue'}
                            mb="md"
                          />
                          <Text size="sm" c="dimmed">
                            {analysisProgress}% Complete
                          </Text>
                        </>
                      )}
                    </div>

                    <Stack gap="sm" ta="left" style={{ width: '100%', maxWidth: 400 }}>
                      <Text size="sm" c="dimmed">✓ Analyzing job requirements</Text>
                      <Text size="sm" c="dimmed">✓ Researching company background</Text>
                      <Text size="sm" c="dimmed">✓ Generating tailored resume</Text>
                      <Text size="sm" c="dimmed">✓ Creating cover letter</Text>
                      <Text size="sm" c="dimmed">✓ Preparing interview strategy</Text>
                      <Text size="sm" c="dimmed">⏳ Finalizing application package...</Text>
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && applicationPackage && selectedJob && (
              <motion.div
                key="package"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card shadow="sm" padding="xl" radius="md">
                  <Group justify="space-between" mb="lg">
                    <div>
                      <Title order={2}>Application Package Complete</Title>
                      <Text c="dimmed" size="sm">
                        {selectedJob.title} at {selectedJob.company}
                      </Text>
                    </div>
                    <Group>
                      <Button
                        variant="light"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={backToJobListings}
                        size="sm"
                      >
                        Back to Job Listings
                      </Button>
                      <Button
                        variant="gradient"
                        gradient={{ from: 'green', to: 'teal' }}
                        leftSection={<IconFileTypePdf size={16} />}
                        onClick={generatePDF}
                        loading={pdfGenerating}
                        size="sm"
                      >
                        Download Application Package
                      </Button>
                      <Button
                        variant="light"
                        leftSection={<IconRefresh size={16} />}
                        onClick={() => setCurrentStep(0)}
                        size="sm"
                      >
                        New Search
                      </Button>
                    </Group>
                  </Group>

                  <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
                    <Tabs.List justify="center" mb="lg">
                      <Tabs.Tab value="overview" leftSection={<IconTarget size={16} />}>
                        📊 Overview
                      </Tabs.Tab>
                      <Tabs.Tab value="resume" leftSection={<IconFileText size={16} />}>
                        📄 Resume
                      </Tabs.Tab>
                      <Tabs.Tab value="cover" leftSection={<IconStar size={16} />}>
                        💌 Cover Letter
                      </Tabs.Tab>
                      <Tabs.Tab value="interview" leftSection={<IconBrain size={16} />}>
                        🎯 Interview Prep
                      </Tabs.Tab>
                      <Tabs.Tab value="strategy" leftSection={<IconTrendingUp size={16} />}>
                        📋 Strategy
                      </Tabs.Tab>
                      <Tabs.Tab value="company" leftSection={<IconBuilding size={16} />}>
                        🏢 Company
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="overview" pt="md">
                      <Stack gap="lg">
                        <Group align="center">
                          <Progress
                            value={applicationPackage.jobAnalysis.relevanceScore}
                            size="lg"
                            color={getScoreColor(applicationPackage.jobAnalysis.relevanceScore)}
                            style={{ flex: 1 }}
                          />
                          <Text fw={600} size="lg">{applicationPackage.jobAnalysis.relevanceScore}% Match</Text>
                        </Group>

                        <Card shadow="xs" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                          <Title order={5} mb="sm" c="green">🎯 Match Strengths</Title>
                          <Stack gap="xs">
                            {(applicationPackage.jobAnalysis.matchStrengths || []).map((strength, index) => (
                              <Text key={index} size="sm">✓ {strength}</Text>
                            ))}
                          </Stack>
                        </Card>

                        {applicationPackage.jobAnalysis.potentialConcerns.length > 0 && (
                          <Card shadow="xs" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-orange-0)' }}>
                            <Title order={5} mb="sm" c="orange">⚠️ Areas to Address</Title>
                            <Stack gap="xs">
                              {(applicationPackage.jobAnalysis.potentialConcerns || []).map((concern, index) => (
                                <Text key={index} size="sm">• {concern}</Text>
                              ))}
                            </Stack>
                          </Card>
                        )}

                        <Card shadow="xs" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                          <Title order={5} mb="sm" c="blue">🚀 Positioning Strategy</Title>
                          <Text size="sm">{applicationPackage.jobAnalysis.positioningStrategy}</Text>
                        </Card>

                        <Group justify="center" mt="xl">
                          <Button
                            component="a"
                            href={selectedJob.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftSection={<IconExternalLink size={18} />}
                            size="lg"
                            gradient={{ from: 'blue', to: 'purple' }}
                          >
                            Apply to Position
                          </Button>
                        </Group>
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="resume" pt="md">
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={4}>ATS-Optimized Executive Resume</Title>
                          <Group>
                            <Button
                              variant="light"
                              leftSection={<IconEye size={16} />}
                              onClick={() => setResumeModalOpen(true)}
                            >
                              Preview
                            </Button>
                            <Group gap="xs">
                              <Select
                                value={downloadFormat}
                                onChange={(value) => setDownloadFormat(value || 'txt')}
                                data={[
                                  { value: 'txt', label: 'TXT (Plain Text)' },
                                  { value: 'pdf', label: 'PDF (Professional)' },
                                  { value: 'doc', label: 'DOC (Word Document)' }
                                ]}
                                w={180}
                                size="sm"
                              />
                              <Button
                                leftSection={<IconDownload size={16} />}
                                onClick={() => downloadResumeWithFormat(downloadFormat)}
                                size="sm"
                              >
                                Download
                              </Button>
                            </Group>
                          </Group>
                        </Group>

                        <div>
                          <Title order={5} mb="sm">Professional Summary</Title>
                          <Card shadow="xs" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                              {applicationPackage.resume.professionalSummary}
                            </Text>
                          </Card>
                        </div>

                        <div>
                          <Title order={5} mb="sm">Key Achievements for This Role</Title>
                          <Stack gap="xs">
                            {(applicationPackage.resume.keyAchievements || []).map((achievement, index) => (
                              <Card key={index} shadow="xs" padding="sm" radius="md" withBorder>
                                <Text size="sm">🏆 {achievement}</Text>
                              </Card>
                            ))}
                          </Stack>
                        </div>

                        <div>
                          <Title order={5} mb="sm">Prioritized Technical Skills</Title>
                          <Group gap="xs">
                            {(applicationPackage.resume.technicalSkills || []).map((skill, index) => (
                              <Badge key={index} variant="light" color="blue" size="lg">
                                {skill}
                              </Badge>
                            ))}
                          </Group>
                        </div>
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="cover" pt="md">
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Title order={4}>Tailored Cover Letter</Title>
                          <Group>
                            <Button
                              variant="light"
                              leftSection={<IconEye size={16} />}
                              onClick={() => setCoverLetterModalOpen(true)}
                            >
                              Preview
                            </Button>
                            <Button
                              leftSection={<IconCopy size={16} />}
                              onClick={() => {
                                navigator.clipboard.writeText(applicationPackage.coverLetter.fullText)
                                // Add toast notification here
                              }}
                            >
                              Copy Text
                            </Button>
                          </Group>
                        </Group>

                        <Card shadow="md" padding="lg" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                          <ScrollArea h={300}>
                            <Text size="sm" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                              {applicationPackage.coverLetter.fullText || 'Cover letter content not available. Please try generating the package again.'}
                            </Text>
                          </ScrollArea>
                        </Card>

                        <div>
                          <Title order={5} mb="sm">Key Message Points</Title>
                          <Stack gap="xs">
                            {(applicationPackage.coverLetter.keyPoints || []).map((point, index) => (
                              <Card key={index} shadow="xs" padding="sm" radius="sm" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                                <Text size="sm">💡 {point}</Text>
                              </Card>
                            ))}
                          </Stack>
                        </div>

                        <Card shadow="xs" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-violet-0)' }}>
                          <Title order={5} mb="sm" c="violet">✨ Customization Notes</Title>
                          <Text size="sm">{applicationPackage.coverLetter.customization}</Text>
                        </Card>
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="interview" pt="md">
                      <Stack gap="md">
                        <div>
                          <Title order={5} mb="sm">STAR Method Stories</Title>
                          <Stack gap="sm">
                            {(applicationPackage.interviewPrep.starStories || []).map((story, index) => (
                              <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                                <Stack gap="xs">
                                  <Text fw={600} size="sm" c="blue">Story #{index + 1}</Text>
                                  <div>
                                    <Text size="xs" fw={600} c="orange">Situation:</Text>
                                    <Text size="sm">{story.situation}</Text>
                                  </div>
                                  <div>
                                    <Text size="xs" fw={600} c="orange">Task:</Text>
                                    <Text size="sm">{story.task}</Text>
                                  </div>
                                  <div>
                                    <Text size="xs" fw={600} c="orange">Action:</Text>
                                    <Text size="sm">{story.action}</Text>
                                  </div>
                                  <div>
                                    <Text size="xs" fw={600} c="orange">Result:</Text>
                                    <Text size="sm">{story.result}</Text>
                                  </div>
                                  <div>
                                    <Text size="xs" fw={600} c="green">Relevance:</Text>
                                    <Text size="sm" style={{ fontStyle: 'italic' }}>{story.relevance}</Text>
                                  </div>
                                </Stack>
                              </Card>
                            ))}
                          </Stack>
                        </div>

                        <div>
                          <Title order={5} mb="sm">Technical Discussion Points</Title>
                          <Group gap="xs">
                            {(applicationPackage.interviewPrep.technicalDiscussion || []).map((area, index) => (
                              <Badge key={index} variant="outline" color="orange" size="md">
                                {area}
                              </Badge>
                            ))}
                          </Group>
                        </div>

                        <div>
                          <Title order={5} mb="sm">Strategic Questions to Ask</Title>
                          <Stack gap="xs">
                            {(applicationPackage.interviewPrep.questionsToAsk || []).map((question, index) => (
                              <Card key={index} shadow="xs" padding="sm" radius="md" withBorder>
                                <Text size="sm">❓ {question}</Text>
                              </Card>
                            ))}
                          </Stack>
                        </div>

                        {applicationPackage.interviewPrep.externalReadingLinks && applicationPackage.interviewPrep.externalReadingLinks.length > 0 && (
                          <div>
                            <Title order={5} mb="sm">📚 External Reading Links</Title>
                            <Stack gap="sm">
                              {applicationPackage.interviewPrep.externalReadingLinks.map((link, index) => (
                                <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                                  <Stack gap="xs">
                                    <Group justify="space-between" align="start">
                                      <div style={{ flex: 1 }}>
                                        <Text fw={600} size="sm" c="blue">{link.title}</Text>
                                        <Badge variant="light" color="purple" size="xs" mt="xs">
                                          {link.skillArea}
                                        </Badge>
                                      </div>
                                      <ActionIcon
                                        component="a"
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="light"
                                        color="blue"
                                        size="sm"
                                      >
                                        <IconExternalLink size={14} />
                                      </ActionIcon>
                                    </Group>
                                    <Text size="sm" c="dimmed">
                                      {link.description}
                                    </Text>
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          </div>
                        )}

                        {applicationPackage.interviewPrep.behavioralQuestions && applicationPackage.interviewPrep.behavioralQuestions.length > 0 && (
                          <div>
                            <Title order={5} mb="sm">🎯 Behavioral Interview Questions</Title>
                            <Stack gap="sm">
                              {applicationPackage.interviewPrep.behavioralQuestions.map((question, index) => (
                                <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                                  <Stack gap="sm">
                                    <Text fw={600} size="sm" c="purple">
                                      Q{index + 1}: {question.question}
                                    </Text>
                                    <div style={{ backgroundColor: 'var(--mantine-color-blue-0)', padding: '12px', borderRadius: '6px' }}>
                                      <Text size="xs" fw={600} c="blue" mb="xs">Suggested Response Strategy:</Text>
                                      <Text size="sm">{question.suggestedResponse}</Text>
                                    </div>
                                    <div style={{ backgroundColor: 'var(--mantine-color-green-0)', padding: '8px', borderRadius: '6px' }}>
                                      <Text size="xs" fw={600} c="green" mb="xs">💡 Tips:</Text>
                                      <Text size="sm">{question.tips}</Text>
                                    </div>
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          </div>
                        )}

                        <div>
                          <Title order={5} mb="sm">Salary Negotiation Strategy</Title>
                          <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                            <Stack gap="sm">
                              <div>
                                <Text size="xs" fw={600} c="green">Market Data:</Text>
                                <Text size="sm">{applicationPackage.interviewPrep.salaryNegotiation.marketData}</Text>
                              </div>
                              <div>
                                <Text size="xs" fw={600} c="green">Value Proposition:</Text>
                                <Text size="sm">{applicationPackage.interviewPrep.salaryNegotiation.valueProposition}</Text>
                              </div>
                              <div>
                                <Text size="xs" fw={600} c="green">Negotiation Approach:</Text>
                                <Text size="sm">{applicationPackage.interviewPrep.salaryNegotiation.negotiationApproach}</Text>
                              </div>
                            </Stack>
                          </Card>
                        </div>
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="strategy" pt="md">
                      <Stack gap="md">
                        <div>
                          <Title order={5} mb="sm">Application Strategy</Title>
                          <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                            <Stack gap="sm">
                              <div>
                                <Text size="xs" fw={600} c="blue">Preferred Channel:</Text>
                                <Text size="sm">{applicationPackage.applicationStrategy.preferredChannel}</Text>
                              </div>
                              <div>
                                <Text size="xs" fw={600} c="blue">LinkedIn Strategy:</Text>
                                <Text size="sm">{applicationPackage.applicationStrategy.linkedinStrategy}</Text>
                              </div>
                              <div>
                                <Text size="xs" fw={600} c="blue">Follow-up Plan:</Text>
                                <Text size="sm">{applicationPackage.applicationStrategy.followUpPlan}</Text>
                              </div>
                              <div>
                                <Text size="xs" fw={600} c="blue">Additional Research:</Text>
                                <Text size="sm">{applicationPackage.applicationStrategy.additionalResearch}</Text>
                              </div>
                            </Stack>
                          </Card>
                        </div>

                        <div>
                          <Title order={5} mb="sm">Action Timeline</Title>
                          <Stack gap="xs">
                            {(applicationPackage.applicationStrategy.timeline || []).map((action, index) => (
                              <Card key={index} shadow="xs" padding="sm" radius="md" withBorder>
                                <Group>
                                  <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                                    <Text size="xs" fw={600}>{index + 1}</Text>
                                  </ThemeIcon>
                                  <Text size="sm">{action}</Text>
                                </Group>
                              </Card>
                            ))}
                          </Stack>
                        </div>

                        {applicationPackage.applicationStrategy.roleAttributes && applicationPackage.applicationStrategy.roleAttributes.length > 0 && (
                          <div>
                            <Title order={5} mb="sm">🎯 Essential Role Attributes</Title>
                            <Stack gap="sm">
                              {applicationPackage.applicationStrategy.roleAttributes.map((attribute, index) => (
                                <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                                  <Stack gap="xs">
                                    <Text fw={600} size="sm" c="purple">{attribute.attribute}</Text>
                                    <Text size="sm">{attribute.description}</Text>
                                    <div style={{ backgroundColor: 'var(--mantine-color-orange-0)', padding: '8px', borderRadius: '6px' }}>
                                      <Text size="xs" fw={600} c="orange" mb="xs">Why it matters:</Text>
                                      <Text size="sm">{attribute.importance}</Text>
                                    </div>
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          </div>
                        )}

                        {applicationPackage.applicationStrategy.interviewTips && applicationPackage.applicationStrategy.interviewTips.length > 0 && (
                          <div>
                            <Title order={5} mb="sm">💡 Interview Tips</Title>
                            <Stack gap="xs">
                              {applicationPackage.applicationStrategy.interviewTips.map((tip, index) => (
                                <Card key={index} shadow="xs" padding="sm" radius="md" withBorder>
                                  <Text size="sm">💡 {tip}</Text>
                                </Card>
                              ))}
                            </Stack>
                          </div>
                        )}

                        {applicationPackage.applicationStrategy.industryInsights && applicationPackage.applicationStrategy.industryInsights.length > 0 && (
                          <div>
                            <Title order={5} mb="sm">📈 Industry Insights</Title>
                            <Stack gap="xs">
                              {applicationPackage.applicationStrategy.industryInsights.map((insight, index) => (
                                <Card key={index} shadow="xs" padding="sm" radius="md" withBorder>
                                  <Text size="sm">📈 {insight}</Text>
                                </Card>
                              ))}
                            </Stack>
                          </div>
                        )}

                        {applicationPackage.applicationStrategy.networkingContacts && applicationPackage.applicationStrategy.networkingContacts.length > 0 && (
                          <div>
                            <Title order={5} mb="sm">🤝 Networking Contacts</Title>
                            <Stack gap="sm">
                              {applicationPackage.applicationStrategy.networkingContacts.map((contact, index) => (
                                <Card key={index} shadow="sm" padding="md" radius="md" withBorder>
                                  <Stack gap="sm">
                                    <Group justify="space-between" align="start">
                                      <div style={{ flex: 1 }}>
                                        <Text fw={600} size="sm" c="blue">{contact.name}</Text>
                                        <Text size="sm" c="dimmed">{contact.title}</Text>
                                        <Badge variant="light" color="green" size="xs" mt="xs">
                                          {contact.department}
                                        </Badge>
                                      </div>
                                      <ActionIcon
                                        component="a"
                                        href={contact.linkedinProfile}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="light"
                                        color="blue"
                                        size="sm"
                                      >
                                        <IconBrandLinkedin size={14} />
                                      </ActionIcon>
                                    </Group>
                                    <div style={{ backgroundColor: 'var(--mantine-color-blue-0)', padding: '8px', borderRadius: '6px' }}>
                                      <Text size="xs" fw={600} c="blue" mb="xs">Connection Strategy:</Text>
                                      <Text size="sm">{contact.outreachStrategy}</Text>
                                    </div>
                                    <div style={{ backgroundColor: 'var(--mantine-color-green-0)', padding: '8px', borderRadius: '6px' }}>
                                      <Text size="xs" fw={600} c="green" mb="xs">Why Connect:</Text>
                                      <Text size="sm">{contact.connectionReason}</Text>
                                    </div>
                                    <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
                                      Role Relevance: {contact.roleRelevance}
                                    </Text>
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          </div>
                        )}

                        <Group justify="center" mt="xl">
                          <Button
                            leftSection={<IconBrandLinkedin size={18} />}
                            variant="filled"
                            color="blue"
                            size="lg"
                            component="a"
                            href={`https://linkedin.com/company/${selectedJob.company.toLowerCase().replace(/\s+/g, '-')}`}
                            target="_blank"
                          >
                            Research on LinkedIn
                          </Button>
                        </Group>
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="company" pt="md">
                      <Stack gap="md">
                        <div>
                          <Title order={5} mb="sm">Company Overview</Title>
                          <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                            <Text size="sm">{applicationPackage.companyResearch.overview}</Text>
                          </Card>
                        </div>

                        {applicationPackage.companyResearch.recentNews && applicationPackage.companyResearch.recentNews.length > 0 && (
                          <div>
                            <Title order={5} mb="sm">Recent Developments</Title>
                            <Stack gap="xs">
                              {(applicationPackage.companyResearch.recentNews || []).map((news, index) => (
                                <Card key={index} shadow="xs" padding="sm" radius="md" withBorder>
                                  <Text size="sm">📰 {news}</Text>
                                </Card>
                              ))}
                            </Stack>
                          </div>
                        )}

                        {applicationPackage.companyResearch.cultureAndValues && (
                          <div>
                            <Title order={5} mb="sm">Culture & Values</Title>
                            <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-violet-0)' }}>
                              <Text size="sm">{applicationPackage.companyResearch.cultureAndValues}</Text>
                            </Card>
                          </div>
                        )}

                        {applicationPackage.companyResearch.glassdoorEstimate && (
                          <div>
                            <Title order={5} mb="sm">Employee Insights (Estimated)</Title>
                            <Card shadow="sm" padding="md" radius="md" withBorder>
                              <Stack gap="sm">
                                {applicationPackage.companyResearch.glassdoorEstimate.rating && (
                                  <Group>
                                    <Text fw={600} c="orange">Rating:</Text>
                                    <Text size="sm">{applicationPackage.companyResearch.glassdoorEstimate.rating}</Text>
                                  </Group>
                                )}
                                {applicationPackage.companyResearch.glassdoorEstimate.pros && applicationPackage.companyResearch.glassdoorEstimate.pros.length > 0 && (
                                  <div>
                                    <Text fw={600} c="green" size="sm" mb="xs">Pros:</Text>
                                    <Stack gap="xs">
                                      {(applicationPackage.companyResearch.glassdoorEstimate.pros || []).map((pro, index) => (
                                        <Text key={index} size="sm">✅ {pro}</Text>
                                      ))}
                                    </Stack>
                                  </div>
                                )}
                                {applicationPackage.companyResearch.glassdoorEstimate.cons && applicationPackage.companyResearch.glassdoorEstimate.cons.length > 0 && (
                                  <div>
                                    <Text fw={600} c="red" size="sm" mb="xs">Challenges:</Text>
                                    <Stack gap="xs">
                                      {(applicationPackage.companyResearch.glassdoorEstimate.cons || []).map((con, index) => (
                                        <Text key={index} size="sm">⚠️ {con}</Text>
                                      ))}
                                    </Stack>
                                  </div>
                                )}
                                {applicationPackage.companyResearch.glassdoorEstimate.salaryRange && (
                                  <div>
                                    <Text fw={600} c="blue" size="sm">Salary Range:</Text>
                                    <Text size="sm">{applicationPackage.companyResearch.glassdoorEstimate.salaryRange}</Text>
                                  </div>
                                )}
                              </Stack>
                            </Card>
                          </div>
                        )}

                        {applicationPackage.companyResearch.hiringManager && (
                          <div>
                            <Title order={5} mb="sm">Hiring Manager Research</Title>
                            <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-cyan-0)' }}>
                              <Stack gap="sm">
                                {applicationPackage.companyResearch.hiringManager.potentialTitles && applicationPackage.companyResearch.hiringManager.potentialTitles.length > 0 && (
                                  <div>
                                    <Text fw={600} size="sm" c="cyan">Potential Titles:</Text>
                                    <Group gap="xs" mt="xs">
                                      {(applicationPackage.companyResearch.hiringManager.potentialTitles || []).map((title, index) => (
                                        <Badge key={index} variant="light" color="cyan" size="sm">{title}</Badge>
                                      ))}
                                    </Group>
                                  </div>
                                )}
                                {applicationPackage.companyResearch.hiringManager.researchTips && (
                                  <div>
                                    <Text fw={600} size="sm" c="cyan">Research Tips:</Text>
                                    <Text size="sm">{applicationPackage.companyResearch.hiringManager.researchTips}</Text>
                                  </div>
                                )}
                                {applicationPackage.companyResearch.hiringManager.connectionStrategy && (
                                  <div>
                                    <Text fw={600} size="sm" c="cyan">Connection Strategy:</Text>
                                    <Text size="sm">{applicationPackage.companyResearch.hiringManager.connectionStrategy}</Text>
                                  </div>
                                )}
                              </Stack>
                            </Card>
                          </div>
                        )}

                        {applicationPackage.companyResearch.competitiveLandscape && (
                          <div>
                            <Title order={5} mb="sm">Competitive Landscape</Title>
                            <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-yellow-0)' }}>
                              <Text size="sm">{applicationPackage.companyResearch.competitiveLandscape}</Text>
                            </Card>
                          </div>
                        )}
                      </Stack>
                    </Tabs.Panel>
                  </Tabs>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resume Preview Modal */}
          <Modal
            opened={resumeModalOpen}
            onClose={() => setResumeModalOpen(false)}
            title={
              <Group>
                <IconFileText size={24} color="blue" />
                <div>
                  <Text fw={600} size="lg">Resume Preview</Text>
                  <Text size="sm" c="dimmed">Industry-Standard Executive Format</Text>
                </div>
              </Group>
            }
            size="xl"
            padding="lg"
            radius="md"
          >
            {applicationPackage && (
              <Stack gap="md">
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <ScrollArea h={600}>
                    <Text size="sm" style={{ whiteSpace: 'pre-line', fontFamily: 'monospace', lineHeight: 1.6 }}>
                      {applicationPackage.resume.formattedResume}
                    </Text>
                  </ScrollArea>
                </Card>

                <Group justify="center">
                  <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={() => {
                      generateResumePDF(applicationPackage, selectedJob)
                    }}
                  >
                    Download Resume
                  </Button>
                  <Button
                    variant="light"
                    leftSection={<IconCopy size={16} />}
                    onClick={() => {
                      navigator.clipboard.writeText(applicationPackage.resume.formattedResume)
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </Group>
              </Stack>
            )}
          </Modal>

          {/* Cover Letter Preview Modal */}
          <Modal
            opened={coverLetterModalOpen}
            onClose={() => setCoverLetterModalOpen(false)}
            title={
              <Group>
                <IconStar size={24} color="purple" />
                <div>
                  <Text fw={600} size="lg">Cover Letter Preview</Text>
                  <Text size="sm" c="dimmed">Tailored Executive Communication</Text>
                </div>
              </Group>
            }
            size="lg"
            padding="lg"
            radius="md"
          >
            {applicationPackage && (
              <Stack gap="md">
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                  <ScrollArea h={500}>
                    <Text size="sm" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {applicationPackage.coverLetter.fullText}
                    </Text>
                  </ScrollArea>
                </Card>

                <Group justify="center">
                  <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={() => {
                      const blob = new Blob([applicationPackage.coverLetter.fullText], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${selectedJob?.company}_${selectedJob?.title}_CoverLetter.txt`
                      a.click()
                    }}
                  >
                    Download Cover Letter
                  </Button>
                  <Button
                    variant="light"
                    leftSection={<IconCopy size={16} />}
                    onClick={() => {
                      navigator.clipboard.writeText(applicationPackage.coverLetter.fullText)
                    }}
                  >
                    Copy to Clipboard
                  </Button>
                </Group>
              </Stack>
            )}
          </Modal>
        </Stack>
      </motion.div>
    </Container>
  )
}