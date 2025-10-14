'use client'

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
  Textarea,
  TextInput,
  Paper,
  ThemeIcon,
  Loader,
  Alert,
  Tabs,
  Divider,
  CopyButton,
  ActionIcon,
  Tooltip
} from '@mantine/core'
import {
  IconFileText,
  IconWand,
  IconBrain,
  IconDownload,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconStar,
  IconTarget,
  IconTrendingUp
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CustomizedResume {
  atsScore?: number
  keywordMatches?: string[]
  keywordDensity?: string
  summary: string
  keyAchievements: string[]
  relevantExperience: string[]
  technicalSkills: string[]
  education?: string
  certifications?: string[]
  atsOptimizations?: string[]
  interviewPrep?: string[]
  recommendations?: string[]
  coverLetter?: string
}

export default function ResumeCustomizerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accessKey, setAccessKey] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [customizedResume, setCustomizedResume] = useState<CustomizedResume | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<string | null>('resume')

  // Check for stored authentication on component mount
  useEffect(() => {
    // Clear any existing authentication to ensure gate works
    localStorage.removeItem('resume-auth')
    // Only set authenticated if explicitly stored with current session
    const stored = sessionStorage.getItem('resume-auth-session')
    if (stored === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleAuthentication = () => {
    // Simple authentication - in production, this would be more secure
    if (accessKey === 'ravi2025resume' || accessKey === 'demo') {
      setIsAuthenticated(true)
      sessionStorage.setItem('resume-auth-session', 'authenticated')
      setError('')
    } else {
      setError('Invalid access key. Please contact Ravi for access.')
    }
  }

  const handleCustomize = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description to customize the resume')
      return
    }

    setLoading(true)
    setError('')
    setCustomizedResume(null)

    try {
      const response = await fetch('/api/resume-customizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      })

      if (response.ok) {
        const data = await response.json()
        setCustomizedResume(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to customize resume')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatResumeText = () => {
    if (!customizedResume) return ''

    return `RAVI PORURI
Technology Leader & AI Innovator

CONTACT INFORMATION
Email: raviporuri@gmail.com
Phone: (408) 823-6713
LinkedIn: linkedin.com/in/poruriravi
Website: raviporuri.com
Location: San Francisco Bay Area

PROFESSIONAL SUMMARY
${customizedResume.summary}

KEY ACHIEVEMENTS
${customizedResume.keyAchievements.map(achievement => `• ${achievement}`).join('\n')}

WORK EXPERIENCE
${customizedResume.relevantExperience.join('\n\n')}

TECHNICAL SKILLS
${customizedResume.technicalSkills.join(' • ')}

EDUCATION
${customizedResume.education || '• MBA (Finance) - Amity University, India\n• Bachelor of Computer Applications - Madras University, India (2000)'}

CERTIFICATIONS & PATENTS
${(customizedResume.certifications || [
      'Oracle Certified Professional',
      'Teradata Certified Implementation Specialist',
      'Multiple U.S. Patents in Data Platform Technologies',
      'Snowflake Black Diamond Executive Council Member',
      'Gartner BI Excellence Award Finalist'
    ]).map(cert => `• ${cert}`).join('\n')}`
  }

  const downloadPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      // Add content to PDF following 2025 trends
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text('RAVI PORURI', 105, 20, { align: 'center' })

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text('Technology Leader & AI Innovator', 105, 28, { align: 'center' })

      // Contact Information
      doc.setFontSize(10)
      doc.text('Email: raviporuri@gmail.com | Phone: (408) 823-6713', 105, 35, { align: 'center' })
      doc.text('LinkedIn: linkedin.com/in/poruriravi | Location: San Francisco Bay Area', 105, 41, { align: 'center' })

      let yPosition = 55

      // Professional Summary
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text('PROFESSIONAL SUMMARY', 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const summaryLines = doc.splitTextToSize(customizedResume?.summary || '', 170)
      doc.text(summaryLines, 20, yPosition)
      yPosition += summaryLines.length * 5 + 10

      // Key Achievements
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text('KEY ACHIEVEMENTS', 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      customizedResume?.keyAchievements.forEach(achievement => {
        const achievementLines = doc.splitTextToSize(`• ${achievement}`, 170)
        doc.text(achievementLines, 20, yPosition)
        yPosition += achievementLines.length * 5 + 3
      })

      yPosition += 5

      // Work Experience
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text('WORK EXPERIENCE', 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      customizedResume?.relevantExperience.forEach(exp => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        const expLines = doc.splitTextToSize(exp, 170)
        doc.text(expLines, 20, yPosition)
        yPosition += expLines.length * 5 + 8
      })

      // Technical Skills
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text('TECHNICAL SKILLS', 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const skillsText = customizedResume?.technicalSkills.join(' • ') || ''
      const skillsLines = doc.splitTextToSize(skillsText, 170)
      doc.text(skillsLines, 20, yPosition)
      yPosition += skillsLines.length * 5 + 10

      // Education
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text('EDUCATION', 20, yPosition)
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text('• MBA (Finance) - Amity University, India', 20, yPosition)
      yPosition += 5
      doc.text('• Bachelor of Computer Applications - Madras University, India (2000)', 20, yPosition)

      // Save the PDF
      doc.save('Ravi_Poruri_Resume_ATS_Optimized.pdf')
    } catch (error) {
      console.error('PDF generation failed:', error)
      // Fallback to text download
      const resumeContent = formatResumeText()
      const element = document.createElement('a')
      const file = new Blob([resumeContent], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = 'Ravi_Poruri_Resume_Customized.txt'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

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
              <ThemeIcon size={60} radius={30} mx="auto" color="blue">
                <IconFileText size={30} />
              </ThemeIcon>

              <div>
                <Title order={2} mb="md">
                  ATS-Optimized Resume Generator
                </Title>
                <Text c="dimmed" size="sm">
                  This is a private tool for generating ATS-friendly resumes.
                  Please enter your access key to continue.
                </Text>
              </div>

              <TextInput
                placeholder="Enter access key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthentication()}
                size="md"
                disabled={loading}
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
              >
                Access Resume Generator
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
    <Container size="lg" py="2rem">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center">
            <Title order={1} size="2.5rem" fw={700} mb="md">
              ATS-Optimized AI Resume Generator
            </Title>
            <Text size="lg" c="dimmed" maw={600} mx="auto">
              Generate ATS-friendly resumes that pass automated screening systems and rank highly with recruiters.
              Advanced keyword matching, formatting optimization, and interview preparation tailored to each role.
            </Text>
          </Box>

          {/* Input Section */}
          <Card shadow="sm" padding="xl" radius="md">
            <Stack gap="md">
              <Group>
                <ThemeIcon size="xl" color="blue" variant="light">
                  <IconWand size={24} />
                </ThemeIcon>
                <div>
                  <Title order={3}>Job-Specific Resume Customization</Title>
                  <Text c="dimmed">Enter the job description to get a tailored resume highlighting relevant experience</Text>
                </div>
              </Group>

              <Textarea
                placeholder="Paste the complete job description here... The AI will analyze requirements and customize Ravi's resume to emphasize the most relevant experience and achievements."
                minRows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.currentTarget.value)}
                disabled={loading}
              />

              {error && (
                <Alert icon={<IconAlertCircle size="1rem" />} color="red" variant="light">
                  {error}
                </Alert>
              )}

              <Group justify="center">
                <Button
                  size="lg"
                  onClick={handleCustomize}
                  disabled={loading || !jobDescription.trim()}
                  leftSection={loading ? <Loader size="sm" /> : <IconBrain size={20} />}
                >
                  {loading ? 'Customizing Resume...' : 'Customize Resume'}
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Customized Resume Results */}
          {customizedResume && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card shadow="sm" padding="xl" radius="md">
                <Stack gap="lg">
                  <Group justify="space-between" align="center">
                    <div>
                      <Title order={2}>ATS-Optimized Resume</Title>
                      {customizedResume.atsScore && (
                        <Group gap="xs" mt="xs">
                          <Badge
                            color={customizedResume.atsScore >= 80 ? 'green' : customizedResume.atsScore >= 70 ? 'yellow' : 'red'}
                            size="lg"
                          >
                            ATS Score: {customizedResume.atsScore}/100
                          </Badge>
                          {customizedResume.keywordDensity && (
                            <Badge color="blue" variant="light">
                              Keywords: {customizedResume.keywordDensity}
                            </Badge>
                          )}
                        </Group>
                      )}
                    </div>
                    <Group>
                      <CopyButton value={formatResumeText()}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copied' : 'Copy resume'} withArrow position="right">
                            <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                              {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                      <Button leftSection={<IconDownload size={16} />} onClick={downloadPDF}>
                        Download Resume
                      </Button>
                    </Group>
                  </Group>

                  <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                      <Tabs.Tab value="resume" leftSection={<IconFileText size={14} />}>
                        Resume
                      </Tabs.Tab>
                      <Tabs.Tab value="ats" leftSection={<IconTarget size={14} />}>
                        ATS Analysis
                      </Tabs.Tab>
                      <Tabs.Tab value="interview" leftSection={<IconStar size={14} />}>
                        Interview Prep
                      </Tabs.Tab>
                      <Tabs.Tab value="tips" leftSection={<IconTrendingUp size={14} />}>
                        Strategy Tips
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="resume" pt="md">
                      <Stack gap="lg">
                        {/* Contact Information Header */}
                        <Card shadow="xs" padding="lg" radius="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                          <Title order={3} ta="center" mb="xs">RAVI PORURI</Title>
                          <Text ta="center" fw={500} c="blue" mb="md">Technology Leader & AI Innovator</Text>
                          <Group justify="center" gap="md">
                            <Text size="sm">raviporuri@gmail.com</Text>
                            <Text size="sm">•</Text>
                            <Text size="sm">(408) 823-6713</Text>
                            <Text size="sm">•</Text>
                            <Text size="sm">linkedin.com/in/poruriravi</Text>
                            <Text size="sm">•</Text>
                            <Text size="sm">San Francisco Bay Area</Text>
                          </Group>
                        </Card>

                        {/* Professional Summary */}
                        <Card shadow="xs" padding="lg" radius="md" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                          <Title order={4} mb="md">Professional Summary</Title>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {customizedResume.summary}
                          </Text>
                        </Card>

                        {/* Key Achievements */}
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Key Achievements</Title>
                          <Stack gap="sm">
                            {customizedResume.keyAchievements.map((achievement, index) => (
                              <Group key={index} gap="xs" align="start">
                                <ThemeIcon size="sm" color="green" variant="light" mt={4}>
                                  <IconStar size={12} />
                                </ThemeIcon>
                                <Text size="sm">{achievement}</Text>
                              </Group>
                            ))}
                          </Stack>
                        </Card>

                        {/* Work Experience */}
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Work Experience</Title>
                          <Stack gap="md">
                            {customizedResume.relevantExperience.map((experience, index) => (
                              <Box key={index}>
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                  {experience}
                                </Text>
                                {index < customizedResume.relevantExperience.length - 1 && <Divider mt="md" />}
                              </Box>
                            ))}
                          </Stack>
                        </Card>

                        {/* Technical Skills */}
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Technical Skills</Title>
                          <Group gap="xs">
                            {customizedResume.technicalSkills.map((skill, index) => (
                              <Badge key={index} variant="light" color="blue">
                                {skill}
                              </Badge>
                            ))}
                          </Group>
                        </Card>

                        {/* Education */}
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Education</Title>
                          <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {customizedResume.education || '• MBA (Finance) - Amity University, India\n• Bachelor of Computer Applications - Madras University, India (2000)'}
                          </Text>
                        </Card>

                        {/* Certifications & Patents */}
                        {customizedResume.certifications && (
                          <Card shadow="xs" padding="lg" radius="md">
                            <Title order={4} mb="md">Certifications & Patents</Title>
                            <Stack gap="xs">
                              {customizedResume.certifications.map((cert, index) => (
                                <Text key={index} size="sm">• {cert}</Text>
                              ))}
                            </Stack>
                          </Card>
                        )}
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="ats" pt="md">
                      <Stack gap="lg">
                        {/* ATS Score & Keywords */}
                        {customizedResume.keywordMatches && (
                          <Card shadow="xs" padding="lg" radius="md" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                            <Title order={4} mb="md">ATS Keyword Analysis</Title>
                            <Text size="sm" mb="md" c="dimmed">
                              Keywords matched from the job description:
                            </Text>
                            <Group gap="xs">
                              {customizedResume.keywordMatches.map((keyword, index) => (
                                <Badge key={index} color="green" variant="filled">
                                  {keyword}
                                </Badge>
                              ))}
                            </Group>
                          </Card>
                        )}

                        {/* ATS Optimizations */}
                        {customizedResume.atsOptimizations && (
                          <Card shadow="xs" padding="lg" radius="md">
                            <Title order={4} mb="md">ATS Formatting Tips</Title>
                            <Stack gap="md">
                              {customizedResume.atsOptimizations.map((tip, index) => (
                                <Paper key={index} p="md" radius="sm" style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                                  <Group gap="xs" align="start">
                                    <ThemeIcon size="sm" color="blue" variant="light">
                                      <IconTarget size={12} />
                                    </ThemeIcon>
                                    <Text size="sm">{tip}</Text>
                                  </Group>
                                </Paper>
                              ))}
                            </Stack>
                          </Card>
                        )}
                      </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="interview" pt="md">
                      {customizedResume.interviewPrep ? (
                        <Card shadow="xs" padding="lg" radius="md">
                          <Title order={4} mb="md">Interview Preparation</Title>
                          <Stack gap="md">
                            {customizedResume.interviewPrep.map((prep, index) => (
                              <Paper key={index} p="md" radius="sm" style={{ backgroundColor: 'var(--mantine-color-orange-0)' }}>
                                <Group gap="xs" align="start">
                                  <ThemeIcon size="sm" color="orange" variant="light">
                                    <IconStar size={12} />
                                  </ThemeIcon>
                                  <Text size="sm">{prep}</Text>
                                </Group>
                              </Paper>
                            ))}
                          </Stack>
                        </Card>
                      ) : (
                        <Alert icon={<IconAlertCircle size="1rem" />} color="blue" variant="light">
                          Interview preparation tips will be generated based on the role requirements.
                        </Alert>
                      )}
                    </Tabs.Panel>

                    <Tabs.Panel value="tips" pt="md">
                      <Card shadow="xs" padding="lg" radius="md">
                        <Title order={4} mb="md">Strategic Recommendations</Title>
                        <Stack gap="md">
                          {(customizedResume.recommendations || []).map((recommendation, index) => (
                            <Paper key={index} p="md" radius="sm" style={{ backgroundColor: 'var(--mantine-color-green-0)' }}>
                              <Group gap="xs" align="start">
                                <ThemeIcon size="sm" color="green" variant="light">
                                  <IconTrendingUp size={12} />
                                </ThemeIcon>
                                <Text size="sm">{recommendation}</Text>
                              </Group>
                            </Paper>
                          ))}
                        </Stack>
                      </Card>
                    </Tabs.Panel>
                  </Tabs>

                  {/* Action Buttons */}
                  <Group justify="center">
                    <Button
                      size="lg"
                      variant="outline"
                      leftSection={<IconTarget size={20} />}
                      onClick={() => window.open('/job-matcher', '_blank')}
                    >
                      Analyze Job Match
                    </Button>
                    <Button
                      size="lg"
                      leftSection={<IconWand size={20} />}
                      onClick={() => {
                        setJobDescription('')
                        setCustomizedResume(null)
                      }}
                    >
                      Customize for Another Role
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </motion.div>
          )}

          {/* Resume Templates */}
          {!customizedResume && (
            <Card shadow="sm" padding="xl" radius="md">
              <Title order={4} mb="md">Quick Resume Templates</Title>
              <Text size="sm" c="dimmed" mb="md">
                Try these pre-configured job types for instant resume customization:
              </Text>
              <Group>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`Chief Technology Officer - AI/ML Company
Leading technology vision and engineering organization for AI-powered SaaS platform. Responsible for technology strategy, product architecture, and scaling engineering practices from 100 to 500+ engineers.

Requirements:
- 15+ years technology leadership in enterprise software
- Experience scaling engineering organizations through hypergrowth
- Deep background in AI/ML, data platforms, and cloud infrastructure
- IPO or major acquisition experience required
- Proven track record of building world-class engineering cultures`)}
                >
                  CTO - AI Company
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`VP of Engineering - Enterprise Data Platform
Lead engineering for next-generation data platform serving Fortune 500 customers. Build and scale data engineering, ML infrastructure, and analytics platforms.

Requirements:
- 12+ years engineering leadership experience
- Experience with big data platforms (Hadoop, Spark, Kafka, Snowflake)
- Team leadership experience managing 50+ engineers
- Background in enterprise B2B software and customer success
- Cloud-native architecture and DevOps practices`)}
                >
                  VP Engineering - Data
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => setJobDescription(`Founder/CEO - Enterprise AI Startup
Seeking experienced technology executive to lead AI startup focused on enterprise security solutions. Company has Series A funding and needs proven leader to scale from 20 to 200+ employees.

Requirements:
- 20+ years technology and business leadership
- Experience as founder, CEO, or C-level executive
- Background in AI/ML and enterprise security
- Track record scaling startups to successful exits
- Strong fundraising and investor relations experience`)}
                >
                  Founder/CEO - AI Startup
                </Button>
              </Group>
            </Card>
          )}
        </Stack>
      </motion.div>
    </Container>
  )
}